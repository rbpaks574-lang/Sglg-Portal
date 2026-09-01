#!/bin/bash
set -e

# Default PORT to 10000 if not provided by Render
export PORT="${PORT:-10000}"

echo "==> Configuring Nginx on port $PORT..."
mkdir -p /run/nginx /tmp/nginx
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "==> Setting up storage permissions..."
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/app/public/submissions \
         /var/www/html/storage/app/public/templates \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Linking storage..."
rm -rf /var/www/html/public/storage
php artisan storage:link || true

echo "==> Clearing old caches & discovering packages..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan package:discover --ansi || true

echo "==> Connecting to Database at: ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306} (DB: ${DB_DATABASE:-sglg_portal})..."

echo "==> Running database migrations..."
php artisan migrate --force || {
    echo "⚠️ Warning: Database migration failed. Please check your DB_HOST, DB_PORT, DB_USERNAME, and DB_PASSWORD in Render Environment Variables."
}

if [ "${DB_SEED_ON_BOOT}" = "true" ] || [ "${DB_SEED_ON_BOOT}" = "1" ]; then
    echo "==> Seeding database (Admin, Checker, Barangays)..."
    php artisan db:seed --force || echo "⚠️ Seeding failed or already seeded."
fi

echo "==> Optimizing configuration & route caches..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Starting Web Server (Supervisord)..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
