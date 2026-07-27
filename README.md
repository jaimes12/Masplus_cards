# Masplus Cards

Tarjetas de fidelidad digitales (Apple Wallet / Google Wallet) para negocios.

## Estructura

- `backend/` — API en ASP.NET Core 9 (EF Core + Pomelo MySQL + dotnet-passbook para generar los `.pkpass`)
- `frontend/` — SPA en React 19 + Vite + Tailwind CSS 4

## Requisitos

- .NET SDK 9
- Node.js 20+
- MySQL (local o remoto)

## Desarrollo

### Backend

```bash
cd backend
cp appsettings.Development.json.example appsettings.Development.json
# editar appsettings.Development.json con la cadena de conexión real
dotnet run
```

La API queda disponible en `http://localhost:5217`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173` y llama a la API definida en `VITE_API_URL` (`frontend/.env.development`).

## Base de datos

Modelo inicial (EF Core, `backend/Models/` + `backend/Data/AppDbContext.cs`):

- **Admin** — usuarios del panel de administración. Crea `Template`s (plantillas base).
- **Template** — plantilla base de tarjeta (tipo de recompensa: sellos/puntos, estructura JSON con layout/colores por defecto). La crea un Admin.
- **Empresa** — negocio dado de alta. Elige un `Template` y lo personaliza como su propio `Diseno`; `DisenoActivoId` apunta al diseño vigente con el que emite tarjetas nuevas.
- **Diseno** — personalización de una Empresa sobre un Template (logo, colores, cantidad de sellos requeridos, etc.).
- **Cliente** — cliente final de una Empresa (identificado por teléfono, único por empresa).
- **Tarjeta** — tarjeta de fidelidad emitida a un Cliente, vinculada a la Empresa y al Diseno vigente al emitirla. Trae `codigo_qr` único, `wallet_tipo` (`web` | `apple_wallet`) y `apple_serial_number` (para push updates del `.pkpass`).
- **TarjetaLog** — historial de eventos por tarjeta (sello agregado, premio canjeado, etc.).

Migraciones con `dotnet-ef` (fijado como local tool en `.config/dotnet-tools.json` porque el SDK global es v10 y el proyecto usa EF Core 9):

```bash
cd backend
dotnet tool restore          # solo la primera vez
dotnet tool run dotnet-ef migrations add NombreMigracion -o Data/Migrations
dotnet tool run dotnet-ef database update
```

## Despliegue (Railway)

Cada servicio se despliega con su propio Dockerfile desde la raíz del repo:

- Backend: `Dockerfile.backend`
- Frontend: `Dockerfile.frontend`
