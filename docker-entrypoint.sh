#!/bin/sh
set -e

echo "==> Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

echo "==> Iniciando servidor Node.js..."
exec node dist/index.js
