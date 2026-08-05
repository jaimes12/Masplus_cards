using System.Net.Http.Json;
using System.Text.Json;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace MasplusCards.Api.Services;

public class WhatsAppBotClient : IWhatsAppBotClient
{
    private readonly HttpClient _http;
    private readonly WhatsAppBotSettings _settings;
    private readonly ILogger<WhatsAppBotClient> _logger;

    public WhatsAppBotClient(HttpClient http, IOptions<WhatsAppBotSettings> settings, ILogger<WhatsAppBotClient> logger)
    {
        _http = http;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> EnviarAsync(string telefono, string texto, bool humanizar = true, CancellationToken ct = default)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl.TrimEnd('/')}/send")
            {
                Content = JsonContent.Create(new { telefono, texto, humanizar }),
            };
            request.Headers.Add("X-Bot-Secret", _settings.SharedSecret);

            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
                _logger.LogWarning("El bot de WhatsApp respondió {Status} al enviar a {Telefono}", response.StatusCode, telefono);

            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo contactar al bot de WhatsApp para enviar a {Telefono}", telefono);
            return false;
        }
    }

    public async Task<WhatsAppBotStatusDto> ObtenerEstadoAsync(CancellationToken ct = default)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"{_settings.BaseUrl.TrimEnd('/')}/qr-data");
            request.Headers.Add("X-Bot-Secret", _settings.SharedSecret);

            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode) return new WhatsAppBotStatusDto(false, null);

            var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
            var conectado = json.TryGetProperty("conectado", out var c) && c.GetBoolean();
            var qr = json.TryGetProperty("qrDataUrl", out var q) ? q.GetString() : null;
            return new WhatsAppBotStatusDto(conectado, qr);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "No se pudo contactar al bot de WhatsApp para consultar su estado");
            return new WhatsAppBotStatusDto(false, null);
        }
    }
}
