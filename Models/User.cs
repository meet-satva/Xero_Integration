    using MongoDB.Bson;
    using MongoDB.Bson.Serialization.Attributes;

    namespace Xero_Integration.Models
    {
        public class User
        {
            [BsonId]
            [BsonRepresentation(BsonType.String)]
            public string UserId { get; set; } = Guid.NewGuid().ToString();

            public string Email { get; set; }

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        }
    }