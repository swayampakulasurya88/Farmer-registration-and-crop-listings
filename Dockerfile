# KrishiSetu — production image
#
# Single Node 20 image containing the app *and* the embedded PostgreSQL
# fallback (userspace Postgres, no system install). The forgot-password OTP
# store uses:
#   - an external DATABASE_URL Postgres if provided (recommended, see
#     docker-compose.yml), or
#   - the embedded cluster under /app/data/pg when running bare `docker run`.
#
# The SQLite database (app data) lives in /app/data — mount a volume there so
# farmers, buyers and listings survive restarts.
#
# Build:   docker build -t krishisetu .
# Run:     docker run --rm -p 3000:3000 -v ks-data:/app/data krishisetu
# Compose: docker compose up -d --build   (app + PostgreSQL together)

FROM node:20-slim

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data

WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the app source. data/ and .env are excluded via .dockerignore —
# the database and secrets are never baked into the image.
COPY . .

# Runtime needs a writable data dir for SQLite + embedded PostgreSQL.
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000
VOLUME ["/app/data"]

# /api/status reports db + postgres health (returns 200 when ready).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]