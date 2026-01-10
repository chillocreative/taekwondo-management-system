<?php

namespace App\Console\Commands;

use App\Models\Child;
use App\Models\StudentPayment;
use App\Models\FeeSetting;
use Illuminate\Console\Command;
use Carbon\Carbon;

class BackfillRegistrationPayments extends Command
{
    protected $signature = 'payments:backfill-registrations';
    protected $description = 'Backfill StudentPayment records for existing paid registrations';

    public function handle()
    {
        $this->info('Starting backfill of registration payments...');

        $feeSettings = FeeSetting::current();
        $paidChildren = Child::where('payment_completed', true)
            ->whereNotNull('payment_date')
            ->with('student')
            ->get();

        $created = 0;

        foreach ($paidChildren as $child) {
            if (!$child->student) {
                $this->warn("Skipping child {$child->id} - no student record");
                continue;
            }

            // Check if StudentPayment already exists for this registration
            $paymentDate = $child->payment_date instanceof Carbon ? $child->payment_date : Carbon::parse($child->payment_date);
            $monthStr = \App\Models\MonthlyPayment::getMalayName($paymentDate->month) . ' ' . $paymentDate->year;

            $existingPayment = StudentPayment::where('student_id', $child->student->id)
                ->where('month', $monthStr)
                ->where('status', 'paid')
                ->first();

            if ($existingPayment) {
                $this->line("Payment already exists for {$child->name} ({$monthStr})");
                continue;
            }

            // Calculate fees
            if ($child->date_of_birth) {
                $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
                $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            } else {
                $yearlyFee = $feeSettings->yearly_fee_below_18;
                $monthlyFee = $feeSettings->monthly_fee_below_18;
            }
            $totalAmount = $yearlyFee + $monthlyFee;

            // Create payment record
            $payment = StudentPayment::create([
                'student_id' => $child->student->id,
                'month' => $monthStr,
                'kategori' => $child->student->kategori ?? 'kanak-kanak',
                'quantity' => 1,
                'amount' => $totalAmount,
                'total' => $totalAmount,
                'receipt_number' => 'REC-' . $paymentDate->format('ym') . '-' . str_pad($child->student->id, 4, '0', STR_PAD_LEFT),
                'transaction_ref' => $child->payment_reference ?? 'REGBACKFILL-' . $child->id,
                'payment_method' => $child->payment_method ?? 'online',
                'status' => 'paid',
                'payment_date' => $paymentDate,
            ]);

            $this->info("Created payment record for {$child->name} - {$payment->receipt_number}");
            $created++;
        }

        $this->info("Backfill complete! Created {$created} payment records.");

        return Command::SUCCESS;
    }
}
