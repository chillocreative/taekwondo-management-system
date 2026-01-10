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
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'month' => $payment->month,
                        'month_name' => $payment->getMonthNameAttribute(),
                        'year' => $payment->year,
                        'amount' => $payment->amount,
                        'is_paid' => $payment->is_paid,
                        'payment_date' => $payment->payment_date ? $payment->payment_date->format('d/m/Y') : null,
                        'receipt_number' => $payment->receipt_number,
                        'receipt_url' => $payment->is_paid ? route('fees.receipt', ['child' => $child->id, 'month' => $payment->month]) : null,
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
}
