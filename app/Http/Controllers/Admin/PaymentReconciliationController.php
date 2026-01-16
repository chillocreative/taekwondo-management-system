<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\StudentPayment;
use App\Models\MonthlyPayment;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentReconciliationController extends Controller
{
    /**
     * Display the payment reconciliation page
     */
    public function index()
    {
        // Get all children with payment_reference (billCode) that are NOT paid
        $pendingPayments = Child::whereNotNull('payment_reference')
            ->where(function ($query) {
                $query->where('payment_completed', false)
                    ->orWhereNull('payment_completed');
            })
            ->with(['parent', 'trainingCenter', 'student'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'parent_name' => $child->parent->name ?? '-',
                    'parent_phone' => $child->parent->phone_number ?? '-',
                    'training_center' => $child->trainingCenter->name ?? '-',
                    'payment_reference' => $child->payment_reference,
                    'payment_completed' => $child->payment_completed,
                    'payment_date' => $child->payment_date?->format('d/m/Y H:i'),
                    'registration_fee' => $child->registration_fee,
                    'created_at' => $child->created_at->format('d/m/Y H:i'),
                    'no_siri' => $child->student->no_siri ?? '-',
                ];
            });

        // Get all children who paid but might need verification
        $paidPayments = Child::where('payment_completed', true)
            ->whereNotNull('payment_reference')
            ->with(['parent', 'trainingCenter', 'student'])
            ->orderBy('payment_date', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'parent_name' => $child->parent->name ?? '-',
                    'parent_phone' => $child->parent->phone_number ?? '-',
                    'training_center' => $child->trainingCenter->name ?? '-',
                    'payment_reference' => $child->payment_reference,
                    'payment_completed' => $child->payment_completed,
                    'payment_date' => $child->payment_date?->format('d/m/Y H:i'),
                    'registration_fee' => $child->registration_fee,
                    'no_siri' => $child->student->no_siri ?? '-',
                ];
            });

        return Inertia::render('Admin/PaymentReconciliation', [
            'pendingPayments' => $pendingPayments,
            'paidPayments' => $paidPayments,
            'stats' => [
                'total_pending' => $pendingPayments->count(),
                'total_paid' => $paidPayments->count(),
            ]
        ]);
    }

    /**
     * Check payment status from ToyyibPay API
     */
    public function checkStatus(Request $request)
    {
        $childId = $request->input('child_id');
        $child = Child::with(['parent', 'trainingCenter', 'student'])->find($childId);

        if (!$child) {
            return response()->json(['error' => 'Child not found'], 404);
        }

        if (!$child->payment_reference) {
            return response()->json(['error' => 'No payment reference found'], 400);
        }

        $toyyibPay = new ToyyibPayService();
        $transactions = $toyyibPay->getBillTransactions($child->payment_reference);

        $result = [
            'child_id' => $child->id,
            'child_name' => $child->name,
            'payment_reference' => $child->payment_reference,
            'current_status' => $child->payment_completed ? 'Paid' : 'Pending',
            'toyyibpay_status' => null,
            'toyyibpay_transaction' => null,
            'needs_update' => false,
        ];

        if ($transactions && count($transactions) > 0) {
            $transaction = $transactions[0];
            $isPaid = ($transaction['billpaymentStatus'] ?? '') == '1';
            
            $result['toyyibpay_status'] = $isPaid ? 'Paid' : 'Pending';
            $result['toyyibpay_transaction'] = [
                'status' => $transaction['billpaymentStatus'] ?? null,
                'amount' => $transaction['billpaymentAmount'] ?? null,
                'invoice' => $transaction['billpaymentInvoiceNo'] ?? null,
                'date' => $transaction['billPaymentDate'] ?? null,
            ];

            // Check if status mismatch
            if ($isPaid && !$child->payment_completed) {
                $result['needs_update'] = true;
            }
        } else {
            $result['toyyibpay_status'] = 'No transactions found';
        }

        return response()->json($result);
    }

    /**
     * Fix a single payment status
     */
    public function fixStatus(Request $request)
    {
        $childId = $request->input('child_id');
        $child = Child::with(['parent', 'trainingCenter'])->find($childId);

        if (!$child) {
            return response()->json(['error' => 'Child not found'], 404);
        }

        // Verify with ToyyibPay first
        $toyyibPay = new ToyyibPayService();
        $transactions = $toyyibPay->getBillTransactions($child->payment_reference);

        if (!$transactions || count($transactions) === 0) {
            return response()->json(['error' => 'Cannot verify payment with ToyyibPay'], 400);
        }

        $transaction = $transactions[0];
        $isPaid = ($transaction['billpaymentStatus'] ?? '') == '1';

        if (!$isPaid) {
            return response()->json(['error' => 'Payment not approved in ToyyibPay'], 400);
        }

        Log::info('Payment Reconciliation: Fixing status for ' . $child->name, [
            'child_id' => $child->id,
            'payment_reference' => $child->payment_reference,
            'toyyibpay_invoice' => $transaction['billpaymentInvoiceNo'] ?? null,
        ]);

        // Process the payment (similar to callback logic)
        try {
            // Update child record
            $child->update([
                'payment_completed' => true,
                'payment_method' => 'online',
                'payment_date' => now(),
                'is_active' => true,
            ]);

            // Create/Sync Student Record
            $studentService = new \App\Services\StudentService();
            $studentService->syncChildToStudent($child);
            
            $child->refresh();

            // Create StudentPayment record
            if ($child->student) {
                $this->createPaymentRecord($child);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully for ' . $child->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment Reconciliation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Manual fix payment status (for cases with proof but API returns no data)
     */
    public function manualFix(Request $request)
    {
        $childId = $request->input('child_id');
        $child = Child::with(['parent', 'trainingCenter'])->find($childId);

        if (!$child) {
            return response()->json(['error' => 'Child not found'], 404);
        }

        Log::info('Payment Reconciliation: MANUAL FIX for ' . $child->name, [
            'child_id' => $child->id,
            'payment_reference' => $child->payment_reference,
            'admin' => auth()->user()->name,
        ]);

        try {
            // Update child record
            $child->update([
                'payment_completed' => true,
                'payment_method' => 'online',
                'payment_date' => now(),
                'is_active' => true,
            ]);

            // Create/Sync Student Record
            $studentService = new \App\Services\StudentService();
            $studentService->syncChildToStudent($child);
            
            $child->refresh();

            // Create StudentPayment record
            if ($child->student) {
                $this->createPaymentRecord($child);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment status manually updated for ' . $child->name,
            ]);
        } catch (\Exception $e) {
            Log::error('Payment Reconciliation Manual Fix Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Bulk check and fix all pending payments
     */
    public function bulkReconcile()
    {
        $results = [
            'checked' => 0,
            'fixed' => 0,
            'errors' => [],
            'details' => [],
        ];

        $toyyibPay = new ToyyibPayService();

        // Get all pending payments with payment reference
        $pendingChildren = Child::whereNotNull('payment_reference')
            ->where(function ($query) {
                $query->where('payment_completed', false)
                    ->orWhereNull('payment_completed');
            })
            ->with(['parent', 'trainingCenter'])
            ->get();

        foreach ($pendingChildren as $child) {
            $results['checked']++;

            try {
                $transactions = $toyyibPay->getBillTransactions($child->payment_reference);

                if (!$transactions || count($transactions) === 0) {
                    $results['details'][] = [
                        'child' => $child->name,
                        'status' => 'No transactions',
                        'action' => 'Skipped'
                    ];
                    continue;
                }

                $transaction = $transactions[0];
                $isPaid = ($transaction['billpaymentStatus'] ?? '') == '1';

                if ($isPaid) {
                    // Fix this payment
                    $child->update([
                        'payment_completed' => true,
                        'payment_method' => 'online',
                        'payment_date' => now(),
                        'is_active' => true,
                    ]);

                    $studentService = new \App\Services\StudentService();
                    $studentService->syncChildToStudent($child);
                    $child->refresh();

                    if ($child->student) {
                        $this->createPaymentRecord($child);
                    }

                    $results['fixed']++;
                    $results['details'][] = [
                        'child' => $child->name,
                        'payment_reference' => $child->payment_reference,
                        'status' => 'Paid',
                        'action' => 'Fixed'
                    ];

                    Log::info('Payment Reconciliation: Fixed ' . $child->name);
                } else {
                    $results['details'][] = [
                        'child' => $child->name,
                        'status' => 'Still pending',
                        'action' => 'Skipped'
                    ];
                }
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'child' => $child->name,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json($results);
    }

    /**
     * Create payment record for a child
     */
    private function createPaymentRecord(Child $child)
    {
        $currentMonth = MonthlyPayment::getMalayName(now()->month) . ' ' . now()->year;
        
        // Check if payment already exists
        $existingPayment = StudentPayment::where('student_id', $child->student->id)
            ->where('transaction_ref', $child->payment_reference)
            ->first();

        if ($existingPayment) {
            // Update status to paid if not already
            if ($existingPayment->status !== 'paid') {
                $existingPayment->update(['status' => 'paid', 'payment_date' => now()]);
            }
            return $existingPayment;
        }

        // Calculate fees
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->getRenewalFeeByBelt($child->belt_level);
            } else {
                $mainFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            }
        } else {
            $monthlyFee = $feeSettings->monthly_fee_below_18;
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->renewal_fee_gup;
            } else {
                $mainFee = $feeSettings->yearly_fee_below_18;
            }
        }

        $isSpecialCenter = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
        
        $outstandingAmount = (float) MonthlyPayment::where('child_id', $child->id)
            ->where('year', '<', now()->year)
            ->where('is_paid', false)
            ->sum('amount');

        if ($isSpecialCenter) {
            $monthlyFee = 0;
            $outstandingAmount = 0;
            $totalAmount = $mainFee;
        } else {
            $totalAmount = $mainFee + $monthlyFee + $outstandingAmount;
        }

        // Create payment record
        $payment = StudentPayment::create([
            'student_id' => $child->student->id,
            'month' => $currentMonth,
            'kategori' => $child->student->kategori ?? 'kanak-kanak',
            'quantity' => 1,
            'amount' => $totalAmount,
            'total' => $totalAmount,
            'receipt_number' => null,
            'transaction_ref' => $child->payment_reference,
            'payment_method' => 'online',
            'status' => 'paid',
            'payment_date' => now(),
        ]);

        $payment->receipt_number = str_pad($payment->id, 4, '0', STR_PAD_LEFT);
        $payment->save();

        // Update monthly payment record
        $currentMonthNum = now()->month;
        $currentYear = now()->year;
        $monthlyPayment = MonthlyPayment::where('child_id', $child->id)
            ->where('month', $currentMonthNum)
            ->where('year', $currentYear)
            ->first();

        if ($monthlyPayment && !$monthlyPayment->is_paid) {
            $monthlyPayment->update([
                'is_paid' => true,
                'paid_date' => now(),
                'payment_method' => 'online',
                'payment_reference' => $child->payment_reference,
                'receipt_number' => $payment->receipt_number,
                'student_payment_id' => $payment->id,
            ]);
        }

        // Settle Outstanding Fees
        MonthlyPayment::where('child_id', $child->id)
            ->where('year', '<', $currentYear)
            ->where('is_paid', false)
            ->update([
                'is_paid' => true,
                'paid_date' => now(),
                'payment_method' => 'online',
                'payment_reference' => $child->payment_reference,
                'receipt_number' => $payment->receipt_number,
                'student_payment_id' => $payment->id,
            ]);

        return $payment;
    }

    /**
     * Sync receipt numbers from StudentPayment to MonthlyPayment
     */
    public function syncReceiptNumbers()
    {
        $results = [
            'checked' => 0,
            'fixed' => 0,
            'details' => [],
        ];

        // Get all paid MonthlyPayments without receipt number OR with bill code in receipt_number
        $monthlyPayments = MonthlyPayment::where('is_paid', true)
            ->where(function($q) {
                $q->whereNull('receipt_number')
                  ->orWhere('receipt_number', '')
                  ->orWhere('receipt_number', '-')
                  // Also fix records where receipt_number looks like a bill code (8 chars alphanumeric)
                  ->orWhere(function($q2) {
                      $q2->whereRaw('LENGTH(receipt_number) = 8')
                         ->whereRaw('receipt_number REGEXP \'^[a-z0-9]{8}$\'');
                  });
            })
            ->with(['child.student'])
            ->get();

        foreach ($monthlyPayments as $mp) {
            $results['checked']++;
            
            if (!$mp->child || !$mp->child->student) {
                $results['details'][] = [
                    'child_id' => $mp->child_id,
                    'month' => MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year,
                    'status' => 'No student linked',
                    'action' => 'Skipped'
                ];
                continue;
            }

            $receiptNumber = null;
            $studentPaymentId = null;

            // Try to find StudentPayment by payment_reference
            if ($mp->payment_reference) {
                $sp = StudentPayment::where('transaction_ref', $mp->payment_reference)->first();
                if ($sp && $sp->receipt_number) {
                    $receiptNumber = $sp->receipt_number;
                    $studentPaymentId = $sp->id;
                }
            }

            // Try by student_id and month
            if (!$receiptNumber) {
                $monthStr = MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year;
                $sp = StudentPayment::where('student_id', $mp->child->student->id)
                    ->where('month', $monthStr)
                    ->where('status', 'paid')
                    ->first();
                if ($sp && $sp->receipt_number) {
                    $receiptNumber = $sp->receipt_number;
                    $studentPaymentId = $sp->id;
                }
            }

            // Try by child's registration payment
            if (!$receiptNumber && $mp->child->payment_reference) {
                $sp = StudentPayment::where('transaction_ref', $mp->child->payment_reference)->first();
                if ($sp && $sp->receipt_number) {
                    // Only use this if it matches the registration month
                    if ($mp->child->payment_date) {
                        $paymentMonth = $mp->child->payment_date->month;
                        $paymentYear = $mp->child->payment_date->year;
                        if ($mp->month == $paymentMonth && $mp->year == $paymentYear) {
                            $receiptNumber = $sp->receipt_number;
                            $studentPaymentId = $sp->id;
                        }
                    }
                }
            }

            if ($receiptNumber) {
                $mp->update([
                    'receipt_number' => $receiptNumber,
                    'student_payment_id' => $studentPaymentId,
                ]);

                $results['fixed']++;
                $results['details'][] = [
                    'child_id' => $mp->child_id,
                    'child_name' => $mp->child->name ?? 'Unknown',
                    'month' => MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year,
                    'receipt_number' => $receiptNumber,
                    'action' => 'Fixed'
                ];
            } else {
                $results['details'][] = [
                    'child_id' => $mp->child_id,
                    'child_name' => $mp->child->name ?? 'Unknown',
                    'month' => MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year,
                    'status' => 'No matching StudentPayment found',
                    'action' => 'Skipped'
                ];
            }
        }

        return response()->json($results);
    }

    /**
     * Get detailed receipt sync status page
     */
    public function receiptSyncStatus()
    {
        // Get all paid MonthlyPayments with their receipt status
        $allPaidMonthly = MonthlyPayment::where('is_paid', true)
            ->with(['child.student'])
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function($mp) {
                // Check if receipt_number looks like a bill code (8 chars alphanumeric)
                $isBillCode = $mp->receipt_number && 
                              strlen($mp->receipt_number) === 8 && 
                              preg_match('/^[a-z0-9]{8}$/', $mp->receipt_number);
                
                $hasReceiptNumber = $mp->receipt_number && 
                                   $mp->receipt_number !== '-' && 
                                   !$isBillCode;
                
                // Try to find the actual receipt number from StudentPayment
                $studentPaymentReceipt = null;
                $studentPaymentId = null;
                if ($mp->child && $mp->child->student) {
                    $monthStr = MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year;
                    $sp = StudentPayment::where('student_id', $mp->child->student->id)
                        ->where('month', $monthStr)
                        ->where('status', 'paid')
                        ->first();
                    
                    if ($sp) {
                        $studentPaymentReceipt = $sp->receipt_number;
                        $studentPaymentId = $sp->id;
                    }
                }

                return [
                    'id' => $mp->id,
                    'child_id' => $mp->child_id,
                    'child_name' => $mp->child->name ?? 'Unknown',
                    'month' => MonthlyPayment::getMalayName($mp->month) . ' ' . $mp->year,
                    'mp_receipt_number' => $mp->receipt_number,
                    'sp_receipt_number' => $studentPaymentReceipt,
                    'sp_id' => $studentPaymentId,
                    'is_bill_code' => $isBillCode,
                    'is_synced' => $hasReceiptNumber && ($mp->receipt_number === $studentPaymentReceipt),
                    'needs_fix' => (!$hasReceiptNumber || $isBillCode) && $studentPaymentReceipt,
                    'paid_date' => $mp->paid_date?->format('d/m/Y'),
                ];
            });

        $needsFix = $allPaidMonthly->filter(fn($p) => $p['needs_fix'])->count();
        $synced = $allPaidMonthly->filter(fn($p) => $p['is_synced'])->count();
        $noReceipt = $allPaidMonthly->filter(fn($p) => !$p['mp_receipt_number'] && !$p['sp_receipt_number'])->count();

        return Inertia::render('Admin/ReceiptSync', [
            'payments' => $allPaidMonthly->values(),
            'stats' => [
                'total' => $allPaidMonthly->count(),
                'synced' => $synced,
                'needs_fix' => $needsFix,
                'no_receipt' => $noReceipt,
            ]
        ]);
    }

    /**
     * Fix null payment_date in StudentPayment records
     */
    public function fixPaymentDates()
    {
        $results = [
            'checked' => 0,
            'fixed' => 0,
        ];

        // Get all paid StudentPayments with null payment_date
        $payments = StudentPayment::where('status', 'paid')
            ->whereNull('payment_date')
            ->get();

        $results['checked'] = $payments->count();

        foreach ($payments as $payment) {
            // Use created_at as payment_date
            $payment->update([
                'payment_date' => $payment->created_at,
            ]);
            $results['fixed']++;
        }

        return response()->json($results);
    }
}
