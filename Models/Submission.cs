using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("submissions")]
[Index("StudentId", Name = "idx_submissions_student")]
public partial class Submission
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("assignment_id")]
    public int AssignmentId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("start_time", TypeName = "timestamp without time zone")]
    public DateTime? StartTime { get; set; }

    [Column("submit_time", TypeName = "timestamp without time zone")]
    public DateTime? SubmitTime { get; set; }

    [Column("score")]
    [Precision(5, 2)]
    public decimal? Score { get; set; }

    [InverseProperty("Submission")]
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    [ForeignKey("AssignmentId")]
    [InverseProperty("Submissions")]
    public virtual Assignment Assignment { get; set; } = null!;

    [ForeignKey("StudentId")]
    [InverseProperty("Submissions")]
    public virtual User Student { get; set; } = null!;
}
