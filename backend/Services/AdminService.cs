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
                e.Tarjetas.Count))
            .ToListAsync();
    }
}
