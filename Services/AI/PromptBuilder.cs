using aoe.DTOs.AI;
using System.Text;

namespace aoe.Services.AI
{
    public static class PromptBuilder
    {
        public static string BuildGenerateQuestionsPrompt(
            GenerateAIQuestionsDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine(
                $"Generate {dto.Count} {dto.Type} questions about {dto.Topic}.");

            sb.AppendLine($"Difficulty: {dto.Difficulty}");

            sb.AppendLine();

            sb.AppendLine("Return ONLY valid JSON.");

            sb.AppendLine("No markdown.");
            sb.AppendLine("No explanation outside JSON.");
            sb.AppendLine();

            if (dto.Type == "single_choice")
            {
                sb.AppendLine("""
[
  {
    "content": "",
    "options": [
      {
        "label": "A",
        "content": ""
      },
      {
        "label": "B",
        "content": ""
      },
      {
        "label": "C",
        "content": ""
      },
      {
        "label": "D",
        "content": ""
      }
    ],
    "correctAnswer": "A",
    "explanation": ""
  }
]
""");
            }
            else
            {
                sb.AppendLine("""
[
  {
    "content": "",
    "correctAnswer": "",
    "explanation": ""
  }
]
""");
            }

            return sb.ToString();
        }

        public static string BuildExplanationPrompt(
            GenerateAIExplanationDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Question:");
            sb.AppendLine(dto.Question);

            sb.AppendLine();

            if (dto.Options != null)
            {
                sb.AppendLine("Options:");

                foreach (var o in dto.Options)
                {
                    sb.AppendLine(
                        $"{o.Label}. {o.Content}");
                }
            }

            sb.AppendLine();

            sb.AppendLine(
                $"Correct Answer: {dto.CorrectAnswer}");

            sb.AppendLine();

            sb.AppendLine("""
Explain:
- why the answer is correct
- why the others are incorrect

Return plain text only.
""");

            return sb.ToString();
        }

        public static string BuildReviewPrompt(
            ReviewAIAnswerDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Question:");
            sb.AppendLine(dto.Question);

            sb.AppendLine();

            if (dto.Options != null)
            {
                sb.AppendLine("Options:");

                foreach (var o in dto.Options)
                {
                    sb.AppendLine(
                        $"{o.Label}. {o.Content}");
                }
            }

            sb.AppendLine();

            sb.AppendLine(
                $"Correct Answer: {dto.CorrectAnswer}");

            sb.AppendLine(
                $"Student Answer: {dto.StudentAnswer}");

            sb.AppendLine();

            sb.AppendLine(
                $"Explanation: {dto.Explanation}");

            sb.AppendLine();

            sb.AppendLine("""
Explain why the student's answer is incorrect.

Do not invent information outside the provided context.

Return plain text only.
""");

            return sb.ToString();
        }
    }
}