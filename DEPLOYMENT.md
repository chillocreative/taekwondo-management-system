# cPanel Deployment Guide - Taekwondo Management System

## Prerequisites
- cPanel account with SSH/Terminal access
- PHP 8.1 or higher
- MySQL database
- Git access enabled
- Composer installed on server

## Step-by-Step Deployment

### 1. Prepare Database
1. Log in to cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `username_taekwondo`)
4. Create a database user with a strong password
5. Add the user to the database with **ALL PRIVILEGES**
6. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost`)

### 2. Clone Repository
1. Open **Terminal** in cPanel
2. Navigate to your home directory:
   ```bash
   cd ~
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/chillocreative/taekwondo-management-system.git
   cd taekwondo-management-system
   ```

### 3. Configure Environment
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file using nano or vi:
   ```bash
   nano .env
   ```
3. Update the following values:
   ```env
   APP_NAME="Taekwondo A&Z"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password

   # ToyyibPay Settings (Production)
   TOYYIBPAY_SECRET_KEY=your_production_secret_key
   TOYYIBPAY_CATEGORY_CODE=your_production_category_code
   TOYYIBPAY_API_URL=https://toyyibpay.com
   ```
4. Save and exit (Ctrl+X, then Y, then Enter)

### 4. Install Dependencies
```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Generate application key
php artisan key:generate

# Create storage symlink
php artisan storage:link
```

### 5. Set Up Public Directory
1. In cPanel File Manager, navigate to `public_html`
2. **Option A: Subdomain/Addon Domain** (Recommended)
   - Create a subdomain or addon domain
   - Point its document root to: `/home/username/taekwondo-management-system/public`

3. **Option B: Main Domain**
   - Backup and remove everything in `public_html`
   - Copy contents of `taekwondo-management-system/public/*` to `public_html/`
   - Update `public_html/index.php`:
     ```php
     require __DIR__.'/../taekwondo-management-system/bootstrap/app.php';
     ```

### 6. Set Permissions
```bash
cd ~/taekwondo-management-system

# Set correct permissions
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# If using Option B (main domain)
chmod -R 755 ~/public_html
```

### 7. Run Database Migrations
```bash
php artisan migrate --force
```

**Or** use the web route (if you kept it):
- Visit: `https://yourdomain.com/migrate`

### 8. Build Frontend Assets (Local Machine)
**IMPORTANT:** Build assets on your local machine before deploying, as cPanel typically doesn't have Node.js.

On your local machine:
```bash
npm run build
```

Then commit and push:
```bash
git add public/build
git commit -m "Add production build assets"
git push origin main
```

On the server, pull the changes:
```bash
cd ~/taekwondo-management-system
git pull origin main
```

### 9. Optimize for Production
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache
```

### 10. Create Admin User
If you need to create an admin user manually:
```bash
php artisan tinker
```
Then run:
```php
$user = new App\Models\User();
$user->name = 'Admin User';
$user->email = 'admin@example.com';
$user->phone_number = '0123456789';
$user->password = Hash::make('your-secure-password');
$user->role = 'admin';
$user->save();
exit
```

### 11. Set Up Cron Jobs (Optional)
If you have scheduled tasks, add this to cPanel Cron Jobs:
```
* * * * * cd /home/username/taekwondo-management-system && php artisan schedule:run >> /dev/null 2>&1
```

## Post-Deployment Checklist
- [ ] Application loads without errors
- [ ] Database connection works
- [ ] Login functionality works
- [ ] File uploads work (test with profile pictures)
- [ ] ToyyibPay integration works (test payment)
- [ ] PDF generation works (test receipts)
- [ ] All routes are accessible
- [ ] SSL certificate is active (HTTPS)

## Updating the Application
When you push updates to GitHub:

1. SSH into your server:
   ```bash
   cd ~/taekwondo-management-system
   ```

2. Stash or reset local changes:
   ```bash
   git reset --hard HEAD
   ```

3. Pull latest changes:
   ```bash
   git pull origin main
   ```

4. Update dependencies (if composer.json changed):
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

5. Run new migrations (if any):
   ```bash
   php artisan migrate --force
   ```

6. Clear and rebuild cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Troubleshooting

### 500 Internal Server Error
1. Check `.env` file exists and is configured correctly
2. Check file permissions (755 for directories, 644 for files)
3. Check error logs in cPanel or `storage/logs/laravel.log`
4. Ensure `APP_KEY` is set in `.env`

### Database Connection Error
1. Verify database credentials in `.env`
2. Ensure database user has correct privileges
3. Check if database host is `localhost` or `127.0.0.1`

### Assets Not Loading
1. Ensure `public/build` directory exists
2. Check `APP_URL` in `.env` matches your domain
3. Clear browser cache
4. Run `npm run build` locally and push changes

### ToyyibPay Not Working
1. Verify API credentials in `.env`
2. Check callback URLs are accessible (not behind authentication)
3. Ensure CSRF exemption is set for callback routes
4. Check ToyyibPay dashboard for error logs

### File Upload Issues
1. Check `storage` and `bootstrap/cache` permissions (775)
2. Ensure `storage/app/public` is linked: `php artisan storage:link`
3. Check PHP upload limits in cPanel (upload_max_filesize, post_max_size)

## Security Recommendations
1. Never commit `.env` file to Git
2. Use strong database passwords
3. Enable SSL/HTTPS
4. Keep `APP_DEBUG=false` in production
5. Regularly update dependencies: `composer update`
6. Set up regular database backups in cPanel
7. Monitor `storage/logs/laravel.log` for errors

## Support
For issues specific to this deployment, check:
- Laravel logs: `storage/logs/laravel.log`
- cPanel error logs: Available in cPanel Error Log viewer
- GitHub repository: https://github.com/chillocreative/taekwondo-management-system
