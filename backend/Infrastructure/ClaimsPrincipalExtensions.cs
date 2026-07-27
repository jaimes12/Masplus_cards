using System.Security.Claims;

namespace MasplusCards.Api.Infrastructure;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var id) ? id : throw new InvalidOperationException("Token sin NameIdentifier válido.");
    }

    public static int GetEmpresaId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue("empresaId");
        return int.TryParse(value, out var id) ? id : throw new InvalidOperationException("Token sin empresaId válido.");
    }
}
