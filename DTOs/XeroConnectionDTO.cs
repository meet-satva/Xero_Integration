using Newtonsoft.Json;

namespace Xero_Integration.DTOs
{
    public class XeroConnectionDTO
    {
        [JsonProperty("tenantId")]
        public string TenantId { get; set; }

        [JsonProperty("tenantName")]
        public string TenantName { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; }
    }
}