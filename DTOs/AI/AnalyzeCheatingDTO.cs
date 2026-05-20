namespace aoe.DTOs.AI
{
    public class AnalyzeCheatingDTO
    {
        public string AssignmentName { get; set; } = "";

        public double Score { get; set; }

        public int QuestionCount { get; set; }

        public int TimeSpentSeconds { get; set; }

        public int TabSwitchCount { get; set; }

        public int AttemptNumber { get; set; }

        public List<string> Reasons { get; set; }
            = new();
    }
}