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
        
        // Eager load monthly payments and student, and trainingCenter
        $children = $user->children()->with(['student', 'trainingCenter', 'monthlyPayments' => function($query) {
            $query->where('year', Carbon::now()->year)
                  ->orderBy('month');
        }])->get();

        $feesData = $children->map(function ($child) {
            $isSpecialCenter = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';

            if ($isSpecialCenter) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'is_special_center' => true,
                    'fees' => [],
                    'no_siri' => $child->student ? $child->student->no_siri : '-',
                ];
            }

            // Generate monthly payments if they don't exist
            if ($child->monthlyPayments->count() === 0) {
                \App\Models\MonthlyPayment::generateForChild($child);
                $child->refresh(); // Refresh to get relations if needed, or just reload mp
                $child->load(['student', 'monthlyPayments' => function($query) {
                     $query->where('year', Carbon::now()->year)->orderBy('month');
                }]);
            }

            // Lazy Fix: Sync Registration month payment if marked in Child but not MonthlyPayment
            if ($child->payment_completed && $child->payment_date) {
                 $pDate = $child->payment_date instanceof Carbon ? $child->payment_date : Carbon::parse($child->payment_date);
                 
                 // Check collection
                 $regMonthPayment = $child->monthlyPayments->first(function($mp) use ($pDate) {
                     return $mp->month == $pDate->month && $mp->year == $pDate->year;
                 });
                 
                 if ($regMonthPayment && !$regMonthPayment->is_paid) {
                     $regMonthPayment->update([
                        'is_paid' => true,
                        'paid_date' => $pDate,
                        'payment_method' => $child->payment_method,
                        'payment_reference' => $child->payment_reference,
                        'receipt_number' => $child->payment_reference,
                     ]);
                     $regMonthPayment->refresh();
                 }
            }

            $fees = $child->monthlyPayments->map(function ($monthlyPayment) use ($child) {
                // Visibility Logic: Hide months before registration/payment
                $paymentDate = $child->payment_date ? ($child->payment_date instanceof Carbon ? $child->payment_date : Carbon::parse($child->payment_date)) : null;
                $hideDetails = false;
                
                if ($paymentDate) {
                     $regStart = $paymentDate->copy()->startOfMonth();
                     $monthStart = Carbon::create($monthlyPayment->year, $monthlyPayment->month, 1);
                     if ($monthStart->lt($regStart)) {
                         $hideDetails = true;
                     }
                }

                if ($hideDetails) {
                    return [
                        'id' => $monthlyPayment->id,
                        'month' => $monthlyPayment->month_name . ' ' . $monthlyPayment->year,
                        'status' => '',
                        'is_paid' => false, 
                        'is_overdue' => false,
                        'amount' => 0,
                        'due_date' => '',
                        'paid_date' => '',
                        'can_pay' => false,
                        'child_id' => $monthlyPayment->child_id,
                        'hide_action' => true,
                        'receipt_url' => null,
                    ];
                }

                // Determine Receipt URL
                $receiptUrl = null;
                if ($monthlyPayment->is_paid) {
                     $monthStr = $monthlyPayment->month_name . ' ' . $monthlyPayment->year;
                     $sp = null;
                     if ($child->student) {
                        $sp = \App\Models\StudentPayment::where('student_id', $child->student->id)
                            ->where('month', $monthStr)
                            ->where('status', 'paid')
                            ->first();
                     }

                     if ($sp) {
                        $receiptUrl = route('receipts.stream', $sp->id);
                     } else {
                        // Fallback to Registration Receipt
                        $receiptUrl = route('children.payment.receipt', $child->id);
                     }
                }

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
                    'hide_action' => false,
                    'receipt_url' => $receiptUrl,
                ];
            });

            return [
                'id' => $child->id,
                'name' => $child->name,
                'fees' => $fees,
                'is_special_center' => $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum',
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
        ]);

        $child = Child::with(['parent', 'student'])->findOrFail($request->child_id);

        if (!$child->student) {
            return back()->with('error', 'Peserta belum mendaftar sebagai pelajar.');
        }

        // Calculate amount from backend settings
        // Ensure student has access to fee settings
        $isSpecialCenter = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
        $amount = $isSpecialCenter ? 0 : $child->student->monthly_fee;

        // Create Pending Payment Record
        // Check if exists
        $payment = StudentPayment::firstOrNew([
            'student_id' => $child->student->id,
            'month' => $request->month,
        ]);
        
        $payment->kategori = $child->student->kategori ?? 'kanak-kanak';
        $payment->quantity = 1;
        $payment->amount = $amount;
        $payment->total = $amount;
        $payment->status = 'pending';
        $payment->save();

        // Generate placeholder email if parent doesn't have one (required by ToyyibPay)
        $parentEmail = $child->parent->email ?? '';
        if (empty($parentEmail)) {
            $parentEmail = ($child->parent->phone_number ?? 'noemail') . '@taekwondoanz.com';
        }

        // Initiate ToyyibPay
        $result = $this->toyyibPayService->createBill([
            'billName' => 'Yuran ' . $request->month,
            'billDescription' => 'Pembayaran yuran untuk ' . $child->name . ' (' . $child->student->no_siri . ')',
            'billAmount' => $amount, // Service will convert to cents
            'billReturnUrl' => route('fees.payment.return'),
            'billCallbackUrl' => route('fees.payment.callback'),
            'billTo' => $child->parent->name ?? '',
            'billEmail' => $parentEmail,
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
                $payment->receipt_number = str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                $payment->save();
                $this->updateMonthlyPaymentStatus($payment);

                // Notify Admin & User via WhatsApp
                $studentName = $payment->student->nama_pelajar ?? 'Unknown';
                \App\Models\Notification::createMonthlyFeeNotification($studentName, $payment->month);
                
                $parentPhone = $payment->student->child->parent->phone_number ?? null;
                $msg = "*[PEMBAYARAN YURAN BERJAYA]*\n\nPelajar: {$studentName}\nBulan: {$payment->month}\nJumlah: RM{$payment->total}\nNo. Resit: {$payment->receipt_number}\n\nTerima kasih atas pembayaran anda.";
                
                \App\Services\WhatsappService::send($parentPhone, $msg);
                \App\Services\WhatsappService::notifyAdmin("Pembayaran Yuran Baru:\nPelajar: {$studentName}\nBulan: {$payment->month}\nJumlah: RM{$payment->total}");
                
                // Send PDF Receipt
                $this->sendReceiptViaWhatsapp($payment);
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
                $payment->receipt_number = str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                $payment->save();
                $this->updateMonthlyPaymentStatus($payment);

                // Notify Admin & User via WhatsApp
                $studentName = $payment->student->nama_pelajar ?? 'Unknown';
                \App\Models\Notification::createMonthlyFeeNotification($studentName, $payment->month);
                
                $parentPhone = $payment->student->child->parent->phone_number ?? null;
                $msg = "*[PEMBAYARAN YURAN BERJAYA]*\n\nPelajar: {$studentName}\nBulan: {$payment->month}\nJumlah: RM{$payment->total}\nNo. Resit: {$payment->receipt_number}\n\nTerima kasih atas pembayaran anda.";
                
                \App\Services\WhatsappService::send($parentPhone, $msg);
                \App\Services\WhatsappService::notifyAdmin("Pembayaran Yuran Baru (Callback):\nPelajar: {$studentName}\nBulan: {$payment->month}\nJumlah: RM{$payment->total}");
                
                // Send PDF Receipt
                $this->sendReceiptViaWhatsapp($payment);
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

    private function updateMonthlyPaymentStatus($payment)
    {
        $student = $payment->student;
        if (!$student || !$student->child) return;
        
        // Parse "MonthName Year" e.g. "Januari 2026"
        $parts = explode(' ', $payment->month);
        if (count($parts) < 2) return;
        
        $monthName = $parts[0];
        $year = $parts[1];

        $months = [
            'Januari' => 1, 'Februari' => 2, 'Mac' => 3, 'April' => 4,
            'Mei' => 5, 'Jun' => 6, 'Julai' => 7, 'Ogos' => 8,
            'September' => 9, 'Oktober' => 10, 'November' => 11, 'Disember' => 12
        ];

        $month = $months[$monthName] ?? null;
        if (!$month) return;

        $monthlyPayment = \App\Models\MonthlyPayment::where('child_id', $student->child->id)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        if ($monthlyPayment) {
            $monthlyPayment->update([
                'is_paid' => true,
                'paid_date' => $payment->payment_date,
                'payment_method' => $payment->payment_method ?? 'online',
                'payment_reference' => $payment->transaction_ref,
                'receipt_number' => $payment->receipt_number,
            ]);
        }
    }

    private function sendReceiptViaWhatsapp(StudentPayment $payment)
    {
        try {
            $payment->load(['student.child.parent', 'student.child.trainingCenter']);
            $pdf = Pdf::loadView('receipts.fee', ['payment' => $payment]);
            $base64 = base64_encode($pdf->output());
            
            $parentPhone = $payment->student->child->parent->phone_number ?? null;
            if ($parentPhone) {
                $studentName = $payment->student->nama_pelajar ?? 'Peserta';
                $msg = "*[RESIT PEMBAYARAN YURAN]*\n\nTerima kasih atas pembayaran yuran bagi *{$studentName}* untuk bulan *{$payment->month}*.\n\nSila simpan resit ini untuk rujukan anda.";
                
                \App\Services\WhatsappService::sendFile(
                    $parentPhone, 
                    $msg, 
                    $base64, 
                    "Resit-{$payment->receipt_number}.pdf"
                );
            }
        } catch (\Exception $e) {
            Log::error('Gagal menghantar resit WhatsApp: ' . $e->getMessage());
        }
    }
}
