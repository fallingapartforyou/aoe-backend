using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("results")]
    public partial class Result
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Column("score")]
        public double Score { get; set; }

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        [Column("attempt_number")]
        public int AttemptNumber { get; set; }

        [Column("time_spent_seconds")]
        public int TimeSpentSeconds { get; set; }

        [Column("tab_switch_count")]
        public int TabSwitchCount { get; set; }

        [Column("suspicious")]
        public bool Suspicious { get; set; }

        [Column("suspicious_reason")]
        public string? SuspiciousReason { get; set; }

        public virtual ICollection<StudentAnswer> StudentAnswers { get; set; }
            = new List<StudentAnswer>();
    }
}