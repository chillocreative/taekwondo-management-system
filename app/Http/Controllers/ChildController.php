<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ChildController extends Controller
{
    /**
     * Display a listing of the user's children
     */
    public function index()
    {
        $currentYear = now()->year;
        $children = Auth::user()->children()
            ->with(['trainingCenter', 'student'])
            ->latest()
            ->get()
            ->map(function($child) use ($currentYear) {
                // Determine registration type for the current year
                // Priority: Respect the value in DB if it's already 'renewal'
                // Otherwise fallback to year-based logic for older records
                if ($child->registration_type !== 'renewal') {
                    $createdYear = $child->created_at->year;
                    if ($createdYear < $currentYear) {
                        $child->registration_type = 'renewal';
                    } else {
                        $child->registration_type = 'new';
                    }
                }

                // Check if payment is valid for current year
                $child->payment_completed = $child->payment_completed && 
                                          $child->payment_date && 
                                          $child->payment_date->year === $currentYear;
                
                $child->needs_update = $child->last_updated_year < $currentYear;
                return $child;
            });
            
        $trainingCenters = TrainingCenter::active()->orderBy('name')->get();

        return Inertia::render('Children/Index', [
            'children' => $children,
            'trainingCenters' => $trainingCenters,
        ]);
    }

    /**
     * Store a newly created child
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'training_center_id' => 'required|exists:training_centers,id',
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'age' => 'required|integer',
            'ic_number' => 'required|string|max:12|unique:children,ic_number',
            'belt_level' => 'required|string|max:50',
            'registration_type' => 'required|in:new,renewal',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'guardian_name' => 'required|string|max:255',
            'guardian_occupation' => 'required|string|max:255',
            'guardian_ic_number' => 'required|string|max:20',
            'guardian_age' => 'required|integer',
            'guardian_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'postcode' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'school_name' => 'required|string|max:255',
            'school_class' => 'required|string|max:50',
        ]);

        // Handle file upload
        if ($request->hasFile('belt_certificate')) {
            $path = $request->file('belt_certificate')->store('certificates', 'public');
            $validated['belt_certificate'] = $path;
        }

        $validated['parent_id'] = Auth::id();
        $validated['last_updated_year'] = now()->year;
        
        $child = Child::create($validated);

        // Create Student Record Immediately (Generate No Siri)
        $studentService = new \App\Services\StudentService();
        $studentService->syncChildToStudent($child);

        return redirect()->route('children.index')
            ->with('success', 'Peserta berjaya ditambah.');
    }

    /**
     * Update the specified child
     */
    public function update(Request $request, Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'training_center_id' => 'required|exists:training_centers,id',
            'name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'age' => 'required|integer',
            'ic_number' => 'required|string|max:12|unique:children,ic_number,' . $child->id,
            'belt_level' => 'required|string|max:50',
            'registration_type' => 'required|in:new,renewal',
            'is_active' => 'boolean',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'guardian_name' => 'required|string|max:255',
            'guardian_occupation' => 'required|string|max:255',
            'guardian_ic_number' => 'required|string|max:20',
            'guardian_age' => 'required|integer',
            'guardian_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'postcode' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'school_name' => 'required|string|max:255',
            'school_class' => 'required|string|max:50',
        ]);

        // Handle file upload
        if ($request->hasFile('belt_certificate')) {
            // Delete old certificate if exists
            if ($child->belt_certificate) {
                \Storage::disk('public')->delete($child->belt_certificate);
            }
            $path = $request->file('belt_certificate')->store('certificates', 'public');
            $validated['belt_certificate'] = $path;
        }

        $validated['last_updated_year'] = now()->year;
        $child->update($validated);

        // Sync updates to Student
        $studentService = new \App\Services\StudentService();
        $studentService->syncChildToStudent($child);

        return redirect()->route('children.index')
            ->with('success', 'Maklumat peserta berjaya dikemaskini.');
    }

    /**
     * Remove the specified child
     */
    public function destroy(Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        // Delete certificate file if exists
        if ($child->belt_certificate) {
            \Storage::disk('public')->delete($child->belt_certificate);
        }

        $child->delete();

        return redirect()->route('children.index')
            ->with('success', 'Peserta berjaya dipadam.');
    }

    /**
     * Show payment confirmation page
     */
    public function payment(Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        // Check if already paid
        if ($child->payment_completed) {
            return redirect()->route('children.index')
                ->with('error', 'Peserta ini sudah membuat pembayaran.');
        }

        // Calculate fees
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->getRenewalFeeByBelt($child->belt_level);
                $feeLabel = 'Yuran Pembaharuan Keahlian';
            } else {
                $mainFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
                $feeLabel = 'Yuran Pendaftaran (Tahunan)';
            }
            
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Pelajar (Bawah 18 tahun)' : 'Dewasa (18 tahun ke atas)';
        } else {
            $monthlyFee = $feeSettings->monthly_fee_below_18;
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->renewal_fee_gup;
                $feeLabel = 'Yuran Pembaharuan Keahlian';
            } else {
                $mainFee = $feeSettings->yearly_fee_below_18;
                $feeLabel = 'Yuran Pendaftaran (Tahunan)';
            }
            $ageCategory = 'Pelajar (Bawah 18 tahun)';
        }

        // Calculate total: Main Fee + Yuran Bulanan (current month) + Previous Outstanding
        $isSpecialCenter = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
        
        $outstandingFees = $this->getOutstandingFees($child);
        $outstandingAmount = $outstandingFees->sum('amount');

        if ($isSpecialCenter) {
            $monthlyFee = 0;
            $outstandingAmount = 0; // Don't charge outstanding for special center if any
            $totalAmount = $mainFee;
        } else {
            $totalAmount = $mainFee + $monthlyFee + $outstandingAmount;
        }

        $currentMonth = \App\Models\MonthlyPayment::getMalayName(now()->month) . ' ' . now()->year;

        return Inertia::render('Children/Payment', [
            'child' => $child->load('trainingCenter'),
            'yearlyFee' => (float) $mainFee, // We keep the variable name yearlyFee for frontend compatibility or rename if needed
            'feeLabel' => $feeLabel,
            'monthlyFee' => (float) $monthlyFee,
            'outstandingAmount' => (float) $outstandingAmount,
            'outstandingCount' => $outstandingFees->count(),
            'totalAmount' => (float) $totalAmount,
            'currentMonth' => $currentMonth,
            'ageCategory' => $ageCategory,
            'beltLevelMalay' => $child->belt_level_malay,
        ]);
    }

    /**
     * Initiate online payment via ToyyibPay
     */
    public function initiateOnlinePayment(Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        // Check if already paid
        if ($child->payment_completed) {
            return redirect()->route('children.index')
                ->with('error', 'Peserta ini sudah membuat pembayaran.');
        }

        // Check if ToyyibPay is configured
        $paymentSettings = \App\Models\PaymentSetting::getActive();
        if (!$paymentSettings || !$paymentSettings->secret_key || !$paymentSettings->category_code) {
            return redirect()->route('children.payment', $child->id)
                ->with('error', 'Sistem pembayaran belum dikonfigurasi. Sila hubungi pentadbir.');
        }

        // Calculate fees
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->getRenewalFeeByBelt($child->belt_level);
                $feeTitle = 'Yuran Pembaharuan';
            } else {
                $mainFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
                $feeTitle = 'Yuran Tahunan';
            }
            
            $ageCount = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $ageCount < 18 ? 'Bawah 18 tahun' : '18 tahun ke atas';
        } else {
            $monthlyFee = $feeSettings->monthly_fee_below_18;
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->renewal_fee_gup;
                $feeTitle = 'Yuran Pembaharuan';
            } else {
                $mainFee = $feeSettings->yearly_fee_below_18;
                $feeTitle = 'Yuran Tahunan';
            }
            $ageCategory = 'Bawah 18 tahun (tiada tarikh lahir)';
        }

        // Calculate total payment
        $isSpecialCenter = $child->trainingCenter && $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
        $currentMonth = \App\Models\MonthlyPayment::getMalayName(now()->month);
        
        $outstandingFees = $this->getOutstandingFees($child);
        $outstandingAmount = (float) $outstandingFees->sum('amount');

        if ($isSpecialCenter) {
            $monthlyFee = 0;
            $outstandingAmount = 0;
            $totalAmount = $mainFee;
        } else {
            $totalAmount = $mainFee + $monthlyFee + $outstandingAmount;
        }

        // Create ToyyibPay bill
        $toyyibPay = new \App\Services\ToyyibPayService();
        
        $billDescription = sprintf(
            '%s (RM%.2f) + Yuran Bulanan %s (RM%.2f)',
            $feeTitle,
            $mainFee,
            $currentMonth,
            $monthlyFee
        );

        if ($outstandingAmount > 0) {
            $billDescription .= sprintf(' + Tunggakan (RM%.2f)', $outstandingAmount);
        }

        $billDescription .= ' - ' . $ageCategory;
        
        $billName = 'Yuran - ' . mb_substr($child->name, 0, 21);
        
        $userEmail = Auth::user()->email;
        if (empty($userEmail)) {
            $userEmail = Auth::user()->phone_number . '@taekwondoanz.com';
        }

        $billData = [
            'billName' => $billName,
            'billDescription' => $billDescription,
            'billAmount' => $totalAmount,
            'billReturnUrl' => route('children.payment.callback'),
            'billCallbackUrl' => route('children.payment.callback.post'),
            'billExternalReferenceNo' => 'CHILD-' . $child->id . '-' . time(),
            'billTo' => mb_substr(Auth::user()->name, 0, 30),
            'billEmail' => $userEmail,
            'billPhone' => Auth::user()->phone_number ?? '',
        ];

        $result = $toyyibPay->createBill($billData);

        if ($result['success']) {
            // Update child with payment reference and fee amount
            $child->update([
                'registration_fee' => $mainFee,
                'payment_reference' => $result['billCode'],
            ]);

            return redirect($result['paymentUrl']);
        }

        \Illuminate\Support\Facades\Log::error('ToyyibPay Error for Child ID ' . $child->id, [
            'result' => $result
        ]);

        return redirect()->route('children.payment', $child->id)
            ->with('error', 'Gagal menghubungi ToyyibPay. Sila cuba sebentar lagi.');
    }

    /**
     * Show offline payment page with QR code
     */
    public function showOfflinePayment(Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        // Check if already paid
        if ($child->payment_completed) {
            return redirect()->route('children.index')
                ->with('error', 'Peserta ini sudah membuat pembayaran.');
        }

        // Calculate fee based on registration type and age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->getRenewalFeeByBelt($child->belt_level);
                $feeLabel = 'Yuran Pembaharuan Keahlian';
            } else {
                $mainFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
                $feeLabel = 'Yuran Pendaftaran (Tahunan)';
            }
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Bawah 18 tahun' : '18 tahun ke atas';
        } else {
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->renewal_fee_gup;
                $feeLabel = 'Yuran Pembaharuan Keahlian';
            } else {
                $mainFee = $feeSettings->yearly_fee_below_18;
                $feeLabel = 'Yuran Pendaftaran (Tahunan)';
            }
            $ageCategory = 'Bawah 18 tahun';
        }

        $outstandingFees = $this->getOutstandingFees($child);
        $outstandingAmount = (float) $outstandingFees->sum('amount');

        return Inertia::render('Children/OfflinePayment', [
            'child' => $child->load('trainingCenter'),
            'yearlyFee' => $mainFee,
            'feeLabel' => $feeLabel,
            'outstandingAmount' => $outstandingAmount,
            'outstandingCount' => $outstandingFees->count(),
            'ageCategory' => $ageCategory,
        ]);
    }

    /**
     * Submit offline payment with slip upload
     */
    public function submitOfflinePayment(Request $request, Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        // Check if already paid
        if ($child->payment_completed) {
            return redirect()->route('children.index')
                ->with('error', 'Peserta ini sudah membuat pembayaran.');
        }

        $request->validate([
            'payment_slip' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
        ]);

        // Calculate fee based on registration type and age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->getRenewalFeeByBelt($child->belt_level);
            } else {
                $mainFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            }
        } else {
            if ($child->registration_type === 'renewal') {
                $mainFee = $feeSettings->renewal_fee_gup;
            } else {
                $mainFee = $feeSettings->yearly_fee_below_18;
            }
        }

        // Handle file upload
        $path = $request->file('payment_slip')->store('payment_slips', 'public');

        // Mark as offline payment pending
        $child->update([
            'payment_method' => 'offline',
            'registration_fee' => $mainFee,
            'payment_reference' => 'OFFLINE-' . $child->id . '-' . time(),
            'payment_slip' => $path,
        ]);

        // Notify Admin via WhatsApp
        \App\Services\WhatsappService::notifyAdmin("Penerimaan Resit Offline Baru:\nPelajar: {$child->name}\nIbu Bapa: " . Auth::user()->name . "\nPusat Latihan: " . ($child->trainingCenter->name ?? '-'));

        return redirect()->route('children.index')
            ->with('success', 'Resit pembayaran telah dihantar. Sila tunggu kelulusan admin.');
    }

    /**
     * Handle payment callback from ToyyibPay
     */
    public function paymentCallback(Request $request)
    {
        // Get bill code from request
        $billCode = $request->input('billcode') ?? $request->input('billCode');
        
        if (!$billCode) {
            return redirect()->route('children.index')
                ->with('error', 'Kod bil tidak sah.');
        }

        // Find child by payment reference
        $child = Child::where('payment_reference', $billCode)->first();

        if (!$child) {
            return redirect()->route('children.index')
                ->with('error', 'Rekod pembayaran tidak dijumpai.');
        }

        // Get bill status from ToyyibPay
        $toyyibPay = new \App\Services\ToyyibPayService();
        $transactions = $toyyibPay->getBillTransactions($billCode);

        if ($transactions && isset($transactions[0])) {
            $transaction = $transactions[0];
            
            // Check if payment is successful
            if ($transaction['billpaymentStatus'] == '1') {
                // Update child record
                $child->update([
                    'payment_completed' => true,
                    'payment_method' => 'online',
                    'payment_date' => now(),
                    'is_active' => true, // Auto-activate after successful payment
                ]);

                // Create/Sync Student Record (Generate No Siri)
                $studentService = new \App\Services\StudentService();
                $studentService->syncChildToStudent($child);
                
                // Reload child to get student relation
                $child->refresh();

                // Create StudentPayment record so it appears on admin payments page
                if ($child->student) {
                    $currentMonth = \App\Models\MonthlyPayment::getMalayName(now()->month) . ' ' . now()->year;
                    
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
                    
                    $outstandingFees = $this->getOutstandingFees($child);
                    $outstandingAmount = (float) $outstandingFees->sum('amount');

                    if ($isSpecialCenter) {
                        $monthlyFee = 0;
                        $outstandingAmount = 0;
                        $totalAmount = $mainFee;
                    } else {
                        $totalAmount = $mainFee + $monthlyFee + $outstandingAmount;
                    }

                    // Save the actual fee used in child record if not already set (just in case)
                    if ($child->registration_fee != $mainFee) {
                        $child->update(['registration_fee' => $mainFee]);
                    }

                    // Create payment record for registration
                    $payment = \App\Models\StudentPayment::create([
                        'student_id' => $child->student->id,
                        'month' => $currentMonth,
                        'kategori' => $child->student->kategori ?? 'kanak-kanak',
                        'quantity' => 1,
                        'amount' => $totalAmount,
                        'total' => $totalAmount,
                        'receipt_number' => null, // Will be set after creation
                        'transaction_ref' => $billCode,
                        'payment_method' => 'online',
                        'status' => 'paid',
                        'payment_date' => now(),
                    ]);

                    // Set receipt number as simple running number
                    $payment->receipt_number = str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                    $payment->save();

                    // Send PDF Receipt to Parent
                    $this->sendReceiptViaWhatsapp($child, $mainFee, $monthlyFee, $payment->receipt_number, $outstandingAmount);

                    // Update monthly payment record for current month
                    $currentMonthNum = \Carbon\Carbon::now()->month;
                    $currentYear = \Carbon\Carbon::now()->year;
                    $monthlyPayment = \App\Models\MonthlyPayment::where('child_id', $child->id)
                        ->where('month', $currentMonthNum)
                        ->where('year', $currentYear)
                        ->first();

                    if ($monthlyPayment) {
                        $monthlyPayment->update([
                            'is_paid' => true,
                            'paid_date' => now(),
                            'payment_method' => 'online',
                            'payment_reference' => $billCode,
                            'receipt_number' => $payment->receipt_number,
                            'student_payment_id' => $payment->id,
                        ]);
                    }

                    // Settle Outstanding Fees (Previous Years)
                    foreach ($outstandingFees as $of) {
                        $of->update([
                            'is_paid' => true,
                            'paid_date' => now(),
                            'payment_method' => 'online',
                            'payment_reference' => $billCode,
                            'receipt_number' => $payment->receipt_number,
                            'student_payment_id' => $payment->id,
                        ]);
                    }

                    // Send WhatsApp Notification to Admin
                    \App\Services\WhatsappService::notifyAdminNewPaidPeserta($child->name, $totalAmount);
                }

                // Notify Admin & User via WhatsApp
                \App\Models\Notification::createPaymentPaidNotification($child);
                
                $parentPhone = $child->parent->phone_number ?? null;
                $msg = "*[PENDAFTARAN BERJAYA]*\n\nPelajar: {$child->name}\nNo Siri: " . ($child->student->no_siri ?? '-') . "\nJumlah: RM{$totalAmount}\n\nSelamat datang ke Taekwondo A&Z! Pendaftaran anda telah diaktifkan.";
                
                \App\Services\WhatsappService::send($parentPhone, $msg);
                \App\Services\WhatsappService::notifyAdmin("Pendaftaran & Pembayaran Baru:\nPelajar: {$child->name}\nJumlah: RM{$totalAmount}");

                return redirect()->route('children.index')
                    ->with('payment_success', 'Pembayaran berjaya! Peserta telah diaktifkan.');
            }
        }

        return redirect()->route('children.index')
            ->with('payment_error', 'Pembayaran gagal atau belum selesai.');
    }
    /**
     * Download Payment Receipt
     */
    public function downloadReceipt(Child $child)
    {
        if (!Auth::user()->isAdmin() && $child->parent_id !== Auth::id()) {
            abort(403);
        }

        if (!$child->payment_completed) {
            return back()->with('payment_error', 'Pembayaran belum dibuat.');
        }

        // Calculate fee breakdown
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

        $outstandingAmount = (float) \App\Models\MonthlyPayment::where('child_id', $child->id)
            ->where('payment_reference', $child->payment_reference)
            ->where('year', '<', now()->year)
            ->sum('amount');

        if ($isSpecialCenter) {
            $monthlyFee = 0;
            $outstandingAmount = 0;
        }

        // Get receipt number from student payment
        $receiptNumber = null;
        if ($child->student) {
            $studentPayment = \App\Models\StudentPayment::where('student_id', $child->student->id)
                ->where('transaction_ref', $child->payment_reference)
                ->first();
            if ($studentPayment) {
                $receiptNumber = $studentPayment->receipt_number;
            }
        }

        $items = [
            'yearly_fee' => (float) $mainFee,
            'monthly_fee' => (float) $monthlyFee,
            'outstanding_fee' => $outstandingAmount,
            'total' => (float) ($mainFee + $monthlyFee + $outstandingAmount),
            'receipt_number' => $receiptNumber
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.registration', [
            'child' => $child,
            'user' => Auth::user(),
            'items' => $items,
        ]);

        return $pdf->stream('Resit_Yuran_' . preg_replace('/[^A-Za-z0-9]/', '_', $child->name) . '.pdf');
    }

    private function sendReceiptViaWhatsapp($child, $yearlyFee, $monthlyFee, $receiptNumber, $outstandingFee = 0)
    {
        try {
            $items = [
                'yearly_fee' => $yearlyFee,
                'monthly_fee' => $monthlyFee,
                'outstanding_fee' => $outstandingFee,
                'total' => $yearlyFee + $monthlyFee + $outstandingFee,
                'receipt_number' => $receiptNumber
            ];

            $pdf = Pdf::loadView('receipts.registration', [
                'child' => $child,
                'user' => $child->parent,
                'items' => $items,
            ]);
            
            $base64 = base64_encode($pdf->output());
            
            $parentPhone = $child->phone_number ?? $child->guardian_phone ?? $child->parent->phone_number ?? null;
            if ($parentPhone) {
                $type = $child->registration_type === 'renewal' ? 'PEMBAHARUAN' : 'PENDAFTARAN';
                $msg = "*[RESIT $type]*\n\n$type bagi *{$child->name}* telah berjaya. Terima kasih atas pembayaran anda.\n\nSila simpan resit ini untuk rujukan anda.";
                
                \App\Services\WhatsappService::sendFile(
                    $parentPhone, 
                    $msg, 
                    $base64, 
                    "Resit-$type-{$child->name}.pdf"
                );
            }
        } catch (\Exception $e) {
            Log::error('Gagal menghantar resit WhatsApp Pendaftaran: ' . $e->getMessage());
        }
    }

    /**
     * Get outstanding fees from previous years
     */
    private function getOutstandingFees(Child $child)
    {
        $currentYear = now()->year;
        return \App\Models\MonthlyPayment::where('child_id', $child->id)
            ->where('year', '<', $currentYear)
            ->where('is_paid', false)
            ->get();
    }
}
