# Contexto de build debe ser la carpeta backend/ (Railway: Root Directory = backend, Dockerfile = Dockerfile).
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY MasplusCards.Api.csproj .
RUN dotnet restore MasplusCards.Api.csproj

COPY . .
RUN dotnet publish MasplusCards.Api.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# curl + openssl: SocketsHttpHandler de .NET tiene un bug con HTTP/2 + certificado de cliente (ver
# ApnsPushService.cs); los pushes a Apple Wallet se mandan como subproceso curl, con el .p12
# convertido antes a PEM vía `openssl pkcs12 -legacy` (el .p12 usa cifrado que OpenSSL 3 desactivó).
RUN apt-get update && apt-get install -y --no-install-recommends curl openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV DOTNET_EnableDiagnostics=0
ENTRYPOINT ["dotnet", "MasplusCards.Api.dll"]
