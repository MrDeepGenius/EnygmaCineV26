FROM node:24-alpine

WORKDIR /app

# Copiar solo artifacts/enygma
COPY artifacts/enygma/package*.json ./
COPY artifacts/enygma/tsconfig.json ./
COPY artifacts/enygma/vite.config.ts ./
COPY artifacts/enygma/src ./src
COPY artifacts/enygma/public ./public

# Instalar y buildear
RUN npm install --legacy-peer-deps && npm run build

# Servir
EXPOSE 3000
CMD ["npm", "start"]

