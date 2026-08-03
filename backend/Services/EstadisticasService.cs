using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class EstadisticasService : IEstadisticasService
{
    private readonly AppDbContext _db;
    private readonly IClientesService _clientes;

    public EstadisticasService(AppDbContext db, IClientesService clientes)
    {
        _db = db;
        _clientes = clientes;
    }

    public async Task<EstadisticasDto> GetAsync(int empresaId)
    {
        var ahora = MexicoCityTime.Now();

        var kpis = await GetKpisAsync(empresaId, ahora);
        var clientesAcumulados = await GetClientesAcumuladosAsync(empresaId, ahora);
        var actividadSemanal = await GetActividadSemanalAsync(empresaId, ahora);
        var composicion = await GetComposicionAsync(empresaId);
        var retencion = await GetRetencionAsync(empresaId, ahora);

        return new EstadisticasDto(kpis, clientesAcumulados, actividadSemanal, composicion, retencion);
    }

    private async Task<EstadisticasKpisDto> GetKpisAsync(int empresaId, DateTime ahora)
    {
        var hace30 = ahora.AddDays(-30);

        var clientesTotal = await _db.Clientes.CountAsync(c => c.EmpresaId == empresaId);
        var clientesNuevos30d = await _db.Clientes.CountAsync(c => c.EmpresaId == empresaId && c.CreatedAt >= hace30);

        var clientesActivos30d = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.Accion == "sello_agregado" && l.CreatedAt >= hace30)
            .Join(_db.Tarjetas, l => l.TarjetaId, t => t.Id, (l, t) => t.ClienteId)
            .Distinct()
            .CountAsync();

        var sellos30d = await _db.TarjetaLogs.CountAsync(l => l.EmpresaId == empresaId && l.Accion == "sello_agregado" && l.CreatedAt >= hace30);
        var canjes30d = await _db.TarjetaLogs.CountAsync(l => l.EmpresaId == empresaId
            && (l.Accion == "premio_canjeado" || l.Accion == "cupon_canjeado") && l.CreatedAt >= hace30);

        var visitasPorCliente = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.Accion == "sello_agregado")
            .Join(_db.Tarjetas, l => l.TarjetaId, t => t.Id, (l, t) => t.ClienteId)
            .GroupBy(clienteId => clienteId)
            .Select(g => g.Count())
            .ToListAsync();

        var tasaRetorno = visitasPorCliente.Count == 0
            ? 0
            : Math.Round(100.0 * visitasPorCliente.Count(v => v >= 2) / visitasPorCliente.Count, 1);

        return new EstadisticasKpisDto(clientesTotal, clientesNuevos30d, clientesActivos30d, sellos30d, canjes30d, tasaRetorno);
    }

    private async Task<List<SeriePuntoDto>> GetClientesAcumuladosAsync(int empresaId, DateTime ahora)
    {
        var desde = new DateTime(ahora.Year, ahora.Month, 1).AddMonths(-5);
        var clientesDelRango = await _db.Clientes
            .Where(c => c.EmpresaId == empresaId && c.CreatedAt >= desde)
            .Select(c => c.CreatedAt)
            .ToListAsync();

        var acumuladoPrevio = await _db.Clientes.CountAsync(c => c.EmpresaId == empresaId && c.CreatedAt < desde);

        var puntos = new List<SeriePuntoDto>();
        var acumulado = acumuladoPrevio;
        for (var i = 0; i < 6; i++)
        {
            var mes = desde.AddMonths(i);
            var nuevosDelMes = clientesDelRango.Count(c => c.Year == mes.Year && c.Month == mes.Month);
            acumulado += nuevosDelMes;
            puntos.Add(new SeriePuntoDto(mes.ToString("MMM"), acumulado));
        }
        return puntos;
    }

    private async Task<List<SerieSemanaDto>> GetActividadSemanalAsync(int empresaId, DateTime ahora)
    {
        var desde = ahora.Date.AddDays(-7 * 7);
        var logs = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.CreatedAt >= desde
                && (l.Accion == "sello_agregado" || l.Accion == "premio_canjeado" || l.Accion == "cupon_canjeado"))
            .Select(l => new { l.Accion, l.CreatedAt })
            .ToListAsync();

        var semanas = new List<SerieSemanaDto>();
        for (var i = 6; i >= 0; i--)
        {
            var inicioSemana = ahora.Date.AddDays(-7 * i - (int)ahora.DayOfWeek);
            var finSemana = inicioSemana.AddDays(7);
            var sellos = logs.Count(l => l.Accion == "sello_agregado" && l.CreatedAt >= inicioSemana && l.CreatedAt < finSemana);
            var canjes = logs.Count(l => (l.Accion == "premio_canjeado" || l.Accion == "cupon_canjeado") && l.CreatedAt >= inicioSemana && l.CreatedAt < finSemana);
            semanas.Add(new SerieSemanaDto(inicioSemana.ToString("d MMM"), sellos, canjes));
        }
        return semanas;
    }

    private async Task<ComposicionBaseDto> GetComposicionAsync(int empresaId)
    {
        var clientes = await _clientes.GetByEmpresaAsync(empresaId);
        return new ComposicionBaseDto(
            clientes.Count(c => c.Estado == "frecuente"),
            clientes.Count(c => c.Estado == "activo"),
            clientes.Count(c => c.Estado == "nuevo"),
            clientes.Count(c => c.Estado == "canje-listo"),
            clientes.Count(c => c.Estado == "inactivo"));
    }

    private async Task<List<CohorteRetencionDto>> GetRetencionAsync(int empresaId, DateTime ahora)
    {
        var desde = new DateTime(ahora.Year, ahora.Month, 1).AddMonths(-5);

        var clientesDelRango = await _db.Clientes
            .Where(c => c.EmpresaId == empresaId && c.CreatedAt >= desde)
            .Select(c => new { c.Id, c.CreatedAt })
            .ToListAsync();

        if (clientesDelRango.Count == 0)
        {
            return Enumerable.Range(0, 6)
                .Select(i => new CohorteRetencionDto(desde.AddMonths(i).ToString("MMM"), 0, 0))
                .ToList();
        }

        var clienteIds = clientesDelRango.Select(c => c.Id).ToList();
        var visitas = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && (l.Accion == "sello_agregado" || l.Accion == "premio_canjeado" || l.Accion == "cupon_canjeado"))
            .Join(_db.Tarjetas, l => l.TarjetaId, t => t.Id, (l, t) => new { t.ClienteId, l.CreatedAt })
            .Where(x => clienteIds.Contains(x.ClienteId))
            .ToListAsync();

        var resultado = new List<CohorteRetencionDto>();
        for (var i = 0; i < 6; i++)
        {
            var mes = desde.AddMonths(i);
            var cohorte = clientesDelRango.Where(c => c.CreatedAt.Year == mes.Year && c.CreatedAt.Month == mes.Month).ToList();
            if (cohorte.Count == 0)
            {
                resultado.Add(new CohorteRetencionDto(mes.ToString("MMM"), 0, 0));
                continue;
            }

            var retenidos = cohorte.Count(c => visitas.Any(v => v.ClienteId == c.Id && v.CreatedAt > c.CreatedAt && v.CreatedAt <= c.CreatedAt.AddDays(30)));
            var porcentaje = Math.Round(100.0 * retenidos / cohorte.Count, 1);
            resultado.Add(new CohorteRetencionDto(mes.ToString("MMM"), cohorte.Count, porcentaje));
        }
        return resultado;
    }
}
