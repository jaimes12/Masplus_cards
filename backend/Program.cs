using Microsoft.EntityFrameworkCore;
using MasplusCards.Api.Data;
using MasplusCards.Api.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.Configure<AppleWalletConfiguration>(
    builder.Configuration.GetSection("AppleWalletConfiguration"));

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? Environment.GetEnvironmentVariable("MYSQL_URL")
    ?? Environment.GetEnvironmentVariable("MYSQL_CONNECTION_STRING");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No se encontró cadena de conexión. Define ConnectionStrings:DefaultConnection (ej. ConnectionStrings__DefaultConnection) o una variable de entorno (DATABASE_URL / MYSQL_URL / MYSQL_CONNECTION_STRING).");
}

connectionString = NormalizeMySqlConnectionString(connectionString);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var corsOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
var origins = string.IsNullOrWhiteSpace(corsOrigins)
    ? builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? new[] { "http://localhost:5173", "http://127.0.0.1:5173" }
    : corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

app.UseAuthorization();

app.MapControllers();

app.Run();

static string NormalizeMySqlConnectionString(string input)
{
    var value = input.Trim();

    // Railway (y otras plataformas) a veces entregan una URL tipo:
    // mysql://user:pass@host:port/db
    if (value.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase) ||
        value.StartsWith("mysqls://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(value);
        var userInfo = uri.UserInfo.Split(':', 2);
        var user = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(0) ?? "");
        var pass = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(1) ?? "");
        var db = uri.AbsolutePath.Trim('/'); // "/railway" -> "railway"

        if (string.IsNullOrWhiteSpace(uri.Host) || string.IsNullOrWhiteSpace(db))
            throw new InvalidOperationException("La URL de MySQL no es válida. Debe incluir host y base de datos.");

        var dbPort = uri.Port > 0 ? uri.Port : 3306;

        // Connection string compatible con MySqlConnector / Pomelo
        return $"Server={uri.Host};Port={dbPort};Database={db};User={user};Password={pass};SslMode=Preferred;";
    }

    // Ya viene como connection string clásico: "Server=...;Port=...;Database=...;User=...;Password=...;"
    return value;
}
