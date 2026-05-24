using aoe.DTOs;
using aoe.DTOs.AI;
using aoe.Models;
using aoe.Services.AI;
using aoe.Services.Systems;
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
        private readonly SystemService _systemService;
        private readonly CheatingDetectionService _cheatingService;
        private readonly IAIService _aiService;

        public ExamController(
    AoeDbContext context,
    SystemService systemService,
    CheatingDetectionService cheatingService,
    IAIService aiService)
        {
            _context = context;

            _systemService = systemService;

            _cheatingService = cheatingService;

            _aiService = aiService;
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
                DateTime.UtcNow < assignment.OpenTime)
                return BadRequest("Not open yet");

            if (assignment.CloseTime != null &&
                DateTime.UtcNow > assignment.CloseTime)
                return BadRequest("Closed");

            var questions =
        _context.Questions
        .Where(q => q.AssignmentId == assignmentId)
        .Select(q => new
        {
            q.Id,
            q.Type,
            q.Content,

            Options =
                q.Type == "single_choice"
                ? _context.QuestionOptions
                    .Where(o => o.QuestionId == q.Id)
                    .OrderBy(o => o.Label)
                    .Select(o => new
                    {
                        label = o.Label.ToString(),
                        content = o.Content
                    })
                    .ToList()
                : null
        })
        .ToList();

            _systemService.CreateLog(
    GetStudentId(),
    "start_exam",
    "assignment",
    assignmentId,
    $"Started assignment {assignment.Name}");

            _context.SaveChanges();

            return Ok(questions);
        }


        // SUBMIT EXAM
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitExam(SubmitExamDTO dto)
        {
            var studentId = GetStudentId();

            double totalScore = 0;

            var lastAttempt =
                _context.Results
                .Where(x =>
                    x.StudentId == studentId &&
                    x.AssignmentId == dto.AssignmentId)
                .OrderByDescending(x => x.AttemptNumber)
                .FirstOrDefault();

            int nextAttempt =
                lastAttempt == null
                ? 1
                : lastAttempt.AttemptNumber + 1;

            bool suspicious = false;

            List<string> suspiciousReasons = new();

            if (dto.TabSwitchCount >= 5)
            {
                suspicious = true;
                suspiciousReasons.Add(
                    "Too many tab switches");
            }

            if (dto.TimeSpentSeconds <= 15)
            {
                suspicious = true;
                suspiciousReasons.Add(
                    "Submitted too quickly");
            }

            var result = new Result
            {
                StudentId = studentId,
                AssignmentId = dto.AssignmentId,
                Score = 0,
                SubmittedAt = DateTime.UtcNow,
                AttemptNumber = nextAttempt,
                TimeSpentSeconds = dto.TimeSpentSeconds,
                TabSwitchCount = dto.TabSwitchCount,
                Suspicious = suspicious,
                SuspiciousReason =
                    suspiciousReasons.Count > 0
                    ? string.Join(", ", suspiciousReasons)
                    : null
            };

            _context.Results.Add(result);

            _context.SaveChanges();

            foreach (var ans in dto.Answers)
            {
                var question =
                    _context.Questions.Find(ans.QuestionId);

                if (question == null)
                    continue;

                string dbAnswer =
                    question.CorrectAnswer?
                        .Trim()
                        .ToUpper() ?? "";

                string studentAnswer =
                    ans.Answer?
                        .Trim()
                        .ToUpper() ?? "";

                bool correct =
                    dbAnswer == studentAnswer;

                if (correct)
                    totalScore += question.Score;

                _context.StudentAnswers.Add(
                    new StudentAnswer
                    {
                        StudentId = studentId,
                        AssignmentId = dto.AssignmentId,
                        QuestionId = ans.QuestionId,
                        ResultId = result.Id,
                        Answer = ans.Answer,
                        IsCorrect = correct
                    }
                );
            }

            result.Score = totalScore;

            result.TabSwitchCount =
                dto.TabSwitchCount;

            int questionCount =
                dto.Answers.Count;

            var detect =
                _cheatingService.Analyze(
                    result,
                    questionCount);

            result.Suspicious =
                detect.suspicious;

            result.SuspiciousReason =
                string.Join(
                    ", ",
                    detect.reasons);

            if (detect.suspicious)
            {
                var assignment =
                    _context.Assignments
                    .FirstOrDefault(x =>
                        x.Id == dto.AssignmentId);

                string aiAnalysis = "";

                try
                {
                    aiAnalysis =
                        await _aiService
                        .AnalyzeCheating(
                            new AnalyzeCheatingDTO
                            {
                                AssignmentName =
                                    assignment?.Name ?? "",

                                Score = result.Score,

                                QuestionCount =
                                    questionCount,

                                TimeSpentSeconds =
                                    result.TimeSpentSeconds,

                                TabSwitchCount =
                                    result.TabSwitchCount,

                                AttemptNumber =
                                    result.AttemptNumber,

                                Reasons =
                                    detect.reasons
                            });
                }
                catch
                {
                    aiAnalysis =
                        "AI analysis failed";
                }

                var report =
                    new SuspiciousReport
                    {
                        StudentId = studentId,

                        AssignmentId =
                            dto.AssignmentId,

                        ResultId =
                            result.Id,

                        SuspiciousScore =
                            detect.score,

                        AiRisk =
                            detect.score,

                        Reason =
                            string.Join(
                                ", ",
                                detect.reasons),

                        AiAnalysis =
                            aiAnalysis,

                        Status = "pending",

                        CreatedAt =
                            DateTime.UtcNow
                    };

                _context
                    .SuspiciousReports
                    .Add(report);

                _systemService
                    .CreateNotification(
                        studentId,
                        "Suspicious Activity",
                        "Your exam attempt was flagged for review",
                        "warning");
            }

            await _context.SaveChangesAsync();

            _systemService.CreateLog(
                studentId,
                "submit_exam",
                "assignment",
                dto.AssignmentId,
                detect.suspicious
                ? $"Submitted suspicious attempt #{nextAttempt}"
                : $"Submitted assignment attempt #{nextAttempt}");

            return Ok(new
            {
                resultId = result.Id,
                score = totalScore,
                attempt = nextAttempt,
                suspicious = detect.suspicious,
                suspiciousReason = detect.reasons
            });
        }

        // VIEW RESULT
        [HttpGet("result/{assignmentId}")]
        public IActionResult Result(int assignmentId)
        {
            var studentId = GetStudentId();

            var best =
                _context.Results
                .Where(x =>
                    x.StudentId == studentId &&
                    x.AssignmentId == assignmentId)
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.SubmittedAt)
                .FirstOrDefault();

            if (best == null)
                return NotFound();

            return Ok(best);
        }


        // HISTORY
        [HttpGet("history/{assignmentId}")]
        public IActionResult History(int assignmentId)
        {
            var studentId = GetStudentId();

            var bestId =
                _context.Results
                .Where(x =>
                    x.StudentId == studentId &&
                    x.AssignmentId == assignmentId)
                .OrderByDescending(x => x.Score)
                .Select(x => x.Id)
                .FirstOrDefault();

            var history =
                _context.Results
                .Where(x =>
                    x.StudentId == studentId &&
                    x.AssignmentId == assignmentId)
                .OrderByDescending(x => x.SubmittedAt)
                .Take(10)
                .Select(x => new
                {
                    x.Id,
                    x.Score,
                    x.AttemptNumber,
                    x.SubmittedAt,
                    x.TimeSpentSeconds,
                    IsBest = x.Id == bestId
                })
                .ToList();
            var assignment = _context.Assignments.FirstOrDefault(x => x.Id == assignmentId);

            if (assignment == null)
                return NotFound();

            if (assignment.ShowResult != true)
            {
                return BadRequest(new
                {
                    message = "History hidden"
                });
            }

            return Ok(history);
        }

        [HttpGet("review/{resultId}")]
        public IActionResult Review(int resultId)
        {
            var studentId = GetStudentId();

            var result =
                _context.Results
                .FirstOrDefault(x =>
                    x.Id == resultId &&
                    x.StudentId == studentId);

            if (result == null)
                return NotFound();
            bool showExplanation =_context.Assignments.Where(x => x.Id == result.AssignmentId).Select(x => x.ShowExplanation == true).FirstOrDefault();

            var questions =
                _context.Questions
                .Where(q => q.AssignmentId == result.AssignmentId)
                .Select(q => new
                {
                    q.Id,
                    q.Content,
                    q.Type,
                    q.CorrectAnswer,
                    Explanation = showExplanation? q.Explanation: null,

                    StudentAnswer =
                        _context.StudentAnswers
                        .Where(a =>
                            a.ResultId == resultId &&
                            a.QuestionId == q.Id)
                        .Select(a => a.Answer)
                        .FirstOrDefault(),

                    IsCorrect =
                        _context.StudentAnswers
                        .Where(a =>
                            a.ResultId == resultId &&
                            a.QuestionId == q.Id)
                        .Select(a => a.IsCorrect)
                        .FirstOrDefault(),

                    Options =
                        q.QuestionOptions
                        .Select(o => new
                        {
                            o.Label,
                            o.Content
                        })
                        .ToList()
                })
                .ToList();

            return Ok(questions);
        }
    }
}
