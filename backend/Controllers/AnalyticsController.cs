using System.Text.RegularExpressions;
using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

/// <summary>Recibe los eventos del tracker del sitio público (analítica propia, sin PII).
/// Anónimo a propósito: lo manda el navegador de cualquier visitante.</summary>
[ApiController]
[Route("api/analytics")]
[AllowAnonymous]
public class AnalyticsController : ControllerBase
{
    private static readonly Regex IdValido = new("^[a-zA-Z0-9_-]{8,40}$", RegexOptions.Compiled);
    private static readonly HashSet<string> TiposValidos = new() { "pageview", "etapa", "fin" };

    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("eventos")]
    public async Task<IActionResult> Registrar([FromBody] List<VisitaEventoRequest> eventos)
    {
        if (eventos == null || eventos.Count == 0) return NoContent();

        // Defensa básica contra basura/abuso: batches chicos y campos validados/truncados.
        var ahora = MexicoCityTime.Now();
        var validos = eventos
            .Take(25)
            .Where(e => e.V != null && IdValido.IsMatch(e.V)
                && e.S != null && IdValido.IsMatch(e.S)
                && e.Tipo != null && TiposValidos.Contains(e.Tipo))
            .Select(e => new VisitaEvento
            {
                VisitanteId = e.V!,
                SesionId = e.S!,
                Tipo = e.Tipo!,
                Valor = Truncar(e.Valor, 160),
                DuracionSegundos = e.Dur is > 0 and <= 60 * 60 * 6 ? e.Dur : null,
                Referrer = Truncar(e.Ref, 300),
                Dispositivo = e.D == "mobile" || e.D == "desktop" ? e.D : null,
                EmpresaId = e.Tipo == "etapa" && e.Valor == "registro_completado" ? e.EmpresaId : null,
                CreatedAt = ahora,
            })
            .ToList();

        if (validos.Count == 0) return NoContent();

        _db.VisitasEventos.AddRange(validos);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string? Truncar(string? s, int max) =>
        string.IsNullOrWhiteSpace(s) ? null : (s.Length <= max ? s : s[..max]);
}
