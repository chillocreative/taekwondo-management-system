# CRITICAL FIX: Delete the `hot` file

## The Problem

Your production server has a file called `hot` in the `public/` folder. This file tells Laravel to use the Vite development server instead of the built production assets.

## The Solution

### Step 1: Delete the `hot` file

**Via cPanel File Manager:**

1. Login to cPanel
2. Open File Manager
3. Navigate to: `/public_html/yuran.taekwondoanz.com/public/` (or wherever your public folder is)
4. Look for a file named `hot` (no extension)
5. **Right-click → Delete**
6. Confirm deletion

**Via SSH/Terminal:**

```bash
cd /home/username/public_html/yuran.taekwondoanz.com/public
rm hot
```

### Step 2: Verify the fix

1. Clear your browser cache (Ctrl+Shift+Delete)
2. Reload `https://yuran.taekwondoanz.com`
3. Check browser console (F12) - errors should be gone

---

## Why This Happened

The `hot` file is automatically created when you run `npm run dev` on your local machine. It contains the address of the Vite development server (e.g., `http://[::1]:5173`).

When you uploaded your files to cPanel, this file was included. Now your production server thinks it should use the dev server, which doesn't exist on your production environment.

---

## Prevention for Future Deployments

### Option 1: Add `hot` to .gitignore (if using Git)

```
/public/hot
/public/storage
```

### Option 2: Manual Upload Checklist

When uploading files to cPanel, **NEVER upload these files/folders:**

- ❌ `public/hot`
- ❌ `node_modules/`
- ❌ `vendor/` (install via composer on server)
- ❌ `.env` (create separately on server)
- ❌ `storage/logs/*` (will be created on server)

**ALWAYS upload:**

- ✅ `public/build/` (production assets)
- ✅ All other application files

---

## Complete Deployment Checklist

After deleting the `hot` file, verify these are correct:

### 1. Check .env on server

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yuran.taekwondoanz.com
```

### 2. Verify build folder exists

```
/public/build/
├── manifest.json
└── assets/
    ├── app-[hash].js
    └── app-[hash].css
```

### 3. Clear all caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan config:cache
```

### 4. Check file permissions

```bash
chmod -R 755 public/build
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

## Still Having Issues?

### Check the HTML source

1. Visit `https://yuran.taekwondoanz.com`
2. Right-click → View Page Source
3. Look for script tags

**Should see (CORRECT):**
```html
<script type="module" src="/build/assets/app-CM3WZLfq.js"></script>
```

**Should NOT see (WRONG):**
```html
<script type="module" src="http://[::1]:5173/@vite/client"></script>
```

If you still see the wrong one, the `hot` file still exists or caches aren't cleared.

### Force clear all caches

```bash
# Clear Laravel caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Clear OPcache (if available)
php artisan optimize:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Check if hot file recreated

Sometimes the `hot` file can be recreated if you have a process running. Make sure:

1. You're not running `npm run dev` on the server
2. No background processes are creating the file
3. File permissions prevent recreation: `chmod 444 public/` (read-only)

---

## Emergency Workaround

If deleting `hot` doesn't work, try this:

### Create a custom Vite configuration for production

**On your local machine**, update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        hmr: {
            host: 'localhost',
        },
    },
    build: {
        manifest: true,
        outDir: 'public/build',
        rollupOptions: {
            input: 'resources/js/app.jsx',
        },
    },
});
```

Then rebuild:

```bash
npm run build
```

Upload the new `public/build/` folder to your server.

---

## Contact Information

If the issue persists after following ALL steps above:

1. Take a screenshot of:
   - Browser console errors (F12)
   - `public/` folder contents on server
   - `.env` file contents (hide sensitive data)

2. Check these files on server:
   - Does `public/hot` exist? (should be NO)
   - Does `public/build/manifest.json` exist? (should be YES)
   - Does `.env` have `APP_ENV=production`? (should be YES)

3. Provide output of:
   ```bash
   php artisan about
   ```

---

**Last Updated**: December 5, 2025
**Priority**: CRITICAL - Must be fixed for production deployment
