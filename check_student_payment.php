<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$payments = App\Models\StudentPayment::where('student_id', 7)->get();
echo "Student 7 Payments count: " . $payments->count() . "\n";
foreach ($payments as $p) {
    echo "Month: {$p->month} | Amount: {$p->amount}\n";
}
