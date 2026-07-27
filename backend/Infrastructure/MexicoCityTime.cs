namespace MasplusCards.Api.Infrastructure;

public static class MexicoCityTime
{
    public static DateTime Now()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, GetTimeZone());
    }

    public static TimeZoneInfo GetTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)");
        }
        catch (InvalidTimeZoneException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Central Standard Time (Mexico)");
        }
    }
}
