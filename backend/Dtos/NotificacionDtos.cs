namespace MasplusCards.Api.Dtos;

public record NotificacionDto(int Id, string Tipo, string Titulo, string Mensaje, string? LinkView, bool Leida, DateTime CreatedAt);
