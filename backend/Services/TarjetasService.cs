using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using Microsoft.EntityFrameworkCore;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

public class TarjetasService : ITarjetasService
{
    private readonly AppDbContext _db;
    private readonly IPassKitService _passKit;
    private readonly IApnsPushService _apns;

    public TarjetasService(AppDbContext db, IPassKitService passKit, IApnsPushService apns)
    {
        _db = db;
        _passKit = passKit;
        _apns = apns;
    }

    private async Task NotifyPassUpdatedAsync(string codigoQr)
    {
        var tokens = await _passKit.GetPushTokensForTarjetaAsync(codigoQr);
        foreach (var token in tokens)
            await _apns.SendUpdateAsync(token);
    }

    public async Task<List<TarjetaDto>> GetByEmpresaAsync(int empresaId)
    {
        return await BaseQuery()
            .Where(t => t.EmpresaId == empresaId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToDto(t))
            .ToListAsync();
    }

    public async Task<TarjetaDto?> GetByIdAsync(int empresaId, int id)
    {
        var tarjeta = await BaseQuery().FirstOrDefaultAsync(t => t.Id == id && t.EmpresaId == empresaId);
        return tarjeta == null ? null : ToDto(tarjeta);
    }

    public async Task<TarjetaDto?> GetByCodigoQrAsync(string codigoQr)
    {
        var tarjeta = await BaseQuery().FirstOrDefaultAsync(t => t.CodigoQr == codigoQr);
        return tarjeta == null ? null : ToDto(tarjeta);
    }

    public async Task<TarjetaDto> EmitirAsync(int empresaId, EmitirTarjetaRequest request)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Id == empresaId)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        var disenoId = request.DisenoId ?? empresa.DisenoActivoId
            ?? throw new InvalidOperationException("Elegí un diseño para emitir la tarjeta.");

        var disenoValido = await _db.Disenos.AnyAsync(d => d.Id == disenoId && d.EmpresaId == empresaId);
        if (!disenoValido)
            throw new InvalidOperationException("El diseño elegido no existe o no pertenece a tu empresa.");

        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.EmpresaId == empresaId && c.Telefono == request.Telefono);
        if (cliente == null)
        {
            cliente = new Cliente { EmpresaId = empresaId, Nombre = request.Nombre, Telefono = request.Telefono, Email = request.Email };
            _db.Clientes.Add(cliente);
            await _db.SaveChangesAsync();
        }

        var tarjeta = new Tarjeta
        {
            ClienteId = cliente.Id,
            EmpresaId = empresaId,
            DisenoId = disenoId,
            CodigoQr = Guid.NewGuid().ToString("N"),
            WalletTipo = string.IsNullOrWhiteSpace(request.WalletTipo) ? "web" : request.WalletTipo,
        };

        _db.Tarjetas.Add(tarjeta);
        await _db.SaveChangesAsync();

        _db.TarjetaLogs.Add(new TarjetaLog { TarjetaId = tarjeta.Id, Accion = "tarjeta_creada" });
        await _db.SaveChangesAsync();

        var created = await BaseQuery().FirstAsync(t => t.Id == tarjeta.Id);
        return ToDto(created);
    }

    public async Task<TarjetaDto?> SumarSelloAsync(int empresaId, int id)
    {
        var tarjeta = await _db.Tarjetas.Include(t => t.Diseno)
            .FirstOrDefaultAsync(t => t.Id == id && t.EmpresaId == empresaId);
        return tarjeta == null ? null : await SumarSelloAsync(tarjeta);
    }

    public async Task<TarjetaDto?> SumarSelloPorCodigoAsync(int empresaId, string codigoQr)
    {
        var tarjeta = await _db.Tarjetas.Include(t => t.Diseno)
            .FirstOrDefaultAsync(t => t.CodigoQr == codigoQr && t.EmpresaId == empresaId);
        return tarjeta == null ? null : await SumarSelloAsync(tarjeta);
    }

    private async Task<TarjetaDto> SumarSelloAsync(Tarjeta tarjeta)
    {
        if (tarjeta.Diseno?.Tipo == "cupon")
            throw new InvalidOperationException("Esta tarjeta es un cupón, no acumula sellos.");

        tarjeta.SellosActuales += 1;
        _db.TarjetaLogs.Add(new TarjetaLog { TarjetaId = tarjeta.Id, Accion = "sello_agregado", SellosAgregados = 1 });
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(t => t.Id == tarjeta.Id);
        await NotifyPassUpdatedAsync(updated.CodigoQr);
        return ToDto(updated);
    }

    public async Task<TarjetaDto?> CanjearPremioAsync(int empresaId, int id)
    {
        var tarjeta = await _db.Tarjetas.Include(t => t.Diseno)
            .FirstOrDefaultAsync(t => t.Id == id && t.EmpresaId == empresaId);
        if (tarjeta == null) return null;

        if (tarjeta.Diseno?.Tipo == "cupon")
            throw new InvalidOperationException("Esta tarjeta es un cupón: usá 'Canjear cupón' en vez de 'Canjear premio'.");

        var sellosRequeridos = tarjeta.Diseno?.SellosRequeridos ?? 0;
        if (sellosRequeridos <= 0 || tarjeta.SellosActuales < sellosRequeridos)
            throw new InvalidOperationException("La tarjeta todavía no acumula los sellos suficientes para canjear un premio.");

        tarjeta.SellosActuales -= sellosRequeridos;
        tarjeta.PremiosCanjeados += 1;
        _db.TarjetaLogs.Add(new TarjetaLog { TarjetaId = tarjeta.Id, Accion = "premio_canjeado" });
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(t => t.Id == id);
        await NotifyPassUpdatedAsync(updated.CodigoQr);
        return ToDto(updated);
    }

    public async Task<TarjetaDto?> CanjearCuponAsync(int empresaId, int id)
    {
        var tarjeta = await _db.Tarjetas.Include(t => t.Diseno)
            .FirstOrDefaultAsync(t => t.Id == id && t.EmpresaId == empresaId);
        if (tarjeta == null) return null;

        if (tarjeta.Diseno?.Tipo != "cupon")
            throw new InvalidOperationException("Esta tarjeta no es un cupón.");

        if (tarjeta.CuponRedimido)
            throw new InvalidOperationException("Este cupón ya fue canjeado.");

        if (tarjeta.Diseno.Vencimiento.HasValue && tarjeta.Diseno.Vencimiento.Value < MexicoCityTime.Now())
            throw new InvalidOperationException("Este cupón ya venció.");

        tarjeta.CuponRedimido = true;
        _db.TarjetaLogs.Add(new TarjetaLog { TarjetaId = tarjeta.Id, Accion = "cupon_canjeado" });
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(t => t.Id == id);
        await NotifyPassUpdatedAsync(updated.CodigoQr);
        return ToDto(updated);
    }

    public async Task<List<TarjetaLogDto>> GetLogsAsync(int empresaId, int id)
    {
        var pertenece = await _db.Tarjetas.AnyAsync(t => t.Id == id && t.EmpresaId == empresaId);
        if (!pertenece) return new List<TarjetaLogDto>();

        return await _db.TarjetaLogs
            .Where(l => l.TarjetaId == id)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new TarjetaLogDto(l.Id, l.Accion, l.SellosAgregados, l.Descripcion, l.CreatedAt))
            .ToListAsync();
    }

    private IQueryable<Tarjeta> BaseQuery() => _db.Tarjetas
        .Include(t => t.Cliente)
        .Include(t => t.Empresa)
        .Include(t => t.Diseno);

    private static TarjetaDto ToDto(Tarjeta t) => new(
        t.Id, t.ClienteId, t.Cliente?.Nombre, t.Cliente?.Telefono,
        t.EmpresaId, t.Empresa?.Nombre,
        t.DisenoId, t.Diseno?.Nombre, t.Diseno?.Tipo ?? "sellos", t.Diseno?.Logo, t.Diseno?.ColorPrimario, t.Diseno?.ColorSecundario,
        t.Diseno?.ColorTexto, t.Diseno?.IconoSello, t.Diseno?.FondoUrl,
        t.SellosActuales, t.Diseno?.SellosRequeridos ?? 0, t.PremiosCanjeados,
        t.Diseno?.Vencimiento, t.Diseno?.Descripcion, t.CuponRedimido,
        t.CodigoQr, t.WalletTipo, t.Estado, t.CreatedAt, t.UpdatedAt);
}
