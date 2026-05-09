namespace aoe.DTOs.AI
{
    public class AIQuestionDTO
    {
        public string Content { get; set; }

        public List<AIOptionDTO>? Options { get; set; }

        public string CorrectAnswer { get; set; }

        public string Explanation { get; set; }
    }
}
