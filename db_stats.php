<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Total Students: " . App\Models\Student::count() . "\n";
echo "Total Children: " . App\Models\Child::count() . "\n";
echo "Total Payments: " . App\Models\MonthlyPayment::count() . "\n";
echo "Students with no child:\n";
$students = App\Models\Student::doesntHave('child')->get();
foreach ($students as $s) {
    echo "ID: {$s->id} | Name: {$s->nama_pelajar}\n";
}
