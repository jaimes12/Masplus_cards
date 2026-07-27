using System.Globalization;
using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Models;
using Microsoft.EntityFrameworkCore;
using MasplusCards.Api.Services.Interfaces;

namespace MasplusCards.Api.Services;

public class PassKitService : IPassKitService
{
    private readonly AppDbContext _db;

    public PassKitService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ValidateTokenAsync(string serialNumber, string? authorizationHeader)
    {
        if (string.IsNullOrWhiteSpace(authorizationHeader) || !authorizationHeader.StartsWith("ApplePass ", StringComparison.Ordinal))
            return false;

        var token = authorizationHeader["ApplePass ".Length..].Trim();
        return await _db.Tarjetas.AnyAsync(t => t.CodigoQr == serialNumber && t.CodigoQr == token);
    }

    public async Task<RegisterDeviceResult> RegisterDeviceAsync(string deviceLibraryIdentifier, string serialNumber, string pushToken)
    {
        var tarjeta = await _db.Tarjetas.FirstOrDefaultAsync(t => t.CodigoQr == serialNumber);
        if (tarjeta == null) return RegisterDeviceResult.NotFound;

        var existing = await _db.PassRegistrations.FirstOrDefaultAsync(
            r => r.DeviceLibraryIdentifier == deviceLibraryIdentifier && r.TarjetaId == tarjeta.Id);

        if (existing != null)
        {
            if (existing.PushToken != pushToken)
            {
                existing.PushToken = pushToken;
                await _db.SaveChangesAsync();
            }
            return RegisterDeviceResult.AlreadyRegistered;
        }

        _db.PassRegistrations.Add(new PassRegistration
        {
            TarjetaId = tarjeta.Id,
            DeviceLibraryIdentifier = deviceLibraryIdentifier,
            PushToken = pushToken,
        });
        await _db.SaveChangesAsync();
        return RegisterDeviceResult.Registered;
    }

    public async Task<bool> UnregisterDeviceAsync(string deviceLibraryIdentifier, string serialNumber)
    {
        var registration = await _db.PassRegistrations
            .Include(r => r.Tarjeta)
            .FirstOrDefaultAsync(r => r.DeviceLibraryIdentifier == deviceLibraryIdentifier && r.Tarjeta!.CodigoQr == serialNumber);
        if (registration == null) return false;

        _db.PassRegistrations.Remove(registration);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<RegisteredSerialNumbersResponse?> GetUpdatedSerialNumbersAsync(string deviceLibraryIdentifier, string? passesUpdatedSince)
    {
        var sinceTicks = long.TryParse(passesUpdatedSince, out var parsed) ? parsed : 0L;
        var since = new DateTime(sinceTicks, DateTimeKind.Unspecified);

        var query = _db.PassRegistrations
            .Include(r => r.Tarjeta)
            .Where(r => r.DeviceLibraryIdentifier == deviceLibraryIdentifier && r.Tarjeta!.UpdatedAt > since);

        var tarjetas = await query.Select(r => new { r.Tarjeta!.CodigoQr, r.Tarjeta.UpdatedAt }).ToListAsync();
        if (tarjetas.Count == 0) return null;

        var maxTicks = tarjetas.Max(t => t.UpdatedAt.Ticks);
        return new RegisteredSerialNumbersResponse(
            maxTicks.ToString(CultureInfo.InvariantCulture),
            tarjetas.Select(t => t.CodigoQr).ToList());
    }

    public async Task<List<string>> GetPushTokensForTarjetaAsync(string codigoQr)
    {
        return await _db.PassRegistrations
            .Where(r => r.Tarjeta!.CodigoQr == codigoQr)
            .Select(r => r.PushToken)
            .ToListAsync();
    }
}
