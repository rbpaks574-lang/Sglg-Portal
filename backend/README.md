# SGLG Portal — Laravel Backend

## Setup

```bash
# Install dependencies
composer install

# Copy env
cp .env.example .env

# Generate key
php artisan key:generate

# Configure .env database:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sglg_portal
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database (64 barangays + test users)
php artisan db:seed

# Install Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Start server
php artisan serve
```

## API Base URL
`http://localhost:8000/api`

## Test Users (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dilg-silang.gov.ph | password |
| Checker | checker@dilg-silang.gov.ph | password |
| Barangay | barangay1@silang.gov.ph | password |
