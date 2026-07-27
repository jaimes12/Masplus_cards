using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class ClientesService : IClientesService
{
    private readonly AppDbContext _db;

    public ClientesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ClienteDto>> GetByEmpresaAsync(int empresaId)
    {
        return await _db.Clientes
            .Where(c => c.EmpresaId == empresaId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => ToDto(c))
            .ToListAsync();
    }

    public async Task<ClienteDto?> GetByIdAsync(int empresaId, int id)
    {
        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id && c.EmpresaId == empresaId);
        return cliente == null ? null : ToDto(cliente);
    }

    private static ClienteDto ToDto(Cliente c) => new(c.Id, c.EmpresaId, c.Nombre, c.Telefono, c.Email, c.CreatedAt);
}
