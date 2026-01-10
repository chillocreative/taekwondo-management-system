<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\MonthlyPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnualStatementController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Get all children for this parent
        $children = Child::where('parent_id', $user->id)
            ->where('payment_completed', true)
            ->with(['trainingCenter', 'student'])
            ->get();

        // Get selected child ID from request or use first child
        $selectedChildId = $request->get('child_id');
        if (!$selectedChildId && $children->count() > 0) {
            $selectedChildId = $children->first()->id;
        }

        // Format children data with monthly payments
        $formattedChildren = $children->map(function ($child) {
            $monthlyPayments = MonthlyPayment::where('child_id', $child->id)
                ->where('year', now()->year)
                ->orderBy('month')
                ->get()
                ->map(function ($payment) use ($child) {
                    return [
                        'id' => $payment->id,
                        'month' => $payment->month,
                        'month_name' => $payment->getMonthNameAttribute(),
                        'year' => $payment->year,
                        'amount' => $payment->amount,
                        'is_paid' => $payment->is_paid,
                        'payment_date' => $payment->payment_date ? $payment->payment_date->format('d/m/Y') : null,
                        'receipt_number' => $payment->receipt_number,
                        'receipt_url' => $payment->is_paid ? $this->getReceiptUrl($child, $payment) : null,
                    ];
                });

            return [
                'id' => $child->id,
                'name' => $child->name,
                'no_siri' => $child->student->no_siri ?? '-',
                'training_center' => [
                    'name' => $child->trainingCenter->name ?? '-',
                ],
                'monthly_payments' => $monthlyPayments,
            ];
        });

        return Inertia::render('AnnualStatement/Index', [
            'children' => $formattedChildren,
            'selectedChildId' => $selectedChildId,
        ]);
    }

    private function getReceiptUrl($child, $monthlyPayment)
    {
        // 1. Check if there's a specific StudentPayment record for this month
        if ($child->student) {
            $monthStr = $monthlyPayment->month_name . ' ' . $monthlyPayment->year;
            $sp = \App\Models\StudentPayment::where('student_id', $child->student->id)
                ->where('month', $monthStr)
                ->where('status', 'paid')
                ->first();

            if ($sp) {
                return route('receipts.stream', $sp->id);
            }
        }

        // 2. Fallback to children.payment.receipt (Registration Receipt)
        // If this month was paid as part of the initial registration
        return route('children.payment.receipt', $child->id);
    }
}
