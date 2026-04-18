using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("class_students")]
[Index("ClassId", "StudentId", Name = "class_students_class_id_student_id_key", IsUnique = true)]
public partial class ClassStudent
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [ForeignKey("ClassId")]
    [InverseProperty("ClassStudents")]
    public virtual Class Class { get; set; } = null!;

    [ForeignKey("StudentId")]
    [InverseProperty("ClassStudents")]
    public virtual User Student { get; set; } = null!;
}
