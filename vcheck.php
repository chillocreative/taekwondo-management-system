<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$children = DB::table('children')->get();
echo "Total children in DB: " . $children->count() . "\n";
foreach ($children as $c) {
    echo "ID: {$c->id} | Name: {$c->name} | Student ID: " . ($c->student_id ?: 'NULL') . "\n";
}

$mps = DB::table('monthly_payments')->get();
echo "\nTotal monthly payments in DB: " . $mps->count() . "\n";
$child_ids = $mps->pluck('child_id')->unique();
echo "Unique child IDs in payments: " . implode(', ', $child_ids->toArray()) . "\n";
