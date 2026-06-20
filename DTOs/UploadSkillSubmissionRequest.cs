namespace aoe.DTOs;

public class UploadSkillSubmissionRequest
{
    public int SkillTaskId { get; set; }

    public string StudentName { get; set; } = "";

    public string? RawText { get; set; }

    public string? FileName { get; set; }

    public string? FileUrl { get; set; }
}