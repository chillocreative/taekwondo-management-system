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
        
        // Eager load student and their payments
        $children = $user->children()->with(['student.payments'])->get();

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
                $paymentId = null;

                // Check if child has a linked student record
                if ($child->student) {
                    // Check for payment matching the month string
                    $payment = $child->student->payments->first(function ($p) use ($monthItem) {
                        return strtoupper($p->month) === $monthItem['month_name'] && $p->status === 'paid';
                    });

                    if ($payment) {
                        $status = 'Sudah Bayar';
                        $hasReceipt = true;
                        $paymentTotal = $payment->total;
                        $paymentId = $payment->id;
                    } else {
                        // Check if pending?
                         $pending = $child->student->payments->first(function ($p) use ($monthItem) {
                            return strtoupper($p->month) === $monthItem['month_name'] && $p->status === 'pending';
                        });
                        
                        if ($pending) {
                            $status = 'Sedang Semak'; // Or allow re-pay if failed?
                            // For simplicity, allow repay if pending for too long? Or just show Pending.
                            // Let's allow pay for now, assuming new flow
                            $canPay = true; 
                        } else {
                            $canPay = true;
                        }

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
                    'payment_id' => $paymentId,
                    'child_id' => $child->id // Needed for payload
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
        $billCode = $this->toyyibPayService->createBill(
            config('services.toyyibpay.category_code'),
            'Yuran ' . $request->month,
            'Pembayaran yuran untuk ' . $child->name . ' (' . $child->student->no_siri . ')',
            $request->amount * 100, // In cents
            route('fees.payment.return'),
            route('fees.payment.callback'),
            1, // Bill to 1 person?
            $child->parent->email,
            $child->parent->phone_number
        );
        
        if ($billCode) {
            $payment->transaction_ref = $billCode;
            $payment->payment_method = 'online';
            $payment->save();

            return Inertia::location('https://dev.toyyibpay.com/' . $billCode); 
        }

        return back()->with('error', 'Gagal menghubungi gerbang pembayaran.');
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
