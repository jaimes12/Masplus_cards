using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MasplusCards.Api.Data;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services;
using MasplusCards.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpContextAccessor();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient(AppleWalletPassService.HttpClientName);

builder.Services.Configure<AppleWalletConfiguration>(
    builder.Configuration.GetSection("AppleWalletConfiguration"));
builder.Services.Configure<R2Configuration>(options =>
{
    builder.Configuration.GetSection("R2").Bind(options);
    // Railway: variables sueltas R2_ACCESS_KEY / R2_SECRET_KEY / R2_BUCKET / R2_ENDPOINT / R2_PUBLIC_URL
    // en vez de la convención R2__AccessKey de .NET.
    options.AccessKey = Environment.GetEnvironmentVariable("R2_ACCESS_KEY") ?? options.AccessKey;
    options.SecretKey = Environment.GetEnvironmentVariable("R2_SECRET_KEY") ?? options.SecretKey;
    options.Bucket = Environment.GetEnvironmentVariable("R2_BUCKET") ?? options.Bucket;
    options.Endpoint = Environment.GetEnvironmentVariable("R2_ENDPOINT") ?? options.Endpoint;
    options.PublicUrl = Environment.GetEnvironmentVariable("R2_PUBLIC_URL") ?? options.PublicUrl;
});
// Railway ya usa la convención Stripe__PublishableKey / Stripe__SecretKey / Stripe__WebhookSecret,
// así que el binder de configuración de .NET las toma solo (no necesita el override manual del R2).
builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
// Stripe.net usa una API key global (no por request); se setea una sola vez al arrancar.
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"];
if (!string.IsNullOrWhiteSpace(stripeSecretKey))
    Stripe.StripeConfiguration.ApiKey = stripeSecretKey;

var jwtSigningKey =
    builder.Configuration["Jwt:SigningKey"]
    ?? Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
    ?? throw new InvalidOperationException(
        "No se encontró la clave de firma JWT. Define Jwt:SigningKey (ej. Jwt__SigningKey) o la env var JWT_SIGNING_KEY.");

var jwtOptions = new JwtOptions { SigningKey = jwtSigningKey };
builder.Configuration.GetSection("Jwt").Bind(jwtOptions);
jwtOptions.SigningKey = jwtSigningKey;
builder.Services.Configure<JwtOptions>(options =>
{
    options.SigningKey = jwtOptions.SigningKey;
    options.Issuer = jwtOptions.Issuer;
    options.ExpirationHours = jwtOptions.ExpirationHours;
});
builder.Services.AddSingleton<JwtService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITemplatesService, TemplatesService>();
builder.Services.AddScoped<IDisenosService, DisenosService>();
builder.Services.AddScoped<IClientesService, ClientesService>();
builder.Services.AddScoped<ITarjetasService, TarjetasService>();
builder.Services.AddScoped<IAppleWalletPassService, AppleWalletPassService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPassKitService, PassKitService>();
builder.Services.AddScoped<IApnsPushService, ApnsPushService>();
builder.Services.AddScoped<IImagenesService, ImagenesService>();
builder.Services.AddScoped<IEmpresaProfileService, EmpresaProfileService>();
builder.Services.AddScoped<IPlanesService, PlanesService>();
builder.Services.AddScoped<IRegistroService, RegistroService>();
builder.Services.AddScoped<IDiscountCodesService, DiscountCodesService>();
builder.Services.AddScoped<IStripeService, StripeService>();
builder.Services.AddHostedService<RecordatoriosBackgroundService>();

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

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Issuer,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateLifetime = true,
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

app.UseAuthentication();
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
