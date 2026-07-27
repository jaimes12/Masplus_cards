using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MasplusCards.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;

    public AuthService(AppDbContext db, JwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<LoginResponse?> LoginAdminAsync(LoginRequest request)
    {
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.Email == request.Email);
        if (admin == null || admin.PasswordHash == null || !PasswordHasher.Verify(request.Password, admin.PasswordHash))
            return null;

        var token = _jwt.GenerateToken(admin.Id, "Admin", admin.Email!);
        return new LoginResponse(token, "Admin", admin.Id, admin.Nombre ?? "", admin.Email!);
    }

    public async Task<LoginResponse?> LoginEmpresaAsync(LoginRequest request)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Email == request.Email);
        if (empresa == null || empresa.PasswordHash == null || !PasswordHasher.Verify(request.Password, empresa.PasswordHash))
            return null;

        var token = _jwt.GenerateToken(empresa.Id, "Empresa", empresa.Email!, empresa.Id);
        return new LoginResponse(token, "Empresa", empresa.Id, empresa.Nombre ?? "", empresa.Email!);
    }

    public async Task<LoginResponse?> RegisterEmpresaAsync(EmpresaRegisterRequest request)
    {
        var exists = await _db.Empresas.AnyAsync(e => e.Email == request.Email);
        if (exists) return null;

        var empresa = new Empresa
        {
            Nombre = request.Nombre,
            Email = request.Email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Telefono = request.Telefono,
        };

        _db.Empresas.Add(empresa);
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(empresa.Id, "Empresa", empresa.Email!, empresa.Id);
        return new LoginResponse(token, "Empresa", empresa.Id, empresa.Nombre ?? "", empresa.Email!);
    }
}
