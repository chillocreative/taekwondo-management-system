<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class FeeController extends Controller
{
    /**
     * Display a listing of fees for the authenticated parent's children.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Eager load student and their payments
        $children = $user->children()->with(['student.payments'])->get();

        // Generate months for the year 2026 (as requested)
        $months = [];
        $malayMonths = [
            1 => 'JANUARI', 2 => 'FEBRUARI', 3 => 'MAC', 4 => 'APRIL', 
            5 => 'MEI', 6 => 'JUN', 7 => 'JULAI', 8 => 'OGOS', 
            9 => 'SEPTEMBER', 10 => 'OKTOBER', 11 => 'NOVEMBER', 12 => 'DISEMBER'
        ];

        // Let's generate for full year 2026
        for ($i = 1; $i <= 12; $i++) {
            $months[] = [
                'month_name' => $malayMonths[$i] . ' 2026',
                'month_date' => Carbon::create(2026, $i, 1),
            ];
        }

        $feesData = $children->map(function ($child) use ($months) {
            $fees = collect($months)->map(function ($monthItem) use ($child) {
                // Default status
                $status = 'Belum Dibayar';
                $canPay = false;
                $hasReceipt = false;
                $paymentTotal = 0;

                // Check if child has a linked student record
                if ($child->student) {
                    // Check for payment matching the month string
                    $payment = $child->student->payments->first(function ($p) use ($monthItem) {
                        return strtoupper($p->month) === $monthItem['month_name'];
                    });

                    if ($payment) {
                        $status = 'Telah Dibayar';
                        $hasReceipt = true;
                        $paymentTotal = $payment->total;
                    } else {
                        $canPay = true;
                        // Determine fee amount based on age/category?
                        // For now hardcode or get from student logic
                        $paymentTotal = $child->student->monthly_fee;
                    }
                } else {
                    $status = 'Tiada Rekod Pelajar';
                }

                return [
                    'month' => $monthItem['month_name'],
                    'status' => $status,
                    'can_pay' => $canPay,
                    'has_receipt' => $hasReceipt,
                    'amount' => $paymentTotal,
                ];
            });

            return [
                'id' => $child->id,
                'name' => $child->name,
                'fees' => $fees,
                'no_siri' => $child->student ? $child->student->no_siri : '-',
            ];
        });

        return Inertia::render('Fees/Index', [
            'feesData' => $feesData,
        ]);
    }

    /**
     * Handle payment (Placeholder).
     */
    public function pay(Request $request)
    {
        // Integration with ToyyibPay would go here
        return redirect()->back()->with('success', 'Redirecting to Payment Gateway...');
    }
}
