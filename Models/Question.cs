using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("questions")]
[Index("AssignmentId", Name = "idx_questions_assignment")]
public partial class Question
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("assignment_id")]
    public int AssignmentId { get; set; }

    [Column("type")]
    [StringLength(20)]
    public string Type { get; set; } = null!;

    [Column("content")]
    public string Content { get; set; } = null!;

    [Column("correct_answer")]
    [StringLength(255)]
    public string CorrectAnswer { get; set; } = null!;

    [Column("explanation")]
    public string? Explanation { get; set; }

    [InverseProperty("Question")]
    public virtual ICollection<Answer> Answers { get; set; } = new List<Answer>();

    [ForeignKey("AssignmentId")]
    [InverseProperty("Questions")]
    public virtual Assignment Assignment { get; set; } = null!;

    [InverseProperty("Question")]
    public virtual ICollection<QuestionOption> QuestionOptions { get; set; } = new List<QuestionOption>();
}
