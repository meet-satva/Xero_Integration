using Xero_Integration.Models;
using Xero_Integration.Repositories.Interfaces;
using Xero_Integration.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Xero_Integration.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }

        //public async Task<User> LoginOrCreate(string email, string userId)
        //{
        //    var user = await _repo.GetById(userId);

        //    if (user == null)
        //    {
        //        user = new User
        //        {
        //            UserId = userId,
        //            Email = email,
        //            CreatedAt = DateTime.UtcNow
        //        };

        //        await _repo.Create(user);
        //    }

        //    return user;
        //}
        public async Task<User> LoginOrCreate(string email)
        {
            // 1. Try to find the existing user by Email only
            var user = await _repo.GetByEmail(email);

            if (user == null)
            {
                // 2. If they don't exist, create them with a new Unique ID
                user = new User
                {
                    UserId = Guid.NewGuid().ToString(), // Generate the ID here
                    Email = email,
                    CreatedAt = DateTime.UtcNow
                };

                await _repo.Create(user);
            }

            // 3. Return the user (either existing or newly created)
            return user;
        }

        public string GenerateToken(User user)
        {
            
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing in configuration.");

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var token = new JwtSecurityToken(
            
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: new[]
                {
            new Claim(ClaimTypes.NameIdentifier, user.UserId ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
                },
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}