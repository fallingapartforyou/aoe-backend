using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/statistic")]
    [Authorize]
    public class StatisticController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public StatisticController(AoeDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );
        }

        // =========================
        // STUDENT DASHBOARD
        // =========================

        [HttpGet("student")]
        [Authorize(Roles = "student")]
        public IActionResult Student()
        {
            var studentId = GetUserId();

            var results =
                _context.Results
                .Where(x => x.StudentId == studentId);

            return Ok(new
            {
                totalAttempts =
                    results.Count(),

                averageScore =
                    results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                bestScore =
                    results.Any()
                    ? results.Max(x => x.Score)
                    : 0,

                suspiciousCount =
                    results.Count(x => x.Suspicious),

                averageTime =
                    results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            });
        }

        // =========================
        // TEACHER DASHBOARD
        // =========================

        [HttpGet("teacher")]
        [Authorize(Roles = "teacher")]
        public IActionResult Teacher()
        {
            var teacherId = GetUserId();

            var assignments =
                _context.Assignments
                .Where(x => x.TeacherId == teacherId)
                .Select(x => x.Id)
                .ToList();

            var results =
                _context.Results
                .Where(x =>
                    assignments.Contains(
                        x.AssignmentId));

            return Ok(new
            {
                assignmentCount =
                    assignments.Count,

                submissionCount =
                    results.Count(),

                averageScore =
                    results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                suspiciousCount =
                    results.Count(x => x.Suspicious),

                averageTime =
                    results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            });
        }

        // =========================
        // ASSIGNMENT STATS
        // =========================

        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "teacher")]
        public IActionResult Assignment(int assignmentId)
        {
            var teacherId = GetUserId();

            var assignment =
                _context.Assignments
                .FirstOrDefault(x =>
                    x.Id == assignmentId &&
                    x.TeacherId == teacherId);

            if (assignment == null)
                return NotFound();

            var results =
                _context.Results
                .Where(x =>
                    x.AssignmentId == assignmentId);

            return Ok(new
            {
                assignment.Id,
                assignment.Name,

                submissions =
                    results.Count(),

                averageScore =
                    results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                highestScore =
                    results.Any()
                    ? results.Max(x => x.Score)
                    : 0,

                suspiciousCount =
                    results.Count(x => x.Suspicious),

                averageTime =
                    results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            });
        }
    }
}