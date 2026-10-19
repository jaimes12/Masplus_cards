FROM node:20-alpine AS build
WORKDIR /app

# En Railway: variable VITE_API_URL con "Available at Build Time" para que el front llame al API correcto.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.mjs ./

ENV NODE_ENV=production
# server.mjs: estáticos + meta tags OG por ruta (miniatura al compartir /productos).
# Lee VITE_API_URL del entorno en runtime (Railway la inyecta como variable del servicio).
CMD ["node", "server.mjs"]
