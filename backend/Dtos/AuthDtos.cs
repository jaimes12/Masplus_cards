namespace MasplusCards.Api.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string Role, int Id, string Nombre, string Email);

public record EmpresaRegisterRequest(string Nombre, string Email, string Password, string? Telefono);
