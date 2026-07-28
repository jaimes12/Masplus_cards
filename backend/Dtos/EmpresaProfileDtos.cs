namespace MasplusCards.Api.Dtos;

public record EmpresaProfileDto(int Id, string? Nombre, string? Email, string? Logo, string? Telefono, DateTime CreatedAt);

public record EmpresaProfileUpdateRequest(string Nombre, string? Logo, string? Telefono);

public record CambiarPasswordRequest(string PasswordActual, string PasswordNueva);
