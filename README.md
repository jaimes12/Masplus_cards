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

Pendiente: falta el esquema de la base de datos. Una vez definido, se agregarán los modelos EF Core en `backend/Models/`, el `AppDbContext` en `backend/Data/AppDbContext.cs`, y las migraciones correspondientes.

## Despliegue (Railway)

Cada servicio se despliega con su propio Dockerfile desde la raíz del repo:

- Backend: `Dockerfile.backend`
- Frontend: `Dockerfile.frontend`
