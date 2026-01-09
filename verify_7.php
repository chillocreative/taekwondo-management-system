<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = App\Models\Student::with('child.monthlyPayments')->find(7);
if ($s && $s->child) {
    echo "Student: " . $s->nama_pelajar . " | Category: " . $s->kategori . "\n";
    $first = $s->child->monthlyPayments()->where('year', 2026)->first();
    echo "Payment Amount: RM " . ($first ? $first->amount : 'NONE') . "\n";
}
