<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ids = DB::table('monthly_payments')->distinct()->pluck('child_id');
echo "Child IDs in payments: " . implode(', ', $ids->toArray()) . "\n";
foreach ($ids as $id) {
    $c = App\Models\Child::find($id);
    if ($c) {
        $first = DB::table('monthly_payments')->where('child_id', $id)->where('year', 2026)->first();
        echo "Child ID: $id | Name: {$c->name} | 2026 Fee: " . ($first ? $first->amount : 'N/A') . "\n";
    } else {
        echo "Child ID: $id | MISSING CHILD RECORD\n";
    }
}
