namespace aoe.Models
{
    public partial class StudentAnswer
    {
        public int Id { get; set; }

        public int StudentId { get; set; }

        public int AssignmentId { get; set; }

        public int QuestionId { get; set; }

        public string? Answer { get; set; }

        public bool? IsCorrect { get; set; }
    }
}
