# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy entire workspace
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (workspace + enygma)
RUN pnpm install --no-frozen-lockfile

# Install enygma specific dependencies just to be safe
WORKDIR /app/artifacts/enygma
RUN pnpm install --no-frozen-lockfile

# Build enygma app
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy the entire workspace from builder (needed to run the app)
COPY --from=builder /app .

# Start
EXPOSE 3000
CMD ["pnpm", "-F", "@workspace/enygma", "start"]

