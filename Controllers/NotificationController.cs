using aoe.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace aoe.Controllers
{
    [ApiController]
    [Route("api/notification")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AoeDbContext _context;

        public NotificationController(AoeDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            return int.Parse(
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )!
            );
        }

        // =====================
        // MY NOTIFICATIONS
        // =====================

        [HttpGet("my")]
        public IActionResult My()
        {
            var userId = GetUserId();

            var data =
                _context.Notifications
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(30)
                .Select(x => new
                {
                    x.Id,
                    x.Title,
                    x.Message,
                    x.Type,
                    x.IsRead,
                    x.CreatedAt
                })
                .ToList();

            return Ok(data);
        }

        // =====================
        // UNREAD COUNT
        // =====================

        [HttpGet("unread-count")]
        public IActionResult UnreadCount()
        {
            var userId = GetUserId();

            var count =
                _context.Notifications
                .Count(x =>
                    x.UserId == userId &&
                    !x.IsRead);

            return Ok(new
            {
                unread = count
            });
        }

        // =====================
        // MARK READ
        // =====================

        [HttpPost("read/{id}")]
        public IActionResult Read(int id)
        {
            var userId = GetUserId();

            var noti =
                _context.Notifications
                .FirstOrDefault(x =>
                    x.Id == id &&
                    x.UserId == userId);

            if (noti == null)
                return NotFound();

            noti.IsRead = true;

            _context.SaveChanges();

            return Ok("Read");
        }
    }
}