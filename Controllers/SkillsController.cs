using aoe.DTOs;
using aoe.Models;
using aoe.Services.AI;
using aoe.Services.Systems;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.EMMA;
using DocumentFormat.OpenXml.ExtendedProperties;
using DocumentFormat.OpenXml.Office2013.Drawing.ChartStyle;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Linq.Expressions;
using System.Runtime.ConstrainedExecution;
using System.Runtime.Intrinsics.X86;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Run = DocumentFormat.OpenXml.Spreadsheet.Run;
using Text = DocumentFormat.OpenXml.Spreadsheet.Text;

namespace aoe.Controllers;

[ApiController]
[Route("api/skills")]
[Authorize(Roles = "teacher")]
public class SkillsController : ControllerBase
{
    private readonly AoeDbContext _context;
    private readonly IAIService _aiService;

    public SkillsController(
            AoeDbContext context,
            IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var tasks =
            _context.SkillTasks
            .Where(x =>
                x.TeacherId == teacherId
            )
            .OrderByDescending(x =>
                x.CreatedAt
            )
            .Select(x => new
            {
                x.Id,
                x.SkillType,
                x.InputType,
                x.Level,
                x.Topic,
                x.Requirements,
                x.CreatedAt,

                SubmissionCount =
                    x.SkillSubmissions.Count
            })
            .ToList();

        return Ok(tasks);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(
        int id
    )
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var task =
            _context.SkillTasks
            .Where(x =>
                x.Id == id
                &&
                x.TeacherId == teacherId
            )
            .Select(x => new
            {
                x.Id,
                x.SkillType,
                x.InputType,
                x.Level,
                x.Topic,
                x.Requirements,
                x.CreatedAt
            })
            .FirstOrDefault();

        if (task == null)
        {
            return NotFound(
                "Task not found"
            );
        }

        return Ok(task);
    }

    [HttpPost]
    public IActionResult Create(
        CreateSkillTaskRequest request
    )
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var task =
            new SkillTask
            {
                TeacherId =
                    teacherId,

                SkillType =
                    request.SkillType,

                InputType =
                    request.InputType,

                Level =
                    request.Level,

                Topic =
                    request.Topic,

                Requirements =
                    request.Requirements,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.SkillTasks.Add(
            task
        );

        _context.SaveChanges();

        return Ok(new
        {
            task.Id,
            Message =
                "Skill task created"
        });
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(
        int id
    )
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var task =
            _context.SkillTasks
            .FirstOrDefault(x =>
                x.Id == id
                &&
                x.TeacherId == teacherId
            );

        if (task == null)
        {
            return NotFound();
        }

        _context.SkillTasks.Remove(
            task
        );

        _context.SaveChanges();

        return Ok(new
        {
            Message =
                "Deleted"
        });
    }

    [HttpPost("upload")]
    public IActionResult Upload(
    UploadSkillSubmissionRequest request
)
    {
        var task =
            _context.SkillTasks
            .FirstOrDefault(x =>
                x.Id == request.SkillTaskId
            );

        if (task == null)
        {
            return NotFound(
                "Skill task not found"
            );
        }

        var wordCount = 0;

        if (!string.IsNullOrWhiteSpace(
            request.RawText
        ))
        {
            wordCount =
                request.RawText
                .Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries
                )
                .Length;
        }

        var submission =
            new SkillSubmission
            {
                SkillTaskId =
                    request.SkillTaskId,

                StudentName =
                    request.StudentName,

                RawText =
                    request.RawText,

                FileName =
                    request.FileName,

                FileUrl =
                    request.FileUrl,

                WordCount =
                    wordCount,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.SkillSubmissions.Add(
            submission
        );

        _context.SaveChanges();

        return Ok(new
        {
            submission.Id,
            submission.WordCount
        });
    }

    [HttpGet("submission/{submissionId}")]
    public IActionResult GetSubmission(
        int submissionId
    )
    {
        var submission =
            _context.SkillSubmissions
            .Where(x =>
                x.Id == submissionId
            )
            .Select(x => new
            {
                x.Id,
                x.StudentName,
                x.FileName,
                x.FileUrl,
                x.RawText,
                x.WordCount,
                x.CreatedAt
            })
            .FirstOrDefault();

        if (submission == null)
        {
            return NotFound();
        }

        return Ok(submission);
    }

    [HttpPost("analyze/{submissionId}")]
    public async Task<IActionResult> Analyze(
int submissionId
)
    {
        var submission =
        _context.SkillSubmissions
        .FirstOrDefault(x =>
        x.Id == submissionId
        );

        if (submission == null)
        {
            return NotFound();
        }

        var task =
    _context.SkillTasks
    .FirstOrDefault(x =>
        x.Id == submission.SkillTaskId
    );

        if (task == null)
        {
            return BadRequest(
                "Skill task not found"
            );
        }

        var prompt =
$@"
You are an expert Academic Writing examiner, CEFR assessor, and professional writing instructor.

Analyze the student's writing submission.

Topic:
{task?.Topic}

Requirements:
{task?.Requirements}

Expected Level:
{task?.Level}

The expected level is ONLY contextual information.

Do NOT force your CEFR evaluation to match the expected level.

Evaluate the actual quality of the student's writing independently.

Evaluate:

Task Completion

Requirement Satisfaction

Task Relevance

Content Quality

Organization

Coherence & Cohesion

Vocabulary Range

Vocabulary Accuracy

Grammar Range

Grammar Accuracy

Sentence Structure

Mechanics

Academic Style

Critical Thinking

Originality

Estimate the student's actual CEFR level from A1 to C2.

Provide a short explanation for the estimated CEFR level.

Determine whether the submission actually responds to the assigned topic and requirements.

TaskRelevance score:

0-20
Completely unrelated

21-40
Mostly unrelated

41-60
Partially related

61-80
Generally relevant

81-100
Strongly aligned

RequirementSatisfaction score:

0-20
Requirements ignored

21-40
Very limited fulfillment

41-60
Partially fulfilled

61-80
Mostly fulfilled

81-100
Fully fulfilled

Only identify genuine language mistakes.

Allowed annotation categories:

Grammar

Vocabulary

Spelling

Collocation

Do NOT annotate:

stylistic improvements

stronger alternatives

academic improvements

repetitive vocabulary

simple vocabulary

basic vocabulary

correct phrases

correct sentences

correct grammar

correct collocations

titles

headings

Examples that MUST NOT be annotated:

very important

very helpful

important

use technology

in a good way

These may be mentioned in feedback but NEVER appear in annotations.

Only annotate actual mistakes.

Each annotation MUST satisfy:

errorText contains only incorrect words

errorText is shorter than 6 words

errorText is shorter than 40 characters

errorText is not a complete sentence

errorText contains only the incorrect fragment

annotate only genuine errors

If there are no genuine language errors:

""annotations"": []

Evaluate task matching separately.

Task Relevance:
Score from 0-100.

0 = completely unrelated to the assigned topic.

100 = fully relevant to the assigned topic.

Requirement Satisfaction:
Score from 0-100.

Evaluate how well the student satisfies the task requirements.

If the essay is unrelated to the task,
Requirement Satisfaction should be very low.

Provide a short explanation in:

taskRelevanceComment

Return ONLY valid JSON.

{{
""mainTopic"": """",

""estimatedLevel"": """",

""taskRelevance"": 0,

""taskRelevanceComment"": """",

""requirementSatisfaction"": 0,

""wordCount"": 0,

""overallComment"": """",

""strengths"": [
""""
],

""weaknesses"": [
""""
],

""grammarFeedback"": """",

""vocabularyFeedback"": """",

""coherenceFeedback"": """",

""taskCompletionFeedback"": """",

""cefrJustification"": """",

""taskRelevance"":0,

""requirementSatisfaction"":0,

""taskRelevanceComment"":"""",

""annotations"": [
{{
""errorText"": """",
""errorType"": ""Grammar|Vocabulary|Spelling|Collocation"",
""suggestion"": """",
""severity"": ""Low|Medium|High"",
""comment"": """"
}}
]
}}

{submission.RawText}
";


        var response =
            await _aiService.GenerateRaw(
                prompt
            );

        Console.WriteLine(
    "===== AI RESPONSE ====="
);

        Console.WriteLine(
            response
        );

        Console.WriteLine(
            "======================="
        );

        response =
            response
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();
        
        AIReviewResultDTO? result;

        try
        {
            result =
                JsonSerializer.Deserialize
                <AIReviewResultDTO>(
                    response,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive =
                            true
                    }
                );
        }
        catch
        {
            return BadRequest(
                new
                {
                    Message =
                        "AI returned invalid JSON",

                    Raw =
                        response
                }
            );
        }

        if (result == null)
        {
            return BadRequest(
                "AI parse failed"
            );
        }

        var review =
            new SkillReview
            {
                SubmissionId =
                    submissionId,

                MainTopic =
                    result.MainTopic,

                EstimatedLevel =
                    result.EstimatedLevel,

                AiSummary =
                    result.OverallComment,

                GrammarFeedback =
                    result.GrammarFeedback,

                VocabularyFeedback =
                    result.VocabularyFeedback,

                CoherenceFeedback =
                    result.CoherenceFeedback,

                TaskCompletionFeedback =
                    result.TaskCompletionFeedback,

                WordCount =
                    submission.WordCount,

                TaskRelevance =
                    result.TaskRelevance,

                RequirementSatisfaction =
                    result.RequirementSatisfaction,

                TaskRelevanceComment =
                    result.TaskRelevanceComment,

                ReviewedAt =
                    DateTime.UtcNow
            };

        var oldReview =
    _context.SkillReviews
    .FirstOrDefault(x =>
        x.SubmissionId == submissionId
    );

        if (oldReview != null)
        {
            var oldAnnotations =
                _context.SkillAnnotations
                .Where(x =>
                    x.ReviewId == oldReview.Id
                );

            _context.SkillAnnotations.RemoveRange(
                oldAnnotations
            );

            _context.SkillReviews.Remove(
                oldReview
            );

            _context.SaveChanges();
        }

        _context.SkillReviews.Add(
            review
        );

        _context.SaveChanges();
        Console.WriteLine(
    $"Review saved. Id={review.Id}, SubmissionId={review.SubmissionId}"
);

        if (result.Annotations != null)
        {
            foreach (
                var item
                in result.Annotations
            )
            {
                _context.SkillAnnotations.Add(
                    new SkillAnnotation
                    {
                        ReviewId =
                            review.Id,

                        ErrorText =
                            item.ErrorText,

                        ErrorType =
                            item.ErrorType,

                        Suggestion =
                            item.Suggestion,

                        CreatedAt =
                            DateTime.UtcNow
                    }
                );
            }

            _context.SaveChanges();
        }

        return Ok(new
        {
            reviewId = review.Id
        });
    }

    [HttpGet("review-detail/{reviewId}")]
    public IActionResult GetReviewDetail(
    int reviewId
)
    {
        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.Id == reviewId
            );

        if (review == null)
        {
            return NotFound();
        }

        var submission =
            _context.SkillSubmissions
            .FirstOrDefault(x =>
                x.Id == review.SubmissionId
            );

        var annotations =
            _context.SkillAnnotations
            .Where(x =>
                x.ReviewId == review.Id
            )
            .ToList();

        return Ok(new
        {
            submission,
            review,
            annotations
        });
    }

    [HttpGet("review-by-submission/{submissionId}")]
    public IActionResult GetReviewBySubmission(
    int submissionId
)
    {
        var review =
            _context.SkillReviews
            .OrderByDescending(x => x.Id)
            .FirstOrDefault(x =>
                x.SubmissionId == submissionId
            );

        if (review == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            reviewId = review.Id
        });
    }

    [HttpPost("comment/{reviewId}")]
    public IActionResult AddTeacherComment(
    int reviewId,
    AddTeacherCommentRequest request
)
    {
        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.Id == reviewId
            );

        if (review == null)
        {
            return NotFound();
        }

        review.TeacherComment =
            request.Comment;

        _context.SaveChanges();

        return Ok();
    }

    [HttpPost("score/{reviewId}")]
    public IActionResult ScoreReview(
    int reviewId,
    ScoreReviewRequest request
)
    {
        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.Id == reviewId
            );

        if (review == null)
        {
            return NotFound();
        }

        review.TeacherScore =
            request.Score;

        _context.SaveChanges();

        return Ok();
    }
    [HttpGet("annotations/{reviewId}")]
    public IActionResult GetAnnotations(
    int reviewId
)
    {
        return Ok(
            _context.SkillAnnotations
            .Where(x =>
                x.ReviewId == reviewId
            )
            .ToList()
        );
    }

    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var taskIds =
            _context.SkillTasks
            .Where(x =>
                x.TeacherId == teacherId
            )
            .Select(x =>
                x.Id
            )
            .ToList();

        var totalSubmissions =
            _context.SkillSubmissions
            .Count(x =>
                taskIds.Contains(
                    x.SkillTaskId
                )
            );

        var reviewed =
            (
                from review in _context.SkillReviews

                join submission in
                    _context.SkillSubmissions
                on review.SubmissionId
                equals submission.Id

                where taskIds.Contains(
                    submission.SkillTaskId
                )

                select review.Id
            )
            .Count();

        return Ok(new
        {
            TotalTasks =
                taskIds.Count,

            TotalSubmissions =
                totalSubmissions,

            Reviewed =
                reviewed,

            Pending =
                totalSubmissions - reviewed
        });
    }

    [HttpGet("submissions/{taskId}")]
    public IActionResult GetSubmissions(
    int taskId
)
    {
        var teacherId =
            int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );

        var ownsTask =
            _context.SkillTasks
            .Any(x =>
                x.Id == taskId
                &&
                x.TeacherId == teacherId
            );

        if (!ownsTask)
        {
            return Unauthorized();
        }

        var submissions =
            _context.SkillSubmissions
            .Where(x =>
                x.SkillTaskId == taskId
            )
            .OrderByDescending(x =>
                x.CreatedAt
            )
            .Select(x => new
            {
                x.Id,
                x.StudentName,
                x.FileName,
                x.WordCount,
                x.CreatedAt,

                Reviewed =
                    _context.SkillReviews
                    .Any(r =>
                        r.SubmissionId == x.Id
                    )
            })
            .ToList();

        return Ok(submissions);
    }

    [HttpGet("review/{submissionId}")]
    public IActionResult GetReview(
    int submissionId
)
    {
        var submission =
            _context.SkillSubmissions
            .FirstOrDefault(x =>
                x.Id == submissionId
            );

        if (submission == null)
        {
            return NotFound();
        }

        var review =
            _context.SkillReviews
            .Where(x =>
                x.SubmissionId == submissionId
            )
            .OrderByDescending(x =>
                x.Id
            )
            .FirstOrDefault();

        if (review == null)
        {
            return Ok(new
            {
                pending = true
            });
        }

        var annotations =
            _context.SkillAnnotations
            .Where(x =>
                x.ReviewId == review.Id
            )
            .Select(x => new
            {
                x.Id,
                x.ErrorText,
                x.ErrorType,
                x.Suggestion,
                x.Comment,
                x.Severity,
                x.Replacement,
                x.StartIndex,
                x.EndIndex
            })
            .ToList();

        return Ok(new
        {
            Submission = new
            {
                submission.Id,
                submission.StudentName,
                submission.FileName,
                submission.RawText,
                submission.WordCount,
                submission.CreatedAt
            },

            Review = review,

            Annotations = annotations
        });
    }

    [HttpPut("review/{reviewId}")]
    public IActionResult UpdateReview(
    int reviewId,
    UpdateSkillReviewRequest request
)
    {
        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.Id == reviewId
            );

        if (review == null)
        {
            return NotFound();
        }

        review.TeacherComment =
            request.TeacherComment;

        review.TeacherScore =
            request.TeacherScore;

        _context.SaveChanges();

        return Ok(new
        {
            Message =
                "Review updated"
        });
    }

    [HttpDelete("submission/{id}")]
    public IActionResult DeleteSubmission(
    int id
)
    {
        var submission =
            _context.SkillSubmissions
            .FirstOrDefault(x =>
                x.Id == id
            );

        if (submission == null)
        {
            return NotFound();
        }

        var reviews =
            _context.SkillReviews
            .Where(x =>
                x.SubmissionId == id
            )
            .ToList();

        foreach (var review in reviews)
        {
            var annotations =
                _context.SkillAnnotations
                .Where(x =>
                    x.ReviewId == review.Id
                );

            _context.SkillAnnotations
                .RemoveRange(
                    annotations
                );
        }

        _context.SkillReviews
            .RemoveRange(
                reviews
            );

        _context.SkillSubmissions
            .Remove(
                submission
            );

        _context.SaveChanges();

        return Ok(new
        {
            Message =
                "Submission deleted"
        });
    }

    [HttpGet("download/{submissionId}")]
    public IActionResult Download(
    int submissionId
)
    {
        var submission =
            _context.SkillSubmissions
            .FirstOrDefault(x =>
                x.Id == submissionId
            );

        if (submission == null)
        {
            return NotFound();
        }

        if (
            string.IsNullOrWhiteSpace(
                submission.FileUrl
            )
        )
        {
            return BadRequest(
                "No file"
            );
        }

        var path =
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                submission.FileUrl.TrimStart('/')
            );

        if (!System.IO.File.Exists(path))
        {
            return NotFound(
                "File not found"
            );
        }

        var bytes =
            System.IO.File.ReadAllBytes(
                path
            );

        return File(
            bytes,
            "application/octet-stream",
            submission.FileName
        );
    }

    [HttpPost("reanalyze/{submissionId}")]
    public async Task<IActionResult> Reanalyze(
    int submissionId
)
    {
        var oldReviews =
            _context.SkillReviews
            .Where(x =>
                x.SubmissionId ==
                submissionId
            )
            .ToList();

        foreach (
            var review
            in oldReviews
        )
        {
            var annotations =
                _context.SkillAnnotations
                .Where(x =>
                    x.ReviewId ==
                    review.Id
                );

            _context.SkillAnnotations
                .RemoveRange(
                    annotations
                );
        }

        _context.SkillReviews
            .RemoveRange(
                oldReviews
            );

        _context.SaveChanges();

        return await Analyze(
            submissionId
        );
    }

    [HttpGet("export/docx/{submissionId}")]
    public IActionResult ExportDocx(
int submissionId
)
    {
        var submission =
        _context.SkillSubmissions
        .FirstOrDefault(x =>
        x.Id == submissionId
        );

        if (submission == null)
        {
            return NotFound();
        }

        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.SubmissionId ==
                submissionId
            );

        if (review == null)
        {
            return NotFound(
                "Review not found"
            );
        }

        var annotations =
            _context.SkillAnnotations
            .Where(x =>
                x.ReviewId ==
                review.Id
            )
            .ToList();

        using var stream =
            new MemoryStream();

        using (
            var document =
                WordprocessingDocument.Create(
                    stream,
                    DocumentFormat.OpenXml.WordprocessingDocumentType.Document,
                    true
                )
        )
        {
            var mainPart =
                document.AddMainDocumentPart();

            mainPart.Document =
                new DocumentFormat.OpenXml.Wordprocessing.Document();

            var body =
                new Body();

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            "SKILLS REVIEW REPORT"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Student: {submission.StudentName}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Word Count: {submission.WordCount}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            "===================="
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            submission.RawText ?? ""
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            "AI SUMMARY"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            review.AiSummary ?? ""
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"CEFR Level: {review.EstimatedLevel}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Grammar: {review.GrammarFeedback}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Vocabulary: {review.VocabularyFeedback}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Coherence: {review.CoherenceFeedback}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Task Completion: {review.TaskCompletionFeedback}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Teacher Score: {review.TeacherScore}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            $"Teacher Comment: {review.TeacherComment}"
                        )
                    )
                )
            );

            body.Append(
                new Paragraph(
                    new Run(
                        new Text(
                            "ANNOTATIONS"
                        )
                    )
                )
            );

            foreach (
                var item
                in annotations
            )
            {
                body.Append(
                    new Paragraph(
                        new Run(
                            new Text(
                                $"{item.ErrorText} -> {item.Suggestion}"
                            )
                        )
                    )
                );
            }

            mainPart.Document.Append(
                body
            );

            mainPart.Document.Save();
        }

        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"review_{submissionId}.docx"
        );
    }

    [HttpGet("export/pdf/{submissionId}")]
    public IActionResult ExportPdf(
int submissionId
)
    {
        var submission =
        _context.SkillSubmissions
        .FirstOrDefault(x =>
        x.Id == submissionId
        );

        if (submission == null)
        {
            return NotFound();
        }

        var review =
            _context.SkillReviews
            .FirstOrDefault(x =>
                x.SubmissionId ==
                submissionId
            );

        if (review == null)
        {
            return NotFound();
        }

        var pdf =
            QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(20);

                    page.Content()
                        .Column(column =>
                        {
                            column.Item()
                                .Text(
                                    "SKILLS REVIEW REPORT"
                                )
                                .Bold();

                            column.Item()
                                .Text(
                                    $"Student: {submission.StudentName}"
                                );

                            column.Item()
                                .Text(
                                    $"Word Count: {submission.WordCount}"
                                );

                            column.Item()
                                .Text(
                                    submission.RawText ?? ""
                                );

                            column.Item()
                                .Text(
                                    $"Level: {review.EstimatedLevel}"
                                );

                            column.Item()
                                .Text(
                                    review.AiSummary ?? ""
                                );

                            column.Item()
                                .Text(
                                    review.GrammarFeedback ?? ""
                                );

                            column.Item()
                                .Text(
                                    review.VocabularyFeedback ?? ""
                                );

                            column.Item()
                                .Text(
                                    review.CoherenceFeedback ?? ""
                                );

                            column.Item()
                                .Text(
                                    review.TaskCompletionFeedback ?? ""
                                );

                            column.Item()
                                .Text(
                                    $"Teacher Score: {review.TeacherScore}"
                                );

                            column.Item()
                                .Text(
                                    review.TeacherComment ?? ""
                                );
                        });
                });
            });

        var bytes =
            pdf.GeneratePdf();

        return File(
            bytes,
            "application/pdf",
            $"review_{submissionId}.pdf"
        );
    }
}