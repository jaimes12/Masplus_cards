using System.Text.Json;
using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class PlanesService : IPlanesService
{
    private readonly AppDbContext _db;

    public PlanesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PlanDto>> GetCatalogoAsync()
    {
        var planes = await _db.Planes.Where(p => p.Activo).OrderBy(p => p.Orden).ToListAsync();
        return planes.Select(ToDto).ToList();
    }

    public async Task<EmpresaPlanDto> GetActualAsync(int empresaId)
    {
        var empresa = await _db.Empresas.Include(e => e.Plan).FirstOrDefaultAsync(e => e.Id == empresaId)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        return await BuildEmpresaPlanDtoAsync(empresa);
    }

    public async Task<EmpresaPlanDto> CambiarPlanAsync(int empresaId, int planId)
    {
        var empresa = await _db.Empresas.Include(e => e.Plan).FirstOrDefaultAsync(e => e.Id == empresaId)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        var plan = await _db.Planes.FirstOrDefaultAsync(p => p.Id == planId && p.Activo)
            ?? throw new InvalidOperationException("Plan no encontrado.");

        empresa.PlanId = plan.Id;
        empresa.PlanRenuevaEl = MexicoCityTime.Now().AddDays(30);
        await _db.SaveChangesAsync();

        empresa.Plan = plan;
        return await BuildEmpresaPlanDtoAsync(empresa);
    }

    private async Task<EmpresaPlanDto> BuildEmpresaPlanDtoAsync(Empresa empresa)
    {
        var disenosUsados = await _db.Disenos.CountAsync(d => d.EmpresaId == empresa.Id && d.Activo);
        var tarjetasUsadas = await _db.Tarjetas.CountAsync(t => t.EmpresaId == empresa.Id);
        var catalogo = await GetCatalogoAsync();

        return new EmpresaPlanDto(
            empresa.Plan == null ? null : ToDto(empresa.Plan),
            empresa.PlanRenuevaEl,
            disenosUsados,
            tarjetasUsadas,
            catalogo);
    }

    private static PlanDto ToDto(Plan p) => new(
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.PrecioMensual,
        p.LimiteDisenos,
        p.LimiteTarjetas,
        string.IsNullOrWhiteSpace(p.Caracteristicas)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(p.Caracteristicas) ?? new List<string>(),
        p.Destacado);
}
