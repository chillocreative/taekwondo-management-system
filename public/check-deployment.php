<?php
/**
 * Laravel Deployment Checker
 * Upload this file to your public folder and visit it in browser
 * DELETE THIS FILE after troubleshooting!
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Laravel Deployment Checker</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #FF2D20; }
        .check { margin: 15px 0; padding: 10px; border-left: 4px solid #ddd; }
        .pass { border-color: #22c55e; background: #f0fdf4; }
        .fail { border-color: #ef4444; background: #fef2f2; }
        .warn { border-color: #f59e0b; background: #fffbeb; }
        .status { font-weight: bold; }
        .pass .status { color: #22c55e; }
        .fail .status { color: #ef4444; }
        .warn .status { color: #f59e0b; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
        .info { background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .command { background: #1f2937; color: #10b981; padding: 10px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Laravel Deployment Checker</h1>
        <p><strong>Domain:</strong> <?php echo $_SERVER['HTTP_HOST']; ?></p>
        <p><strong>Time:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        
        <hr>

        <?php
        $checks = [];
        $errors = [];
        $warnings = [];

        // Check 1: PHP Version
        $phpVersion = PHP_VERSION;
        $phpOk = version_compare($phpVersion, '8.2.0', '>=');
        $checks[] = [
            'name' => 'PHP Version',
            'status' => $phpOk ? 'pass' : 'fail',
            'message' => "PHP $phpVersion " . ($phpOk ? '✓' : '✗ (Requires PHP 8.2+)'),
            'details' => $phpOk ? 'PHP version is compatible' : 'Laravel 11 requires PHP 8.2 or higher. Update PHP in cPanel MultiPHP Manager.'
        ];
        if (!$phpOk) $errors[] = "PHP version too old ($phpVersion). Need 8.2+";

        // Check 2: Laravel Root
        $laravelRoot = dirname(__DIR__);
        $vendorExists = file_exists($laravelRoot . '/vendor/autoload.php');
        $checks[] = [
            'name' => 'Composer Dependencies',
            'status' => $vendorExists ? 'pass' : 'fail',
            'message' => 'vendor/autoload.php ' . ($vendorExists ? 'found ✓' : 'NOT FOUND ✗'),
            'details' => $vendorExists ? 'Composer dependencies installed' : 'Run: composer install --optimize-autoloader --no-dev'
        ];
        if (!$vendorExists) $errors[] = "Composer dependencies not installed";

        // Check 3: .env file
        $envExists = file_exists($laravelRoot . '/.env');
        $checks[] = [
            'name' => 'Environment File',
            'status' => $envExists ? 'pass' : 'fail',
            'message' => '.env file ' . ($envExists ? 'exists ✓' : 'NOT FOUND ✗'),
            'details' => $envExists ? 'Environment configuration file found' : 'Copy .env.example to .env and configure it'
        ];
        if (!$envExists) $errors[] = ".env file missing";

        // Check 4: .htaccess
        $htaccessExists = file_exists(__DIR__ . '/.htaccess');
        $checks[] = [
            'name' => '.htaccess File',
            'status' => $htaccessExists ? 'pass' : 'fail',
            'message' => 'public/.htaccess ' . ($htaccessExists ? 'exists ✓' : 'NOT FOUND ✗'),
            'details' => $htaccessExists ? 'URL rewriting configured' : 'Missing .htaccess file in public folder'
        ];
        if (!$htaccessExists) $errors[] = ".htaccess missing in public folder";

        // Check 5: Storage permissions
        $storageWritable = is_writable($laravelRoot . '/storage');
        $checks[] = [
            'name' => 'Storage Permissions',
            'status' => $storageWritable ? 'pass' : 'fail',
            'message' => 'storage/ ' . ($storageWritable ? 'writable ✓' : 'NOT WRITABLE ✗'),
            'details' => $storageWritable ? 'Storage directory has correct permissions' : 'Set permissions: chmod -R 755 storage'
        ];
        if (!$storageWritable) $errors[] = "storage/ folder not writable";

        // Check 6: Bootstrap cache permissions
        $bootstrapCacheWritable = is_writable($laravelRoot . '/bootstrap/cache');
        $checks[] = [
            'name' => 'Bootstrap Cache Permissions',
            'status' => $bootstrapCacheWritable ? 'pass' : 'fail',
            'message' => 'bootstrap/cache/ ' . ($bootstrapCacheWritable ? 'writable ✓' : 'NOT WRITABLE ✗'),
            'details' => $bootstrapCacheWritable ? 'Bootstrap cache has correct permissions' : 'Set permissions: chmod -R 755 bootstrap/cache'
        ];
        if (!$bootstrapCacheWritable) $errors[] = "bootstrap/cache/ folder not writable";

        // Check 7: Build folder (Vite assets)
        $buildExists = file_exists(__DIR__ . '/build/manifest.json');
        $checks[] = [
            'name' => 'Frontend Assets',
            'status' => $buildExists ? 'pass' : 'warn',
            'message' => 'public/build/ ' . ($buildExists ? 'exists ✓' : 'NOT FOUND ⚠'),
            'details' => $buildExists ? 'Frontend assets compiled' : 'Run: npm run build (on local machine, then upload)'
        ];
        if (!$buildExists) $warnings[] = "Frontend assets not built - run 'npm run build'";

        // Check 8: Required PHP extensions
        $requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'json', 'bcmath', 'fileinfo'];
        $missingExtensions = [];
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $missingExtensions[] = $ext;
            }
        }
        $checks[] = [
            'name' => 'PHP Extensions',
            'status' => empty($missingExtensions) ? 'pass' : 'fail',
            'message' => empty($missingExtensions) ? 'All required extensions loaded ✓' : 'Missing extensions: ' . implode(', ', $missingExtensions),
            'details' => empty($missingExtensions) ? 'All required PHP extensions are available' : 'Enable missing extensions in cPanel Select PHP Version'
        ];
        if (!empty($missingExtensions)) $errors[] = "Missing PHP extensions: " . implode(', ', $missingExtensions);

        // Check 9: Try to load Laravel
        $laravelLoaded = false;
        $laravelError = '';
        if ($vendorExists && $envExists) {
            try {
                require $laravelRoot . '/vendor/autoload.php';
                $app = require_once $laravelRoot . '/bootstrap/app.php';
                $laravelLoaded = true;
            } catch (Exception $e) {
                $laravelError = $e->getMessage();
            }
        }
        $checks[] = [
            'name' => 'Laravel Bootstrap',
            'status' => $laravelLoaded ? 'pass' : 'fail',
            'message' => 'Laravel ' . ($laravelLoaded ? 'loads successfully ✓' : 'FAILED to load ✗'),
            'details' => $laravelLoaded ? 'Application bootstraps correctly' : 'Error: ' . $laravelError
        ];
        if (!$laravelLoaded) $errors[] = "Laravel failed to bootstrap: $laravelError";

        // Display checks
        foreach ($checks as $check) {
            echo "<div class='check {$check['status']}'>";
            echo "<div class='status'>{$check['message']}</div>";
            echo "<div style='margin-top: 5px; font-size: 0.9em;'>{$check['details']}</div>";
            echo "</div>";
        }

        // Summary
        echo "<hr>";
        $totalChecks = count($checks);
        $passedChecks = count(array_filter($checks, fn($c) => $c['status'] === 'pass'));
        $failedChecks = count(array_filter($checks, fn($c) => $c['status'] === 'fail'));
        $warnChecks = count(array_filter($checks, fn($c) => $c['status'] === 'warn'));

        echo "<h2>Summary</h2>";
        echo "<p><strong>Total Checks:</strong> $totalChecks</p>";
        echo "<p style='color: #22c55e;'><strong>Passed:</strong> $passedChecks</p>";
        echo "<p style='color: #ef4444;'><strong>Failed:</strong> $failedChecks</p>";
        echo "<p style='color: #f59e0b;'><strong>Warnings:</strong> $warnChecks</p>";

        if ($failedChecks === 0 && $warnChecks === 0) {
            echo "<div class='info' style='border-color: #22c55e; background: #f0fdf4;'>";
            echo "<h3 style='color: #22c55e; margin-top: 0;'>✅ All checks passed!</h3>";
            echo "<p>Your Laravel application should be working. If you still see a blank page:</p>";
            echo "<ol>";
            echo "<li>Clear browser cache (Ctrl+Shift+R)</li>";
            echo "<li>Check that document root points to <code>/public</code> folder</li>";
            echo "<li>Run artisan commands (see below)</li>";
            echo "</ol>";
            echo "</div>";
        } else {
            echo "<div class='info' style='border-color: #ef4444; background: #fef2f2;'>";
            echo "<h3 style='color: #ef4444; margin-top: 0;'>❌ Issues Found</h3>";
            echo "<p><strong>Fix these issues:</strong></p>";
            echo "<ul>";
            foreach ($errors as $error) {
                echo "<li>$error</li>";
            }
            foreach ($warnings as $warning) {
                echo "<li style='color: #f59e0b;'>$warning</li>";
            }
            echo "</ul>";
            echo "</div>";
        }

        // Next steps
        echo "<hr>";
        echo "<h2>📋 Next Steps</h2>";
        echo "<div class='info'>";
        echo "<h3>1. Verify Document Root</h3>";
        echo "<p>In cPanel, ensure your domain points to the <code>public</code> folder:</p>";
        echo "<div class='command'>/home/yourusername/yourfolder/public</div>";
        
        echo "<h3>2. Run Artisan Commands (via SSH)</h3>";
        echo "<div class='command'>";
        echo "cd " . htmlspecialchars($laravelRoot) . "<br>";
        echo "php artisan key:generate<br>";
        echo "php artisan migrate --force<br>";
        echo "php artisan storage:link<br>";
        echo "php artisan config:clear<br>";
        echo "php artisan cache:clear<br>";
        echo "php artisan route:clear<br>";
        echo "php artisan view:clear<br>";
        echo "php artisan optimize";
        echo "</div>";

        echo "<h3>3. Build Frontend Assets (on local machine)</h3>";
        echo "<div class='command'>";
        echo "npm install<br>";
        echo "npm run build";
        echo "</div>";
        echo "<p>Then upload the <code>public/build</code> folder to cPanel</p>";

        echo "<h3>4. Set File Permissions</h3>";
        echo "<div class='command'>";
        echo "chmod -R 755 storage<br>";
        echo "chmod -R 755 bootstrap/cache";
        echo "</div>";
        echo "</div>";

        // System info
        echo "<hr>";
        echo "<h2>📊 System Information</h2>";
        echo "<table style='width: 100%; border-collapse: collapse;'>";
        echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'><strong>PHP Version:</strong></td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>" . PHP_VERSION . "</td></tr>";
        echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'><strong>Server Software:</strong></td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>" . $_SERVER['SERVER_SOFTWARE'] . "</td></tr>";
        echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'><strong>Document Root:</strong></td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>" . $_SERVER['DOCUMENT_ROOT'] . "</td></tr>";
        echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'><strong>Laravel Root:</strong></td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>" . $laravelRoot . "</td></tr>";
        echo "<tr><td style='padding: 5px; border-bottom: 1px solid #ddd;'><strong>Current User:</strong></td><td style='padding: 5px; border-bottom: 1px solid #ddd;'>" . get_current_user() . "</td></tr>";
        echo "</table>";

        ?>

        <hr>
        <div style="background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #ef4444; margin-top: 0;">⚠️ SECURITY WARNING</h3>
            <p><strong>DELETE THIS FILE IMMEDIATELY AFTER TROUBLESHOOTING!</strong></p>
            <p>This file exposes system information and should not be accessible in production.</p>
        </div>
    </div>
</body>
</html>
