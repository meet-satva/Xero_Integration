using Xero_Integration.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Xero_Integration.Repositories.Interfaces
{
    public interface ICompanyRepository
    {
        Task<Company?> Get(string userId);
        Task<List<Company>> GetAll();
        Task Update(string userId, Company company);
        Task UpsertByXeroId(Company company);

        Task<bool> DeleteByUserId(string userId);
    }
}