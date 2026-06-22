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

# Copy only the compiled dist folder
COPY --from=builder /app/artifacts/enygma/dist/public ./

# Install http-server which doesn't add restrictive CSP headers
RUN npm install -g http-server

EXPOSE 3000
# Use -r to rewrite requests to index.html for SPA routing
CMD ["http-server", "-p", "3000", "--cors", "-r", "index.html"]

