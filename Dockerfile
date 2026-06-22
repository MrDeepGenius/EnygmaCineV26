# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy entire workspace (needed for pnpm monorepo)
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Install dependencies including devDependencies
RUN pnpm install --prod=false

# Build enygma app
RUN pnpm -F @workspace/enygma build

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

