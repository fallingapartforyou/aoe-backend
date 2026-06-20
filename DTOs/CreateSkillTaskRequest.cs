namespace aoe.DTOs;

public class CreateSkillTaskRequest
{
    public string SkillType { get; set; } = "";
    public string InputType { get; set; } = "";
    public string Level { get; set; } = "";
    public string? Topic { get; set; }
    public string? Requirements { get; set; }
}