    using Microsoft.AspNetCore.Mvc;
    using Newtonsoft.Json;
using Xero.NetStandard.OAuth2.Model.Accounting;
    using Xero_Integration.DTOs;
    using Xero_Integration.Repositories;
    using Xero_Integration.Repositories.Interfaces;
using Xero_Integration.Services;
    using Xero_Integration.Services.Interfaces;

namespace Xero_Integration.Controllers
    {
        [ApiController]
        [Route("api/xero")]
        public class XeroController : ControllerBase
        {
            private readonly IXeroService _xero;
           
        public XeroController(IXeroService xero)
            {
                _xero = xero;
               
            }

       
            [HttpGet("/xero/connect/{userId?}")]
            public IActionResult Connect([FromRoute] string? userId = null)
            {
                var state = string.IsNullOrEmpty(userId) ? Guid.NewGuid().ToString() : userId;

                var url = _xero.GetAuthUrl(state);
                return Redirect(url);
            }

            [HttpGet("callback")]
            public async Task<IActionResult> Callback(string code, string state)
            {
                if (string.IsNullOrEmpty(code))
                {
                    return BadRequest("Authorization code is missing.");
                }

                try
                {
                    var token = await _xero.SaveTokens(state, code);
                    return Redirect($"http://localhost:5173/dashboard?userId={state}&tenantId={token.TenantId}");
                }
                catch (Exception ex)
                {
                    return BadRequest($"Callback Error: {ex.Message}");
                }
            }

            [HttpGet("companies/{userId}")]
            public async Task<IActionResult> GetAllCompanies([FromRoute] string userId)
            {
          
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { Error = "User ID was not provided in the route." });
                }

                try
                {
                    var companies = await _xero.GetAvailableCompanies(userId);
                    return Ok(companies);
                }
                catch (Exception ex)
                {
                    //Console.WriteLine($"[Xero Error]: {ex.Message}");
                    return BadRequest(new { Error = ex.Message });
                }
            }
     
        [HttpPost("create/customer/{userId}")]
            public async Task<IActionResult> CreateCustomer([FromRoute] string userId, [FromBody] CustomerDTO dto)
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    throw new Exception("Contact Name is required for Xero.");

                var result = await _xero.CreateCustomer(userId, dto);
                return Ok(JsonConvert.DeserializeObject(result));
            }

            [HttpGet("customers/{userId}")]
            public async Task<IActionResult> GetXeroCustomers([FromRoute] string userId)
            {
                try
                {
                    var result = await _xero.GetCustomers(userId);
                    return Content(result, "application/json");
                }
                catch (Exception ex)
                {   
                    return BadRequest(new { Error = ex.Message });
                }
            }


            [HttpPost("create/product/{userId}")]
            public async Task<IActionResult> CreateXeroProduct([FromRoute] string userId, [FromBody] ProductDTO dto)
            {
                try
                {
                    var result = await _xero.CreateProduct(userId, dto);
                    return Content(result, "application/json");
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Error = ex.Message });
                }
            }

            [HttpGet("products/{userId}")]
            public async Task<IActionResult> GetAllProducts([FromRoute] string userId)
            {
                try
                {
                    var result = await _xero.GetProducts(userId);
                    return Content(result, "application/json");
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Error = ex.Message });
                }
            }

            [HttpPost("create/invoice/{userId}")]
            public async Task<IActionResult> CreateInvoice([FromRoute] string userId, [FromBody] InvoiceDTO dto)
            {
                var payload = new
                {
                    Invoices = new[]
                    {
                        new
                        {
                            Type = "ACCREC",
                            Contact = new { Name = dto.ContactName },
                            LineItems = new[]
                            {
                                new
                                {
                                    Description = dto.Description,
                                    Quantity = 1,
                                    UnitAmount = dto.Amount
                                }
                            },
                            Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                            DueDate = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd")
                        }
                    }
                };

                var result = await _xero.CreateInvoice(userId, payload);
                return Ok(result);
            }

            [HttpGet("invoices/{userId}")]
            public async Task<IActionResult> GetAllInvoices([FromRoute] string userId)
            {
                try
                {
                    var result = await _xero.GetInvoices(userId);
                    return Content(result, "application/json");
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Error = ex.Message });
                }
            }

           [HttpPost("disconnect/{userId}")]
           public async Task<IActionResult> Disconnect([FromRoute] string userId) {

              var result = await _xero.RevokeToken(userId);
              if (result)
              {
                return Ok(new { Message = "Disconnected successfully" });
              }
               return BadRequest(new { Message = "Failed to disconnect or token not found" });
           }
        }
    }