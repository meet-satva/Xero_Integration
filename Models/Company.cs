using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Xero_Integration.Models
{
    public class Company
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string UserId { get; set; }

        public string CompanyName { get; set; }

        public string? XeroTenantId { get; set; }

        public string? Email { get; set; }

        public string? Country { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}