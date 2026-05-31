using aoe.DTOs.AI;
using aoe.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(
            IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("generate-questions")]
        [Authorize(Roles = "teacher")]
        public async Task<IActionResult>
            GenerateQuestions(
                GenerateAIQuestionsDTO dto)
        {
            var result =
                await _aiService
                .GenerateQuestions(dto);

            return Ok(result);
        }

        [HttpPost("generate-explanation")]
        [Authorize(Roles = "teacher")]
        public async Task<IActionResult>
            GenerateExplanation(
                GenerateAIExplanationDTO dto)
        {
            var result =
                await _aiService
                .GenerateExplanation(dto);

            return Ok(result);
        }

        [HttpPost("review-answer")]
        [Authorize]
        public async Task<IActionResult>
    ReviewAnswer(
        ReviewAIAnswerDTO dto)
        {
            try
            {
                var result =
                    await _aiService
                        .ReviewAnswer(dto);

                return Ok(new
                {
                    response = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}