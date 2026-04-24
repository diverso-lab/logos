#!/bin/sh
set -e

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
ES_HOST="${ES_HOST:-elasticsearch}"
ES_PORT="${ES_PORT:-9200}"

echo "==> Waiting for database at ${DB_HOST}:${DB_PORT}..."
until nc -z "${DB_HOST}" "${DB_PORT}" 2>/dev/null; do sleep 1; done
echo "==> Database is ready."

echo "==> Waiting for elasticsearch at ${ES_HOST}:${ES_PORT}..."
until nc -z "${ES_HOST}" "${ES_PORT}" 2>/dev/null; do sleep 1; done
echo "==> Elasticsearch is ready."

echo "==> Running migrations..."
npx prisma migrate deploy

echo "==> Seeding admin user (if needed)..."
npx tsx prisma/seed.ts || true

echo "==> Starting Next.js on ${HOSTNAME}:${PORT}..."
exec npx next start -H "${HOSTNAME}" -p "${PORT}"
