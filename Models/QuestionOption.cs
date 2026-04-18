using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("question_options")]
[Index("QuestionId", "Label", Name = "question_options_question_id_label_key", IsUnique = true)]
public partial class QuestionOption
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("question_id")]
    public int QuestionId { get; set; }

    [Column("label")]
    [MaxLength(1)]
    public char Label { get; set; }

    [Column("content")]
    public string Content { get; set; } = null!;

    [ForeignKey("QuestionId")]
    [InverseProperty("QuestionOptions")]
    public virtual Question Question { get; set; } = null!;
}
