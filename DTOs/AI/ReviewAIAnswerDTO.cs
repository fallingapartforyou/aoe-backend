namespace aoe.DTOs.AI
{
    public class ReviewAIAnswerDTO
    {
        public string Question { get; set; } = "";

        public List<AIOptionDTO>? Options { get; set; }

        public string CorrectAnswer { get; set; } = "";

        public string StudentAnswer { get; set; } = "";

        public string Explanation { get; set; } = "";
    }
}
