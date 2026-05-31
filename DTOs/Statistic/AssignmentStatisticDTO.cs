namespace aoe.DTOs.Statistic
{
    public class AssignmentStatisticDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";

        public int Submissions { get; set; }
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public int SuspiciousCount { get; set; }
        public double AverageTime { get; set; }
    }
}