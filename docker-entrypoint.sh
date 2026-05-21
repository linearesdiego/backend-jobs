#!/bin/sh
set -e

echo "==> Aplicando schema de base de datos..."
npx prisma db push --accept-data-loss

echo "==> Iniciando servidor Node.js..."
exec node dist/index.js