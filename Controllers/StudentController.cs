using aoe.DTOs.Class;
using aoe.DTOs.Student;
using aoe.Models;
using aoe.Services.Systems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/student")]
    [Authorize(Roles = "student")]
    public class StudentController : ControllerBase
    {
        private readonly AoeDbContext _context;
        private readonly SystemService _systemService;

        public StudentController(
            AoeDbContext context,
            SystemService systemService)
        {
            _context = context;
            _systemService = systemService;
        }

        // =========================
        // UTILS
        // =========================
        private int GetStudentId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // =========================
        // JOIN CLASS (BY CODE)
        // =========================
        [HttpPost("join-class")]
        public IActionResult JoinClass(JoinClassDTO dto)
        {
            var studentId = GetStudentId();

            var classObj = _context.Classes
                .FirstOrDefault(x => x.ClassCode == dto.ClassCode);

            if (classObj == null)
                return NotFound("Class not found");

            bool alreadyJoined = _context.ClassStudents
                .Any(x =>
                    x.ClassId == classObj.Id &&
                    x.StudentId == studentId);

            if (alreadyJoined)
                return BadRequest("Already joined");

            bool pendingRequest = _context.ClassJoinRequests
                .Any(x =>
                    x.ClassId == classObj.Id &&
                    x.StudentId == studentId &&
                    x.Status == "pending");

            if (pendingRequest)
                return BadRequest("Request already sent");

            var request = new ClassJoinRequest
            {
                ClassId = classObj.Id,
                StudentId = studentId,
                Type = "student_request",
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.ClassJoinRequests.Add(request);

            // notify teacher
            _systemService.CreateNotification(
                classObj.TeacherId,
                "New Join Request",
                $"Student requested to join class {classObj.Name}",
                "join_request");

            _systemService.CreateLog(
                studentId,
                "request_join_class",
                "class",
                classObj.Id,
                $"Requested to join class {classObj.Name}");

            _context.SaveChanges();

            return Ok("Request sent");
        }

        // =========================
        // MY CLASSES (FIXED - SINGLE SOURCE OF TRUTH)
        // =========================
        [HttpGet("my-classes")]
        public IActionResult MyClasses()
        {
            var studentId = GetStudentId();

            var classes =
                from cs in _context.ClassStudents
                join c in _context.Classes
                    on cs.ClassId equals c.Id
                where cs.StudentId == studentId
                select new
                {
                    c.Id,
                    c.Name,
                    c.ClassCode,

                    teacherName = c.Teacher.Name,
                    teacherEmail = c.Teacher.Email,
                    teacherPhone = c.Teacher.Phone
                };

            return Ok(classes.ToList());
        }

        // =========================
        // JOIN REQUESTS (HISTORY + STATUS)
        // =========================
        [HttpGet("join-requests")]
        public IActionResult JoinRequests()
        {
            var studentId = GetStudentId();

            var requests = _context.ClassJoinRequests
                .Where(x => x.StudentId == studentId)
                .Select(x => new
                {
                    x.Id,
                    x.Status,
                    x.Type,
                    x.CreatedAt,

                    classId = x.Class.Id,
                    className = x.Class.Name,
                    classCode = x.Class.ClassCode,

                    teacherName = x.Class.Teacher.Name
                })
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            return Ok(requests);
        }
    }
}