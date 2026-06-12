# ──────────────────────────────────────────────
# Stage 1: Builder — instala deps y compila TS
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/
COPY src/ ./src/
COPY types/ ./types/

RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Runner — imagen final de producción
# ──────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma.config.ts ./
COPY prisma/ ./prisma/

RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

# Crear directorios de uploads (el volumen Docker los sobreescribirá en runtime)
RUN mkdir -p /uploads/videos /uploads/ads

# Usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app /uploads

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER appuser

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
