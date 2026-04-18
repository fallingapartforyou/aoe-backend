using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("answers")]
public partial class Answer
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("submission_id")]
    public int SubmissionId { get; set; }

    [Column("question_id")]
    public int QuestionId { get; set; }

    [Column("answer")]
    [StringLength(255)]
    public string Answer1 { get; set; } = null!;

    [Column("is_correct")]
    public bool? IsCorrect { get; set; }

    [ForeignKey("QuestionId")]
    [InverseProperty("Answers")]
    public virtual Question Question { get; set; } = null!;

    [ForeignKey("SubmissionId")]
    [InverseProperty("Answers")]
    public virtual Submission Submission { get; set; } = null!;
}
