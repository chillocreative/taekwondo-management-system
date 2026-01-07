<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$categories = \App\Models\StudentPayment::distinct()->pluck('kategori')->toArray();
$months = \App\Models\StudentPayment::distinct()->pluck('month')->toArray();

echo "Categories: " . implode(', ', $categories) . "\n";
echo "Months: " . implode(', ', $months) . "\n";
