using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAdminAsync(LoginRequest request);
    Task<LoginResponse?> LoginEmpresaAsync(LoginRequest request);
    Task<LoginResponse?> RegisterEmpresaAsync(EmpresaRegisterRequest request);
}
