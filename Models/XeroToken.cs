using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MongoDB.Bson.Serialization.Attributes;

namespace Xero_Integration.Models
{
    public class XeroToken
    {
        [Key] // Primary Key for SQL Server
        [BsonIgnore] // Prevents Mongo from trying to use this ID
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string AccessToken { get; set; }

        [Required]
        public string RefreshToken { get; set; }

        public string TenantId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}