FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/enygma/ ./artifacts/enygma/
COPY scripts/ ./scripts/
COPY tsconfig.base.json tsconfig.json ./

# ── Build stage ──────────────────────────────────────────────────────────────
FROM base AS builder

RUN pnpm install --frozen-lockfile

# Build shared libs (api-zod, api-client-react)
RUN pnpm run typecheck:libs

# Build frontend (static files → artifacts/enygma/dist/public)
RUN PORT=3000 BASE_PATH=/ pnpm --filter @workspace/enygma run build

# Build API server (→ artifacts/api-server/dist/)
RUN pnpm --filter @workspace/api-server run build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:24-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only what runtime needs
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/

# Install only production deps for the API server
RUN pnpm install --frozen-lockfile --prod --filter @workspace/api-server

# Copy built frontend into the API server's static folder
COPY --from=builder /app/artifacts/enygma/dist/public/ ./artifacts/api-server/dist/public/

# Copy admin data folder if it exists
COPY artifacts/api-server/data/ ./artifacts/api-server/data/

WORKDIR /app/artifacts/api-server

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
