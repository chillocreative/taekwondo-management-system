<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$settings = App\Models\FeeSetting::first();
if ($settings) {
    $settings->monthly_fee_below_18 = 40.00;
    $settings->save();
    echo "Updated setting ID 1 to 40.00\n";
    $settings->syncWithExistingRecords();
    echo "Synced records.\n";
}
