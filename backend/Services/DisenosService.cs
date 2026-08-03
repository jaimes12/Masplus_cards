using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class DisenosService : IDisenosService
{
    private readonly AppDbContext _db;
    private readonly INotificacionesService _notificaciones;

    public DisenosService(AppDbContext db, INotificacionesService notificaciones)
    {
        _db = db;
        _notificaciones = notificaciones;
    }

    public async Task<List<DisenoDto>> GetByEmpresaAsync(int empresaId)
    {
        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();

        var counts = await _db.Tarjetas
            .Where(t => t.EmpresaId == empresaId)
            .GroupBy(t => t.DisenoId)
            .Select(g => new { DisenoId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.DisenoId, x => x.Count);

        var disenos = await _db.Disenos
            .Where(d => d.EmpresaId == empresaId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return disenos.Select(d => ToDto(d, activoId, counts.GetValueOrDefault(d.Id))).ToList();
    }

    public async Task<DisenoDto?> GetByIdAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        var count = await _db.Tarjetas.CountAsync(t => t.DisenoId == id);
        return ToDto(diseno, activoId, count);
    }

    public async Task<DisenoDto> CreateAsync(int empresaId, DisenoUpsertRequest request)
    {
        var (limiteDisenos, _) = await PlanLimitesHelper.ObtenerLimitesAsync(_db, empresaId);
        if (limiteDisenos.HasValue)
        {
            var disenosActivos = await _db.Disenos.CountAsync(d => d.EmpresaId == empresaId && d.Activo);
            if (disenosActivos >= limiteDisenos.Value)
            {
                throw new InvalidOperationException(
                    $"Llegaste al límite de {limiteDisenos.Value} diseño{(limiteDisenos.Value == 1 ? "" : "s")} de tu plan actual. Mejorá tu plan para crear más.");
            }
        }

        var diseno = new Diseno
        {
            EmpresaId = empresaId,
            TemplateId = request.TemplateId,
            Nombre = request.Nombre,
            Tipo = NormalizeTipo(request.Tipo),
            Logo = request.Logo,
            ColorPrimario = request.ColorPrimario,
            ColorSecundario = request.ColorSecundario,
            ColorTexto = request.ColorTexto,
            IconoSello = request.IconoSello,
            FondoUrl = request.FondoUrl,
            SellosRequeridos = request.SellosRequeridos,
            Vencimiento = request.Vencimiento,
            Descripcion = request.Descripcion,
            Configuracion = request.Configuracion,
            RecordatoriosActivos = request.RecordatoriosActivos,
            EstiloCuponPoster = request.EstiloCuponPoster,
        };

        _db.Disenos.Add(diseno);
        await _db.SaveChangesAsync();
        return ToDto(diseno, null, 0);
    }

    public async Task<DisenoDto?> UpdateAsync(int empresaId, int id, DisenoUpsertRequest request)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        diseno.TemplateId = request.TemplateId;
        diseno.Nombre = request.Nombre;
        diseno.Tipo = NormalizeTipo(request.Tipo);
        diseno.Logo = request.Logo;
        diseno.ColorPrimario = request.ColorPrimario;
        diseno.ColorSecundario = request.ColorSecundario;
        diseno.ColorTexto = request.ColorTexto;
        diseno.IconoSello = request.IconoSello;
        diseno.FondoUrl = request.FondoUrl;
        diseno.SellosRequeridos = request.SellosRequeridos;
        diseno.Vencimiento = request.Vencimiento;
        diseno.Descripcion = request.Descripcion;
        diseno.Configuracion = request.Configuracion;
        diseno.RecordatoriosActivos = request.RecordatoriosActivos;
        diseno.EstiloCuponPoster = request.EstiloCuponPoster;

        await _db.SaveChangesAsync();

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        var count = await _db.Tarjetas.CountAsync(t => t.DisenoId == id);
        return ToDto(diseno, activoId, count);
    }

    public async Task<DisenoDto?> ActivarAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        var empresa = await _db.Empresas.FirstAsync(e => e.Id == empresaId);
        empresa.DisenoActivoId = diseno.Id;
        await _db.SaveChangesAsync();

        var count = await _db.Tarjetas.CountAsync(t => t.DisenoId == id);
        return ToDto(diseno, diseno.Id, count);
    }

    public async Task<DisenoDto?> PausarAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        diseno.Activo = false;
        await _db.SaveChangesAsync();
        await _notificaciones.CrearAsync(
            empresaId, "diseno_pausado", "Tarjeta pausada",
            $"Pausaste \"{diseno.Nombre}\". Ya no se puede usar para nuevas emisiones.", "tarjetas");

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId).Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        var count = await _db.Tarjetas.CountAsync(t => t.DisenoId == id);
        return ToDto(diseno, activoId, count);
    }

    public async Task<DisenoDto?> ReactivarAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        diseno.Activo = true;
        await _db.SaveChangesAsync();
        await _notificaciones.CrearAsync(
            empresaId, "diseno_reactivado", "Tarjeta reactivada",
            $"\"{diseno.Nombre}\" vuelve a estar disponible para nuevas emisiones.", "tarjetas");

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId).Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        var count = await _db.Tarjetas.CountAsync(t => t.DisenoId == id);
        return ToDto(diseno, activoId, count);
    }

    public async Task<DisenoDto?> DuplicarAsync(int empresaId, int id)
    {
        var original = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (original == null) return null;

        var (limiteDisenos, _) = await PlanLimitesHelper.ObtenerLimitesAsync(_db, empresaId);
        if (limiteDisenos.HasValue)
        {
            var disenosActivos = await _db.Disenos.CountAsync(d => d.EmpresaId == empresaId && d.Activo);
            if (disenosActivos >= limiteDisenos.Value)
            {
                throw new InvalidOperationException(
                    $"Llegaste al límite de {limiteDisenos.Value} diseño{(limiteDisenos.Value == 1 ? "" : "s")} de tu plan actual. Mejorá tu plan para crear más.");
            }
        }

        var copia = new Diseno
        {
            EmpresaId = empresaId,
            TemplateId = original.TemplateId,
            Nombre = string.IsNullOrWhiteSpace(original.Nombre) ? "Copia" : $"{original.Nombre} (copia)",
            Tipo = original.Tipo,
            Logo = original.Logo,
            ColorPrimario = original.ColorPrimario,
            ColorSecundario = original.ColorSecundario,
            ColorTexto = original.ColorTexto,
            IconoSello = original.IconoSello,
            FondoUrl = original.FondoUrl,
            SellosRequeridos = original.SellosRequeridos,
            Vencimiento = original.Vencimiento,
            Descripcion = original.Descripcion,
            Configuracion = original.Configuracion,
            RecordatoriosActivos = original.RecordatoriosActivos,
            EstiloCuponPoster = original.EstiloCuponPoster,
        };

        _db.Disenos.Add(copia);
        await _db.SaveChangesAsync();
        return ToDto(copia, null, 0);
    }

    public async Task<bool> DeleteAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return false;

        var tieneTarjetas = await _db.Tarjetas.AnyAsync(t => t.DisenoId == id);
        if (tieneTarjetas)
        {
            throw new InvalidOperationException(
                "No se puede eliminar este diseño porque ya tiene tarjetas emitidas a clientes.");
        }

        _db.Disenos.Remove(diseno);
        await _db.SaveChangesAsync();
        return true;
    }

    private static string NormalizeTipo(string? tipo) => tipo == "cupon" ? "cupon" : "sellos";

    private static DisenoDto ToDto(Diseno d, int? disenoActivoId, int tarjetasCount) => new(
        d.Id, d.EmpresaId, d.TemplateId, d.Nombre, d.Tipo, d.Logo, d.ColorPrimario, d.ColorSecundario, d.ColorTexto,
        d.IconoSello, d.FondoUrl, d.SellosRequeridos, d.Vencimiento, d.Descripcion, d.Configuracion, d.Activo,
        EsActivoDeEmpresa: disenoActivoId.HasValue && disenoActivoId.Value == d.Id,
        TarjetasCount: tarjetasCount,
        d.CodigoRegistro,
        d.CreatedAt, d.UpdatedAt,
        d.RecordatoriosActivos,
        d.EstiloCuponPoster);
}
