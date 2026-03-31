using Xero_Integration.Models;
using Xero_Integration.DTOs;

namespace Xero_Integration.Services.Interfaces
{
    public interface IXeroService
    {
        string GetAuthUrl(string userId);
        Task<XeroToken> SaveTokens(string userId, string code);
     
        Task<List<Company>> GetAvailableCompanies(string email);

        Task<string> GetCustomers(string userId);
        Task<string> CreateCustomer(string userId, CustomerDTO dto);

        Task<string> CreateProduct(string userId, ProductDTO dto);
        Task<string> GetProducts(string userId);

        Task<string> CreateInvoice(string userId, object payload);
        Task<string> GetInvoices(string userId);    
        Task<XeroToken> RefreshXeroToken(string userId);
        Task<bool> RevokeToken(string userId);
    }
}