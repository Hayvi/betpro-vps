#!/bin/bash
# BetPro VPS Deployment Script
# Run as root or with sudo

set -e

DOMAIN="yourdomain.com"
APP_DIR="/var/www/betpro"

echo "=== Installing dependencies ==="
apt update
apt install -y nginx postgresql postgresql-contrib nodejs npm certbot python3-certbot-nginx

# Install PM2 globally
npm install -g pm2

echo "=== Setting up PostgreSQL ==="
sudo -u postgres psql -c "CREATE USER betpro WITH PASSWORD 'your_db_password';"
sudo -u postgres psql -c "CREATE DATABASE betpro OWNER betpro;"
sudo -u postgres psql -d betpro -f $APP_DIR/server/schema.sql

echo "=== Setting up application ==="
cd $APP_DIR/server
npm install --production

# Create .env file
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=betpro
DB_USER=betpro
DB_PASSWORD=your_db_password
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://$DOMAIN
EOF

echo "=== Building frontend ==="
cd $APP_DIR
npm install
npm run build

echo "=== Setting up Nginx ==="
cp $APP_DIR/server/nginx.conf /etc/nginx/sites-available/betpro
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/betpro
ln -sf /etc/nginx/sites-available/betpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "=== Getting SSL certificate ==="
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

echo "=== Starting services ==="
cd $APP_DIR/server
pm2 start ecosystem.config.json
pm2 save
pm2 startup

nginx -t && systemctl restart nginx

echo "=== Done! ==="
echo "App running at https://$DOMAIN"
echo "Admin: root_admin / changeme123"
