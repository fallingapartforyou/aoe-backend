using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models;

[Table("skill_tasks")]
public class SkillTask
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Column("skill_type")]
    [StringLength(20)]
    public string SkillType { get; set; } = null!;

    [Column("input_type")]
    [StringLength(20)]
    public string InputType { get; set; } = null!;

    [Column("level")]
    [StringLength(10)]
    public string Level { get; set; } = null!;

    [Column("topic")]
    public string? Topic { get; set; }

    [Column("requirements")]
    public string? Requirements { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(TeacherId))]
    public virtual User Teacher { get; set; } = null!;

    public virtual ICollection<SkillSubmission>
        SkillSubmissions
    { get; set; }
        = new List<SkillSubmission>();
}