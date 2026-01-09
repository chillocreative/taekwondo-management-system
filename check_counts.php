<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;

echo "Total Students: " . Student::count() . "\n";
echo "Active Paid Students: " . Student::whereHas('child', function($q) {
    $q->where('payment_completed', true)
      ->where('is_active', true);
})->count() . "\n";
