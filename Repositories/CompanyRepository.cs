using MongoDB.Driver;
using Xero_Integration.Models;
using Xero_Integration.Data;
using Xero_Integration.Repositories.Interfaces;

namespace Xero_Integration.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly MongoDbContext _db;

        public CompanyRepository(MongoDbContext db)
        {
            _db = db;
        }

        public async Task<Company?> Get(string userId)
        {
            return await _db.Companies
                .Find(x => x.UserId == userId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Company>> GetAll()
        {
            var filter = Builders<Company>.Filter.Ne(c => c.XeroTenantId, null);

            return await _db.Companies
                .Find(filter)
                .ToListAsync();
        }

        public async Task UpsertByXeroId(Company company)
        {
            // Filter by the specific Xero Organization ID
            var filter = Builders<Company>.Filter.Eq(x => x.XeroTenantId, company.XeroTenantId);

            var update = Builders<Company>.Update
                .Set(x => x.UserId, company.UserId)
                .Set(x => x.CompanyName, company.CompanyName)
                .Set(x => x.Email, company.Email)
                .Set(x => x.Country, company.Country)
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            // IsUpsert = true creates a new doc if the XeroTenantId doesn't exist yet
            await _db.Companies.UpdateOneAsync(filter, update, new UpdateOptions { IsUpsert = true });
        }

        public async Task Update(string userId, Company company)
        {
            var update = Builders<Company>.Update
                .Set(x => x.CompanyName, company.CompanyName)
                .Set(x => x.Email, company.Email)
                .Set(x => x.Country, company.Country)
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            await _db.Companies.UpdateOneAsync(
                x => x.UserId == userId,
                update,
                new UpdateOptions { IsUpsert = false }
            );
        }

        public async Task<bool> DeleteByUserId(string userId)
        {
            var result = await _db.Companies.DeleteManyAsync(c => c.UserId == userId);
            return result.IsAcknowledged && result.DeletedCount > 0;
        }
    }
}