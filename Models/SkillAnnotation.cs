using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models;

[Table("skill_annotations")]
public class SkillAnnotation
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("review_id")]
    public int ReviewId { get; set; }

    [Column("error_text")]
    public string? ErrorText { get; set; }

    [Column("error_type")]
    public string? ErrorType { get; set; }

    [Column("suggestion")]
    public string? Suggestion { get; set; }

    [Column("start_index")]
    public int? StartIndex { get; set; }

    [Column("end_index")]
    public int? EndIndex { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("severity")]
    public string? Severity { get; set; }

    [Column("comment")]
    public string? Comment { get; set; }

    [Column("replacement")]
    public string? Replacement { get; set; }

    [ForeignKey(nameof(ReviewId))]
    public virtual SkillReview Review { get; set; } = null!;
}