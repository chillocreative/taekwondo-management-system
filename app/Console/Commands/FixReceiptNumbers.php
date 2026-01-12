<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonthlyPayment;
use App\Models\StudentPayment;

class FixReceiptNumbers extends Command
{
    protected $signature = 'fix:receipt-numbers';
    protected $description = 'Fix receipt numbers to use proper numeric format from StudentPayment';

    public function handle()
    {
        $this->info('Fixing receipt numbers...');
        
        // Fix MonthlyPayments that have alphanumeric receipt numbers (from payment_reference)
        $monthlyPayments = MonthlyPayment::where('is_paid', true)
            ->whereNotNull('payment_reference')
            ->get();
        
        $fixed = 0;
        
        foreach ($monthlyPayments as $mp) {
            // Check if receipt_number is alphanumeric (looks like a bill code)
            if ($mp->receipt_number && preg_match('/[A-Za-z]/', $mp->receipt_number)) {
                // Find the corresponding StudentPayment
                $child = $mp->child;
                if ($child && $child->student) {
                    $studentPayment = StudentPayment::where('student_id', $child->student->id)
                        ->where('transaction_ref', $mp->payment_reference)
                        ->whereNotNull('receipt_number')
                        ->first();
                    
                    if ($studentPayment && is_numeric($studentPayment->receipt_number)) {
                        $oldReceipt = $mp->receipt_number;
                        $mp->receipt_number = $studentPayment->receipt_number;
                        $mp->student_payment_id = $studentPayment->id;
                        $mp->save();
                        $fixed++;
                        $this->line("Fixed MP #{$mp->id}: {$oldReceipt} -> {$studentPayment->receipt_number}");
                    }
                }
            }
        }
        
        $this->info("Fixed {$fixed} monthly payment receipt numbers.");
        
        // Ensure all StudentPayments have proper numeric receipt numbers
        $studentPayments = StudentPayment::where('status', 'paid')
            ->whereNull('receipt_number')
            ->get();
        
        $generated = 0;
        foreach ($studentPayments as $sp) {
            $sp->receipt_number = str_pad($sp->id, 4, '0', STR_PAD_LEFT);
            $sp->save();
            $generated++;
            $this->line("Generated receipt for SP #{$sp->id}: {$sp->receipt_number}");
        }
        
        $this->info("Generated {$generated} missing receipt numbers.");
        
        return Command::SUCCESS;
    }
}
