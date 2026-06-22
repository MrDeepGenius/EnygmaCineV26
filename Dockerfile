FROM node:24-alpine

WORKDIR /app

# Copiar archivos
COPY . .

# Limpiar pnpm si existe
RUN npm cache clean --force || true

# Instalar dependencias con npm
RUN npm install --legacy-peer-deps

# Build
RUN npm run build

# Start frontend
EXPOSE 3000
CMD ["npm", "start"]
