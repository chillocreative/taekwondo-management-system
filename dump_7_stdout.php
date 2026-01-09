<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = DB::table('students')->find(7);
echo "STUDENT 7:\n";
print_r($s);

$c = DB::table('children')->where('student_id', 7)->first();
echo "\nCHILD LINKED TO 7:\n";
print_r($c);

if ($c) {
    $mp = DB::table('monthly_payments')->where('child_id', $c->id)->where('year', 2026)->get();
    echo "\nPAYMENTS FOR CHILD {$c->id}:\n";
    foreach ($mp as $p) {
        echo "Month {$p->month}: RM {$p->amount}\n";
    }
}
