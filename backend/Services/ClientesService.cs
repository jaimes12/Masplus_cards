using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class ClientesService : IClientesService
{
    private readonly AppDbContext _db;

    public ClientesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ClienteDto>> GetByEmpresaAsync(int empresaId)
    {
        var clientes = await _db.Clientes
            .Where(c => c.EmpresaId == empresaId)
            .Include(c => c.Tarjetas).ThenInclude(t => t.Diseno)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        if (clientes.Count == 0) return new List<ClienteDto>();

        var clienteIds = clientes.Select(c => c.Id).ToList();
        var ahora = MexicoCityTime.Now();
        var hace30 = ahora.AddDays(-30);

        var visitas30d = await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.Accion == "sello_agregado" && l.CreatedAt >= hace30)
            .Join(_db.Tarjetas, l => l.TarjetaId, t => t.Id, (l, t) => t.ClienteId)
            .Where(clienteId => clienteIds.Contains(clienteId))
            .GroupBy(clienteId => clienteId)
            .Select(g => new { ClienteId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ClienteId, x => x.Count);

        return clientes.Select(c => ToDto(c, ahora, visitas30d.GetValueOrDefault(c.Id))).ToList();
    }

    public async Task<ClienteDto?> GetByIdAsync(int empresaId, int id)
    {
        var cliente = await _db.Clientes
            .Include(c => c.Tarjetas).ThenInclude(t => t.Diseno)
            .FirstOrDefaultAsync(c => c.Id == id && c.EmpresaId == empresaId);
        if (cliente == null) return null;

        var ahora = MexicoCityTime.Now();
        var visitas30d = await ContarVisitas30dAsync(cliente, ahora);
        return ToDto(cliente, ahora, visitas30d);
    }

    public async Task<ClienteDto?> EditarAsync(int empresaId, int id, ClienteEditRequest request)
    {
        var cliente = await _db.Clientes
            .Include(c => c.Tarjetas).ThenInclude(t => t.Diseno)
            .FirstOrDefaultAsync(c => c.Id == id && c.EmpresaId == empresaId);
        if (cliente == null) return null;

        if (string.IsNullOrWhiteSpace(request.Nombre))
            throw new InvalidOperationException("El nombre no puede estar vacío.");

        cliente.Nombre = request.Nombre.Trim();
        cliente.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        await _db.SaveChangesAsync();

        var ahora = MexicoCityTime.Now();
        var visitas30d = await ContarVisitas30dAsync(cliente, ahora);
        return ToDto(cliente, ahora, visitas30d);
    }

    public async Task<List<ClienteHistorialItemDto>> GetHistorialAsync(int empresaId, int id)
    {
        var pertenece = await _db.Clientes.AnyAsync(c => c.Id == id && c.EmpresaId == empresaId);
        if (!pertenece) return new List<ClienteHistorialItemDto>();

        return await _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId && l.Tarjeta!.ClienteId == id)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new ClienteHistorialItemDto(l.Id, l.Accion, l.SellosAgregados, l.Descripcion, l.Tarjeta!.Diseno!.Nombre, l.CreatedAt))
            .ToListAsync();
    }

    private async Task<int> ContarVisitas30dAsync(Cliente cliente, DateTime ahora)
    {
        var hace30 = ahora.AddDays(-30);
        var tarjetaIds = cliente.Tarjetas.Select(t => t.Id).ToList();
        if (tarjetaIds.Count == 0) return 0;

        return await _db.TarjetaLogs
            .CountAsync(l => tarjetaIds.Contains(l.TarjetaId) && l.Accion == "sello_agregado" && l.CreatedAt >= hace30);
    }

    /// <summary>Prioridad: inactivo (riesgo de fuga) &gt; canje-listo (acción pendiente) &gt;
    /// frecuente &gt; nuevo &gt; activo (por defecto).</summary>
    private static ClienteDto ToDto(Cliente c, DateTime ahora, int visitas30d)
    {
        var principal = c.Tarjetas
            .OrderByDescending(t => t.UltimoSelloEn ?? t.CreatedAt)
            .FirstOrDefault();

        DateTime? ultimaVisita = c.Tarjetas.Count == 0
            ? null
            : c.Tarjetas.Select(t => t.UltimoSelloEn ?? t.CreatedAt).Max();

        var diasInactivo = ultimaVisita.HasValue ? (ahora - ultimaVisita.Value).TotalDays : (double?)null;
        var diasRegistro = (ahora - c.CreatedAt).TotalDays;

        var tieneCanjeListo = c.Tarjetas.Any(t =>
            t.Diseno?.Tipo == "sellos" && t.Diseno.SellosRequeridos > 0 && t.SellosActuales >= t.Diseno.SellosRequeridos);

        string estado;
        if (diasInactivo.HasValue && diasInactivo.Value >= 60)
            estado = "inactivo";
        else if (tieneCanjeListo)
            estado = "canje-listo";
        else if (visitas30d >= 4)
            estado = "frecuente";
        else if (diasRegistro <= 7)
            estado = "nuevo";
        else
            estado = "activo";

        return new ClienteDto(
            c.Id, c.EmpresaId, c.Nombre, c.Telefono, c.Email, c.CreatedAt,
            estado,
            principal?.DisenoId, principal?.Diseno?.Nombre, principal?.Diseno?.Tipo,
            principal?.SellosActuales ?? 0, principal?.Diseno?.SellosRequeridos ?? 0, principal?.PremiosCanjeados ?? 0,
            ultimaVisita, c.Tarjetas.Count);
    }
}
