# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy entire workspace structure (needed for paths and references)
COPY . .

WORKDIR /app/artifacts/enygma

# Install dependencies
RUN npm install --legacy-peer-deps

# Build
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Copy the built files
COPY --from=builder /app/artifacts/enygma/dist/public ./
# Copy server.js
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]

