<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = DB::table('students')->find(7);
file_put_contents('student_7.txt', print_r($s, true));

$c = DB::table('children')->where('student_id', 7)->first();
file_put_contents('child_student_7.txt', print_r($c, true));
