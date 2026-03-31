using Microsoft.EntityFrameworkCore;
using Xero_Integration.Data;
using Xero_Integration.Repositories;
using Xero_Integration.Repositories.Interfaces;
using Xero_Integration.Services;
using Xero_Integration.Services.Interfaces;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("https://localhost:7273", "http://localhost:5081", "https://localhost:7256");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<IXeroTokenRepository, XeroTokenRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IXeroService, XeroService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:5081")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();


app.UseAuthorization();

app.MapControllers();

app.MapOpenApi();
app.MapScalarApiReference();

app.Run();