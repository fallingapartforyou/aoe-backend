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


        // START EXAM
        [HttpGet("start/{assignmentId}")]
        public IActionResult StartExam(int assignmentId)
        {
            var assignment =
                _context.Assignments.Find(
                    assignmentId
                );

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
                .Where(x =>
                    x.AssignmentId ==
                    assignmentId)
                .Select(q => new
                {
                    q.Id,
                    q.Type,
                    q.Content,
                    options =
                        _context.QuestionOptions
                        .Where(o =>
                            o.QuestionId == q.Id)
                });

            return Ok(questions);
        }


        // SUBMIT EXAM
        [HttpPost("submit")]
        public IActionResult SubmitExam(
            SubmitExamDTO dto)
        {
            var studentId =
                GetStudentId();

            int score = 0;

            foreach (var ans in dto.Answers)
            {
                var question =
                    _context.Questions.Find(
                        ans.QuestionId
                    );

                bool correct =
                    question.CorrectAnswer ==
                    ans.Answer;

                if (correct)
                    score++;

                _context.StudentAnswers.Add(
                    new StudentAnswer
                    {
                        StudentId = studentId,
                        QuestionId = ans.QuestionId,
                        Answer = ans.Answer,
                        IsCorrect = correct
                    }
                );
            }

            _context.Results.Add(
                new Result
                {
                    StudentId = studentId,
                    AssignmentId =
                        dto.AssignmentId,
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
        [HttpGet("history")]
        public IActionResult History()
        {
            var studentId =
                GetStudentId();

            var history =
                _context.Results
                .Where(x =>
                    x.StudentId ==
                    studentId);

            return Ok(history);
        }

        [HttpGet("review/{assignmentId}")]
        public IActionResult Review(int assignmentId)
        {
            var studentId = GetStudentId();

            var data =
                from q in _context.Questions
                where q.AssignmentId == assignmentId
                select new
                {
                    q.Id,
                    q.Content,
                    q.CorrectAnswer,
                    q.Explanation
                };

            return Ok(data.ToList());
        }
    }
}
