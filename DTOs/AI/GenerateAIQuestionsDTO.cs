namespace aoe.DTOs.AI
{
    public class GenerateAIQuestionsDTO
    {
        public string Topic { get; set; } = "";

        public string Difficulty { get; set; } = "easy";

        public string Type { get; set; } = "single_choice";

        public int Count { get; set; } = 5;
    }
}
