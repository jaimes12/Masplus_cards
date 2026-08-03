using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

/// <summary>Autorregistro público: un cliente escanea el QR de un diseño y obtiene su propia tarjeta
/// dando solo su nombre y teléfono, sin que la empresa tenga que intervenir.</summary>
public class RegistroService : IRegistroService
{
    private readonly AppDbContext _db;

    public RegistroService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<RegistroDisenoPublicoDto?> GetDisenoPublicoAsync(string codigoRegistro)
    {
        var diseno = await _db.Disenos.Include(d => d.Empresa)
            .FirstOrDefaultAsync(d => d.CodigoRegistro == codigoRegistro && d.Activo);
        if (diseno == null) return null;

        return new RegistroDisenoPublicoDto(
            diseno.Empresa?.Nombre ?? "Masplus",
            diseno.Nombre,
            diseno.Tipo,
            diseno.Logo,
            diseno.IconoSello,
            diseno.FondoUrl,
            diseno.ColorPrimario,
            diseno.ColorTexto,
            diseno.SellosRequeridos,
            diseno.Vencimiento,
            diseno.Descripcion);
    }

    public async Task<RegistroResultDto> RegistrarAsync(string codigoRegistro, RegistroClienteRequest request)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.CodigoRegistro == codigoRegistro && d.Activo)
            ?? throw new InvalidOperationException("Este enlace de registro ya no está disponible.");

        var nombre = request.Nombre?.Trim();
        var telefono = request.Telefono?.Trim();
        if (string.IsNullOrWhiteSpace(nombre))
            throw new InvalidOperationException("Ingresá tu nombre.");
        if (string.IsNullOrWhiteSpace(telefono))
            throw new InvalidOperationException("Ingresá tu número de teléfono.");

        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.EmpresaId == diseno.EmpresaId && c.Telefono == telefono);
        if (cliente == null)
        {
            cliente = new Cliente { EmpresaId = diseno.EmpresaId, Nombre = nombre, Telefono = telefono };
            _db.Clientes.Add(cliente);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Alguien más registró el mismo teléfono justo antes: reusamos el cliente que ganó la carrera.
                _db.Entry(cliente).State = EntityState.Detached;
                cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.EmpresaId == diseno.EmpresaId && c.Telefono == telefono)
                    ?? throw new InvalidOperationException("No se pudo completar el registro, intentá de nuevo.");
            }
        }

        var tarjetaExistente = await _db.Tarjetas
            .FirstOrDefaultAsync(t => t.ClienteId == cliente.Id && t.DisenoId == diseno.Id);
        if (tarjetaExistente != null)
            return new RegistroResultDto(tarjetaExistente.CodigoQr);

        var (_, limiteTarjetas) = await PlanLimitesHelper.ObtenerLimitesAsync(_db, diseno.EmpresaId);
        if (limiteTarjetas.HasValue)
        {
            var tarjetasEmitidas = await _db.Tarjetas.CountAsync(t => t.EmpresaId == diseno.EmpresaId);
            if (tarjetasEmitidas >= limiteTarjetas.Value)
            {
                throw new InvalidOperationException(
                    "Este negocio llegó al límite de tarjetas de su plan actual. Contactalo directamente para que te agregue.");
            }
        }

        var tarjeta = new Tarjeta
        {
            ClienteId = cliente.Id,
            EmpresaId = diseno.EmpresaId,
            DisenoId = diseno.Id,
            CodigoQr = Guid.NewGuid().ToString("N"),
            WalletTipo = "web",
        };
        _db.Tarjetas.Add(tarjeta);
        await _db.SaveChangesAsync();

        _db.TarjetaLogs.Add(new TarjetaLog { TarjetaId = tarjeta.Id, EmpresaId = diseno.EmpresaId, Accion = "tarjeta_creada", Descripcion = "Autorregistro por QR" });
        await _db.SaveChangesAsync();

        return new RegistroResultDto(tarjeta.CodigoQr);
    }
}
