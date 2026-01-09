<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$name = 'abaya';
$c = App\Models\Child::where('name', 'LIKE', "%$name%")->get();
echo "Found " . $c->count() . " children matching $name\n";
foreach ($c as $child) {
    echo "ID: {$child->id} | Name: {$child->name} | Student ID: " . ($child->student_id ?: 'NULL') . "\n";
    $mps = $child->monthlyPayments()->where('year', 2026)->get();
    echo "  - 2026 Payments: " . $mps->count() . "\n";
    if ($mps->count() > 0) {
        echo "  - Sample Amount: RM " . $mps->first()->amount . "\n";
    }
}
