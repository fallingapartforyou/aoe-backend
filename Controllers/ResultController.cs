using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/result")]
    [Authorize(Roles = "teacher")]
    public class ResultController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public ResultController(AoeDbContext context)
        {
            _context = context;
        }

        // ================= RESULTS =================
        [HttpGet("assignment/{assignmentId}")]
        public IActionResult AssignmentResults(int assignmentId)
        {
            var teacherId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)
            );

            bool ownsAssignment =
            (
                from ac in _context.AssignmentClasses
                join c in _context.Classes
                on ac.ClassId equals c.Id
                where ac.AssignmentId == assignmentId
                && c.TeacherId == teacherId
                select ac
            ).Any();

            if (!ownsAssignment)
                return Unauthorized();

            var results =
                from r in _context.Results
                join u in _context.Users
                on r.StudentId equals u.Id
                where r.AssignmentId == assignmentId
                orderby r.SubmittedAt descending
                select new
                {
                    StudentId = u.Id, // 🔥 FIX
                    u.Name,
                    u.Email,
                    u.Phone,
                    r.Score,
                    r.SubmittedAt
                };

            return Ok(results.ToList());
        }

        // ================= EXPORT =================
        [HttpGet("export/{assignmentId}")]
        public IActionResult ExportCSV(int assignmentId)
        {
            var teacherId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)
            );

            bool ownsAssignment =
            (
                from ac in _context.AssignmentClasses
                join c in _context.Classes
                on ac.ClassId equals c.Id
                where ac.AssignmentId == assignmentId
                && c.TeacherId == teacherId
                select ac
            ).Any();

            if (!ownsAssignment)
                return Unauthorized();

            var results =
                from r in _context.Results
                join u in _context.Users
                on r.StudentId equals u.Id
                where r.AssignmentId == assignmentId
                select new
                {
                    u.Name,
                    u.Email,
                    u.Phone,
                    r.Score,
                    r.SubmittedAt
                };

            var csv = new StringBuilder();
            csv.AppendLine("Name,Email,Phone,Score,SubmittedAt");

            foreach (var r in results)
            {
                csv.AppendLine(
                    $"\"{r.Name}\",\"{r.Email}\",\"{r.Phone}\",{r.Score},{r.SubmittedAt}"
                );
            }

            return File(
                Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv",
                "assignment_result.csv"
            );
        }

        // ================= REVIEW =================
        [HttpGet("review/{resultId}")]
        public IActionResult Review(int resultId)
        {
            var teacherId = int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            );

            var result =
                _context.Results
                .FirstOrDefault(x =>
                    x.Id == resultId
                );

            if (result == null)
                return NotFound();

            bool ownsAssignment =
            (
                from ac in _context.AssignmentClasses
                join c in _context.Classes
                on ac.ClassId equals c.Id
                where ac.AssignmentId == result.AssignmentId
                && c.TeacherId == teacherId
                select ac
            ).Any();

            if (!ownsAssignment)
                return Unauthorized();

            var review =
                _context.StudentAnswers
                .Where(sa =>
                    sa.ResultId == resultId
                )
                .Select(sa => new
                {
                    sa.QuestionId,

                    Content =
                        _context.Questions
                        .Where(q =>
                            q.Id == sa.QuestionId
                        )
                        .Select(q => q.Content)
                        .FirstOrDefault(),

                    Type =
                        _context.Questions
                        .Where(q =>
                            q.Id == sa.QuestionId
                        )
                        .Select(q => q.Type)
                        .FirstOrDefault(),

                    CorrectAnswer =
                        _context.Questions
                        .Where(q =>
                            q.Id == sa.QuestionId
                        )
                        .Select(q => q.CorrectAnswer)
                        .FirstOrDefault(),

                    StudentAnswer =
                        sa.Answer,

                    sa.IsCorrect,

                    Explanation =
                        _context.Questions
                        .Where(q =>
                            q.Id == sa.QuestionId
                        )
                        .Select(q => q.Explanation)
                        .FirstOrDefault(),

                    Options =
                        _context.QuestionOptions
                        .Where(o =>
                            o.QuestionId == sa.QuestionId
                        )
                        .Select(o => o.Content)
                        .ToList()
                })
                .ToList(); 
            
            return Ok(new
            {
                result.Id,
                result.Score,
                result.AttemptNumber,
                result.SubmittedAt,
                result.TimeSpentSeconds,
                result.TabSwitchCount,
                result.Suspicious,
                result.SuspiciousReason,

                Review = review
            });
        }

        [HttpGet("attempts/{assignmentId}/{studentId}")]
        public IActionResult Attempts(
    int assignmentId,
    int studentId)
        {
            var teacherId = int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            );

            bool ownsAssignment =
            (
                from ac in _context.AssignmentClasses
                join c in _context.Classes
                on ac.ClassId equals c.Id
                where ac.AssignmentId == assignmentId
                && c.TeacherId == teacherId
                select ac
            ).Any();

            if (!ownsAssignment)
                return Unauthorized();

            var attempts =
                _context.Results
                .Where(x =>
                    x.AssignmentId == assignmentId
                    &&
                    x.StudentId == studentId
                )
                .OrderByDescending(x =>
                    x.AttemptNumber
                )
                .Select(x => new
                {
                    x.Id,
                    x.AttemptNumber,
                    x.Score,
                    x.SubmittedAt,
                    x.TimeSpentSeconds,
                    x.TabSwitchCount,
                    x.Suspicious,
                    x.SuspiciousReason
                })
                .ToList();

            return Ok(attempts);
        }
    }
}