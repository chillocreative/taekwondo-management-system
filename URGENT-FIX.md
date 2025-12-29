# URGENT FIX: Vite Production Asset Loading Issue

## Problem
Your production site is trying to load from Vite dev server instead of built assets.

## Quick Fix Steps

### 1. Upload Built Assets to cPanel

**From your local machine:**

1. Locate the `public/build/` folder in your local project
2. Compress it as `build.zip`
3. Upload `build.zip` to your cPanel File Manager
4. Navigate to: `/public_html/yuran.taekwondoanz.com/public/` (or your public folder)
5. Extract `build.zip` here
6. Verify you now have `/public/build/manifest.json` and `/public/build/assets/` folder

### 2. Fix .env on Production Server

**Via cPanel File Manager:**

1. Navigate to your application root (where .env is located)
2. Edit `.env` file
3. Make sure these lines are set:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yuran.taekwondoanz.com
```

4. Save the file

### 3. Clear All Caches

**Via cPanel Terminal (or SSH):**

```bash
# Navigate to your application directory
cd /home/username/public_html/yuran.taekwondoanz.com

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 4. Verify File Permissions

```bash
# Make sure build folder is readable
chmod -R 755 public/build
```

### 5. Test the Application

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Visit `https://yuran.taekwondoanz.com`
3. Check browser console (F12) - errors should be gone

---

## Alternative: Manual Asset Upload (If build folder is missing)

If you don't have the `public/build/` folder locally:

### On Your Local Machine:

1. Open terminal/command prompt
2. Navigate to project:
   ```bash
   cd d:\laragon\www\taekwondo
   ```

3. Build production assets:
   ```bash
   npm run build
   ```

4. Wait for build to complete
5. Locate `public/build/` folder
6. Upload to cPanel as described in Step 1 above

---

## Verification Checklist

- [ ] `public/build/manifest.json` exists on server
- [ ] `public/build/assets/` folder exists with JS/CSS files
- [ ] `.env` has `APP_ENV=production`
- [ ] `.env` has `APP_DEBUG=false`
- [ ] `.env` has correct `APP_URL`
- [ ] All caches cleared and rebuilt
- [ ] Browser cache cleared
- [ ] No CORS errors in browser console

---

## Why This Happened

**Development vs Production:**
- **Development**: Uses Vite dev server at `http://localhost:5173` or `http://[::1]:5173`
- **Production**: Uses pre-built static assets in `public/build/`

**The Issue:**
- Your `.env` was likely set to `APP_ENV=local` or `development`
- OR the `public/build/` folder was not uploaded
- Laravel/Vite defaults to dev server when in development mode

**The Fix:**
- Ensure `APP_ENV=production` in `.env`
- Ensure built assets exist in `public/build/`
- Clear all caches so Laravel recognizes the change

---

## Still Having Issues?

### Check app.blade.php

Verify `resources/views/app.blade.php` has:

```blade
@vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
```

NOT:

```blade
@vite(['resources/js/app.jsx'])
```

### Check .htaccess

Ensure `public/.htaccess` exists with proper rewrite rules (see DEPLOYMENT.md)

### Check PHP Version

```bash
php -v
```

Should be PHP 8.1 or higher.

### Check Composer Dependencies

```bash
composer install --optimize-autoloader --no-dev
```

---

## Contact Support

If issue persists after following all steps:
1. Check `storage/logs/laravel.log` for errors
2. Verify file permissions: `ls -la public/build`
3. Test with `APP_DEBUG=true` temporarily to see detailed errors
4. Check browser Network tab (F12) to see what files are being requested

---

**Last Updated**: December 5, 2025
