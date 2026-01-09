<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (App\Models\FeeSetting::all() as $s) {
    echo "ID: $s->id | Monthly Below 18: $s->monthly_fee_below_18 | Monthly Above 18: $s->monthly_fee_above_18\n";
}
