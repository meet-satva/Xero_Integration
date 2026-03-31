using Xero_Integration.Models;
using System.Threading.Tasks;

namespace Xero_Integration.Repositories.Interfaces
{
    public interface IXeroTokenRepository
    {
        Task<XeroToken?> Get(string userId);
        Task Save(XeroToken token);
    }
}