# ==============================================================================
# Multi-Stage Dockerfile for FlirtCheck DeepTrace™ (Next.js Standalone + Sharp)
# ==============================================================================

# STAGE 1: Dependencies Cache
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Cache package manifests
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
# Ensure sharp native binaries for alpine linux are correctly resolved
RUN npm install --arch=x64 --platform=linux --libc=musl sharp

# STAGE 2: Source Code Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable Next.js telemetry disable
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile standalone production artifacts (if next build is configured, or prepare distribution)
RUN if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then npx next build; else echo "Custom deployment build"; fi

# STAGE 3: Production Minimal Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init curl

# Create unprivileged system user for cybersecurity compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime assets and dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public 2>/dev/null || true

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

# Healthcheck probe against our live endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "-r", "dotenv/config", "src/server/index.js"]
