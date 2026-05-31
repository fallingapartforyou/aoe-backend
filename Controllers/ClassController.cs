using aoe.DTOs.Class;
using aoe.Helpers;
using aoe.Models;
using aoe.Services.Systems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/class")]
    [Authorize(Roles = "teacher")]
    public class ClassController : ControllerBase
    {
        private readonly AoeDbContext _context;
        private readonly SystemService _systemService;

        public ClassController(
            AoeDbContext context,
            SystemService systemService)
        {
            _context = context;
            _systemService = systemService;
        }

        // =========================
        // UTILS
        // =========================
        private int GetTeacherId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        private bool OwnsClass(int classId)
        {
            var teacherId = GetTeacherId();

            return _context.Classes.Any(x =>
                x.Id == classId &&
                x.TeacherId == teacherId);
        }

        // =========================
        // CREATE CLASS
        // =========================
        [HttpPost("create")]
        public IActionResult CreateClass(CreateClassDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Length > 20)
                return BadRequest("Invalid class name");

            var teacherId = GetTeacherId();

            string code;
            do
            {
                code = ClassCodeGenerator.Generate();
            }
            while (_context.Classes.Any(x => x.ClassCode == code));

            var newClass = new Class
            {
                Name = dto.Name,
                ClassCode = code,
                TeacherId = teacherId
            };

            _context.Classes.Add(newClass);
            _context.SaveChanges();

            return Ok(new
            {
                newClass.Id,
                newClass.Name,
                newClass.ClassCode
            });
        }

        // =========================
        // DELETE CLASS
        // =========================
        [HttpDelete("delete/{classId}")]
        public IActionResult DeleteClass(int classId)
        {
            if (!OwnsClass(classId))
                return Unauthorized();

            var cls = _context.Classes.Find(classId);
            if (cls == null)
                return NotFound();

            _context.Classes.Remove(cls);
            _context.SaveChanges();

            return Ok("Class deleted");
        }

        // =========================
        // MY CLASSES
        // =========================
        [HttpGet("my-classes")]
        public IActionResult MyClasses(string? keyword)
        {
            var teacherId = GetTeacherId();

            var query = _context.Classes
                .Where(x => x.TeacherId == teacherId);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                query = query.Where(x => x.Name.Contains(keyword));
            }

            var result = query
                .Select(x => new
                {
                    x.Id,
                    x.Name,
                    x.ClassCode,

                    studentCount =
                        _context.ClassStudents.Count(cs => cs.ClassId == x.Id)
                })
                .ToList();

            return Ok(result);
        }

        // =========================
        // CLASS STUDENTS
        // =========================
        [HttpGet("students/{classId}")]
        public IActionResult Students(int classId)
        {
            if (!OwnsClass(classId))
                return Unauthorized();

            var students = _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => new
                {
                    cs.Student.Id,
                    cs.Student.Name,
                    cs.Student.Email,
                    cs.Student.Phone
                })
                .ToList();

            return Ok(students);
        }

        // =========================
        // ADD STUDENT BY EMAIL (INVITE FLOW)
        // =========================
        [HttpPost("add-student")]
        public IActionResult AddStudent(AddStudentDTO dto)
        {
            if (!OwnsClass(dto.ClassId))
                return Unauthorized();

            var student = _context.Users
                .FirstOrDefault(x =>
                    x.Email == dto.Email &&
                    x.Role == "student");

            if (student == null)
                return NotFound("Student not found");

            bool exists = _context.ClassStudents.Any(x =>
                x.ClassId == dto.ClassId &&
                x.StudentId == student.Id);

            if (exists)
                return BadRequest("Student already in class");

            _context.ClassStudents.Add(new ClassStudent
            {
                ClassId = dto.ClassId,
                StudentId = student.Id
            });

            _systemService.CreateNotification(
                student.Id,
                "Added To Class",
                "You have been added to a class",
                "class"
            );

            _context.SaveChanges();

            return Ok("Student added");
        }

        // =========================
        // REMOVE STUDENT
        // =========================
        [HttpDelete("remove-student/{studentId}/{classId}")]
        public IActionResult RemoveStudent(int studentId, int classId)
        {
            if (!OwnsClass(classId))
                return Unauthorized();

            var record = _context.ClassStudents.FirstOrDefault(x =>
                x.StudentId == studentId &&
                x.ClassId == classId);

            if (record == null)
                return NotFound();

            _context.ClassStudents.Remove(record);
            _context.SaveChanges();

            return Ok("Removed");
        }

        // =========================
        // UPDATE STUDENT INFO
        // =========================
        [HttpPut("update-student")]
        public IActionResult UpdateStudent(UpdateStudentDTO dto)
        {
            var student = _context.Users.FirstOrDefault(x =>
                x.Id == dto.StudentId &&
                x.Role == "student");

            if (student == null)
                return NotFound("Student not found");

            if (!ValidationHelper.ValidName(dto.Name))
                return BadRequest("Invalid name");

            if (!ValidationHelper.ValidPhone(dto.Phone))
                return BadRequest("Invalid phone");

            student.Name = dto.Name;
            student.Phone = dto.Phone;

            _context.SaveChanges();

            return Ok("Student updated");
        }

        // =========================
        // JOIN REQUESTS (PENDING)
        // =========================
        [HttpGet("join-requests/{classId}")]
        public IActionResult JoinRequests(int classId)
        {
            if (!OwnsClass(classId))
                return Unauthorized();

            var requests = _context.ClassJoinRequests
                .Where(x =>
                    x.ClassId == classId &&
                    x.Status == "pending")
                .Select(x => new
                {
                    x.Id,
                    x.Type,
                    x.CreatedAt,

                    studentId = x.Student.Id,
                    studentName = x.Student.Name,
                    studentEmail = x.Student.Email
                })
                .ToList();

            return Ok(requests);
        }

        // =========================
        // APPROVE REQUEST
        // =========================
        [HttpPost("approve-request/{requestId}")]
        public IActionResult ApproveRequest(int requestId)
        {
            var request = _context.ClassJoinRequests
                .FirstOrDefault(x => x.Id == requestId);

            if (request == null)
                return NotFound();

            if (!OwnsClass(request.ClassId))
                return Unauthorized();

            bool alreadyJoined = _context.ClassStudents.Any(x =>
                x.ClassId == request.ClassId &&
                x.StudentId == request.StudentId);

            if (!alreadyJoined)
            {
                _context.ClassStudents.Add(new ClassStudent
                {
                    ClassId = request.ClassId,
                    StudentId = request.StudentId
                });
            }

            request.Status = "approved";

            _systemService.CreateNotification(
                request.StudentId,
                "Join Request Approved",
                "You have joined the class successfully",
                "class");

            _systemService.CreateLog(
                request.StudentId,
                "join_class",
                "class",
                request.ClassId,
                "Approved join request");

            _context.SaveChanges();

            return Ok("Approved");
        }

        // =========================
        // REJECT REQUEST
        // =========================
        [HttpPost("reject-request/{requestId}")]
        public IActionResult RejectRequest(int requestId)
        {
            var request = _context.ClassJoinRequests
                .FirstOrDefault(x => x.Id == requestId);

            if (request == null)
                return NotFound();

            if (!OwnsClass(request.ClassId))
                return Unauthorized();

            request.Status = "rejected";

            _systemService.CreateNotification(
                request.StudentId,
                "Join Request Rejected",
                "Your join request was rejected",
                "class");

            _systemService.CreateLog(
                request.StudentId,
                "reject_join_request",
                "class",
                request.ClassId,
                "Rejected join request");

            _context.SaveChanges();

            return Ok("Rejected");
        }

        
    }
}