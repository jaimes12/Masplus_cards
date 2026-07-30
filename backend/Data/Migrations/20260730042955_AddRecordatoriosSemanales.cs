using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRecordatoriosSemanales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ultimo_recordatorio_en",
                table: "tarjetas",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ultimo_recordatorio_mensaje",
                table: "tarjetas",
                type: "varchar(300)",
                maxLength: 300,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "ultimo_sello_en",
                table: "tarjetas",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "recordatorios_activos",
                table: "disenos",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ultimo_recordatorio_en",
                table: "tarjetas");

            migrationBuilder.DropColumn(
                name: "ultimo_recordatorio_mensaje",
                table: "tarjetas");

            migrationBuilder.DropColumn(
                name: "ultimo_sello_en",
                table: "tarjetas");

            migrationBuilder.DropColumn(
                name: "recordatorios_activos",
                table: "disenos");
        }
    }
}
