<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\StudentPayment;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeController extends Controller
{
    protected $toyyibPayService;

    public function __construct(ToyyibPayService $toyyibPayService)
    {
        $this->toyyibPayService = $toyyibPayService;
    }

    /**
     * Display a listing of fees for the authenticated parent's children.
     */
    public function index()
    {
        $user = auth()->user();
        
        // Eager load monthly payments
        $children = $user->children()->with(['monthlyPayments' => function($query) {
            $query->where('year', Carbon::now()->year)
                  ->orderBy('month');
        }])->get();

        $feesData = $children->map(function ($child) {
            // Generate monthly payments if they don't exist
            if ($child->monthlyPayments->count() === 0) {
                \App\Models\MonthlyPayment::generateForChild($child);
                $child->load('monthlyPayments');
            }

            $fees = $child->monthlyPayments->map(function ($monthlyPayment) {
                return [
                    'id' => $monthlyPayment->id,
                    'month' => $monthlyPayment->month_name . ' ' . $monthlyPayment->year,
                    'status' => $monthlyPayment->status,
                    'is_paid' => $monthlyPayment->is_paid,
                    'is_overdue' => $monthlyPayment->isOverdue(),
                    'amount' => $monthlyPayment->amount,
                    'due_date' => $monthlyPayment->due_date->format('d/m/Y'),
                    'paid_date' => $monthlyPayment->paid_date?->format('d/m/Y'),
                    'can_pay' => !$monthlyPayment->is_paid,
                    'child_id' => $monthlyPayment->child_id,
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
     * Initiate Payment
     */
    public function pay(Request $request)
    {
        $request->validate([
            'child_id' => 'required|exists:children,id',
            'month' => 'required|string',
            'amount' => 'required|numeric',
        ]);

        $child = Child::with(['parent', 'student'])->findOrFail($request->child_id);

        if (!$child->student) {
            return back()->with('error', 'Peserta belum mendaftar sebagai pelajar.');
        }

        // Create Pending Payment Record
        // Check if exists
        $payment = StudentPayment::firstOrNew([
            'student_id' => $child->student->id,
            'month' => $request->month,
        ]);
        
        $payment->kategori = $child->student->kategori ?? 'kanak-kanak';
        $payment->quantity = 1;
        $payment->amount = $request->amount;
        $payment->total = $request->amount;
        $payment->status = 'pending';
        $payment->save();

        // Initiate ToyyibPay
        $result = $this->toyyibPayService->createBill([
            'billName' => 'Yuran ' . $request->month,
            'billDescription' => 'Pembayaran yuran untuk ' . $child->name . ' (' . $child->student->no_siri . ')',
            'billAmount' => $request->amount, // Service will convert to cents
            'billReturnUrl' => route('fees.payment.return'),
            'billCallbackUrl' => route('fees.payment.callback'),
            'billTo' => $child->parent->name ?? '',
            'billEmail' => $child->parent->email ?? '',
            'billPhone' => $child->parent->phone_number ?? '',
            'billExternalReferenceNo' => 'FEE-' . $payment->id,
        ]);
        
        if ($result['success'] ?? false) {
            $payment->transaction_ref = $result['billCode'];
            $payment->payment_method = 'online';
            $payment->save();

            return Inertia::location($result['paymentUrl']); 
        }

        // If ToyyibPay fails, log the error and allow manual payment
        Log::error('ToyyibPay createBill failed', $result);
        
        return back()->with('error', 'Gagal menghubungi gerbang pembayaran. Sila cuba lagi atau hubungi pentadbir.');
    }

    public function paymentReturn(Request $request)
    {
        $status_id = $request->query('status_id');
        $billcode = $request->query('billcode');
        $transaction_id = $request->query('transaction_id');

        // 1 = Success, 2 = Pending, 3 = Fail
        if ($status_id == 1) {
            $payment = StudentPayment::where('transaction_ref', $billcode)->first();
            if ($payment && $payment->status !== 'paid') {
                $payment->status = 'paid';
                $payment->payment_date = now();
                $payment->receipt_number = 'REC-' . now()->format('ym') . '-' . str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                $payment->save();
            }
            return redirect()->route('fees.index')->with('success', 'Pembayaran berjaya! Resit telah dijana.');
        }

        return redirect()->route('fees.index')->with('error', 'Pembayaran tidak berjaya atau dibatalkan.');
    }

    public function paymentCallback(Request $request)
    {
        // ... (Similar logic but backend only)
        // Usually handles backend updates if return page is skipped
        $status = $request->input('status'); // 1=success
        $billcode = $request->input('billcode');
        
        if ($status == '1') {
             $payment = StudentPayment::where('transaction_ref', $billcode)->first();
             if ($payment && $payment->status !== 'paid') {
                $payment->status = 'paid';
                $payment->payment_date = now();
                $payment->receipt_number = 'REC-' . now()->format('ym') . '-' . str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                $payment->save();
            }
        }
    }

    public function streamReceipt(StudentPayment $payment)
    {
        if ($payment->status !== 'paid') abort(404);
        
        $payment->load(['student.child.parent', 'student.child.trainingCenter']); // Load relations
        
        $pdf = Pdf::loadView('receipts.fee', ['payment' => $payment]);
        return $pdf->stream('receipt-' . $payment->receipt_number . '.pdf');
    }

    public function downloadReceipt(StudentPayment $payment)
    {
        if ($payment->status !== 'paid') abort(404);

        $payment->load(['student.child.parent', 'student.child.trainingCenter']); 

        $pdf = Pdf::loadView('receipts.fee', ['payment' => $payment]);
        return $pdf->download('receipt-' . $payment->receipt_number . '.pdf');
    }
}
