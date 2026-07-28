using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class DisenosService : IDisenosService
{
    private readonly AppDbContext _db;

    public DisenosService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<DisenoDto>> GetByEmpresaAsync(int empresaId)
    {
        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();

        return await _db.Disenos
            .Where(d => d.EmpresaId == empresaId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => ToDto(d, activoId))
            .ToListAsync();
    }

    public async Task<DisenoDto?> GetByIdAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        return ToDto(diseno, activoId);
    }

    public async Task<DisenoDto> CreateAsync(int empresaId, DisenoUpsertRequest request)
    {
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
        };

        _db.Disenos.Add(diseno);
        await _db.SaveChangesAsync();
        return ToDto(diseno, null);
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

        await _db.SaveChangesAsync();

        var activoId = await _db.Empresas.Where(e => e.Id == empresaId)
            .Select(e => e.DisenoActivoId).FirstOrDefaultAsync();
        return ToDto(diseno, activoId);
    }

    public async Task<DisenoDto?> ActivarAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return null;

        var empresa = await _db.Empresas.FirstAsync(e => e.Id == empresaId);
        empresa.DisenoActivoId = diseno.Id;
        await _db.SaveChangesAsync();

        return ToDto(diseno, diseno.Id);
    }

    public async Task<bool> DeleteAsync(int empresaId, int id)
    {
        var diseno = await _db.Disenos.FirstOrDefaultAsync(d => d.Id == id && d.EmpresaId == empresaId);
        if (diseno == null) return false;

        _db.Disenos.Remove(diseno);
        await _db.SaveChangesAsync();
        return true;
    }

    private static string NormalizeTipo(string? tipo) => tipo == "cupon" ? "cupon" : "sellos";

    private static DisenoDto ToDto(Diseno d, int? disenoActivoId) => new(
        d.Id, d.EmpresaId, d.TemplateId, d.Nombre, d.Tipo, d.Logo, d.ColorPrimario, d.ColorSecundario, d.ColorTexto,
        d.IconoSello, d.FondoUrl, d.SellosRequeridos, d.Vencimiento, d.Descripcion, d.Configuracion, d.Activo,
        EsActivoDeEmpresa: disenoActivoId.HasValue && disenoActivoId.Value == d.Id,
        d.CreatedAt, d.UpdatedAt);
}
