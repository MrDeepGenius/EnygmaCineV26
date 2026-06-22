# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy entire workspace
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install all workspace dependencies
RUN pnpm install --no-frozen-lockfile

# Build enygma from root (this respects the workspace structure)
RUN pnpm run -C artifacts/enygma build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy solo el output compilado
COPY --from=builder /app/artifacts/enygma/dist/public ./public

# Copiar package.json para poder servir la app
COPY --from=builder /app/artifacts/enygma/package.json ./

# Install minimal runtime dependencies (only for serving static files)
RUN npm install -g pnpm && npm install -g serve

# Servir los archivos estáticos compilados
EXPOSE 3000
CMD ["serve", "-s", "public", "-l", "3000"]

