using MasplusCards.Api.Dtos;

namespace MasplusCards.Api.Services.Interfaces;

public interface IRegistroService
{
    Task<RegistroDisenoPublicoDto?> GetDisenoPublicoAsync(string codigoRegistro);
    Task<RegistroResultDto> RegistrarAsync(string codigoRegistro, RegistroClienteRequest request);
}
