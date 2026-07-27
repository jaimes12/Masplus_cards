using MasplusCards.Api.Dtos;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MasplusCards.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<LoginResponse>> AdminLogin([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAdminAsync(request);
        return result == null ? Unauthorized() : Ok(result);
    }

    [HttpPost("empresa/login")]
    public async Task<ActionResult<LoginResponse>> EmpresaLogin([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginEmpresaAsync(request);
        return result == null ? Unauthorized() : Ok(result);
    }

    [HttpPost("empresa/register")]
    public async Task<ActionResult<LoginResponse>> EmpresaRegister([FromBody] EmpresaRegisterRequest request)
    {
        var result = await _auth.RegisterEmpresaAsync(request);
        return result == null ? Conflict("Ya existe una empresa con ese email.") : Ok(result);
    }
}
