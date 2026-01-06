# Production Deployment Guide

## Issue
The production database is missing the new columns for the children table. You're getting this error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'guardian_name'
```

## Solution: Run Database Migrations on Production

### Step 1: Connect to Your cPanel Server
1. Log in to your cPanel
2. Open **Terminal** or use SSH to connect to your server

### Step 2: Navigate to Your Project Directory
```bash
cd public_html/yuran  # or wherever your Laravel project is located
```

### Step 3: Run the Migrations
```bash
php artisan migrate
```

This will add all the missing columns to your `children` table:
- `guardian_name`
- `guardian_occupation`
- `guardian_ic_number`
- `guardian_age`
- `guardian_phone`
- `address`
- `phone_number`
- `school_name`
- `school_class`
- `postcode`
- `city`
- `state`

### Step 4: Clear Cache (Important!)
After running migrations, clear all Laravel caches:
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear
```

### Step 5: Verify
Try adding a new participant again. The form should now work without errors.

## Alternative: If You Don't Have Terminal Access

If you can't access the terminal in cPanel, you can:

1. Create a temporary route in `routes/web.php`:
```php
Route::get('/run-migrations', function() {
    Artisan::call('migrate');
    return 'Migrations completed!';
})->middleware('auth'); // Only accessible when logged in
```

2. Visit: `https://yuran.taekwondoanz.com/run-migrations`

3. **IMPORTANT**: Remove this route immediately after running it for security!

## What Migrations Will Run

The following migrations will be executed:
1. `2026_01_06_140349_add_new_fields_to_children_table.php` - Adds guardian and child info fields
2. `2026_01_06_143711_add_address_details_to_children_table.php` - Adds postcode, city, state fields

## Notes
- These migrations are **safe** to run - they only ADD columns, they don't delete anything
- All new columns are **nullable**, so existing data won't be affected
- The migrations have already been tested on your local development environment
