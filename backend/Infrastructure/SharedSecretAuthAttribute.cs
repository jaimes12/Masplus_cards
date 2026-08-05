using System.Security.Cryptography;
using System.Text;
using MasplusCards.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace MasplusCards.Api.Infrastructure;

/// <summary>Protege endpoints llamados por whatsapp-bot/ (no por un usuario logueado) con un
/// header de secreto compartido, comparado en tiempo constante. No es un scheme de autenticación
/// completo a propósito — es un único endpoint server-to-server, no necesita integrarse con
/// [Authorize(Roles=...)] ni con claims.</summary>
public class SharedSecretAuthAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var settings = context.HttpContext.RequestServices.GetRequiredService<IOptions<WhatsAppBotSettings>>().Value;
        var provided = context.HttpContext.Request.Headers["X-Bot-Secret"].FirstOrDefault();

        if (string.IsNullOrEmpty(settings.SharedSecret) || provided == null || !ComparacionSegura(provided, settings.SharedSecret))
        {
            context.Result = new UnauthorizedResult();
        }
    }

    private static bool ComparacionSegura(string a, string b)
    {
        var bytesA = Encoding.UTF8.GetBytes(a);
        var bytesB = Encoding.UTF8.GetBytes(b);
        if (bytesA.Length != bytesB.Length) return false;
        return CryptographicOperations.FixedTimeEquals(bytesA, bytesB);
    }
}
