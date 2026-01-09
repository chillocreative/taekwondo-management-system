<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach ([55, 56] as $id) {
    $s = App\Models\Student::with('child.trainingCenter')->find($id);
    if ($s && $s->child) {
        $tc = $s->child->trainingCenter;
        echo "Student $id ({$s->nama_pelajar}): " . ($tc ? $tc->name : 'No Training Center') . "\n";
    }
}
