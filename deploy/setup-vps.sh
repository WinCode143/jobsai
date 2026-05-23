#!/bin/bash
# Run once on a fresh Debian 11/12 VPS as root
# Usage: bash setup-vps.sh

set -e

echo "=== Updating system ==="
apt-get update && apt-get upgrade -y

echo "=== Installing dependencies ==="
apt-get install -y curl git build-essential nginx certbot python3-certbot-nginx ufw

echo "=== Installing Node.js 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "=== Installing PM2 ==="
npm install -g pm2
pm2 startup systemd -u debian --hp /home/debian

echo "=== Installing PostgreSQL 16 ==="
apt-get install -y postgresql postgresql-contrib

echo "=== Installing pgvector ==="
apt-get install -y postgresql-server-dev-all make gcc
cd /tmp
git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git
cd pgvector
make && make install
cd / && rm -rf /tmp/pgvector

echo "=== Configuring PostgreSQL ==="
sudo -u postgres psql -c "CREATE USER jobsai WITH PASSWORD 'CHANGE_THIS_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE jobsai OWNER jobsai;"
sudo -u postgres psql -d jobsai -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "=== Installing Redis ==="
apt-get install -y redis-server
sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl restart redis
systemctl enable redis

echo "=== Configuring firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== Creating app directory ==="
mkdir -p /var/www/jobsai
chown debian:debian /var/www/jobsai

echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "1. Run deploy/init-app.sh as the 'debian' user"
echo "2. Configure /etc/nginx/sites-available/jobsai"
echo "3. Set up GitHub Actions secrets"
