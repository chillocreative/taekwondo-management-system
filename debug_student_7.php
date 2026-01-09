<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = App\Models\Student::with('child.monthlyPayments')->find(7);
if ($s) {
    echo "Student ID: " . $s->id . "\n";
    echo "Name: " . $s->nama_pelajar . "\n";
    echo "Category: " . $s->kategori . "\n";
    if ($s->child) {
        echo "Child ID: " . $s->child->id . "\n";
        echo "Payments for 2026: " . $s->child->monthlyPayments()->where('year', 2026)->count() . "\n";
        $first = $s->child->monthlyPayments()->where('year', 2026)->first();
        if ($first) {
            echo "First month amount: RM " . $first->amount . "\n";
        }
    } else {
        echo "No child record\n";
    }
} else {
    echo "Student 7 not found\n";
}
