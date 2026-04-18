namespace aoe.DTOs.Question
{
    public class CreateQuestionDTO
    {
        public int AssignmentId { get; set; }

        public string Type { get; set; }

        public string Content { get; set; }

        public string CorrectAnswer { get; set; }

        public string? Explanation { get; set; }
    }
}
