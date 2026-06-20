using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models;

[Table("skill_reviews")]
public class SkillReview
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("submission_id")]
    public int SubmissionId { get; set; }

    [Column("ai_summary")]
    public string? AiSummary { get; set; }

    [Column("main_topic")]
    public string? MainTopic { get; set; }

    [Column("estimated_level")]
    [StringLength(10)]
    public string? EstimatedLevel { get; set; }

    [Column("grammar_feedback")]
    public string? GrammarFeedback { get; set; }

    [Column("vocabulary_feedback")]
    public string? VocabularyFeedback { get; set; }

    [Column("coherence_feedback")]
    public string? CoherenceFeedback { get; set; }

    [Column("task_completion_feedback")]
    public string? TaskCompletionFeedback { get; set; }

    [Column("teacher_comment")]
    public string? TeacherComment { get; set; }

    [Column("teacher_score")]
    public double? TeacherScore { get; set; }

    [Column("word_count")]
    public int? WordCount { get; set; }

    [Column("reviewed_at")]
    public DateTime ReviewedAt { get; set; }

    [Column("task_relevance")]
    public int? TaskRelevance { get; set; }

    [Column("requirement_satisfaction")]
    public int? RequirementSatisfaction { get; set; }

    [Column("task_relevance_comment")]
    public string? TaskRelevanceComment { get; set; }

    [ForeignKey(nameof(SubmissionId))]
    public virtual SkillSubmission Submission { get; set; } = null!;
}