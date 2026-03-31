using MongoDB.Driver;
using Xero_Integration.Data;
using Xero_Integration.Models;
using Xero_Integration.Repositories.Interfaces;

namespace Xero_Integration.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly MongoDbContext _db;

        public UserRepository(MongoDbContext db)
        {
            _db = db;
        }

        public async Task Create(User user)
        {
            await _db.Users.InsertOneAsync(user);
        }

       
        public async Task<User> GetById(string id)
        {
            return await _db.Users.Find(u => u.UserId == id).FirstOrDefaultAsync();
        }
        public async Task<User?> GetByEmail(string email)
        {
            return await _db.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }
        public async Task<bool> Delete(string userId)
        {
            var result = await _db.Users.DeleteOneAsync(u => u.UserId == userId);
            return result.IsAcknowledged && result.DeletedCount > 0;
        }
    }
}