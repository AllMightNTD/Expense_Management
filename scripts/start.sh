#!/usr/bin/env bash
set -e

echo "🚀 [1/4] Starting PostgreSQL 16 & Redis 7 containers..."
docker compose -f docker/docker-compose.yml up -d

echo "⌛ [2/4] Waiting for PostgreSQL database connection..."
until docker exec expense_postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done
echo "✅ Database PostgreSQL ready!"

echo "📦 [3/4] Generating Prisma Client..."
npx -y pnpm@10.5.2 --filter @expense/api exec prisma generate

echo "🔥 [4/4] Starting NestJS API & Next.js Web App in dev mode..."
npx -y pnpm@10.5.2 dev
