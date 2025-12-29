# Taekwondo A&Z - cPanel Deployment Guide

## Pre-Deployment Checklist

### 1. Local Preparation
- [x] Production assets built (`npm run build`)
- [x] Database migrations tested
- [x] Seeders prepared
- [x] Environment variables configured
- [x] All features tested locally

### 2. cPanel Requirements
- PHP 8.1 or higher
- MySQL 5.7 or higher
- Composer installed
- SSH access (recommended)
- Sufficient disk space (minimum 500MB)

---

## Step-by-Step Deployment Process

### Step 1: Prepare cPanel Environment

1. **Login to cPanel**
   - Access your cPanel dashboard
   - Navigate to File Manager

2. **Create Database**
   - Go to MySQL Databases
   - Create new database: `taekwondo_db` (or your preferred name)
   - Create database user with strong password
   - Grant ALL PRIVILEGES to the user
   - Note down: database name, username, password

3. **Prepare Directory Structure**
   - Navigate to `public_html` or your domain directory
   - Create a new folder (e.g., `taekwondo`) if needed
   - Or use root directory for main domain

### Step 2: Upload Files

**Option A: Using File Manager (Recommended for small projects)**
1. Compress your local project folder (excluding `node_modules` and `vendor`)
2. Upload the ZIP file to cPanel File Manager
3. Extract the ZIP file in the desired directory

**Option B: Using FTP/SFTP**
1. Use FileZilla or similar FTP client
2. Connect to your server
3. Upload all files except:
   - `node_modules/`
   - `vendor/`
   - `.env` (will be created separately)

**Option C: Using Git (Recommended for version control)**
1. SSH into your server
2. Clone your repository:
   ```bash
   cd public_html
   git clone https://github.com/yourusername/taekwondo.git
   cd taekwondo
   ```

### Step 3: Configure Environment

1. **Create .env file**
   - Copy `.env.example` to `.env`
   - Or create new `.env` file with the following content:

```env
APP_NAME="Taekwondo A&Z"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="${APP_NAME}"
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="${PUSHER_HOST}"
VITE_PUSHER_PORT="${PUSHER_PORT}"
VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

2. **Update Database Credentials**
   - Replace `your_database_name`, `your_database_user`, `your_database_password`
   - Update `APP_URL` to your actual domain

### Step 4: Install Dependencies

**Via SSH (Recommended)**:
```bash
cd /home/username/public_html/taekwondo
composer install --optimize-autoloader --no-dev
```

**Via cPanel Terminal** (if SSH not available):
1. Open Terminal in cPanel
2. Navigate to project directory
3. Run composer install command

### Step 5: Configure Laravel

**Via SSH**:
```bash
# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed admin users
php artisan db:seed --class=AdminUserSeeder

# (Optional) Seed sample students
php artisan db:seed --class=StudentSeeder

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link
```

### Step 6: Set File Permissions

**Via SSH**:
```bash
# Set directory permissions
find . -type d -exec chmod 755 {} \;

# Set file permissions
find . -type f -exec chmod 644 {} \;

# Set storage and bootstrap/cache to writable
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

**Via File Manager**:
1. Select `storage` folder → Change Permissions → 775 (recursive)
2. Select `bootstrap/cache` → Change Permissions → 775 (recursive)

### Step 7: Configure Web Server

**For Apache (most cPanel setups)**:

1. **Create/Update .htaccess in public folder**:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

2. **Point domain to public folder**:
   - In cPanel, go to Domains
   - Edit domain settings
   - Set Document Root to `/public_html/taekwondo/public`
   - Or create a symlink

**Alternative: Create .htaccess in root**:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### Step 8: Verify Deployment

1. **Test Homepage**:
   - Visit `https://yourdomain.com`
   - Should see the Welcome page

2. **Test Login**:
   - Go to `/login`
   - Use credentials:
     - Email: `admin@taekwondo.com`
     - Password: `abcd1234`
   - OR
     - Email: `bluehostmedia@gmail.com`
     - Password: `abcd1234`

3. **Test Dashboard**:
   - Should redirect to `/dashboard` after login
   - Verify student count displays correctly

4. **Test Student Management**:
   - Navigate to Students page
   - Try adding a new student
   - Test search and filter
   - Test PDF download

5. **Test Responsive Design**:
   - Check on mobile device
   - Verify all pages are responsive

---

## Troubleshooting

### Issue: 500 Internal Server Error

**Solution**:
1. Check file permissions (storage and bootstrap/cache should be 775)
2. Verify `.env` file exists and is configured correctly
3. Run `php artisan config:clear`
4. Check error logs in `storage/logs/laravel.log`

### Issue: Page not found (404)

**Solution**:
1. Verify `.htaccess` file exists in public folder
2. Check if mod_rewrite is enabled
3. Verify document root points to `/public` folder

### Issue: Assets not loading (CSS/JS)

**Solution**:
1. Verify `npm run build` was executed
2. Check if `public/build` folder exists
3. Verify `APP_URL` in `.env` matches your domain
4. Run `php artisan config:clear`

### Issue: Database connection error

**Solution**:
1. Verify database credentials in `.env`
2. Check if database exists in cPanel
3. Verify database user has correct privileges
4. Test database connection from cPanel phpMyAdmin

### Issue: Permission denied errors

**Solution**:
1. Set correct permissions:
   ```bash
   chmod -R 775 storage
   chmod -R 775 bootstrap/cache
   ```
2. Verify web server user owns the files

### Issue: "No application encryption key"

**Solution**:
```bash
php artisan key:generate
```

---

## Post-Deployment Tasks

### 1. Security Hardening

1. **Disable Debug Mode**:
   - Ensure `APP_DEBUG=false` in `.env`

2. **Secure .env File**:
   - Set permissions to 600
   ```bash
   chmod 600 .env
   ```

3. **Update .htaccess** (prevent .env access):
```apache
# Deny access to .env
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

4. **Enable HTTPS**:
   - Install SSL certificate via cPanel (Let's Encrypt)
   - Force HTTPS in `.htaccess`:
   ```apache
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### 2. Backup Strategy

1. **Database Backups**:
   - Set up automated daily backups in cPanel
   - Or create cron job:
   ```bash
   0 2 * * * mysqldump -u username -p'password' database_name > /path/to/backup/db_$(date +\%Y\%m\%d).sql
   ```

2. **File Backups**:
   - Use cPanel Backup feature
   - Or create cron job for file backup

### 3. Monitoring

1. **Set up Error Monitoring**:
   - Monitor `storage/logs/laravel.log`
   - Consider using services like Sentry or Bugsnag

2. **Performance Monitoring**:
   - Monitor server resources
   - Check page load times
   - Optimize database queries if needed

### 4. Maintenance

1. **Regular Updates**:
   - Keep Laravel and dependencies updated
   - Monitor security advisories

2. **Database Maintenance**:
   - Regular cleanup of old logs
   - Optimize database tables periodically

3. **User Management**:
   - Regularly review user accounts
   - Remove inactive users
   - Update passwords periodically

---

## Quick Reference Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --class=AdminUserSeeder

# Generate app key
php artisan key:generate

# Create storage link
php artisan storage:link

# Check Laravel version
php artisan --version

# List all routes
php artisan route:list
```

---

## Support Information

**Application**: Taekwondo A&Z Payment System
**Version**: 1.0
**Laravel Version**: 10.x
**PHP Version**: 8.1+
**Database**: MySQL 5.7+

**Login Credentials**:
- Admin: admin@taekwondo.com / abcd1234
- Bluehost: bluehostmedia@gmail.com / abcd1234

**Important Files**:
- Configuration: `.env`
- Routes: `routes/web.php`
- Controllers: `app/Http/Controllers/`
- Models: `app/Models/`
- Views: `resources/views/` and `resources/js/Pages/`
- Logs: `storage/logs/laravel.log`

---

## Deployment Checklist

- [ ] Database created in cPanel
- [ ] Files uploaded to server
- [ ] `.env` file configured
- [ ] Composer dependencies installed
- [ ] Application key generated
- [ ] Migrations run
- [ ] Admin users seeded
- [ ] File permissions set correctly
- [ ] `.htaccess` configured
- [ ] Document root pointed to `/public`
- [ ] SSL certificate installed
- [ ] HTTPS forced
- [ ] Application tested (login, CRUD, PDF)
- [ ] Responsive design verified
- [ ] Backup strategy implemented
- [ ] Error monitoring set up

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Production URL**: _____________
**Notes**: _____________
