namespace aoe.DTOs.Statistic
{
    public class TeacherStatisticDTO
    {
        public int AssignmentCount { get; set; }
        public int SubmissionCount { get; set; }
        public double AverageScore { get; set; }
        public int SuspiciousCount { get; set; }
        public double AverageTime { get; set; }
    }
}