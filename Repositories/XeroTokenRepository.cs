using Microsoft.EntityFrameworkCore; 
using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;
using Xero_Integration.Data;
using Xero_Integration.Models;
using Xero_Integration.Repositories.Interfaces;

namespace Xero_Integration.Repositories
{
    public class XeroTokenRepository : IXeroTokenRepository
    {
        private readonly AppDbContext _db;

        public XeroTokenRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<XeroToken?> Get(string userId)
        {
            return await _db.XeroTokens
                .FirstOrDefaultAsync(t => t.UserId == userId);
        }

        public async Task Save(XeroToken token)
        {
            var existing = await _db.XeroTokens.FirstOrDefaultAsync(x => x.UserId == token.UserId);

            if (existing != null)
            {
                existing.AccessToken = token.AccessToken;
                existing.RefreshToken = token.RefreshToken;
                existing.TenantId = token.TenantId;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                await _db.XeroTokens.AddAsync(token);
            }

            await _db.SaveChangesAsync();
        }
    }
}