using MasplusCards.Api.Data;
using MasplusCards.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Infrastructure;

/// <summary>Plan que le aplica a una empresa en este momento, ya considerando el periodo de prueba.</summary>
public record PlanVigente(Plan Plan, bool EnPrueba, DateTime? PruebaTerminaEl);

/// <summary>
/// Modelo de acceso (definido tras revisar la competencia — Loopy Loyalty, Stamp Me, Boomerangme,
/// SMS Masivos, LealHub): al registrarse, la empresa recibe <see cref="DiasPrueba"/> días del plan
/// destacado (Pro) sin tarjeta; al vencer sin suscripción, baja automáticamente al plan Gratis
/// (precio 0, límites acotados) en vez de quedar inactiva — así las tarjetas que sus clientes ya
/// tienen en Wallet siguen funcionando y el negocio paga cuando el producto ya le está funcionando.
///
/// Este helper es la única fuente de verdad del plan vigente: resuelve la prueba vencida de forma
/// perezosa (la primera vez que algo consulta el plan después del vencimiento) y persiste el cambio.
/// </summary>
public static class PlanLimitesHelper
{
    public const int DiasPrueba = 14;

    /// <summary>Tope de emergencia si la tabla de planes no tiene un plan Gratis (precio 0) activo.</summary>
    public const int LimiteGratuitoDisenos = 1;
    public const int LimiteGratuitoTarjetas = 30;

    public static Task<Plan?> ObtenerPlanGratisAsync(AppDbContext db) =>
        db.Planes.Where(p => p.Activo && p.PrecioMensual == 0).OrderBy(p => p.Orden).FirstOrDefaultAsync();

    /// <summary>Plan con el que arranca la prueba: el destacado; si no hay, el pago más barato.</summary>
    public static async Task<Plan?> ObtenerPlanDePruebaAsync(AppDbContext db)
    {
        var pagos = db.Planes.Where(p => p.Activo && p.PrecioMensual > 0);
        return await pagos.FirstOrDefaultAsync(p => p.Destacado)
            ?? await pagos.OrderBy(p => p.PrecioMensual).FirstOrDefaultAsync();
    }

    public static async Task<PlanVigente> ResolverAsync(AppDbContext db, int empresaId)
    {
        var empresa = await db.Empresas.Include(e => e.Plan).FirstOrDefaultAsync(e => e.Id == empresaId)
            ?? throw new InvalidOperationException("Empresa no encontrada.");
        return await ResolverAsync(db, empresa);
    }

    /// <summary>Versión para cuando ya se tiene la entidad cargada (con .Include(e => e.Plan)).</summary>
    public static async Task<PlanVigente> ResolverAsync(AppDbContext db, Empresa empresa)
    {
        var now = MexicoCityTime.Now();
        var cambio = false;

        // Ya paga: la prueba deja de tener sentido, aunque hubiera quedado una fecha guardada.
        if (empresa.PruebaTerminaEl.HasValue && !string.IsNullOrEmpty(empresa.StripeSubscriptionId))
        {
            empresa.PruebaTerminaEl = null;
            cambio = true;
        }

        var enPrueba = empresa.PruebaTerminaEl.HasValue && empresa.PruebaTerminaEl.Value > now && empresa.PlanId != null;
        var pruebaVencida = empresa.PruebaTerminaEl.HasValue && empresa.PruebaTerminaEl.Value <= now;

        if (pruebaVencida || empresa.PlanId == null || empresa.Plan == null)
        {
            var gratis = await ObtenerPlanGratisAsync(db);
            if (gratis != null && (empresa.PlanId != gratis.Id || pruebaVencida))
            {
                empresa.PlanId = gratis.Id;
                empresa.Plan = gratis;
                empresa.PlanRenuevaEl = null;
                empresa.PruebaTerminaEl = null;
                cambio = true;
            }
            else if (gratis == null)
            {
                // Sin plan Gratis en catálogo: aplicar el tope de emergencia sin persistir nada.
                var sintetico = new Plan
                {
                    Id = 0,
                    Nombre = "Gratis",
                    PrecioMensual = 0,
                    LimiteDisenos = LimiteGratuitoDisenos,
                    LimiteTarjetas = LimiteGratuitoTarjetas,
                    Caracteristicas = "[]",
                    Activo = true,
                };
                if (cambio) await db.SaveChangesAsync();
                return new PlanVigente(sintetico, false, null);
            }
            enPrueba = false;
        }

        if (cambio) await db.SaveChangesAsync();
        return new PlanVigente(empresa.Plan!, enPrueba, enPrueba ? empresa.PruebaTerminaEl : null);
    }

    /// <summary>Límites (diseños, tarjetas) vigentes; null = ilimitado.</summary>
    public static async Task<(int? Disenos, int? Tarjetas)> ObtenerLimitesAsync(AppDbContext db, int empresaId)
    {
        var vigente = await ResolverAsync(db, empresaId);
        return (vigente.Plan.LimiteDisenos, vigente.Plan.LimiteTarjetas);
    }
}
