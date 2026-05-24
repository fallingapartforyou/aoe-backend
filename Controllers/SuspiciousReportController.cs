using aoe.Models;
using aoe.Services.Systems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/suspicious")]
    [Authorize(Roles = "teacher")]
    public class SuspiciousReportController : ControllerBase
    {
        private readonly AoeDbContext _context;
        private readonly SystemService _systemService;

        public SuspiciousReportController(
            AoeDbContext context,
            SystemService systemService)
        {
            _context = context;
            _systemService = systemService;
        }

        private int GetTeacherId()
        {
            return int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );
        }

        // =========================
        // LIST
        // =========================

        [HttpGet("list")]
        public IActionResult List(string? status)
        {
            var teacherId = GetTeacherId();

            var query =
                from sr in _context.SuspiciousReports

                join a in _context.Assignments
                on sr.AssignmentId equals a.Id

                join u in _context.Users
                on sr.StudentId equals u.Id

                where a.TeacherId == teacherId

                select new
                {
                    sr.Id,

                    sr.SuspiciousScore,
                    sr.AiRisk,

                    sr.Reason,
                    sr.Status,

                    sr.CreatedAt,

                    studentId = u.Id,
                    studentName = u.Name,
                    studentEmail = u.Email,

                    assignmentId = a.Id,
                    assignmentName = a.Name
                };

            if (!string.IsNullOrWhiteSpace(status))
            {
                query =
                    query.Where(x =>
                        x.Status == status);
            }

            return Ok(
                query
                .OrderByDescending(x => x.CreatedAt)
                .ToList()
            );
        }

        // =========================
        // DETAIL
        // =========================

        [HttpGet("{id}")]
        public IActionResult Detail(int id)
        {
            var teacherId = GetTeacherId();

            var report =
                (
                    from sr in _context.SuspiciousReports

                    join a in _context.Assignments
                    on sr.AssignmentId equals a.Id

                    join u in _context.Users
                    on sr.StudentId equals u.Id

                    join r in _context.Results
                    on sr.ResultId equals r.Id

                    where
                        sr.Id == id
                        && a.TeacherId == teacherId

                    select new
                    {
                        sr.Id,

                        sr.SuspiciousScore,
                        sr.AiRisk,

                        sr.Reason,
                        sr.AiAnalysis,

                        sr.Status,

                        sr.CreatedAt,

                        student = new
                        {
                            u.Id,
                            u.Name,
                            u.Email
                        },

                        assignment = new
                        {
                            a.Id,
                            a.Name
                        },

                        result = new
                        {
                            r.Id,
                            r.Score,
                            r.TimeSpentSeconds,
                            r.AttemptNumber,
                            r.TabSwitchCount,
                            r.SubmittedAt,
                            r.Suspicious,
                            r.SuspiciousReason,

                            Answers =
                                _context.StudentAnswers
                                .Where(x =>
                                    x.ResultId == r.Id)
                                .Select(x => new
                                {
                                    x.QuestionId,
                                    x.Answer,
                                    x.IsCorrect
                                })
                                .ToList()
                        }
                    }
                )
                .FirstOrDefault();

            if (report == null)
                return NotFound();

            return Ok(report);
        }

        // =========================
        // CONFIRM
        // =========================

        [HttpPost("confirm/{id}")]
        public IActionResult Confirm(int id)
        {
            var teacherId = GetTeacherId();

            var report =
                _context.SuspiciousReports
                .FirstOrDefault(x =>
                    x.Id == id);

            if (report == null)
                return NotFound();

            var assignment =
                _context.Assignments
                .FirstOrDefault(x =>
                    x.Id == report.AssignmentId);

            if (assignment == null)
                return NotFound();

            if (assignment.TeacherId != teacherId)
                return Unauthorized();

            report.Status = "confirmed";

            _context.SaveChanges();

            _systemService.CreateNotification(
                report.StudentId,
                "Academic Review",
                "One of your attempts has been marked for teacher review.",
                "warning"
            );

            _systemService.CreateLog(
                teacherId,
                "confirm_suspicious",
                "suspicious_report",
                report.Id,
                $"Confirmed suspicious report #{report.Id}"
            );

            return Ok("Confirmed");
        }

        // =========================
        // REJECT
        // =========================

        [HttpPost("reject/{id}")]
        public IActionResult Reject(int id)
        {
            var teacherId = GetTeacherId();

            var report =
                _context.SuspiciousReports
                .FirstOrDefault(x =>
                    x.Id == id);

            if (report == null)
                return NotFound();

            var assignment =
                _context.Assignments
                .FirstOrDefault(x =>
                    x.Id == report.AssignmentId);

            if (assignment == null)
                return NotFound();

            if (assignment.TeacherId != teacherId)
                return Unauthorized();

            report.Status = "rejected";

            _context.SaveChanges();

            _systemService.CreateLog(
                teacherId,
                "reject_suspicious",
                "suspicious_report",
                report.Id,
                $"Rejected suspicious report #{report.Id}"
            );

            return Ok("Rejected");
        }

        // =========================
        // STATS
        // =========================

        [HttpGet("stats")]
        public IActionResult Stats()
        {
            var teacherId = GetTeacherId();

            var reports =
                from sr in _context.SuspiciousReports

                join a in _context.Assignments
                on sr.AssignmentId equals a.Id

                where a.TeacherId == teacherId

                select sr;

            return Ok(new
            {
                total =
                    reports.Count(),

                pending =
                    reports.Count(x =>
                        x.Status == "pending"),

                confirmed =
                    reports.Count(x =>
                        x.Status == "confirmed"),

                rejected =
                    reports.Count(x =>
                        x.Status == "rejected"),

                averageRisk =
                    reports.Any()
                    ? reports.Average(x => x.AiRisk)
                    : 0
            });
        }
    }
}