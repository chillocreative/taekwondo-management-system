<?php

/**
 * Emergency Cache Clearer
 * Upload this to your public directory and visit it in your browser.
 * Example: https://yuran.taekwondoanz.com/emergency-fix.php
 */

define('LARAVEL_START', microtime(true));

// Path to your bootstrap directory
$bootstrapDir = __DIR__ . '/../bootstrap/cache';

// If running from public directory
if (!is_dir($bootstrapDir)) {
    $bootstrapDir = __DIR__ . '/bootstrap/cache';
}

echo "<h1>Laravel Emergency Cache Fix</h1>";

$files = [
    'config.php',
    'packages.php',
    'services.php',
    'events.php',
    'routes-v7.php'
];

echo "<ul>";
foreach ($files as $file) {
    $path = $bootstrapDir . '/' . $file;
    if (file_exists($path)) {
        if (unlink($path)) {
            echo "<li>Successfully deleted: $file</li>";
        } else {
            echo "<li style='color:red'>Failed to delete: $file (Check permissions)</li>";
        }
    } else {
        echo "<li>File not found: $file (Already clear)</li>";
    }
}
echo "</ul>";

echo "<p><strong>Try refreshing your site now.</strong></p>";
echo "<p><em>Remember to delete this file after use for security!</em></p>";
