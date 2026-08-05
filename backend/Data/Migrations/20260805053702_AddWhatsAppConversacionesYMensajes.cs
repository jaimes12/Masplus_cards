using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MasplusCards.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppConversacionesYMensajes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "whatsapp_conversaciones",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    telefono = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nombre_contacto = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    etapa = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ia_activa = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ultimo_mensaje_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_whatsapp_conversaciones", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "whatsapp_mensajes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    conversacion_id = table.Column<int>(type: "int", nullable: false),
                    rol = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    texto = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    whatsapp_message_id = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    estado_envio = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_whatsapp_mensajes", x => x.id);
                    table.ForeignKey(
                        name: "FK_whatsapp_mensajes_whatsapp_conversaciones_conversacion_id",
                        column: x => x.conversacion_id,
                        principalTable: "whatsapp_conversaciones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_conversaciones_etapa",
                table: "whatsapp_conversaciones",
                column: "etapa");

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_conversaciones_telefono",
                table: "whatsapp_conversaciones",
                column: "telefono",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_mensajes_conversacion_id_created_at",
                table: "whatsapp_mensajes",
                columns: new[] { "conversacion_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_whatsapp_mensajes_whatsapp_message_id",
                table: "whatsapp_mensajes",
                column: "whatsapp_message_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "whatsapp_mensajes");

            migrationBuilder.DropTable(
                name: "whatsapp_conversaciones");
        }
    }
}
