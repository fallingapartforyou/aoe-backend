using aoe.DTOs.AI;
using System.Text;

namespace aoe.Services.AI
{
    public static class PromptBuilder
    {
        // =========================
        // GLOBAL RULE (ENGLISH ONLY)
        // =========================
        private static string GlobalRule => """
You are an AI assistant for ENGLISH EDUCATION ONLY.

STRICT DOMAIN RULES:
- Only generate or explain English language learning content
- Focus: grammar, vocabulary, reading, writing, speaking
- Do NOT generate content from unrelated subjects (math, science, IT, programming, engineering, history as academic theory)
- If a topic is outside English learning, transform it into an English learning context (e.g., reading passage or vocabulary exercise)

OUTPUT RULES:
- Follow requested format strictly
- Do NOT add external knowledge outside English learning scope
- Be concise, educational, and student-friendly
""";

        // =========================
        // GENERATE QUESTIONS
        // =========================
        public static string BuildGenerateQuestionsPrompt(
            GenerateAIQuestionsDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine(GlobalRule);

            sb.AppendLine("""
OUTPUT FORMAT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
""");

            sb.AppendLine();
            sb.AppendLine(
                $"Generate {dto.Count} {dto.Type} ENGLISH learning questions about: {dto.Topic}");
            sb.AppendLine($"Difficulty: {dto.Difficulty}");

            sb.AppendLine();

            if (dto.Type == "single_choice")
            {
                sb.AppendLine("""
[
  {
    "content": "",
    "options": [
      { "label": "A", "content": "" },
      { "label": "B", "content": "" },
      { "label": "C", "content": "" },
      { "label": "D", "content": "" }
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

        // =========================
        // EXPLANATION
        // =========================
        public static string BuildExplanationPrompt(
            GenerateAIExplanationDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine(GlobalRule);

            sb.AppendLine("""
TASK:
Explain the English question clearly for learners.

RULES:
- Focus only on English grammar, vocabulary, reading comprehension
- Do NOT introduce other academic fields
- Keep explanation simple and educational
- No markdown
""");

            sb.AppendLine();
            sb.AppendLine("Question:");
            sb.AppendLine(dto.Question);

            sb.AppendLine();

            if (dto.Options != null)
            {
                sb.AppendLine("Options:");
                foreach (var o in dto.Options)
                {
                    sb.AppendLine($"{o.Label}. {o.Content}");
                }
            }

            sb.AppendLine();
            sb.AppendLine($"Correct Answer: {dto.CorrectAnswer}");

            return sb.ToString();
        }

        // =========================
        // REVIEW AI
        // =========================
        public static string BuildReviewPrompt(
            ReviewAIAnswerDTO dto)
        {
            var sb = new StringBuilder();

            sb.AppendLine(GlobalRule);

            sb.AppendLine("""
TASK:
Evaluate student's English understanding.

RULES:
- Only analyze English language knowledge
- Do NOT introduce external subject knowledge
- Focus on grammar, vocabulary, comprehension
- Be concise and educational
""");

            sb.AppendLine();

            sb.AppendLine("Question:");
            sb.AppendLine(dto.Question);

            sb.AppendLine();

            if (dto.Options != null)
            {
                sb.AppendLine("Options:");
                foreach (var o in dto.Options)
                {
                    sb.AppendLine($"{o.Label}. {o.Content}");
                }
            }

            sb.AppendLine();
            sb.AppendLine($"Correct Answer: {dto.CorrectAnswer}");
            sb.AppendLine($"Student Answer: {dto.StudentAnswer}");
            sb.AppendLine($"Explanation: {dto.Explanation}");
            sb.AppendLine($"Student Question: {dto.Ask}");

            return sb.ToString();
        }

        // =========================
        // CHEATING ANALYSIS
        // =========================
        public static string BuildCheatingAnalyzePrompt(
            AnalyzeCheatingDTO dto)
        {
            var reasons =
                dto.Reasons.Any()
                ? string.Join(", ", dto.Reasons)
                : "No obvious heuristic reason";

            return $"""
You are an AI assistant for EDUCATIONAL EXAM MONITORING ONLY.

STRICT DOMAIN RULES:
- Only analyze exam behavior
- Do NOT generate or explain academic subject content
- Do NOT include external domain knowledge
- Focus only on behavioral patterns in online exams

TASK:
Analyze cheating risk based on exam behavior.

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

OUTPUT:
1. Risk score (0-100)
2. Explanation of behavior
3. Suspicious patterns (if any)
4. Teacher recommendation

Return concise plain text only.
""";
        }
    }
}