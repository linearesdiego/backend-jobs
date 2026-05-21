#!/bin/sh
set -e

echo "==> Ejecutando migraciones Prisma..."
npx prisma migrate deploy

echo "==> Iniciando servidor Node.js..."
exec node dist/index.js