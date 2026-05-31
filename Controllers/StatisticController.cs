using aoe.DTOs.Statistic;
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

        // =========================
        // UTILS
        // =========================
        private int GetUserId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // =========================
        // STUDENT DASHBOARD
        // =========================
        [HttpGet("student")]
        [Authorize(Roles = "student")]
        public IActionResult Student()
        {
            var studentId = GetUserId();

            var results = _context.Results
                .Where(x => x.StudentId == studentId);

            var dto = new StudentStatisticDTO
            {
                TotalAttempts = results.Count(),

                AverageScore = results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                BestScore = results.Any()
                    ? results.Max(x => x.Score)
                    : 0,

                SuspiciousCount = results.Count(x => x.Suspicious),

                AverageTime = results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            };

            return Ok(dto);
        }

        // =========================
        // TEACHER DASHBOARD
        // =========================
        [HttpGet("teacher")]
        [Authorize(Roles = "teacher")]
        public IActionResult Teacher()
        {
            var teacherId = GetUserId();

            var assignmentIds = _context.Assignments
                .Where(x => x.TeacherId == teacherId)
                .Select(x => x.Id)
                .ToList();

            var results = _context.Results
                .Where(x => assignmentIds.Contains(x.AssignmentId));

            var dto = new TeacherStatisticDTO
            {
                AssignmentCount = assignmentIds.Count,

                SubmissionCount = results.Count(),

                AverageScore = results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                SuspiciousCount = results.Count(x => x.Suspicious),

                AverageTime = results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            };

            return Ok(dto);
        }

        // =========================
        // ASSIGNMENT DETAIL STATS
        // =========================
        [HttpGet("assignment/{assignmentId}")]
        [Authorize(Roles = "teacher")]
        public IActionResult Assignment(int assignmentId)
        {
            var teacherId = GetUserId();

            var assignment = _context.Assignments
                .FirstOrDefault(x =>
                    x.Id == assignmentId &&
                    x.TeacherId == teacherId);

            if (assignment == null)
                return NotFound();

            var results = _context.Results
                .Where(x => x.AssignmentId == assignmentId);

            var dto = new AssignmentStatisticDTO
            {
                Id = assignment.Id,
                Name = assignment.Name,

                Submissions = results.Count(),

                AverageScore = results.Any()
                    ? results.Average(x => x.Score)
                    : 0,

                HighestScore = results.Any()
                    ? results.Max(x => x.Score)
                    : 0,

                SuspiciousCount = results.Count(x => x.Suspicious),

                AverageTime = results.Any()
                    ? results.Average(x => x.TimeSpentSeconds)
                    : 0
            };

            return Ok(dto);
        }
    }
}