<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FeeSetting;

$settings = FeeSetting::current();
echo "Syncing fees for setting: " . $settings->id . "\n";
$settings->syncWithExistingRecords();
echo "Sync complete.\n";
