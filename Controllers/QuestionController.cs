using aoe.DTOs.Question;
using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/question")]
    [Authorize(Roles = "teacher")]
    public class QuestionController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public QuestionController(AoeDbContext context)
        {
            _context = context;
        }


        // CREATE QUESTION
        [HttpPost("create")]
        [Authorize(Roles = "teacher")]
        public IActionResult Create(CreateQuestionDTO dto)
        {
            if (dto == null)
                return BadRequest("Invalid payload");

            if (dto.Type != "single_choice"
                && dto.Type != "fill_blank")
                return BadRequest("Invalid question type");


            var assignment =
                _context.Assignments
                .FirstOrDefault(x =>
                    x.Id == dto.AssignmentId);

            if (assignment == null)
                return NotFound("Assignment not found");


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
                where ac.AssignmentId == dto.AssignmentId
                && c.TeacherId == teacherId
                select ac
            ).Any();

            if (!ownsAssignment)
                return Unauthorized("Not your assignment");


            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Content required");


            if (dto.Type == "fill_blank")
            {
                if (!System.Text.RegularExpressions.Regex
                    .IsMatch(dto.Content,
                    @"^[A-Za-z ]+$"))
                    return BadRequest(
                        "Content only letters + spaces");

                if (!System.Text.RegularExpressions.Regex
                    .IsMatch(dto.CorrectAnswer,
                    @"^[A-Za-z ]+$"))
                    return BadRequest(
                        "Answer only letters + spaces");
            }


            if (dto.Type == "single_choice")
            {
                if (!new[] { "A", "B", "C", "D" }
                    .Contains(dto.CorrectAnswer))
                    return BadRequest(
                        "Answer must be A B C or D");
            }


            var question =
                new Question
                {
                    AssignmentId =
                        dto.AssignmentId,

                    Type =
                        dto.Type,

                    Content =
                        dto.Content.Trim(),

                    CorrectAnswer =
                        dto.CorrectAnswer.Trim(),

                    Explanation =
                        dto.Explanation?.Trim()
                };


            _context.Questions.Add(question);

            _context.SaveChanges();


            return Ok(question);
        }


        // ADD OPTIONS (A B C D)
        [HttpPost("add-options")]
        public IActionResult AddOptions(
            AddOptionsDTO dto)
        {
            var question =
                _context.Questions.Find(
                    dto.QuestionId);

            if (question == null)
                return NotFound();

            if (question.Type != "single_choice")
                return BadRequest(
                    "Only single_choice");

            var options =
                new List<QuestionOption>
                {
                new QuestionOption
                {
                    QuestionId =
                        dto.QuestionId,
                    Label = 'A',
                    Content = dto.A
                },
                new QuestionOption
                {
                    QuestionId =
                        dto.QuestionId,
                    Label = 'B',
                    Content = dto.B
                },
                new QuestionOption
                {
                    QuestionId =
                        dto.QuestionId,
                    Label = 'C',
                    Content = dto.C
                },
                new QuestionOption
                {
                    QuestionId =
                        dto.QuestionId,
                    Label = 'D',
                    Content = dto.D
                }
                };

            _context.QuestionOptions
                .AddRange(options);

            _context.SaveChanges();

            return Ok("Options added");
        }


        // LIST QUESTIONS
        [HttpGet("by-assignment/{assignmentId}")]
        public IActionResult ByAssignment(int assignmentId)
        {
            var questions =
                _context.Questions
                .Where(q => q.AssignmentId == assignmentId)
                .Select(q => new
                {
                    q.Id,
                    q.Type,
                    q.Content,
                    q.CorrectAnswer,
                    q.Explanation,

                    Options =
                        q.Type == "single_choice"
                        ? _context.QuestionOptions
                            .Where(o => o.QuestionId == q.Id)
                            .Select(o => new
                            {
                                o.Label,
                                o.Content
                            })
                            .ToList()
                        : null
                });

            return Ok(questions);
        }


        // UPDATE QUESTION
        [HttpPut("update/{id}")]
        public IActionResult Update(
            int id,
            CreateQuestionDTO dto)
        {
            var question =
                _context.Questions.Find(id);

            if (question == null)
                return NotFound();

            question.Content =
                dto.Content;

            question.CorrectAnswer =
                dto.CorrectAnswer;

            question.Explanation =
                dto.Explanation;

            _context.SaveChanges();

            return Ok("Updated");
        }


        // DELETE QUESTION
        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var question =
                _context.Questions.Find(id);

            if (question == null)
                return NotFound();

            _context.Questions.Remove(question);

            _context.SaveChanges();

            return Ok("Deleted");
        }
    }
}
