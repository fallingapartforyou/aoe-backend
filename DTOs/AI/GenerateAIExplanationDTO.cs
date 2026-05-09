namespace aoe.DTOs.AI
{
    public class GenerateAIExplanationDTO
    {
        public string Question { get; set; } = "";

        public List<AIOptionDTO>? Options { get; set; }

        public string CorrectAnswer { get; set; } = "";
    }
}
