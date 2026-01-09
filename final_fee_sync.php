<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\MonthlyPayment;
use App\Models\FeeSetting;

$settings = FeeSetting::current();
$below18Fee = $settings->monthly_fee_below_18;
$above18Fee = $settings->monthly_fee_above_18;

echo "Target Fees: Below18=$below18Fee, Above18=$above18Fee\n";

$mps = MonthlyPayment::with('child')->where('year', 2026)->get();
$updateCount = 0;

foreach ($mps as $mp) {
    if (!$mp->child) continue;
    
    $isSpecial = $mp->child->trainingCenter && $mp->child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
    
    if ($isSpecial) {
        $target = 0;
    } else {
        $age = $mp->child->date_of_birth ? $mp->child->date_of_birth->age : 0;
        $target = $age < 18 ? $below18Fee : $above18Fee;
    }
    
    if ($mp->amount != $target) {
        $mp->amount = $target;
        $mp->save();
        $updateCount++;
    }
}

echo "Updated $updateCount monthly payment records to match current settings.\n";
