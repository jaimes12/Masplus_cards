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
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
CMD ["sh", "-c", "exec serve -s dist -l \"tcp://0.0.0.0:${PORT:-3000}\""]
