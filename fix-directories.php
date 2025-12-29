<?php
/**
 * Laravel Directory Fix Script
 * Upload this to your cPanel domain root and access via browser
 * This will create all missing Laravel directories
 */

header('Content-Type: text/html; charset=utf-8');

// Get the base path (one level up from public)
$basePath = dirname(__DIR__);

?>
<!DOCTYPE html>
<html>
<head>
    <title>Laravel Directory Fix</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
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
        .code {
            background: #1f2937;
            color: #10b981;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        ul { line-height: 1.8; }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
        }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Laravel Directory Fix</h1>
        <p>Automatically create missing Laravel directories</p>
    </div>

<?php

if (isset($_GET['fix'])) {
    echo "<div class='section'>";
    echo "<h2>🚀 Creating Missing Directories...</h2>";
    
    $directories = [
        'storage/framework/cache',
        'storage/framework/cache/data',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/framework/testing',
        'storage/logs',
        'storage/app',
        'storage/app/public',
        'bootstrap/cache',
    ];
    
    $created = [];
    $existed = [];
    $failed = [];
    
    foreach ($directories as $dir) {
        $fullPath = $basePath . '/' . $dir;
        
        if (file_exists($fullPath)) {
            $existed[] = $dir;
        } else {
            if (@mkdir($fullPath, 0755, true)) {
                $created[] = $dir;
                // Set permissions
                @chmod($fullPath, 0755);
            } else {
                $failed[] = $dir;
            }
        }
    }
    
    if (!empty($created)) {
        echo "<h3 class='success'>✓ Successfully Created:</h3>";
        echo "<ul>";
        foreach ($created as $dir) {
            echo "<li class='success'>{$dir}</li>";
        }
        echo "</ul>";
    }
    
    if (!empty($existed)) {
        echo "<h3 class='warning'>⚠ Already Existed:</h3>";
        echo "<ul>";
        foreach ($existed as $dir) {
            echo "<li class='warning'>{$dir}</li>";
        }
        echo "</ul>";
    }
    
    if (!empty($failed)) {
        echo "<h3 class='error'>✗ Failed to Create:</h3>";
        echo "<ul>";
        foreach ($failed as $dir) {
            echo "<li class='error'>{$dir}</li>";
        }
        echo "</ul>";
        echo "<p class='error'>You may need to create these manually via File Manager or contact your hosting provider.</p>";
    }
    
    // Now fix permissions
    echo "<h3>🔒 Setting Permissions...</h3>";
    
    $permDirs = [
        'storage',
        'bootstrap/cache',
    ];
    
    foreach ($permDirs as $dir) {
        $fullPath = $basePath . '/' . $dir;
        if (file_exists($fullPath)) {
            @chmod($fullPath, 0755);
            echo "<p class='success'>✓ Set permissions for {$dir}</p>";
        }
    }
    
    echo "<h3>🎉 Next Steps:</h3>";
    echo "<ol>";
    echo "<li>Clear Laravel caches via SSH or Terminal</li>";
    echo "<li>Delete this fix script (security)</li>";
    echo "<li>Test your application</li>";
    echo "</ol>";
    
    echo "<div class='code'>";
    echo "# Run these commands via SSH:\n";
    echo "cd " . $basePath . "\n";
    echo "php artisan config:clear\n";
    echo "php artisan cache:clear\n";
    echo "php artisan view:clear\n";
    echo "php artisan config:cache\n";
    echo "php artisan route:cache\n";
    echo "php artisan view:cache\n";
    echo "</div>";
    
    echo "<p><a href='?' class='btn'>← Back to Check</a></p>";
    echo "</div>";
    
} else {
    // Show current status
    echo "<div class='section'>";
    echo "<h2>📋 Current Status</h2>";
    
    $directories = [
        'storage/framework/cache' => 'Storage Framework Cache',
        'storage/framework/cache/data' => 'Storage Framework Cache Data',
        'storage/framework/sessions' => 'Storage Framework Sessions',
        'storage/framework/views' => 'Storage Framework Views',
        'storage/logs' => 'Storage Logs',
        'storage/app/public' => 'Storage App Public',
        'bootstrap/cache' => 'Bootstrap Cache',
    ];
    
    $missing = [];
    
    echo "<table style='width:100%; border-collapse: collapse;'>";
    echo "<tr style='background: #f9fafb;'>";
    echo "<th style='padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;'>Directory</th>";
    echo "<th style='padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;'>Status</th>";
    echo "</tr>";
    
    foreach ($directories as $dir => $label) {
        $fullPath = $basePath . '/' . $dir;
        $exists = file_exists($fullPath);
        
        if (!$exists) {
            $missing[] = $dir;
        }
        
        echo "<tr>";
        echo "<td style='padding: 12px; border-bottom: 1px solid #e5e7eb;'>{$label}<br><code style='font-size: 12px; color: #6b7280;'>{$dir}</code></td>";
        echo "<td style='padding: 12px; border-bottom: 1px solid #e5e7eb;'>";
        echo $exists ? "<span class='success'>✓ Exists</span>" : "<span class='error'>✗ Missing</span>";
        echo "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    echo "</div>";
    
    if (!empty($missing)) {
        echo "<div class='section' style='background: #fef3c7; border-left: 4px solid #f59e0b;'>";
        echo "<h3>⚠️ Missing Directories Detected</h3>";
        echo "<p><strong>" . count($missing) . " directories are missing.</strong> Click the button below to create them automatically.</p>";
        echo "<p><a href='?fix=1' class='btn' style='background: #f59e0b;'>🔧 Fix Missing Directories</a></p>";
        echo "</div>";
    } else {
        echo "<div class='section' style='background: #dcfce7; border-left: 4px solid #22c55e;'>";
        echo "<h3>✅ All Directories Exist!</h3>";
        echo "<p>All required Laravel directories are present. If you're still experiencing issues, try clearing caches.</p>";
        echo "<div class='code'>";
        echo "# Run via SSH:\n";
        echo "php artisan config:clear\n";
        echo "php artisan cache:clear\n";
        echo "php artisan view:clear\n";
        echo "</div>";
        echo "</div>";
    }
}

?>

<div class="section" style="background: #fee2e2; border-left: 4px solid #ef4444;">
    <h3>🔒 Security Notice</h3>
    <p><strong>DELETE THIS FILE after fixing!</strong></p>
    <p>This script should not remain on your production server.</p>
</div>

<div class="section" style="text-align: center; color: #6b7280;">
    <p>Laravel Directory Fix Script v1.0</p>
    <p>Generated: <?php echo date('Y-m-d H:i:s'); ?></p>
</div>

</body>
</html>
