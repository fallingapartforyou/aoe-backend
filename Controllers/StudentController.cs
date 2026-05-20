using aoe.DTOs.Class;
using aoe.DTOs.Student;
using aoe.Helpers;
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

        // JOIN CLASS
        [HttpPost("join-class")]
        public IActionResult JoinClass(
    JoinClassDTO dto)
        {
            var studentId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier
                    )
                );

            var classObj =
                _context.Classes.FirstOrDefault(
                    x => x.ClassCode == dto.ClassCode
                );

            if (classObj == null)
                return NotFound("Class not found");

            bool exists =
                _context.ClassStudents.Any(
                    x =>
                        x.ClassId == classObj.Id &&
                        x.StudentId == studentId
                );

            if (exists)
                return BadRequest(
                    "Already joined"
                );

            bool requested =
                _context.ClassJoinRequests.Any(x =>
                    x.ClassId == classObj.Id &&
                    x.StudentId == studentId &&
                    x.Status == "pending");

            if (requested)
                return BadRequest("Request already sent");

            var request =
                new ClassJoinRequest
                {
                    ClassId = classObj.Id,
                    StudentId = studentId,
                    Type = "student_request",
                    Status = "pending",
                    CreatedAt = DateTime.Now
                };

            _context.ClassJoinRequests.Add(request);

            _systemService.CreateNotification(
                classObj.TeacherId,
                "New Join Request",
                $"A student requested to join class {classObj.Name}",
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


        // LIST MY CLASSES
        [HttpGet("my-classes")]
        public IActionResult MyClasses()
        {
            var studentId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier
                    )
                );

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
        
        [HttpGet("my")]
        [Authorize(Roles = "student")]
        public IActionResult GetMyClasses()
        {
            var studentId =
            int.Parse(
            User.FindFirstValue(
            ClaimTypes.NameIdentifier
            )
            );

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

        [HttpGet("join-requests")]
        public IActionResult JoinRequests()
        {
            var studentId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier
                    )
                );

            var requests =
                _context.ClassJoinRequests
                .Where(x => x.StudentId == studentId)
                .Select(x => new
                {
                    x.Id,
                    x.Status,
                    x.Type,
                    x.CreatedAt,

                    classId = x.Class.Id,
                    className = x.Class.Name,
                    classCode = x.Class.ClassCode
                })
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            return Ok(requests);
        }
    }
}
