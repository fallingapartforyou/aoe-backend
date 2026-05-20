using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("suspicious_reports")]
    public class SuspiciousReport
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Column("result_id")]
        public int ResultId { get; set; }

        [Column("suspicious_score")]
        public double SuspiciousScore { get; set; }

        [Column("ai_risk")]
        public double AiRisk { get; set; }

        [Column("reason")]
        public string Reason { get; set; } = null!;

        [Column("ai_analysis")]
        public string? AiAnalysis { get; set; }

        [Column("status")]
        public string Status { get; set; } = "pending";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}