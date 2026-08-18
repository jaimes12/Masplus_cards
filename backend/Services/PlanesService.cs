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
        empresa.PlanRenuevaEl = plan.PrecioMensual > 0 ? MexicoCityTime.Now().AddDays(30) : null;
        empresa.PruebaTerminaEl = null;
        await _db.SaveChangesAsync();

        empresa.Plan = plan;
        return await BuildEmpresaPlanDtoAsync(empresa);
    }

    private async Task<EmpresaPlanDto> BuildEmpresaPlanDtoAsync(Empresa empresa)
    {
        var vigente = await PlanLimitesHelper.ResolverAsync(_db, empresa);
        var disenosUsados = await _db.Disenos.CountAsync(d => d.EmpresaId == empresa.Id && d.Activo);
        var tarjetasUsadas = await _db.Tarjetas.CountAsync(t => t.EmpresaId == empresa.Id);
        var catalogo = await GetCatalogoAsync();

        return new EmpresaPlanDto(
            ToDto(vigente.Plan),
            vigente.EnPrueba ? null : empresa.PlanRenuevaEl,
            vigente.EnPrueba,
            vigente.PruebaTerminaEl,
            PlanLimitesHelper.DiasPrueba,
            disenosUsados,
            tarjetasUsadas,
            catalogo);
    }

    public async Task<List<PlanAdminDto>> GetCatalogoAdminAsync()
    {
        var planes = await _db.Planes.OrderBy(p => p.Orden).ToListAsync();
        return planes.Select(ToAdminDto).ToList();
    }

    public async Task<PlanAdminDto> ActualizarAsync(int planId, PlanUpdateRequest request)
    {
        var plan = await _db.Planes.FirstOrDefaultAsync(p => p.Id == planId)
            ?? throw new InvalidOperationException("Plan no encontrado.");

        plan.Nombre = request.Nombre;
        plan.Descripcion = request.Descripcion;
        plan.LimiteDisenos = request.LimiteDisenos;
        plan.LimiteTarjetas = request.LimiteTarjetas;
        plan.Caracteristicas = JsonSerializer.Serialize(request.Caracteristicas);
        plan.Destacado = request.Destacado;
        plan.Orden = request.Orden;
        plan.Activo = request.Activo;

        // El precio en Stripe es inmutable: si cambia, se limpia el price guardado para que
        // StripeService cree uno nuevo la próxima vez que alguien se suscriba a este plan.
        // Las suscripciones ya activas siguen cobrando el precio con el que se dieron de alta.
        if (plan.PrecioMensual != request.PrecioMensual)
            plan.StripePriceId = null;
        plan.PrecioMensual = request.PrecioMensual;

        await _db.SaveChangesAsync();
        return ToAdminDto(plan);
    }

    private static PlanDto ToDto(Plan p) => new(
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.PrecioMensual,
        p.LimiteDisenos,
        p.LimiteTarjetas,
        DeserializeCaracteristicas(p.Caracteristicas),
        p.Destacado);

    private static PlanAdminDto ToAdminDto(Plan p) => new(
        p.Id,
        p.Nombre,
        p.Descripcion,
        p.PrecioMensual,
        p.LimiteDisenos,
        p.LimiteTarjetas,
        DeserializeCaracteristicas(p.Caracteristicas),
        p.Destacado,
        p.Orden,
        p.Activo);

    private static List<string> DeserializeCaracteristicas(string? json) =>
        string.IsNullOrWhiteSpace(json)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
}
