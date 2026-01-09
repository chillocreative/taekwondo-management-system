<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\FeeSetting;
use App\Models\MonthlyPayment;
use App\Models\Child;
use App\Models\Student;

$settings = FeeSetting::current();
$below18Fee = $settings->monthly_fee_below_18;
$above18Fee = $settings->monthly_fee_above_18;

echo "Target Fees: Below 18 = RM $below18Fee, Above 18 = RM $above18Fee\n";

$allChildren = Child::with(['trainingCenter', 'student'])->get();
$updateCount = 0;

foreach ($allChildren as $child) {
    $isSpecial = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
    
    if ($isSpecial) {
        $targetAmount = 0;
    } else {
        // Try to get category from student record first, then fallback to age
        $category = null;
        if ($child->student) {
            $category = $child->student->kategori;
        }
        
        if (!$category) {
            $age = $child->date_of_birth ? $child->date_of_birth->age : 0;
            $category = $age < 18 ? 'kanak-kanak' : 'dewasa';
        }
        
        $targetAmount = ($category === 'kanak-kanak') ? $below18Fee : $above18Fee;
    }

    // Update all 2026 monthly payments for this child
    $updated = MonthlyPayment::where('child_id', $child->id)
        ->where('year', 2026)
        ->update(['amount' => $targetAmount]);
    
    if ($updated > 0) {
        $updateCount += $updated;
        echo "Updated $updated months for child ID {$child->id} ({$child->name}) to RM $targetAmount\n";
    }
}

echo "\nTotal records updated: $updateCount\n";
