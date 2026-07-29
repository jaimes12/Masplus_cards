using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class DiscountCodesService : IDiscountCodesService
{
    private readonly AppDbContext _db;

    public DiscountCodesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<DiscountCodeDto>> GetAllAsync()
    {
        return await _db.DiscountCodes
            .Include(x => x.Plan)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => ToDto(x))
            .ToListAsync();
    }

    public async Task<DiscountCodeDto> CreateAsync(DiscountCodeUpsertRequest request)
    {
        var codigo = request.Codigo.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(codigo))
            throw new InvalidOperationException("El código no puede estar vacío.");

        var tipo = request.TipoDescuento == "monto_fijo" ? "monto_fijo" : "porcentaje";
        if (request.Valor <= 0)
            throw new InvalidOperationException("El valor del descuento debe ser mayor a 0.");
        if (tipo == "porcentaje" && request.Valor > 100)
            throw new InvalidOperationException("Un descuento por porcentaje no puede ser mayor a 100.");

        var existe = await _db.DiscountCodes.AnyAsync(x => x.Codigo == codigo);
        if (existe)
            throw new InvalidOperationException("Ya existe un código de descuento con ese nombre.");

        var entity = new DiscountCode
        {
            Codigo = codigo,
            TipoDescuento = tipo,
            Valor = request.Valor,
            PlanId = request.PlanId,
            UsosMaximos = request.UsosMaximos,
            FechaExpiracion = request.FechaExpiracion,
            Activo = true,
        };

        _db.DiscountCodes.Add(entity);
        await _db.SaveChangesAsync();

        var created = await _db.DiscountCodes.Include(x => x.Plan).FirstAsync(x => x.Id == entity.Id);
        return ToDto(created);
    }

    public async Task<bool> SetActivoAsync(int id, bool activo)
    {
        var entity = await _db.DiscountCodes.FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return false;
        entity.Activo = activo;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _db.DiscountCodes.FirstOrDefaultAsync(x => x.Id == id);
        if (entity == null) return false;
        _db.DiscountCodes.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ValidarCodigoResultDto> ValidarAsync(int empresaId, ValidarCodigoRequest request)
    {
        var plan = await _db.Planes.FirstOrDefaultAsync(p => p.Id == request.PlanId && p.Activo);
        if (plan == null)
            return new ValidarCodigoResultDto(false, "Ese plan no existe.", null, null, null, null, null);

        var codigo = (request.Codigo ?? string.Empty).Trim().ToUpperInvariant();
        var entity = await _db.DiscountCodes.FirstOrDefaultAsync(x => x.Codigo == codigo);

        if (entity == null || !entity.Activo)
            return new ValidarCodigoResultDto(false, "Ese código no existe o ya no está disponible.", null, null, null, null, null);

        if (entity.FechaExpiracion.HasValue && entity.FechaExpiracion.Value < MexicoCityTime.Now())
            return new ValidarCodigoResultDto(false, "Ese código ya venció.", null, null, null, null, null);

        if (entity.UsosMaximos.HasValue && entity.UsosActuales >= entity.UsosMaximos.Value)
            return new ValidarCodigoResultDto(false, "Ese código ya alcanzó su límite de usos.", null, null, null, null, null);

        if (entity.PlanId.HasValue && entity.PlanId.Value != plan.Id)
            return new ValidarCodigoResultDto(false, "Ese código no aplica para el plan elegido.", null, null, null, null, null);

        var yaUsado = await _db.DiscountCodeRedemptions.AnyAsync(r => r.DiscountCodeId == entity.Id && r.EmpresaId == empresaId);
        if (yaUsado)
            return new ValidarCodigoResultDto(false, "Tu cuenta ya usó ese código antes.", null, null, null, null, null);

        var precioOriginal = plan.PrecioMensual;
        var descuento = entity.TipoDescuento == "monto_fijo"
            ? entity.Valor
            : Math.Round(precioOriginal * entity.Valor / 100m, 2);
        var precioConDescuento = Math.Max(precioOriginal - descuento, 0);

        return new ValidarCodigoResultDto(
            true, null, entity.Codigo, entity.TipoDescuento, entity.Valor, precioOriginal, precioConDescuento);
    }

    public async Task RedimirAsync(int empresaId, string codigo)
    {
        var normalizado = (codigo ?? string.Empty).Trim().ToUpperInvariant();
        var entity = await _db.DiscountCodes.FirstOrDefaultAsync(x => x.Codigo == normalizado);
        if (entity == null) return;

        var yaUsado = await _db.DiscountCodeRedemptions.AnyAsync(r => r.DiscountCodeId == entity.Id && r.EmpresaId == empresaId);
        if (yaUsado) return;

        entity.UsosActuales += 1;
        _db.DiscountCodeRedemptions.Add(new DiscountCodeRedemption { DiscountCodeId = entity.Id, EmpresaId = empresaId });
        await _db.SaveChangesAsync();
    }

    private static DiscountCodeDto ToDto(DiscountCode x) => new(
        x.Id, x.Codigo, x.TipoDescuento, x.Valor, x.PlanId, x.Plan?.Nombre,
        x.UsosMaximos, x.UsosActuales, x.FechaExpiracion, x.Activo, x.CreatedAt);
}
