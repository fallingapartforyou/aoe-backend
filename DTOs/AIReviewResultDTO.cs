namespace aoe.DTOs
{
    public class AIReviewResultDTO
    {
        public string? MainTopic { get; set; }

        public string? EstimatedLevel { get; set; }

        public string? OverallComment { get; set; }

        public string? GrammarFeedback { get; set; }

        public string? VocabularyFeedback { get; set; }

        public string? CoherenceFeedback { get; set; }

        public string? TaskCompletionFeedback { get; set; }

        public int TaskRelevance { get; set; }

        public string? TaskRelevanceComment { get; set; }

        public int RequirementSatisfaction { get; set; }

        public List<AIAnnotationDTO>
            Annotations
        { get; set; } = [];
    }
}
