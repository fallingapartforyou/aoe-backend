using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models;

[Table("skill_submissions")]
public class SkillSubmission
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("skill_task_id")]
    public int SkillTaskId { get; set; }

    [Column("student_name")]
    public string StudentName { get; set; } = null!;

    [Column("file_name")]
    public string? FileName { get; set; }

    [Column("file_url")]
    public string? FileUrl { get; set; }

    [Column("raw_text")]
    public string? RawText { get; set; }

    [Column("word_count")]
    public int WordCount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(SkillTaskId))]
    public virtual SkillTask SkillTask { get; set; } = null!;

    public virtual ICollection<SkillReview>
        Reviews
    { get; set; }
        = new List<SkillReview>();
}