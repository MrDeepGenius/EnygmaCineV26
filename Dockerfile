# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app/artifacts/enygma

# Copy only enygma
COPY artifacts/enygma .
# Copy tsconfig.base.json from root
COPY tsconfig.base.json ../../

# Install dependencies
RUN npm install --legacy-peer-deps

# Build
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy only the compiled dist folder
COPY --from=builder /app/artifacts/enygma/dist/public ./public

# Install serve to run static files
RUN npm install -g serve

EXPOSE 3000
CMD ["serve", "-s", "public", "-l", "3000"]

