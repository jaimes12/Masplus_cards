namespace MasplusCards.Api.Dtos;

public record ClienteDto(int Id, int EmpresaId, string? Nombre, string Telefono, string? Email, DateTime CreatedAt);

public record ClienteUpsertRequest(string Nombre, string Telefono, string? Email);
