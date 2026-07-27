namespace MasplusCards.Api.Dtos;

public record RegisterDeviceRequest(string PushToken);

public record RegisteredSerialNumbersResponse(string LastUpdated, List<string> SerialNumbers);

public record PassKitLogRequest(List<string>? Logs);

public enum RegisterDeviceResult
{
    NotFound,
    AlreadyRegistered,
    Registered,
}
