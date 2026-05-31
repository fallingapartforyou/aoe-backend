namespace aoe.DTOs.Statistic
{
    public class StudentStatisticDTO
    {
        public int TotalAttempts { get; set; }
        public double AverageScore { get; set; }
        public double BestScore { get; set; }
        public int SuspiciousCount { get; set; }
        public double AverageTime { get; set; }
    }
}