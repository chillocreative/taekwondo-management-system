<?php
/**
 * cPanel Deployment Diagnostic Script
 * Upload this file to your cPanel public_html or domain root
 * Access it via: https://yourdomain.com/cpanel-diagnostic.php
 * 
 * This script will help diagnose common deployment issues
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>cPanel Deployment Diagnostics</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 1200px; 
            margin: 20px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .section { 
            background: white;
            margin: 20px 0; 
            padding: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .success { 
            color: #22c55e; 
            font-weight: bold;
        }
        .error { 
            color: #ef4444; 
            font-weight: bold;
        }
        .warning { 
            color: #f59e0b; 
            font-weight: bold;
        }
        .info { 
            color: #3b82f6; 
            font-weight: bold;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb;
        }
        th { 
            background: #f9fafb; 
            font-weight: 600;
        }
        .code {
            background: #1f2937;
            color: #10b981;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 10px 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-error { background: #fee2e2; color: #991b1b; }
        .badge-warning { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 cPanel Deployment Diagnostics</h1>
        <p>Taekwondo Management System - Server Environment Check</p>
    </div>

<?php

// Get the base path (one level up from public)
$basePath = dirname(__DIR__);
$publicPath = __DIR__;

echo "<div class='section'>";
echo "<h2>📁 Path Information</h2>";
echo "<table>";
echo "<tr><th>Path Type</th><th>Location</th></tr>";
echo "<tr><td>Current Directory</td><td><code>" . __DIR__ . "</code></td></tr>";
echo "<tr><td>Base Path (Laravel Root)</td><td><code>" . $basePath . "</code></td></tr>";
echo "<tr><td>Public Path</td><td><code>" . $publicPath . "</code></td></tr>";
echo "</table>";
echo "</div>";

// PHP Version Check
echo "<div class='section'>";
echo "<h2>🐘 PHP Environment</h2>";
$phpVersion = phpversion();
$phpOk = version_compare($phpVersion, '8.2.0', '>=');
echo "<table>";
echo "<tr><th>Check</th><th>Status</th><th>Details</th></tr>";
echo "<tr>";
echo "<td>PHP Version</td>";
echo "<td>" . ($phpOk ? "<span class='success'>✓ PASS</span>" : "<span class='error'>✗ FAIL</span>") . "</td>";
echo "<td><strong>" . $phpVersion . "</strong> " . ($phpOk ? "(Required: 8.2+)" : "<span class='error'>Upgrade to PHP 8.2+</span>") . "</td>";
echo "</tr>";
echo "</table>";
echo "</div>";

// Required PHP Extensions
echo "<div class='section'>";
echo "<h2>🔌 PHP Extensions</h2>";
$requiredExtensions = [
    'pdo' => 'PDO',
    'pdo_mysql' => 'PDO MySQL',
    'mbstring' => 'Multibyte String',
    'openssl' => 'OpenSSL',
    'tokenizer' => 'Tokenizer',
    'xml' => 'XML',
    'ctype' => 'Ctype',
    'json' => 'JSON',
    'bcmath' => 'BCMath',
    'fileinfo' => 'Fileinfo',
    'curl' => 'cURL',
    'zip' => 'ZIP',
    'gd' => 'GD (Image Processing)',
];

echo "<table>";
echo "<tr><th>Extension</th><th>Status</th></tr>";
foreach ($requiredExtensions as $ext => $name) {
    $loaded = extension_loaded($ext);
    echo "<tr>";
    echo "<td>{$name} ({$ext})</td>";
    echo "<td>" . ($loaded ? "<span class='success'>✓ Loaded</span>" : "<span class='error'>✗ Missing</span>") . "</td>";
    echo "</tr>";
}
echo "</table>";
echo "</div>";

// File and Directory Permissions
echo "<div class='section'>";
echo "<h2>📂 File Permissions</h2>";
$pathsToCheck = [
    $basePath . '/storage' => 'storage',
    $basePath . '/storage/framework' => 'storage/framework',
    $basePath . '/storage/framework/cache' => 'storage/framework/cache',
    $basePath . '/storage/framework/sessions' => 'storage/framework/sessions',
    $basePath . '/storage/framework/views' => 'storage/framework/views',
    $basePath . '/storage/logs' => 'storage/logs',
    $basePath . '/bootstrap/cache' => 'bootstrap/cache',
];

echo "<table>";
echo "<tr><th>Path</th><th>Exists</th><th>Writable</th><th>Permissions</th></tr>";
foreach ($pathsToCheck as $path => $label) {
    $exists = file_exists($path);
    $writable = $exists && is_writable($path);
    $perms = $exists ? substr(sprintf('%o', fileperms($path)), -4) : 'N/A';
    
    echo "<tr>";
    echo "<td>{$label}</td>";
    echo "<td>" . ($exists ? "<span class='success'>✓ Yes</span>" : "<span class='error'>✗ No</span>") . "</td>";
    echo "<td>" . ($writable ? "<span class='success'>✓ Yes</span>" : "<span class='error'>✗ No</span>") . "</td>";
    echo "<td><code>{$perms}</code></td>";
    echo "</tr>";
}
echo "</table>";
echo "</div>";

// Laravel Files Check
echo "<div class='section'>";
echo "<h2>📋 Laravel Files</h2>";
$laravelFiles = [
    $basePath . '/.env' => '.env (Environment Config)',
    $basePath . '/vendor/autoload.php' => 'vendor/autoload.php (Composer)',
    $basePath . '/artisan' => 'artisan (CLI Tool)',
    $publicPath . '/index.php' => 'public/index.php (Entry Point)',
    $publicPath . '/.htaccess' => 'public/.htaccess (Apache Config)',
    $basePath . '/bootstrap/cache/config.php' => 'bootstrap/cache/config.php (Config Cache)',
];

echo "<table>";
echo "<tr><th>File</th><th>Status</th></tr>";
foreach ($laravelFiles as $file => $label) {
    $exists = file_exists($file);
    echo "<tr>";
    echo "<td>{$label}</td>";
    echo "<td>" . ($exists ? "<span class='success'>✓ Exists</span>" : "<span class='error'>✗ Missing</span>") . "</td>";
    echo "</tr>";
}
echo "</table>";
echo "</div>";

// Environment File Check
echo "<div class='section'>";
echo "<h2>⚙️ Environment Configuration</h2>";
$envFile = $basePath . '/.env';
if (file_exists($envFile)) {
    echo "<p class='success'>✓ .env file exists</p>";
    
    // Parse .env file
    $envContent = file_get_contents($envFile);
    $envLines = explode("\n", $envContent);
    $envVars = [];
    
    foreach ($envLines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $envVars[$key] = $value;
        }
    }
    
    $criticalVars = [
        'APP_KEY' => 'Application Key',
        'APP_ENV' => 'Environment',
        'APP_DEBUG' => 'Debug Mode',
        'APP_URL' => 'Application URL',
        'DB_CONNECTION' => 'Database Connection',
        'DB_HOST' => 'Database Host',
        'DB_DATABASE' => 'Database Name',
        'DB_USERNAME' => 'Database User',
        'DB_PASSWORD' => 'Database Password',
    ];
    
    echo "<table>";
    echo "<tr><th>Variable</th><th>Status</th><th>Value (masked)</th></tr>";
    foreach ($criticalVars as $var => $label) {
        $isset = isset($envVars[$var]) && !empty($envVars[$var]);
        $value = $isset ? $envVars[$var] : 'NOT SET';
        
        // Mask sensitive values
        if (in_array($var, ['APP_KEY', 'DB_PASSWORD']) && $isset) {
            $value = str_repeat('*', 20) . substr($value, -4);
        }
        
        echo "<tr>";
        echo "<td>{$label} ({$var})</td>";
        echo "<td>" . ($isset ? "<span class='success'>✓ Set</span>" : "<span class='error'>✗ Not Set</span>") . "</td>";
        echo "<td><code>{$value}</code></td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Check for common issues
    echo "<h3>⚠️ Configuration Warnings</h3>";
    $warnings = [];
    
    if (isset($envVars['APP_DEBUG']) && $envVars['APP_DEBUG'] === 'true') {
        $warnings[] = "APP_DEBUG is set to 'true'. Set it to 'false' for production.";
    }
    
    if (isset($envVars['APP_ENV']) && $envVars['APP_ENV'] !== 'production') {
        $warnings[] = "APP_ENV is set to '{$envVars['APP_ENV']}'. Consider setting it to 'production'.";
    }
    
    if (!isset($envVars['APP_KEY']) || empty($envVars['APP_KEY']) || $envVars['APP_KEY'] === 'base64:') {
        $warnings[] = "APP_KEY is not set or invalid. Run: php artisan key:generate";
    }
    
    if (empty($warnings)) {
        echo "<p class='success'>✓ No configuration warnings</p>";
    } else {
        echo "<ul>";
        foreach ($warnings as $warning) {
            echo "<li class='warning'>⚠ {$warning}</li>";
        }
        echo "</ul>";
    }
    
} else {
    echo "<p class='error'>✗ .env file NOT found!</p>";
    echo "<p>Copy .env.example to .env and configure it.</p>";
}
echo "</div>";

// Database Connection Test
echo "<div class='section'>";
echo "<h2>🗄️ Database Connection</h2>";

if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    preg_match('/DB_HOST=(.*)/', $envContent, $hostMatch);
    preg_match('/DB_DATABASE=(.*)/', $envContent, $dbMatch);
    preg_match('/DB_USERNAME=(.*)/', $envContent, $userMatch);
    preg_match('/DB_PASSWORD=(.*)/', $envContent, $passMatch);
    
    $dbHost = isset($hostMatch[1]) ? trim($hostMatch[1]) : '';
    $dbName = isset($dbMatch[1]) ? trim($dbMatch[1]) : '';
    $dbUser = isset($userMatch[1]) ? trim($userMatch[1]) : '';
    $dbPass = isset($passMatch[1]) ? trim($passMatch[1]) : '';
    
    if ($dbHost && $dbName && $dbUser) {
        try {
            $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            
            echo "<p class='success'>✓ Database connection successful!</p>";
            echo "<table>";
            echo "<tr><th>Property</th><th>Value</th></tr>";
            echo "<tr><td>Host</td><td><code>{$dbHost}</code></td></tr>";
            echo "<tr><td>Database</td><td><code>{$dbName}</code></td></tr>";
            echo "<tr><td>Username</td><td><code>{$dbUser}</code></td></tr>";
            
            // Get MySQL version
            $version = $pdo->query('SELECT VERSION()')->fetchColumn();
            echo "<tr><td>MySQL Version</td><td><code>{$version}</code></td></tr>";
            
            // Check if tables exist
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo "<tr><td>Tables Found</td><td><code>" . count($tables) . "</code></td></tr>";
            echo "</table>";
            
            if (count($tables) === 0) {
                echo "<p class='warning'>⚠ No tables found. Run migrations: <code>php artisan migrate</code></p>";
            }
            
        } catch (PDOException $e) {
            echo "<p class='error'>✗ Database connection failed!</p>";
            echo "<p class='error'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
            echo "<div class='code'>";
            echo "Possible solutions:\n";
            echo "1. Verify database credentials in .env file\n";
            echo "2. Ensure database exists in cPanel MySQL Databases\n";
            echo "3. Check if database user has privileges\n";
            echo "4. Try using '127.0.0.1' instead of 'localhost' for DB_HOST";
            echo "</div>";
        }
    } else {
        echo "<p class='error'>✗ Database credentials not configured in .env</p>";
    }
} else {
    echo "<p class='error'>✗ Cannot test database connection - .env file missing</p>";
}
echo "</div>";

// Server Information
echo "<div class='section'>";
echo "<h2>🖥️ Server Information</h2>";
echo "<table>";
echo "<tr><th>Property</th><th>Value</th></tr>";
echo "<tr><td>Server Software</td><td><code>" . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</code></td></tr>";
echo "<tr><td>Document Root</td><td><code>" . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</code></td></tr>";
echo "<tr><td>PHP SAPI</td><td><code>" . php_sapi_name() . "</code></td></tr>";
echo "<tr><td>Max Execution Time</td><td><code>" . ini_get('max_execution_time') . " seconds</code></td></tr>";
echo "<tr><td>Memory Limit</td><td><code>" . ini_get('memory_limit') . "</code></td></tr>";
echo "<tr><td>Upload Max Filesize</td><td><code>" . ini_get('upload_max_filesize') . "</code></td></tr>";
echo "<tr><td>Post Max Size</td><td><code>" . ini_get('post_max_size') . "</code></td></tr>";
echo "</table>";
echo "</div>";

// Error Log Check
echo "<div class='section'>";
echo "<h2>📜 Recent Error Logs</h2>";
$logFile = $basePath . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    echo "<p class='info'>✓ Log file exists: <code>storage/logs/laravel.log</code></p>";
    
    // Read last 50 lines
    $lines = file($logFile);
    $lastLines = array_slice($lines, -50);
    
    echo "<div class='code' style='max-height: 400px; overflow-y: auto;'>";
    echo "<strong>Last 50 lines:</strong>\n\n";
    echo htmlspecialchars(implode('', $lastLines));
    echo "</div>";
} else {
    echo "<p class='warning'>⚠ No log file found yet</p>";
}
echo "</div>";

// Recommendations
echo "<div class='section'>";
echo "<h2>💡 Troubleshooting Steps</h2>";
echo "<ol>";
echo "<li><strong>If you see this page, PHP is working!</strong> The issue is likely with Laravel configuration.</li>";
echo "<li>Check all items marked with <span class='error'>✗</span> above and fix them.</li>";
echo "<li>Ensure <code>.env</code> file exists and is properly configured.</li>";
echo "<li>Run: <code>php artisan key:generate</code> if APP_KEY is missing.</li>";
echo "<li>Set proper permissions: <code>chmod -R 755 storage bootstrap/cache</code></li>";
echo "<li>Clear caches: <code>php artisan config:clear && php artisan cache:clear</code></li>";
echo "<li>If database connection fails, verify credentials and try '127.0.0.1' for DB_HOST.</li>";
echo "<li>Check error logs above for specific Laravel errors.</li>";
echo "<li>Ensure document root points to the <code>public</code> folder.</li>";
echo "<li>Delete this diagnostic file after troubleshooting for security.</li>";
echo "</ol>";
echo "</div>";

?>

<div class="section" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
    <h3>🔒 Security Notice</h3>
    <p><strong>DELETE THIS FILE after troubleshooting!</strong></p>
    <p>This diagnostic script exposes sensitive server information and should not be left on a production server.</p>
</div>

<div class="section" style="text-align: center; color: #6b7280;">
    <p>Generated: <?php echo date('Y-m-d H:i:s'); ?></p>
    <p>Taekwondo Management System - Deployment Diagnostics v1.0</p>
</div>

</body>
</html>
