using Xero_Integration.Models;

namespace Xero_Integration.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User> LoginOrCreate(string email);
        string GenerateToken(User user);
    }
}