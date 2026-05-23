#!/bin/bash
# Run once as 'debian' user after setup-vps.sh
# Clones the repo and does the first deploy

set -e

APP_DIR="/var/www/jobsai"
REPO="https://github.com/WinCode143/jobsai.git"

echo "=== Cloning repository ==="
git clone "$REPO" "$APP_DIR"
cd "$APP_DIR"

echo "=== Installing dependencies ==="
npm ci

echo "=== Running database migrations ==="
# Make sure .env is configured before running this
npx prisma migrate deploy

echo "=== Building Next.js ==="
npm run build

echo "=== Starting PM2 ==="
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== App initialized ==="
echo "Check status with: pm2 status"
