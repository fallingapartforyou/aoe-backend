using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("student_answers")]
    public partial class StudentAnswer
    {
        public int StudentId { get; set; }

        public int AssignmentId { get; set; }

        public int QuestionId { get; set; }

        public int ResultId { get; set; }

        public string? Answer { get; set; }

        public bool? IsCorrect { get; set; }

        [ForeignKey(nameof(ResultId))]
        public virtual Result Result { get; set; }
    }
}