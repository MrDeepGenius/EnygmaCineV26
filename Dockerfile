FROM node:20-alpine

WORKDIR /app

# Copiar solo la carpeta de enygma
COPY artifacts/enygma .

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Build
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Start
CMD ["npm", "start"]
