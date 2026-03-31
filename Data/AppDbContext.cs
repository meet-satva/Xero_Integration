using Microsoft.EntityFrameworkCore;
using Xero_Integration.Models;
using System.Collections.Generic;

namespace Xero_Integration.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<XeroToken> XeroTokens { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Company> Companies { get; set; }
    }
}