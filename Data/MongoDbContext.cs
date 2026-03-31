using MongoDB.Driver;
using Xero_Integration.Models;

namespace Xero_Integration.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _db;

        public MongoDbContext(IConfiguration config)
        {
            var client = new MongoClient(config["MongoDB:ConnectionString"]);
            _db = client.GetDatabase(config["MongoDB:DatabaseName"]);
        }

        public IMongoCollection<User> Users => _db.GetCollection<User>("Users");
        public IMongoCollection<Company> Companies => _db.GetCollection<Company>("Companies");
    }
}