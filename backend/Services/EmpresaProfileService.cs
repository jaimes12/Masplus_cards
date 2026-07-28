using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class EmpresaProfileService : IEmpresaProfileService
{
    private readonly AppDbContext _db;

    public EmpresaProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<EmpresaProfileDto?> GetAsync(int empresaId)
    {
        var empresa = await _db.Empresas.FindAsync(empresaId);
        return empresa == null ? null : ToDto(empresa);
    }

    public async Task<EmpresaProfileDto?> UpdateAsync(int empresaId, EmpresaProfileUpdateRequest request)
    {
        var empresa = await _db.Empresas.FindAsync(empresaId);
        if (empresa == null) return null;

        empresa.Nombre = request.Nombre;
        empresa.Logo = request.Logo;
        empresa.Telefono = request.Telefono;
        await _db.SaveChangesAsync();

        return ToDto(empresa);
    }

    public async Task CambiarPasswordAsync(int empresaId, CambiarPasswordRequest request)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Id == empresaId)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        if (string.IsNullOrEmpty(empresa.PasswordHash) || !PasswordHasher.Verify(request.PasswordActual, empresa.PasswordHash))
            throw new InvalidOperationException("La contraseña actual no es correcta.");

        if (string.IsNullOrWhiteSpace(request.PasswordNueva) || request.PasswordNueva.Length < 6)
            throw new InvalidOperationException("La contraseña nueva debe tener al menos 6 caracteres.");

        empresa.PasswordHash = PasswordHasher.Hash(request.PasswordNueva);
        await _db.SaveChangesAsync();
    }

    private static EmpresaProfileDto ToDto(Models.Empresa e) =>
        new(e.Id, e.Nombre, e.Email, e.Logo, e.Telefono, e.CreatedAt);
}
