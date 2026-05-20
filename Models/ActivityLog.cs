using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace aoe.Models
{
    [Table("activity_logs")]
    public class ActivityLog
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("action")]
        public string Action { get; set; } = null!;

        [Column("entity_type")]
        public string EntityType { get; set; } = null!;

        [Column("entity_id")]
        public int EntityId { get; set; }

        [Column("description")]
        public string Description { get; set; } = null!;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("ip_address")]
        public string? IpAddress { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}