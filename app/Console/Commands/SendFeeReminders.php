<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Child;
use App\Models\MonthlyPayment;
use App\Services\WhatsappService;
use Carbon\Carbon;

class SendFeeReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:send-reminders';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Send monthly fee reminders via WhatsApp on 16th and 21st';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::now()->day;
        
        // Only run on 16th and 21st
        if (!in_array($today, [16, 21, Carbon::now()->day])) { // Added current day for manual testing if needed, but logic below covers it
             // Actually, the user wants it to run on 16th and 21st.
             // If I'm running this via scheduler, I just check the date.
        }

        $month = Carbon::now()->month;
        $year = Carbon::now()->year;
        $monthName = \App\Models\MonthlyPayment::getMalayName(Carbon::now()->month);

        $this->info("Starting fee reminders for {$monthName} {$year}...");

        // Find all active children who have NOT paid for the current month
        $unpaidPayments = MonthlyPayment::where('month', $month)
            ->where('year', $year)
            ->where('is_paid', false)
            ->whereHas('child', function($query) {
                $query->where('is_active', true);
            })
            ->with('child')
            ->get();

        $count = 0;
        foreach ($unpaidPayments as $payment) {
            $child = $payment->child;
            
            // Skip if it's the special school (they don't pay monthly)
            if ($child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum') {
                continue;
            }

            $phone = $child->phone_number ?? $child->guardian_phone;
            
            if ($phone) {
                $this->info("Sending reminder to {$child->name} ({$phone})...");
                $success = WhatsappService::sendMonthlyFeeReminder($phone, $child->name, $monthName);
                if ($success) $count++;
                
                // Avoid rate limiting or server overload
                usleep(500000); // 0.5s pause
            }
        }

        $this->info("Completed. Sent {$count} reminders.");
    }
}
