using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class NotificacionesService : INotificacionesService
{
    private readonly AppDbContext _db;

    public NotificacionesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<NotificacionDto>> GetAsync(int empresaId)
    {
        return await _db.Notificaciones
            .Where(n => n.EmpresaId == empresaId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(200)
            .Select(n => ToDto(n))
            .ToListAsync();
    }

    public Task<int> ContarNoLeidasAsync(int empresaId) =>
        _db.Notificaciones.CountAsync(n => n.EmpresaId == empresaId && !n.Leida);

    public async Task MarcarLeidasAsync(int empresaId)
    {
        await _db.Notificaciones
            .Where(n => n.EmpresaId == empresaId && !n.Leida)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Leida, true));
    }

    public async Task CrearAsync(int empresaId, string tipo, string titulo, string mensaje, string? linkView = null)
    {
        _db.Notificaciones.Add(new Notificacion
        {
            EmpresaId = empresaId,
            Tipo = tipo,
            Titulo = titulo,
            Mensaje = mensaje,
            LinkView = linkView,
            CreatedAt = MexicoCityTime.Now(),
        });
        await _db.SaveChangesAsync();
    }

    private static NotificacionDto ToDto(Notificacion n) =>
        new(n.Id, n.Tipo, n.Titulo, n.Mensaje, n.LinkView, n.Leida, n.CreatedAt);
}
