using aoe.DTOs.AI;

namespace aoe.Services.AI
{
    public static class AIResponseValidator
    {
        public static bool IsValidQuestionList(
            List<AIQuestionDTO>? questions,
            string type)
        {
            if (questions == null || !questions.Any())
                return false;

            foreach (var q in questions)
            {
                if (string.IsNullOrWhiteSpace(q.Content))
                    return false;

                if (string.IsNullOrWhiteSpace(q.CorrectAnswer))
                    return false;

                if (type == "single_choice")
                {
                    if (q.Options == null
                        || q.Options.Count != 4)
                        return false;

                    var labels =
                        q.Options
                        .Select(x => x.Label)
                        .ToList();

                    if (!labels.Contains("A")
                        || !labels.Contains("B")
                        || !labels.Contains("C")
                        || !labels.Contains("D"))
                        return false;

                    if (!new[] { "A", "B", "C", "D" }
                        .Contains(q.CorrectAnswer))
                        return false;
                }
            }

            return true;
        }
    }
}