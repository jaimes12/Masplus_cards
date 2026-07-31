using MasplusCards.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Infrastructure;

/// <summary>Resuelve los límites de uso (diseños/tarjetas) que le aplican a una empresa. Si la empresa
/// no tiene un plan pago (Empresa.PlanId == null, el estado por default al registrarse), aplica un tope
/// gratuito fijo de 1 diseño y 1 tarjeta — no existe un renglón "Free" en la tabla de planes, así que ese
/// tope vive acá. Si tiene un plan, usa los límites de ese plan (null en el plan = ilimitado).</summary>
public static class PlanLimitesHelper
{
    public const int LimiteGratuitoDisenos = 1;
    public const int LimiteGratuitoTarjetas = 1;

    public static async Task<(int? Disenos, int? Tarjetas)> ObtenerLimitesAsync(AppDbContext db, int empresaId)
    {
        var info = await db.Empresas
            .Where(e => e.Id == empresaId)
            .Select(e => new { e.PlanId, LimiteDisenos = e.Plan!.LimiteDisenos, LimiteTarjetas = e.Plan!.LimiteTarjetas })
            .FirstOrDefaultAsync();

        if (info == null || info.PlanId == null)
            return (LimiteGratuitoDisenos, LimiteGratuitoTarjetas);

        return (info.LimiteDisenos, info.LimiteTarjetas);
    }
}
