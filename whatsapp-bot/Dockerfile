# Contexto de build debe ser la carpeta whatsapp-bot/ (Railway: Root Directory = whatsapp-bot).
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "index.js"]
