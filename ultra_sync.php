<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FeeSetting;
use App\Models\MonthlyPayment;
use App\Models\Child;
use App\Models\Student;
use App\Models\User;

$settings = FeeSetting::current();
// Force correct values just in case
$settings->monthly_fee_below_18 = 40.00;
$settings->monthly_fee_above_18 = 50.00;
$settings->save();

echo "Confirmed Settings: Below 18 = 40, Above 18 = 50\n";

$students = Student::all();
echo "Processing " . $students->count() . " students...\n";

foreach ($students as $student) {
    // 1. Ensure child record exists
    $child = $student->child;
    if (!$child) {
        echo "Creating child for student ID {$student->id} ({$student->nama_pelajar})...\n";
        // Create dummy parent if not exists
        $parent = User::where('role', 'user')->first();
        
        $child = Child::create([
            'student_id' => $student->id,
            'name' => $student->nama_pelajar,
            'parent_id' => $parent ? $parent->id : 1, // Fallback to ID 1 admin if no user
            'is_active' => true,
            'payment_completed' => true,
            'registration_fee' => 100.00,
        ]);
    }

    // 2. Determine target monthly fee
    $isSpecial = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
    if ($isSpecial) {
        $targetAmount = 0;
    } else {
        $targetAmount = ($student->kategori === 'kanak-kanak') ? 40.00 : 50.00;
    }

    // 3. Generate or Sync 2026 payments
    for ($month = 1; $month <= 12; $month++) {
        $dueDate = \Carbon\Carbon::create(2026, $month, 1)->endOfMonth();
        
        $mp = MonthlyPayment::updateOrCreate(
            [
                'child_id' => $child->id,
                'year' => 2026,
                'month' => $month,
            ],
            [
                'amount' => $targetAmount,
                'due_date' => $dueDate,
            ]
        );
    }
}

echo "Sync complete for all students.\n";
