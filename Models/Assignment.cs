using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("assignments")]
public partial class Assignment
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(20)]
    public string Name { get; set; } = null!;

    [Column("question_type")]
    [StringLength(20)]
    public string QuestionType { get; set; } = null!;

    [Column("question_count")]
    public int QuestionCount { get; set; }

    [Column("open_time", TypeName = "timestamp without time zone")]
    public DateTime? OpenTime { get; set; }

    [Column("close_time", TypeName = "timestamp without time zone")]
    public DateTime? CloseTime { get; set; }

    [Column("show_result")]
    public bool? ShowResult { get; set; }

    [Column("show_explanation")]
    public bool? ShowExplanation { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [InverseProperty("Assignment")]
    public virtual ICollection<AssignmentClass> AssignmentClasses { get; set; } = new List<AssignmentClass>();

    [InverseProperty("Assignment")]
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

    [InverseProperty("Assignment")]
    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();
}
