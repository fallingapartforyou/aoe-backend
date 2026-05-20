using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("classes")]
[Index("ClassCode", Name = "classes_class_code_key", IsUnique = true)]
[Index("TeacherId", Name = "idx_classes_teacher")]
public partial class Class
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(20)]
    public string Name { get; set; } = null!;

    [Column("class_code")]
    [StringLength(8)]
    public string ClassCode { get; set; } = null!;

    [Column("teacher_id")]
    public int TeacherId { get; set; }

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [InverseProperty("Class")]
    public virtual ICollection<AssignmentClass> AssignmentClasses { get; set; } = new List<AssignmentClass>();

    [InverseProperty("Class")]
    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    [ForeignKey("TeacherId")]
    [InverseProperty("Classes")]
    public virtual User Teacher { get; set; } = null!;

    [InverseProperty(nameof(ClassJoinRequest.Class))]
    public virtual ICollection<ClassJoinRequest> JoinRequests { get; set; }
    = new List<ClassJoinRequest>();
}
