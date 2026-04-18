using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("results")]
    public partial class Result
    {

        [Column("id")]
        public int Id { get; set; }

        [Column("student_id")]
        public int StudentId { get; set; }

        [Column("assignment_id")]
        public int AssignmentId { get; set; }

        [Column("score")]
        public int Score { get; set; }

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

    }
}