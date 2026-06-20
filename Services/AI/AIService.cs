using aoe.DTOs.AI;
using System.Text;
using System.Text.Json;
using System.Net;
using static aoe.Services.AI.PromptBuilder;

namespace aoe.Services.AI
{
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;

        private readonly IConfiguration _configuration;

        public AIService(HttpClient httpClient,IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<AIQuestionDTO>> GenerateQuestions(GenerateAIQuestionsDTO dto)
        {
            var prompt = PromptBuilder.BuildGenerateQuestionsPrompt(dto);

            var raw = await SendPrompt(prompt);

            raw = CleanJson(raw);

            var result = JsonSerializer.Deserialize<List<AIQuestionDTO>>(raw,new JsonSerializerOptions {PropertyNameCaseInsensitive = true});

            if (!AIResponseValidator.IsValidQuestionList(result, dto.Type))
            {
                throw new Exception("AI returned invalid question format");
            }

            return result!;
        }

        public async Task<string> GenerateExplanation(GenerateAIExplanationDTO dto)
        {
            var prompt = PromptBuilder.BuildExplanationPrompt(dto);

            return await SendPrompt(prompt);
        }

        public async Task<string>
            ReviewAnswer(
                ReviewAIAnswerDTO dto)
        {
            var prompt =
                PromptBuilder
                .BuildReviewPrompt(dto);

            return await SendPrompt(prompt);
        }

        public async Task<string>
    AnalyzeCheating(
        AnalyzeCheatingDTO dto)
        {
            var prompt =
                PromptBuilder.BuildCheatingAnalyzePrompt(dto);

            return await SendPrompt(prompt);
        }


        private async Task<string>
            SendPrompt(string prompt)
        {
            var apiKey =
                _configuration["Gemini:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new Exception(
                    "Gemini API key missing");
            }

            var url =
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new
                            {
                                text = prompt
                            }
                        }
                    }
                }
            };

            var json =
     JsonSerializer.Serialize(body);

            var content =
                new StringContent(
                    json,
                    Encoding.UTF8,
                    "application/json"
                );

            HttpResponseMessage response;
            string responseText = "";

            for (
                int attempt = 1;
                attempt <= 3;
                attempt++
            )
            {
                response =
                    await _httpClient
                    .PostAsync(
                        url,
                        content
                    );

                responseText =
                    await response
                    .Content
                    .ReadAsStringAsync();

                Console.WriteLine(
                    $"===== GEMINI RESPONSE (Attempt {attempt}) ====="
                );

                Console.WriteLine(
                    responseText
                );

                Console.WriteLine(
                    "==============================================="
                );

                if (
                    response.IsSuccessStatusCode
                )
                {
                    break;
                }

                if (
                    response.StatusCode ==
                    HttpStatusCode.ServiceUnavailable
                )
                {
                    if (attempt < 3)
                    {
                        await Task.Delay(
                            3000
                        );

                        continue;
                    }
                }

                throw new Exception(
                    $"Gemini Error {(int)response.StatusCode}: {responseText}"
                );
            }

            using var doc =
                JsonDocument.Parse(
                    responseText
                );

            return doc
                .RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()
                ?? "";
        }

        private string CleanJson(string raw)
        {
            return raw
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();
        }

        public async Task<double>
    AnalyzeCheatingRisk(
        AnalyzeCheatingDTO dto)
        {
            var prompt =
                PromptBuilder
                .BuildCheatingAnalyzePrompt(dto);

            var raw =
                await SendPrompt(prompt);

            raw = raw.Trim();

            double risk;

            if (!double.TryParse(raw, out risk))
                risk = 0;

            if (risk < 0)
                risk = 0;

            if (risk > 100)
                risk = 100;

            return risk;
        }

        public async Task<string> GenerateRaw(
    string prompt
)
        {
            return await SendPrompt(
                prompt
            );
        }
    }
}