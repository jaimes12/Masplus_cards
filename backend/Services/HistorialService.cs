using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class HistorialService : IHistorialService
{
    private readonly AppDbContext _db;

    public HistorialService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<HistorialPageDto> GetAsync(int empresaId, int page, int pageSize, string? accion, DateTime? desde, DateTime? hasta, string? q)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.TarjetaLogs
            .Where(l => l.EmpresaId == empresaId)
            .Include(l => l.Tarjeta).ThenInclude(t => t!.Cliente)
            .Include(l => l.Tarjeta).ThenInclude(t => t!.Diseno)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(accion))
            query = query.Where(l => l.Accion == accion);

        if (desde.HasValue)
            query = query.Where(l => l.CreatedAt >= desde.Value);

        if (hasta.HasValue)
            query = query.Where(l => l.CreatedAt <= hasta.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var texto = q.Trim();
            query = query.Where(l =>
                (l.Tarjeta!.Cliente!.Nombre != null && EF.Functions.Like(l.Tarjeta.Cliente.Nombre, $"%{texto}%")) ||
                EF.Functions.Like(l.Tarjeta!.Diseno!.Nombre, $"%{texto}%"));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new HistorialItemDto(
                l.Id, l.Accion, l.SellosAgregados, l.Descripcion,
                l.Tarjeta!.ClienteId, l.Tarjeta.Cliente!.Nombre, l.Tarjeta.DisenoId, l.Tarjeta.Diseno!.Nombre,
                l.CreatedAt))
            .ToListAsync();

        return new HistorialPageDto(items, total, page, pageSize);
    }
}
