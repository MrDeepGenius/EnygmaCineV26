# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copiar solo enygma
COPY artifacts/enygma .

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm install --legacy-peer-deps

# Build
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copiar el built output desde stage 1
COPY --from=builder /app/dist/public ./dist/public
COPY --from=builder /app/package*.json ./

# Instalar solo production dependencies
RUN npm install --legacy-peer-deps --production

# Start
EXPOSE 3000
CMD ["npm", "start"]

