# Production Cache Clearing Guide

## Issue: Button Not Working After Deployment

If the "Bayar" button doesn't redirect to ToyyibPay and there are no console messages, it means the browser is loading old cached JavaScript files.

## Solution: Clear All Caches

### Step 1: Clear Laravel Cache on Server
SSH into your server and run:

```bash
cd public_html/yuran  # or your project directory

# Clear all Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear

# Regenerate optimized files
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 2: Clear Browser Cache
On your browser:

**Option A: Hard Refresh**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Site Data**
1. Press `F12` to open Developer Tools
2. Right-click on the refresh button (while DevTools is open)
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
- Open the site in an incognito/private window to bypass cache

### Step 3: Verify Asset Files Are Updated
Check if the new JavaScript files are loaded:

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Reload the page
4. Look for `app-*.js` file
5. Check the **Size** column - it should show the file being downloaded, not "(disk cache)"

### Step 4: Check Asset Version
In the page source, look for:
```html
<script src="/build/assets/app-CN85EW0C.js"></script>
```

The hash `CN85EW0C` should match the latest build. If it shows an older hash, the server hasn't updated the manifest file.

### Step 5: Force Asset Refresh (If Still Not Working)

If the above doesn't work, you may need to:

1. **Delete the old build folder on server**:
   ```bash
   cd public_html/yuran/public
   rm -rf build
   ```

2. **Re-upload the build folder** from your local machine:
   - Zip your local `public/build` folder
   - Upload it to the server
   - Extract it in `public_html/yuran/public/`

3. **Or rebuild on server** (if Node.js is available):
   ```bash
   cd public_html/yuran
   npm run build
   ```

### Step 6: Verify It's Working

After clearing caches:
1. Reload the page with hard refresh
2. Click the "Bayar" button
3. You should see in console:
   ```
   Payment button clicked for child ID: 42
   Redirecting to: https://yuran.taekwondoanz.com/children/42/payment/online
   ```
4. The page should redirect to ToyyibPay

## Quick Fix: Add Version Query Parameter

If you need an immediate fix without clearing caches, you can add a version parameter to force browsers to reload assets. Edit `resources/views/app.blade.php` and add `?v=2` to asset URLs:

```html
<script src="{{ asset('build/assets/app.js') }}?v=2"></script>
```

But this is a temporary workaround - proper cache clearing is the right solution.

## Still Not Working?

If after all these steps it still doesn't work, check:

1. **File permissions**: Ensure the `public/build` folder has correct permissions (755 for folders, 644 for files)
2. **Cloudflare cache**: If using Cloudflare, purge the cache from Cloudflare dashboard
3. **Server cache**: Some hosts have additional caching layers - check with your hosting provider

## Prevention

To avoid this in future deployments:

1. Always run `php artisan optimize:clear` after deploying
2. Use hard refresh when testing after deployment
3. Consider implementing asset versioning in your build process
