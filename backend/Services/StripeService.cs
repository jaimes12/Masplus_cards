using MasplusCards.Api.Data;
using MasplusCards.Api.Dtos;
using MasplusCards.Api.Infrastructure;
using MasplusCards.Api.Models;
using MasplusCards.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;

namespace MasplusCards.Api.Services;

public class StripeService : IStripeService
{
    private readonly AppDbContext _db;
    private readonly IPlanesService _planes;
    private readonly IDiscountCodesService _codigos;
    private readonly StripeSettings _settings;

    public StripeService(AppDbContext db, IPlanesService planes, IDiscountCodesService codigos, IOptions<StripeSettings> settings)
    {
        _db = db;
        _planes = planes;
        _codigos = codigos;
        _settings = settings.Value;
    }

    public string PublishableKey => _settings.PublishableKey;

    public async Task<IniciarPagoDto> CrearSetupIntentAsync(int empresaId, CancellationToken ct = default)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Id == empresaId, ct)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        var customerId = await GetOrCreateCustomerIdAsync(empresa, ct);

        var service = new SetupIntentService();
        var setupIntent = await service.CreateAsync(new SetupIntentCreateOptions
        {
            Customer = customerId,
            PaymentMethodTypes = new List<string> { "card" },
        }, cancellationToken: ct);

        return new IniciarPagoDto(setupIntent.ClientSecret, PublishableKey);
    }

    public async Task<CrearSuscripcionResultDto> CrearSuscripcionAsync(int empresaId, CrearSuscripcionRequest request, CancellationToken ct = default)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Id == empresaId, ct)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        var plan = await _db.Planes.FirstOrDefaultAsync(p => p.Id == request.PlanId && p.Activo, ct)
            ?? throw new InvalidOperationException("Plan no encontrado.");

        var customerId = await GetOrCreateCustomerIdAsync(empresa, ct);
        var priceId = await EnsurePriceIdAsync(plan, ct);

        var paymentMethodService = new PaymentMethodService();
        await paymentMethodService.AttachAsync(request.PaymentMethodId, new PaymentMethodAttachOptions { Customer = customerId }, cancellationToken: ct);

        var customerService = new CustomerService();
        await customerService.UpdateAsync(customerId, new CustomerUpdateOptions
        {
            InvoiceSettings = new CustomerInvoiceSettingsOptions { DefaultPaymentMethod = request.PaymentMethodId },
        }, cancellationToken: ct);

        var (discounts, codigoValidado) = await CrearDescuentoAsync(empresaId, plan.Id, request.CodigoDescuento, ct);

        Subscription subscription;
        var subscriptionService = new SubscriptionService();

        if (!string.IsNullOrWhiteSpace(empresa.StripeSubscriptionId))
        {
            // Ya tiene una suscripción activa: se cambia el precio del item existente en vez de
            // crear una suscripción nueva, para que Stripe prorratee la diferencia automáticamente.
            var actual = await subscriptionService.GetAsync(empresa.StripeSubscriptionId, cancellationToken: ct);
            var itemId = actual.Items.Data.First().Id;

            var updateOptions = new SubscriptionUpdateOptions
            {
                Items = new List<SubscriptionItemOptions> { new() { Id = itemId, Price = priceId } },
                DefaultPaymentMethod = request.PaymentMethodId,
                PaymentBehavior = "default_incomplete",
                ProrationBehavior = "always_invoice",
                Discounts = discounts,
            };
            updateOptions.AddExpand("latest_invoice.confirmation_secret");

            subscription = await subscriptionService.UpdateAsync(empresa.StripeSubscriptionId, updateOptions, cancellationToken: ct);
        }
        else
        {
            var subscriptionOptions = new SubscriptionCreateOptions
            {
                Customer = customerId,
                Items = new List<SubscriptionItemOptions> { new() { Price = priceId } },
                DefaultPaymentMethod = request.PaymentMethodId,
                PaymentBehavior = "default_incomplete",
                Discounts = discounts,
            };
            subscriptionOptions.AddExpand("latest_invoice.confirmation_secret");

            subscription = await subscriptionService.CreateAsync(subscriptionOptions, cancellationToken: ct);
        }

        if (codigoValidado != null)
            await _codigos.RedimirAsync(empresaId, codigoValidado);

        empresa.StripeSubscriptionId = subscription.Id;
        empresa.PlanId = plan.Id;
        var periodEnd = subscription.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd;
        empresa.PlanRenuevaEl = periodEnd.HasValue
            ? TimeZoneInfo.ConvertTimeFromUtc(periodEnd.Value, MexicoCityTime.GetTimeZone())
            : MexicoCityTime.Now().AddDays(30);
        await _db.SaveChangesAsync(ct);

        var requiereAccion = subscription.Status == "incomplete";
        var clientSecret = subscription.LatestInvoice?.ConfirmationSecret?.ClientSecret;

        return new CrearSuscripcionResultDto(requiereAccion, requiereAccion ? clientSecret : null, await _planes.GetActualAsync(empresaId));
    }

    public async Task<CrearSuscripcionResultDto> CanjearCodigoGratisAsync(int empresaId, CanjearGratisRequest request, CancellationToken ct = default)
    {
        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.Id == empresaId, ct)
            ?? throw new InvalidOperationException("Empresa no encontrada.");

        var plan = await _db.Planes.FirstOrDefaultAsync(p => p.Id == request.PlanId && p.Activo, ct)
            ?? throw new InvalidOperationException("Plan no encontrado.");

        var validacion = await _codigos.ValidarAsync(empresaId, new ValidarCodigoRequest(request.Codigo, plan.Id));
        if (!validacion.Valido)
            throw new InvalidOperationException(validacion.Error ?? "Ese código de descuento no es válido.");
        if (validacion.PrecioConDescuento != 0)
            throw new InvalidOperationException("Ese código no cubre el 100% del plan; hay que pagar con tarjeta.");

        if (!string.IsNullOrWhiteSpace(empresa.StripeSubscriptionId))
        {
            var subscriptionService = new SubscriptionService();
            try
            {
                await subscriptionService.CancelAsync(empresa.StripeSubscriptionId, cancellationToken: ct);
            }
            catch (StripeException)
            {
                // Puede que ya estuviera cancelada del lado de Stripe; no bloquea el canje gratis.
            }
            empresa.StripeSubscriptionId = null;
        }

        await _codigos.RedimirAsync(empresaId, validacion.Codigo!);

        empresa.PlanId = plan.Id;
        empresa.PlanRenuevaEl = MexicoCityTime.Now().AddDays(30);
        await _db.SaveChangesAsync(ct);

        return new CrearSuscripcionResultDto(false, null, await _planes.GetActualAsync(empresaId));
    }

    private async Task<(List<SubscriptionDiscountOptions>? Discounts, string? Codigo)> CrearDescuentoAsync(
        int empresaId, int planId, string? codigoDescuento, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(codigoDescuento))
            return (null, null);

        var validacion = await _codigos.ValidarAsync(empresaId, new ValidarCodigoRequest(codigoDescuento, planId));
        if (!validacion.Valido)
            throw new InvalidOperationException(validacion.Error ?? "Ese código de descuento no es válido.");

        var couponService = new CouponService();
        var coupon = await couponService.CreateAsync(new CouponCreateOptions
        {
            Duration = "once",
            PercentOff = validacion.TipoDescuento == "porcentaje" ? validacion.Valor : null,
            AmountOff = validacion.TipoDescuento == "monto_fijo" ? (long?)(validacion.Valor!.Value * 100) : null,
            Currency = validacion.TipoDescuento == "monto_fijo" ? "mxn" : null,
            Name = $"Código {validacion.Codigo}",
        }, cancellationToken: ct);

        return (new List<SubscriptionDiscountOptions> { new() { Coupon = coupon.Id } }, validacion.Codigo);
    }

    public async Task ProcesarWebhookAsync(string json, string firmaHeader, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.WebhookSecret))
            throw new InvalidOperationException("Stripe:WebhookSecret no está configurado.");

        var stripeEvent = EventUtility.ConstructEvent(json, firmaHeader, _settings.WebhookSecret);

        if (stripeEvent.Data.Object is not Subscription subscription) return;

        var empresa = await _db.Empresas.FirstOrDefaultAsync(e => e.StripeSubscriptionId == subscription.Id, ct);
        if (empresa == null) return;

        switch (stripeEvent.Type)
        {
            case "customer.subscription.updated":
                var periodEnd = subscription.Items?.Data?.FirstOrDefault()?.CurrentPeriodEnd;
                if (periodEnd.HasValue)
                    empresa.PlanRenuevaEl = TimeZoneInfo.ConvertTimeFromUtc(periodEnd.Value, MexicoCityTime.GetTimeZone());
                await _db.SaveChangesAsync(ct);
                break;

            case "customer.subscription.deleted":
                empresa.PlanId = null;
                empresa.PlanRenuevaEl = null;
                empresa.StripeSubscriptionId = null;
                await _db.SaveChangesAsync(ct);
                break;
        }
    }

    private async Task<string> GetOrCreateCustomerIdAsync(Empresa empresa, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(empresa.StripeCustomerId))
            return empresa.StripeCustomerId;

        var service = new CustomerService();
        var customer = await service.CreateAsync(new CustomerCreateOptions
        {
            Name = empresa.Nombre,
            Email = empresa.Email,
            Metadata = new Dictionary<string, string> { ["empresa_id"] = empresa.Id.ToString() },
        }, cancellationToken: ct);

        empresa.StripeCustomerId = customer.Id;
        await _db.SaveChangesAsync(ct);
        return customer.Id;
    }

    private async Task<string> EnsurePriceIdAsync(Models.Plan plan, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(plan.StripePriceId))
            return plan.StripePriceId;

        var service = new PriceService();
        var price = await service.CreateAsync(new PriceCreateOptions
        {
            Currency = "mxn",
            UnitAmount = (long)(plan.PrecioMensual * 100),
            Recurring = new PriceRecurringOptions { Interval = "month" },
            ProductData = new PriceProductDataOptions { Name = $"Masplus Cards — Plan {plan.Nombre}" },
        }, cancellationToken: ct);

        plan.StripePriceId = price.Id;
        await _db.SaveChangesAsync(ct);
        return price.Id;
    }
}
