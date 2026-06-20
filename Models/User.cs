using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace aoe.Models;

[Table("users")]
[Index("Email", Name = "users_email_key", IsUnique = true)]
[Index("Phone", Name = "users_phone_key", IsUnique = true)]
public partial class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(25)]
    public string Name { get; set; } = null!;

    [Column("email")]
    [StringLength(32)]
    public string Email { get; set; } = null!;

    [Column("phone")]
    [StringLength(11)]
    public string Phone { get; set; } = null!;

    [Column("password")]
    [StringLength(20)]
    public string Password { get; set; } = null!;

    [Column("role")]
    [StringLength(10)]
    public string Role { get; set; } = null!;

    [Column("created_at", TypeName = "timestamp without time zone")]
    public DateTime? CreatedAt { get; set; }

    [Column("last_login_at", TypeName = "timestamp without time zone")]
    public DateTime? LastLoginAt { get; set; }

    [Column("is_banned")]
    public bool IsBanned { get; set; } = false;

    [InverseProperty("Student")]
    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    [InverseProperty("Teacher")]
    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    [InverseProperty("Student")]
    public virtual ICollection<Submission> Submissions { get; set; } = new List<Submission>();

    [InverseProperty(nameof(ClassJoinRequest.Student))]
    public virtual ICollection<ClassJoinRequest> JoinRequests { get; set; } = new List<ClassJoinRequest>();

    [InverseProperty(nameof(Notification.User))]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [InverseProperty(nameof(ActivityLog.User))]
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();

    [InverseProperty(nameof(SkillTask.Teacher))]
    public virtual ICollection<SkillTask>
    SkillTasks
    { get; set; }
    = new List<SkillTask>();
}
