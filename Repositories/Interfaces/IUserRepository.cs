using Xero_Integration.Models;

namespace Xero_Integration.Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetById(string id);
        Task<User> GetByEmail(string email);

        Task Create(User user);

        Task<bool> Delete(string userId);
    }
}