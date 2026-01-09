<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;

$students = Student::all();
echo "Count: " . $students->count() . "\n";
foreach ($students->take(10) as $s) {
    echo $s->id . ": " . $s->nama_pelajar . "\n";
}
