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

        // =========================
        // NOTIFICATION (RAW INSERT ONLY)
        // =========================
        public void CreateNotification(Notification notification)
        {
            _context.Notifications.Add(notification);
        }

        // overload tiện dùng nhưng KHÔNG format logic
        public void CreateNotification(
            int userId,
            string title,
            string message,
            string type = "system")
        {
            _context.Notifications.Add(new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        // =========================
        // ACTIVITY LOG
        // =========================
        public void CreateLog(
            int userId,
            string action,
            string entityType,
            int entityId,
            string description,
            string? ip = null)
        {
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                IpAddress = ip
            });
        }

        // overload (raw log object)
        public void CreateLog(ActivityLog log)
        {
            _context.ActivityLogs.Add(log);
        }

        // =========================
        // SAVE CONTROL (OPTIONAL CENTRALIZED COMMIT)
        // =========================
        public int Commit()
        {
            return _context.SaveChanges();
        }

        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}