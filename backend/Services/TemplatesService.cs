using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class TemplatesService : ITemplatesService
{
    private readonly AppDbContext _db;

    public TemplatesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TemplateDto>> GetAllAsync(bool soloActivos)
    {
        var query = _db.Templates.AsQueryable();
        if (soloActivos) query = query.Where(t => t.Activo);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToDto(t))
            .ToListAsync();
    }

    public async Task<TemplateDto?> GetByIdAsync(int id)
    {
        var template = await _db.Templates.FindAsync(id);
        return template == null ? null : ToDto(template);
    }

    public async Task<TemplateDto> CreateAsync(int adminId, TemplateUpsertRequest request)
    {
        var template = new Template
        {
            AdminId = adminId,
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            PreviewImg = request.PreviewImg,
            TipoRecompensa = request.TipoRecompensa,
            Estructura = request.Estructura,
            Activo = request.Activo,
        };

        _db.Templates.Add(template);
        await _db.SaveChangesAsync();
        return ToDto(template);
    }

    public async Task<TemplateDto?> UpdateAsync(int id, TemplateUpsertRequest request)
    {
        var template = await _db.Templates.FindAsync(id);
        if (template == null) return null;

        template.Nombre = request.Nombre;
        template.Descripcion = request.Descripcion;
        template.PreviewImg = request.PreviewImg;
        template.TipoRecompensa = request.TipoRecompensa;
        template.Estructura = request.Estructura;
        template.Activo = request.Activo;

        await _db.SaveChangesAsync();
        return ToDto(template);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var template = await _db.Templates.FindAsync(id);
        if (template == null) return false;

        _db.Templates.Remove(template);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TemplateDto ToDto(Template t) => new(
        t.Id, t.Nombre, t.Descripcion, t.PreviewImg, t.TipoRecompensa, t.Estructura, t.Activo, t.CreatedAt);
}
