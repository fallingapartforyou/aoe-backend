using aoe.DTOs;
using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/exam")]
    [Authorize(Roles = "student")]
    public class ExamController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public ExamController(AoeDbContext context)
        {
            _context = context;
        }


        private int GetStudentId()
        {
            return int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            );
        }


        // LIST ASSIGNMENTS OF CLASS
        [HttpGet("assignments/{classId}")]
        public IActionResult Assignments(int classId)
        {
            var assignments =
                from ac in _context.AssignmentClasses
                join a in _context.Assignments
                on ac.AssignmentId equals a.Id
                where ac.ClassId == classId
                select a;

            return Ok(assignments);
        }

        [HttpGet("state/{assignmentId}")]
        [Authorize(Roles = "student")]
        public IActionResult GetExamState(int assignmentId)
        {
            // ===== LẤY STUDENT ID =====
            var studentId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)
            );

            // ===== CHECK STUDENT THUỘC CLASS CÓ ASSIGNMENT =====
            bool hasAccess =
            (
                from ac in _context.AssignmentClasses
                join cs in _context.ClassStudents
                    on ac.ClassId equals cs.ClassId
                where ac.AssignmentId == assignmentId
                && cs.StudentId == studentId
                select ac
            ).Any();

            if (!hasAccess)
                return Unauthorized();

            // ===== LẤY ASSIGNMENT =====
            var assignment =
                _context.Assignments
                .Where(a => a.Id == assignmentId)
                .Select(a => new
                {
                    a.OpenTime,
                    a.CloseTime,
                    a.ShowResult,
                    a.ShowExplanation
                })
                .FirstOrDefault();

            if (assignment == null)
                return NotFound();

            // ===== CHECK SUBMITTED =====
            bool submitted =
                _context.Results.Any(r =>
                    r.AssignmentId == assignmentId &&
                    r.StudentId == studentId
                );

            // ===== RETURN =====
            return Ok(new
            {
                openTime = assignment.OpenTime,
                closeTime = assignment.CloseTime,
                submitted,
                showResult = assignment.ShowResult,
                showExplanation = assignment.ShowExplanation
            });
        }

        // START EXAM
        [HttpGet("start/{assignmentId}")]
        public IActionResult StartExam(int assignmentId)
        {
            var assignment =
                _context.Assignments
                .FirstOrDefault(a => a.Id == assignmentId);

            if (assignment == null)
                return NotFound();

            if (assignment.OpenTime != null &&
                DateTime.Now < assignment.OpenTime)
                return BadRequest("Not open yet");

            if (assignment.CloseTime != null &&
                DateTime.Now > assignment.CloseTime)
                return BadRequest("Closed");

            var questions =
                _context.Questions
                .Where(q => q.AssignmentId == assignmentId)
                .Select(q => new
                {
                    id = q.Id,
                    type = q.Type,
                    content = q.Content,

                    options =
                        _context.QuestionOptions
                        .Where(o => o.QuestionId == q.Id)
                        .Select(o => o.Content)
                        .ToList()
                })
                .ToList();

            return Ok(questions);
        }


        // SUBMIT EXAM
        [HttpPost("submit")]
        public IActionResult SubmitExam(SubmitExamDTO dto)
        {
            var studentId = GetStudentId();

            int score = 0;

            foreach (var ans in dto.Answers)
            {
                var question =
                    _context.Questions.Find(ans.QuestionId);

                if (question == null)
                    continue;

                bool correct =
                    question.CorrectAnswer == ans.Answer;

                if (correct)
                    score++;

                // ✅ CHECK EXIST
                var existing =
                    _context.StudentAnswers.FirstOrDefault(x =>
                        x.StudentId == studentId &&
                        x.AssignmentId == dto.AssignmentId &&
                        x.QuestionId == ans.QuestionId
                    );

                if (existing != null)
                {
                    // ✅ UPDATE
                    existing.Answer = ans.Answer;
                    existing.IsCorrect = correct;
                }
                else
                {
                    // ✅ INSERT
                    _context.StudentAnswers.Add(
                        new StudentAnswer
                        {
                            StudentId = studentId,
                            AssignmentId = dto.AssignmentId,
                            QuestionId = ans.QuestionId,
                            Answer = ans.Answer,
                            IsCorrect = correct
                        }
                    );
                }
            }

            _context.Results.Add(
                new Result
                {
                    StudentId = studentId,
                    AssignmentId = dto.AssignmentId,
                    Score = score
                }
            );

            _context.SaveChanges();

            return Ok(new
            {
                score
            });
        }


        // VIEW RESULT
        [HttpGet("result/{assignmentId}")]
        public IActionResult Result(
            int assignmentId)
        {
            var studentId =
                GetStudentId();

            var result =
                _context.Results.FirstOrDefault(
                    x =>
                        x.StudentId ==
                        studentId &&
                        x.AssignmentId ==
                        assignmentId
                );

            if (result == null)
                return NotFound();

            return Ok(result);
        }


        // HISTORY
        [HttpGet("history/{assignmentId}")]
        public IActionResult History(int assignmentId)
        {
            var studentId = GetStudentId();

            var history =
                _context.Results
                .Where(x =>
                    x.StudentId == studentId &&
                    x.AssignmentId == assignmentId
                )
                .OrderByDescending(x => x.SubmittedAt ?? DateTime.MinValue) // mới nhất lên đầu
                .Select(x => new
                {
                    score = x.Score,
                    time = x.SubmittedAt
                })
                .ToList();

            return Ok(history);
        }
    }
}
