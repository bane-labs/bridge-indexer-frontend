# syntax=docker/dockerfile:1

# Build stage
FROM node:22-alpine AS builder

LABEL maintainer="developers@thedanielmark.com"
LABEL org.opencontainers.image.source="https://github.com/thedanielmark/atlas"

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN pnpm build --filter=@atlas/web

# Production stage
FROM node:22-alpine AS runner

LABEL maintainer="developers@thedanielmark.com"
LABEL org.opencontainers.image.source="https://github.com/thedanielmark/atlas"

# Install curl for healthchecks
RUN apk add --no-cache curl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["node", "apps/web/server.js"]
