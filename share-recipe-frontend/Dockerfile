# Simplified single-stage production Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build \
    && npm prune --production

# Expose port
EXPOSE 3000

# Optional healthcheck (root path)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -qO- http://127.0.0.1:${PORT}/ >/dev/null 2>&1 || exit 1

# Use built-in non-root user for security
USER node

CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -p ${PORT:-3000}"]