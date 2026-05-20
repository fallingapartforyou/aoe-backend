namespace aoe.DTOs
{
    public class SubmitExamDTO
    {
        public int AssignmentId { get; set; }

        public int TimeSpentSeconds { get; set; }

        public List<StudentAnswerDTO> Answers { get; set; }

        public int TabSwitchCount { get; set; }
    }

    public class StudentAnswerDTO
    {
        public int QuestionId { get; set; }

        public string Answer { get; set; }
    }
}
