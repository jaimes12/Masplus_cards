using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var totalEmpresas = await _db.Empresas.CountAsync();
        var totalTemplates = await _db.Templates.CountAsync();
        var totalDisenos = await _db.Disenos.CountAsync();
        var totalTarjetas = await _db.Tarjetas.CountAsync();
        var totalClientes = await _db.Clientes.CountAsync();
        var premiosCanjeados = await _db.Tarjetas.SumAsync(t => (int?)t.PremiosCanjeados) ?? 0;

        return new AdminStatsDto(totalEmpresas, totalTemplates, totalDisenos, totalTarjetas, totalClientes, premiosCanjeados);
    }

    public async Task<List<AdminEmpresaListItemDto>> GetEmpresasAsync()
    {
        return await _db.Empresas
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new AdminEmpresaListItemDto(
                e.Id,
                e.Nombre,
                e.Email!,
                e.Estado,
                e.CreatedAt,
                e.Disenos.Count,
                e.Tarjetas.Count,
                e.Plan != null ? e.Plan.Nombre : null))
            .ToListAsync();
    }

    public async Task<AdminEmpresaDetalleDto?> GetEmpresaDetalleAsync(int empresaId)
    {
        var e = await _db.Empresas
            .Include(x => x.Plan)
            .FirstOrDefaultAsync(x => x.Id == empresaId);
        if (e == null) return null;

        var totalClientes = await _db.Clientes.CountAsync(c => c.EmpresaId == empresaId);
        var totalTarjetas = await _db.Tarjetas.CountAsync(t => t.EmpresaId == empresaId);
        var premiosCanjeados = await _db.Tarjetas
            .Where(t => t.EmpresaId == empresaId)
            .SumAsync(t => (int?)t.PremiosCanjeados) ?? 0;

        // "Escaneo" = cada vez que la empresa escaneó la tarjeta de un cliente (sello o canje).
        var logsEscaneo = _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && (l.Accion == "sello_agregado" || l.Accion == "premio_canjeado"));
        var escaneosTotal = await logsEscaneo.CountAsync();
        var clientesEscanearon = await logsEscaneo
            .Select(l => l.TarjetaId).Distinct().CountAsync();
        var sellosOtorgados = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.Accion == "sello_agregado")
            .SumAsync(l => (int?)(l.SellosAgregados ?? 1)) ?? 0;

        // Métricas de escaneo por diseño (vía la tarjeta del log).
        var escaneosPorDiseno = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && (l.Accion == "sello_agregado" || l.Accion == "premio_canjeado"))
            .Join(_db.Tarjetas, l => l.TarjetaId, t => t.Id, (l, t) => new { t.DisenoId, l.TarjetaId })
            .GroupBy(x => x.DisenoId)
            .Select(g => new { DisenoId = g.Key, Escaneos = g.Count(), Tarjetas = g.Select(x => x.TarjetaId).Distinct().Count() })
            .ToDictionaryAsync(x => x.DisenoId);

        var disenos = (await _db.Disenos
                .Where(d => d.EmpresaId == empresaId)
                .Select(d => new
                {
                    d.Id, d.Nombre, d.Tipo, d.Activo, d.EstiloPoster, d.Logo, d.ColorPrimario, d.ColorSecundario,
                    d.ColorTexto, d.IconoSello, d.FondoUrl, d.SellosRequeridos, d.Vencimiento, d.Descripcion,
                    d.CodigoRegistro, d.CreatedAt,
                    Tarjetas = d.Tarjetas.Count,
                    Premios = d.Tarjetas.Sum(t => (int?)t.PremiosCanjeados) ?? 0,
                })
                .ToListAsync())
            .Select(d => new AdminDisenoDetalleDto(
                d.Id, d.Nombre, d.Tipo, d.Activo, d.EstiloPoster, d.Logo, d.ColorPrimario, d.ColorSecundario,
                d.ColorTexto, d.IconoSello, d.FondoUrl, d.SellosRequeridos, d.Vencimiento, d.Descripcion,
                d.CodigoRegistro, d.CreatedAt,
                d.Tarjetas,
                escaneosPorDiseno.GetValueOrDefault(d.Id)?.Tarjetas ?? 0,
                escaneosPorDiseno.GetValueOrDefault(d.Id)?.Escaneos ?? 0,
                d.Premios))
            .OrderByDescending(d => d.Tarjetas)
            .ToList();

        var actividad = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(12)
            .Select(l => new AdminActividadDto(
                l.Accion,
                l.Descripcion,
                l.Tarjeta != null && l.Tarjeta.Cliente != null ? l.Tarjeta.Cliente.Nombre : null,
                l.Tarjeta != null && l.Tarjeta.Diseno != null ? l.Tarjeta.Diseno.Nombre : null,
                l.CreatedAt))
            .ToListAsync();

        return new AdminEmpresaDetalleDto(
            e.Id, e.Nombre, e.Email ?? "", e.Telefono, e.Logo, e.Estado, e.CreatedAt,
            e.Plan?.Nombre, e.PruebaTerminaEl, !string.IsNullOrEmpty(e.StripeCustomerId),
            totalClientes, totalTarjetas, clientesEscanearon, escaneosTotal, sellosOtorgados, premiosCanjeados,
            disenos, actividad);
    }

    /// <summary>Orden del funnel del sitio público: de solo llegar hasta registrarse. El índice
    /// define qué etapa es "más avanzada" al calcular hasta dónde llegó cada visitante.</summary>
    private static readonly (string Clave, string Nombre)[] FunnelEtapas =
    {
        ("landing", "Visitó la página"),
        ("vio_como_funciona", "Vio cómo funciona"),
        ("vio_precios", "Vio los precios"),
        ("cta_registro", "Clic en registrarse"),
        ("registro_form", "Abrió el formulario"),
        ("registro_completado", "Completó su registro"),
    };

    public async Task<AdminAnaliticaDto> GetAnaliticaAsync(int dias)
    {
        dias = Math.Clamp(dias, 1, 365);
        var desde = MasplusCards.Api.Infrastructure.MexicoCityTime.Now().Date.AddDays(-(dias - 1));

        var eventos = await _db.VisitasEventos
            .Where(e => e.CreatedAt >= desde)
            .Select(e => new { e.VisitanteId, e.SesionId, e.Tipo, e.Valor, e.DuracionSegundos, e.Referrer, e.Dispositivo, e.EmpresaId, e.CreatedAt })
            .ToListAsync();

        var visitantesUnicos = eventos.Select(e => e.VisitanteId).Distinct().Count();
        var sesiones = eventos.Select(e => e.SesionId).Distinct().Count();
        var pageviews = eventos.Count(e => e.Tipo == "pageview");

        var duraciones = eventos.Where(e => e.Tipo == "fin" && e.DuracionSegundos.HasValue)
            .Select(e => e.DuracionSegundos!.Value).ToList();
        var duracionPromedio = duraciones.Count > 0 ? (int)duraciones.Average() : 0;

        var registrosEmpresas = await _db.Empresas.CountAsync(e => e.CreatedAt >= desde);
        var disenosCreados = await _db.Disenos.CountAsync(d => d.CreatedAt >= desde);
        var tarjetasEmitidas = await _db.Tarjetas.CountAsync(t => t.CreatedAt >= desde);
        var clientesRegistrados = await _db.Clientes.CountAsync(c => c.CreatedAt >= desde);
        var conversion = visitantesUnicos > 0
            ? Math.Round(registrosEmpresas * 100.0 / visitantesUnicos, 1)
            : 0;

        // Funnel: cuántos visitantes distintos llegaron a cada etapa. "landing" = cualquier pageview.
        var etapasPorVisitante = eventos
            .Where(e => e.Tipo == "etapa" && e.Valor != null)
            .GroupBy(e => e.VisitanteId)
            .ToDictionary(g => g.Key, g => g.Select(e => e.Valor!).ToHashSet());
        var visitantesConPageview = eventos.Where(e => e.Tipo == "pageview")
            .Select(e => e.VisitanteId).ToHashSet();

        var funnel = FunnelEtapas.Select(f => new AnaliticaFunnelPasoDto(
            f.Clave,
            f.Nombre,
            f.Clave == "landing"
                ? visitantesConPageview.Count
                : etapasPorVisitante.Count(kv => kv.Value.Contains(f.Clave)))).ToList();

        // Serie por día: visitantes únicos y registros de empresa.
        var registrosPorDia = (await _db.Empresas
                .Where(e => e.CreatedAt >= desde)
                .Select(e => e.CreatedAt)
                .ToListAsync())
            .GroupBy(f => f.Date)
            .ToDictionary(g => g.Key, g => g.Count());

        var visitantesPorDia = eventos
            .GroupBy(e => e.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Select(e => e.VisitanteId).Distinct().Count());

        var porDia = Enumerable.Range(0, dias)
            .Select(i => desde.AddDays(i))
            .Select(dia => new AnaliticaDiaDto(
                dia.ToString("yyyy-MM-dd"),
                visitantesPorDia.GetValueOrDefault(dia),
                registrosPorDia.GetValueOrDefault(dia)))
            .ToList();

        // Visitantes recientes con hasta dónde llegaron.
        var ordenEtapa = FunnelEtapas.Select((f, i) => (f.Clave, i)).ToDictionary(x => x.Clave, x => x.i);
        var empresaIds = eventos.Where(e => e.EmpresaId.HasValue).Select(e => e.EmpresaId!.Value).Distinct().ToList();
        var empresasNombre = await _db.Empresas
            .Where(e => empresaIds.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, e => e.Nombre);

        var visitantes = eventos
            .GroupBy(e => e.VisitanteId)
            .Select(g =>
            {
                var etapas = g.Where(e => e.Tipo == "etapa" && e.Valor != null && ordenEtapa.ContainsKey(e.Valor!))
                    .Select(e => ordenEtapa[e.Valor!]).DefaultIfEmpty(0).Max();
                var empresaId = g.Where(e => e.EmpresaId.HasValue).Select(e => (int?)e.EmpresaId!.Value).FirstOrDefault();
                return new AnaliticaVisitanteDto(
                    g.Key,
                    g.Min(e => e.CreatedAt),
                    g.Max(e => e.CreatedAt),
                    g.Select(e => e.SesionId).Distinct().Count(),
                    g.Count(e => e.Tipo == "pageview"),
                    g.Where(e => e.Tipo == "fin").Sum(e => e.DuracionSegundos ?? 0),
                    FunnelEtapas[etapas].Nombre,
                    g.Select(e => e.Dispositivo).FirstOrDefault(d => d != null),
                    g.Select(e => e.Referrer).FirstOrDefault(r => !string.IsNullOrEmpty(r)),
                    empresaId.HasValue ? empresasNombre.GetValueOrDefault(empresaId.Value) : null);
            })
            .OrderByDescending(v => v.UltimaVisita)
            .Take(30)
            .ToList();

        var registrosRecientes = await _db.Empresas
            .Where(e => e.CreatedAt >= desde)
            .OrderByDescending(e => e.CreatedAt)
            .Take(20)
            .Select(e => new AnaliticaRegistroDto(
                e.Id, e.Nombre, e.Email, e.CreatedAt,
                e.Plan != null ? e.Plan.Nombre : null,
                e.Disenos.Count, e.Tarjetas.Count))
            .ToListAsync();

        return new AdminAnaliticaDto(
            new AnaliticaKpisDto(
                visitantesUnicos, sesiones, pageviews, duracionPromedio,
                registrosEmpresas, conversion, disenosCreados, tarjetasEmitidas, clientesRegistrados),
            funnel, porDia, visitantes, registrosRecientes);
    }
}
