<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Student;
use App\Models\Child;
use App\Models\MonthlyPayment;

$student = Student::find(14);
if (!$student) {
    echo "Student 14 not found\n";
    exit;
}

echo "Student: " . $student->nama_pelajar . " (ID: " . $student->id . ")\n";
echo "Kategori: " . $student->kategori . "\n";

$child = $student->child;
if ($child) {
    echo "Child Name: " . $child->name . " (ID: " . $child->id . ")\n";
    echo "DOB: " . ($child->date_of_birth ? $child->date_of_birth->format('Y-m-d') : 'NULL') . "\n";
    echo "Monthly Payments for 2026:\n";
    foreach ($child->monthlyPayments()->where('year', 2026)->get() as $mp) {
        echo " - Month " . $mp->month . ": Amount RM " . $mp->amount . " | Paid: " . ($mp->is_paid ? 'Yes' : 'No') . "\n";
    }
} else {
    echo "No child record found for student 14\n";
}
