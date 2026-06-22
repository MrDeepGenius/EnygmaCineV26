FROM node:24-alpine

WORKDIR /app

# Copiar todo el repo
COPY . .

# Cambiar a carpeta enygma y hacer build SOLO de esa carpeta
WORKDIR /app/artifacts/enygma

# Instalar dependencias locales (ignorar workspace)
RUN npm install --legacy-peer-deps --no-save

# Build
RUN npm run build

# Servir
EXPOSE 3000
CMD ["npm", "start"]
