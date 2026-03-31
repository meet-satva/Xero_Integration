using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using Xero_Integration.DTOs;
using Xero_Integration.Models;
using Xero_Integration.Repositories.Interfaces;
using Xero_Integration.Services.Interfaces;

namespace Xero_Integration.Services
{
    public class XeroService : IXeroService
    {
        private readonly IConfiguration _config;
        private readonly IXeroTokenRepository _tokenRepo;
        private readonly ICompanyRepository _companyRepo;
        private readonly IUserRepository _user;


        public XeroService(IConfiguration config, IXeroTokenRepository tokenRepo, ICompanyRepository companyRepo, IUserRepository UserRepository)
        {
            _config = config;
            _tokenRepo = tokenRepo;
            _companyRepo = companyRepo;
            _user = UserRepository;
        }
    
        public string GetAuthUrl(string state)
        {
            var clientId = _config["Xero:ClientId"] ?? string.Empty;
            var redirect = Uri.EscapeDataString(_config["Xero:RedirectUrl"] ?? string.Empty);
            var scope = Uri.EscapeDataString("openid profile email offline_access accounting.settings accounting.contacts accounting.invoices");

            return $"https://login.xero.com/identity/connect/authorize?response_type=code&client_id={clientId}&redirect_uri={redirect}&scope={scope}&state={state}";
        }

        public async Task<XeroToken> SaveTokens(string userId, string code)
        {
            var existingToken = await _tokenRepo.Get(userId);

            if (existingToken != null && (DateTime.UtcNow - existingToken.UpdatedAt).TotalSeconds < 5)
            {
                return existingToken;
            }

            var clientId = _config["Xero:ClientId"] ?? string.Empty;
            var clientSecret = _config["Xero:ClientSecret"] ?? string.Empty;
            var redirectUrl = _config["Xero:RedirectUrl"] ?? string.Empty;
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);

            var tokenParams = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", code },
                { "redirect_uri", redirectUrl }
            };

            var tokenRes = await http.PostAsync("https://identity.xero.com/connect/token", new FormUrlEncodedContent(tokenParams));
            var tokenContent = await tokenRes.Content.ReadAsStringAsync();

            if (!tokenRes.IsSuccessStatusCode)
            {
                var alreadySaved = await _tokenRepo.Get(userId);
                if (alreadySaved != null) return alreadySaved;
                throw new Exception($"Token Exchange Failed: {tokenContent}");
            }

            var tokenData = JsonConvert.DeserializeObject<dynamic>(tokenContent);
            if (tokenData == null) throw new Exception("Invalid token response");

            string accessToken = tokenData.access_token;
            string refreshToken = tokenData.refresh_token;
            string idToken = tokenData.id_token;

            string email = "user@example.com";
            if (!string.IsNullOrEmpty(idToken))
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jsonToken = handler.ReadJwtToken(idToken);
                email = jsonToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? email;
            }

            var existingUser = await _user.GetById(userId);
            if (existingUser == null)
            {
                await _user.Create(new User
                {
                    UserId = userId,
                    Email = email,
                    CreatedAt = DateTime.UtcNow
                });
            }

            http.DefaultRequestHeaders.Clear();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var connRes = await http.GetAsync("https://api.xero.com/connections");
            var connContent = await connRes.Content.ReadAsStringAsync();
            var connections = JsonConvert.DeserializeObject<List<XeroConnectionDTO>>(connContent) ?? new List<XeroConnectionDTO>();

            foreach (var conn in connections)
            {
                var company = new Company
                {
                    UserId = userId,
                    CompanyName = conn.TenantName ?? "Unknown",
                    XeroTenantId = conn.TenantId,
                    UpdatedAt = DateTime.UtcNow
                };
                await _companyRepo.UpsertByXeroId(company);
            }

            var firstConn = connections.FirstOrDefault() ?? throw new Exception("No Xero organization connected.");

            var token = new XeroToken
            {
                UserId = userId,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TenantId = firstConn.TenantId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _tokenRepo.Save(token);
            return token;
        }

        public async Task<List<Company>> GetAvailableCompanies(string userId)
        {
           
            var token = await _tokenRepo.Get(userId);

            if (token == null)
            {
               
                throw new Exception($"No Xero connection found for User ID: {userId}");
            }

            if (token.UpdatedAt.AddMinutes(25) < DateTime.UtcNow)
            {
                token = await RefreshXeroToken(userId);
            }

           
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);

            var res = await http.GetAsync("https://api.xero.com/connections");
            if (!res.IsSuccessStatusCode) throw new Exception("Xero API Communication Failed");

            var content = await res.Content.ReadAsStringAsync();
            var connections = JsonConvert.DeserializeObject<List<XeroConnectionDTO>>(content) ?? new List<XeroConnectionDTO>();

           
            var companies = connections.Select(c => new Company
            {
                UserId = userId, 
                CompanyName = c.TenantName,
                XeroTenantId = c.TenantId,
                UpdatedAt = DateTime.UtcNow
            }).ToList();

            await Task.WhenAll(companies.Select(comp => _companyRepo.UpsertByXeroId(comp)));

            return companies;
        }

        public async Task<string> GetCustomers(string userId)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            if (token.UpdatedAt.AddMinutes(28) < DateTime.UtcNow) token = await RefreshXeroToken(userId);

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);

            var res = await http.GetAsync("https://api.xero.com/api.xro/2.0/Contacts");
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<string> CreateCustomer(string userId, CustomerDTO dto)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            if (token.UpdatedAt.AddMinutes(28) < DateTime.UtcNow) token = await RefreshXeroToken(userId);

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);

            var payload = new { Contacts = new[] { new { Name = dto.Name, EmailAddress = dto.EmailAddress } } };
            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            var res = await http.PostAsync("https://api.xero.com/api.xro/2.0/Contacts", content);
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<string> GetProducts(string userId)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            if (token.UpdatedAt.AddMinutes(28) < DateTime.UtcNow) token = await RefreshXeroToken(userId);

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);

            var res = await http.GetAsync("https://api.xero.com/api.xro/2.0/Items");
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<string> CreateProduct(string userId, ProductDTO dto)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);
            var res = await http.PostAsync("https://api.xero.com/api.xro/2.0/Items", new StringContent(JsonConvert.SerializeObject(dto), Encoding.UTF8, "application/json"));
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<string> GetInvoices(string userId)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            if (token.UpdatedAt.AddMinutes(28) < DateTime.UtcNow) token = await RefreshXeroToken(userId);

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);

            var res = await http.GetAsync("https://api.xero.com/api.xro/2.0/Invoices");
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<string> CreateInvoice(string userId, object payload)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Xero token not found");
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            http.DefaultRequestHeaders.Add("xero-tenant-id", token.TenantId);
            var res = await http.PostAsync("https://api.xero.com/api.xro/2.0/Invoices", new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));
            return await res.Content.ReadAsStringAsync();
        }

        public async Task<XeroToken> RefreshXeroToken(string userId)
        {
            var token = await _tokenRepo.Get(userId) ?? throw new Exception("Token not found");

            var clientId = _config["Xero:ClientId"] ?? string.Empty;
            var clientSecret = _config["Xero:ClientSecret"] ?? string.Empty;
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);

            var dict = new Dictionary<string, string>
            {
                { "grant_type", "refresh_token" },
                { "refresh_token", token.RefreshToken }
            };

            var res = await http.PostAsync("https://identity.xero.com/connect/token", new FormUrlEncodedContent(dict));
            var content = await res.Content.ReadAsStringAsync();

            if (!res.IsSuccessStatusCode) throw new Exception("Refresh Failed: " + content);

            var data = JsonConvert.DeserializeObject<dynamic>(content);
            token.AccessToken = data?.access_token;
            token.RefreshToken = data?.refresh_token;
            token.UpdatedAt = DateTime.UtcNow;

            await _tokenRepo.Save(token);
            return token;
        }

        public async Task<bool> RevokeToken(string userId)
        {
            var token = await _tokenRepo.Get(userId);
            if (token == null) return false;

            var clientId = _config["Xero:ClientId"];
            var clientSecret = _config["Xero:ClientSecret"];
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);

            var data = new Dictionary<string, string>
            {
                { "token", token.RefreshToken }
            };

            var response = await http.PostAsync("https://identity.xero.com/connect/revocation", new FormUrlEncodedContent(data));

            if (response.IsSuccessStatusCode)
            {
                await _user.Delete(userId);
                await _companyRepo.DeleteByUserId(userId);
                return true;
            }

            return false;
        }

    }
}