# ==============================================================================
# Multi-Stage Dockerfile for Antigravity Affiliate Core & Blog Engine
# Base: Node.js 22 Alpine (Security Hardened Minimal Distribution)
# ==============================================================================

# STAGE 1: Source Builder
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy root manifests and workspace configs
COPY package.json package-lock.json tsconfig.json ./
COPY core/package.json core/package.json
COPY blog/package.json blog/package.json

# Install dependencies across monorepo
RUN npm ci
RUN cd core && npm install
RUN cd blog && npm install

# Copy source trees
COPY core ./core
COPY blog ./blog
COPY campaigns ./campaigns
COPY public ./public

# Build Core (TypeScript compilation + dashboard HTML bundle)
RUN npm --prefix core run build

# Build Blog (Astro static production artifact generation)
RUN npm --prefix blog run build

# Prune devDependencies for runner stage
RUN npm prune --omit=dev
RUN cd core && npm prune --omit=dev

# STAGE 2: Production Minimal Runner
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init curl bash sqlite
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Prepare directories for SQLite databases, logs and static distributions
RUN mkdir -p /app/data /app/.antigravity /app/core/dist /app/blog/dist /app/logs && \
    chown -R node:node /app

# Copy compiled production artifacts and runtime dependencies
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/core/node_modules ./core/node_modules
COPY --from=builder --chown=node:node /app/core/dist ./core/dist
COPY --from=builder --chown=node:node /app/core/package.json ./core/package.json
COPY --from=builder --chown=node:node /app/blog/dist ./blog/dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Expose Dashboard & API port
EXPOSE 5000

# Declare persistent volumes for stateful databases and runtime logs
VOLUME ["/app/data", "/app/.antigravity"]

# Switch to unprivileged system user
USER node

# Healthcheck probe against active API endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:5000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "core/dist/dashboard-server.js"]
