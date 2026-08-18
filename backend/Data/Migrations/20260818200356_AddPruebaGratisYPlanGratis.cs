using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPruebaGratisYPlanGratis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "prueba_termina_el",
                table: "empresas",
                type: "datetime(6)",
                nullable: true);
            // Plan Gratis (precio 0): destino automático al vencer la prueba o cancelar la suscripción.
            migrationBuilder.Sql("""
                INSERT INTO planes (nombre, descripcion, precio_mensual, limite_disenos, limite_tarjetas, caracteristicas, destacado, orden, activo, created_at)
                SELECT 'Gratis', 'Para empezar y probar con tus primeros clientes. Sin costo, para siempre.', 0, 1, 30,
                       JSON_ARRAY('1 diseño de tarjeta', 'Hasta 30 tarjetas emitidas', 'Apple Wallet y tarjeta web', 'Escáner y sellos por QR', 'Notificaciones a tus clientes'),
                       0, 0, 1, NOW()
                WHERE NOT EXISTS (SELECT 1 FROM planes WHERE precio_mensual = 0);
                """);

            // Empresas que hoy están "sin plan" (antes: tope fijo de 1 diseño / 1 tarjeta): les arranca la
            // prueba gratis del plan destacado desde hoy, en vez de mandarlas directo al plan Gratis.
            migrationBuilder.Sql("""
                UPDATE empresas
                SET plan_id = (SELECT id FROM planes WHERE destacado = 1 AND activo = 1 AND precio_mensual > 0 ORDER BY orden LIMIT 1),
                    prueba_termina_el = DATE_ADD(NOW(), INTERVAL 14 DAY)
                WHERE plan_id IS NULL AND stripe_subscription_id IS NULL;
                """);
        }

        /// <inheritdoc />

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "prueba_termina_el",
                table: "empresas");
        }
    }
}
