<?php
/**
 * Permission Fix Script
 * Upload to your cPanel domain root and access via browser
 * This will fix file permissions for Laravel
 */

header('Content-Type: text/html; charset=utf-8');
$basePath = dirname(__DIR__);

?>
<!DOCTYPE html>
<html>
<head>
    <title>Fix Permissions</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #22c55e; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Fix File Permissions</h1>
        <p>Laravel Permission Repair Tool</p>
    </div>

<?php

if (isset($_GET['fix'])) {
    echo "<div class='section'>";
    echo "<h2>🚀 Fixing Permissions...</h2>";
    
    $directories = [
        'vendor',
        'storage',
        'storage/framework',
        'storage/framework/cache',
        'storage/framework/sessions',
        'storage/framework/views',
        'storage/logs',
        'bootstrap/cache',
    ];
    
    echo "<h3>Setting Directory Permissions to 755...</h3>";
    foreach ($directories as $dir) {
        $fullPath = $basePath . '/' . $dir;
        if (file_exists($fullPath)) {
            if (@chmod($fullPath, 0755)) {
                echo "<p class='success'>✓ {$dir}</p>";
            } else {
                echo "<p class='error'>✗ Failed: {$dir}</p>";
            }
        } else {
            echo "<p class='error'>✗ Not found: {$dir}</p>";
        }
    }
    
    echo "<h3>✅ Done!</h3>";
    echo "<p>Permissions have been updated. Try accessing your site now.</p>";
    echo "<p><strong>Note:</strong> For complete fix, run via SSH:</p>";
    echo "<pre>chmod -R 755 vendor storage bootstrap/cache</pre>";
    echo "<p><a href='/' class='btn'>Test Your Site</a></p>";
    echo "</div>";
    
} else {
    echo "<div class='section'>";
    echo "<h2>⚠️ Permission Issue Detected</h2>";
    echo "<p>Your error log shows: <code>Permission denied</code> on vendor files.</p>";
    echo "<p>This script will fix the permissions on critical directories.</p>";
    echo "<p><a href='?fix=1' class='btn'>Fix Permissions Now</a></p>";
    echo "</div>";
    
    echo "<div class='section'>";
    echo "<h3>Manual Fix (Recommended)</h3>";
    echo "<p><strong>Via cPanel File Manager:</strong></p>";
    echo "<ol>";
    echo "<li>Navigate to your app root</li>";
    echo "<li>Right-click <code>vendor</code> folder</li>";
    echo "<li>Change Permissions → 755</li>";
    echo "<li><strong>CHECK: Recurse into subdirectories</strong></li>";
    echo "<li>Click Change Permissions</li>";
    echo "<li>Repeat for <code>storage</code> and <code>bootstrap/cache</code></li>";
    echo "</ol>";
    echo "</div>";
}

?>

<div class="section" style="background: #fee2e2; border-left: 4px solid #ef4444;">
    <h3>🔒 Security Notice</h3>
    <p><strong>DELETE THIS FILE after fixing!</strong></p>
</div>

</body>
</html>
