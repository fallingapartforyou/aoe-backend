using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("class_join_requests")]
    public class ClassJoinRequest
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("class_id")]
        public int ClassId { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("type")]
        public string Type { get; set; } = "student_request";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(ClassId))]
        public Class Class { get; set; } = null!;

        [ForeignKey(nameof(StudentId))]
        public User Student { get; set; } = null!;
    }
}