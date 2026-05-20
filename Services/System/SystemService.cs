using aoe.Models;

namespace aoe.Services.Systems
{
    public class SystemService
    {
        private readonly AoeDbContext _context;

        public SystemService(AoeDbContext context)
        {
            _context = context;
        }

        public void CreateNotification(
            int userId,
            string title,
            string message,
            string type = "system")
        {
            _context.Notifications.Add(
                new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                });
        }

        public void CreateLog(
            int userId,
            string action,
            string entityType,
            int entityId,
            string description,
            string? ip = null)
        {
            _context.ActivityLogs.Add(
                new ActivityLog
                {
                    UserId = userId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Description = description,
                    CreatedAt = DateTime.Now,
                    IpAddress = ip
                });
        }
    }
}