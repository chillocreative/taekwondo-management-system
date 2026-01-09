<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$c = App\Models\Child::all();
foreach ($c as $child) {
    echo "Child ID: " . $child->id . " | Name: " . $child->name . " | Student ID: " . ($child->student_id ?: 'NULL') . "\n";
}
