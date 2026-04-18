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

        [HttpGet("assignment/{assignmentId}")]
        public IActionResult AssignmentResults(int assignmentId)
        {
            var teacherId =
                int.Parse(
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

            return Ok(results.ToList());
        }

        [HttpGet("export/{assignmentId}")]
        public IActionResult ExportCSV(int assignmentId)
        {
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
                    $"{r.Name},{r.Email},{r.Phone},{r.Score},{r.SubmittedAt}"
                );
            }

            return File(
                Encoding.UTF8.GetBytes(csv.ToString()),
                "text/csv",
                "assignment_result.csv"
            );
        }

        [HttpGet("review/{assignmentId}")]
        public IActionResult Review(int assignmentId)
        {
            var studentId =
                int.Parse(
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier
                    )
                );

            var review =
                from q in _context.Questions
                join sa in _context.StudentAnswers
                on q.Id equals sa.QuestionId
                where sa.StudentId == studentId
                && sa.AssignmentId == assignmentId
                select new
                {
                    q.Content,
                    StudentAnswer = sa.Answer,
                    CorrectAnswer = q.CorrectAnswer,
                    sa.IsCorrect,
                    q.Explanation
                };

            return Ok(review.ToList());
        }
    }

}
