namespace MasplusCards.Api.Infrastructure;

public class JwtOptions
{
    public string SigningKey { get; set; } = "";
    public string Issuer { get; set; } = "MasplusCards.Api";
    public int ExpirationHours { get; set; } = 24 * 7;
}
