using Microsoft.AspNetCore.Mvc;
using Xero_Integration.DTOs;
using Xero_Integration.Services.Interfaces;

namespace Xero_Integration.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthDTO dto)
        {
            var user = await _auth.LoginOrCreate(dto.Email);

            var token = _auth.GenerateToken(user);

            return Ok(new
            {
                token,
                userId = user.UserId,
                email = user.Email
            });
        }
    }
}