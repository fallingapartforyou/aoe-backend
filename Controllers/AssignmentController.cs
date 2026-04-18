using Microsoft.AspNetCore.Mvc;

namespace aoe.Controllers
{
    using aoe.DTOs.Assignment;
    using aoe.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Claims;
    using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

    [ApiController]
    [Route("api/assignment")]
    [Authorize(Roles = "teacher")]
    public class AssignmentController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public AssignmentController(AoeDbContext context)
        {
            _context = context;
        }

        // CREATE
        [HttpPost("create")]
        public IActionResult Create(
            CreateAssignmentDTO dto)
        {
            if (dto.Name.Length > 20)
                return BadRequest();

            if (dto.QuestionType != "single_choice"
                && dto.QuestionType != "fill_blank")
                return BadRequest();

            var assignment =
                new Assignment
                {
                    Name = dto.Name,
                    QuestionType = dto.QuestionType,
                    QuestionCount = dto.QuestionCount,
                    OpenTime = dto.OpenTime,
                    CloseTime = dto.CloseTime,
                    ShowResult = dto.ShowResult,
                    ShowExplanation = dto.ShowExplanation
                };

            _context.Assignments.Add(assignment);

            _context.SaveChanges();

            return Ok(assignment);
        }


        // LIST
        [HttpGet("my-assignments")]
        public IActionResult MyAssignments(
            string? keyword)
        {
            var query = _context.Assignments.AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query =
                    query.Where(x =>
                        x.Name.Contains(keyword));
            }

            return Ok(query.ToList());
        }


        // UPDATE
        [HttpPut("update/{id}")]
        public IActionResult Update(
            int id,
            CreateAssignmentDTO dto)
        {
            var assignment =
                _context.Assignments.Find(id);

            if (assignment == null)
                return NotFound();

            assignment.Name = dto.Name;
            assignment.QuestionType =
                dto.QuestionType;
            assignment.QuestionCount =
                dto.QuestionCount;
            assignment.OpenTime =
                dto.OpenTime;
            assignment.CloseTime =
                dto.CloseTime;
            assignment.ShowResult =
                dto.ShowResult;
            assignment.ShowExplanation =
                dto.ShowExplanation;

            _context.SaveChanges();

            return Ok("Updated");
        }


        // DELETE
        [HttpDelete("delete/{id}")]
        public IActionResult Delete(int id)
        {
            var assignment =
                _context.Assignments.Find(id);

            if (assignment == null)
                return NotFound();

            _context.Assignments.Remove(
                assignment);

            _context.SaveChanges();

            return Ok("Deleted");
        }


        // ASSIGN → CLASS
        [HttpPost("assign-to-class")]
        public IActionResult AssignToClass(
AssignToClassDTO dto)
        {
            var assignmentExists =
            _context.Assignments
            .Any(x => x.Id == dto.AssignmentId);

            if (!assignmentExists)
                return BadRequest("Assignment not found");


            var classExists =
            _context.Classes
            .Any(x => x.Id == dto.ClassId);

            if (!classExists)
                return BadRequest("Class not found");


            var exists =
            _context.AssignmentClasses.Any(x =>
            x.AssignmentId == dto.AssignmentId &&
            x.ClassId == dto.ClassId
            );

            if (exists)
                return BadRequest("Already assigned");


            _context.AssignmentClasses.Add(
            new AssignmentClass
            {
                AssignmentId = dto.AssignmentId,
                ClassId = dto.ClassId
            });

            _context.SaveChanges();

            return Ok("Assigned");
        }


        // LIST CLASSES OF ASSIGNMENT
        [HttpGet("classes/{assignmentId}")]
        public IActionResult Classes(
            int assignmentId)
        {
            var classes =
                from ac in _context.AssignmentClasses
                join c in _context.Classes
                on ac.ClassId equals c.Id
                where ac.AssignmentId ==
                      assignmentId
                select new
                {
                    c.Id,
                    c.Name,
                    c.ClassCode
                };

            return Ok(classes.ToList());
        }
    }
}
