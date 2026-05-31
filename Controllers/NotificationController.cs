using aoe.DTOs.Notification;
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

        // =====================
        // UTILS
        // =====================
        private int GetUserId()
        {
            return int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        // =====================
        // GET MY NOTIFICATIONS
        // =====================
        [HttpGet("my")]
        public IActionResult My()
        {
            var userId = GetUserId();

            var data = _context.Notifications
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Take(30)
                .Select(x => new NotificationDTO
                {
                    Id = x.Id,
                    Title = x.Title,
                    Message = x.Message,
                    Type = x.Type,
                    IsRead = x.IsRead,
                    CreatedAt = x.CreatedAt
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

            var count = _context.Notifications
                .Count(x => x.UserId == userId && !x.IsRead);

            return Ok(new
            {
                unread = count
            });
        }

        // =====================
        // MARK AS READ
        // =====================
        [HttpPost("read/{id}")]
        public IActionResult Read(int id)
        {
            var userId = GetUserId();

            var noti = _context.Notifications
                .FirstOrDefault(x =>
                    x.Id == id &&
                    x.UserId == userId);

            if (noti == null)
                return NotFound();

            noti.IsRead = true;

            _context.SaveChanges();

            return Ok("Read");
        }

        // =====================
        // MARK ALL READ (OPTIONAL)
        // =====================
        [HttpPost("read-all")]
        public IActionResult ReadAll()
        {
            var userId = GetUserId();

            var notifications = _context.Notifications
                .Where(x => x.UserId == userId && !x.IsRead)
                .ToList();

            foreach (var n in notifications)
                n.IsRead = true;

            _context.SaveChanges();

            return Ok("All read");
        }
    }
}