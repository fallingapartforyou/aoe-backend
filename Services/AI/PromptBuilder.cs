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

        // ===== EXPLANATION =====
        public static string BuildExplanationPrompt(
            GenerateAIExplanationDTO dto)
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

            sb.AppendLine();

            sb.AppendLine("""
Explain:
- why the answer is correct
- why the others are incorrect
- concise and educational

Return plain text only.
""");

            return sb.ToString();
        }

        // ===== REVIEW AI =====
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

            sb.AppendLine(
                $"Student Question: {dto.Ask}");

            sb.AppendLine();

            sb.AppendLine("""
Explain:
- answer the student's question
- explain why the answer is correct or incorrect
- teach the related concept
- concise and educational

Do not invent information outside the provided context.

Return plain text only.
""");

            return sb.ToString();
        }

        public static string BuildCheatingAnalyzePrompt(
    AnalyzeCheatingDTO dto)
        {
            var reasons =
        dto.Reasons.Any()
        ? string.Join(", ", dto.Reasons)
        : "No obvious heuristic reason";

            return
        $"""
You are an AI exam cheating detector.

Analyze whether this exam attempt is suspicious.

Assignment:
{dto.AssignmentName}

Score:
{dto.Score}

Question Count:
{dto.QuestionCount}

Time Spent:
{dto.TimeSpentSeconds} seconds

Tab Switch Count:
{dto.TabSwitchCount}

Attempt Number:
{dto.AttemptNumber}

Heuristic Flags:
{reasons}

Tasks:
1. Determine cheating risk level from 0-100
2. Explain why this attempt is suspicious or normal
3. Mention behavioral anomalies
4. Give short recommendation for teacher review

Return concise plain text only.
""";
        }
    }
}