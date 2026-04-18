using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("assignment_classes")]
[Index("AssignmentId", "ClassId", Name = "assignment_classes_assignment_id_class_id_key", IsUnique = true)]
[Index("AssignmentId", Name = "idx_assignment_classes_assignment")]
[Index("ClassId", Name = "idx_assignment_classes_class")]
public partial class AssignmentClass
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("assignment_id")]
    public int AssignmentId { get; set; }

    [Column("class_id")]
    public int ClassId { get; set; }

    [ForeignKey("AssignmentId")]
    [InverseProperty("AssignmentClasses")]
    public virtual Assignment Assignment { get; set; } = null!;

    [ForeignKey("ClassId")]
    [InverseProperty("AssignmentClasses")]
    public virtual Class Class { get; set; } = null!;
}
