using aoe.DTOs.AI;

namespace aoe.Services.AI
{
    public interface IAIService
    {
        Task<List<AIQuestionDTO>> GenerateQuestions(GenerateAIQuestionsDTO dto);

        Task<string> GenerateExplanation(GenerateAIExplanationDTO dto);

        Task<string> ReviewAnswer(ReviewAIAnswerDTO dto);

        Task<string> AnalyzeCheating(AnalyzeCheatingDTO dto);

        Task<string> GenerateRaw(string prompt);
    }
}