<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChildController extends Controller
{
    /**
     * Display a listing of the user's children
     */
    public function index()
    {
        $children = Auth::user()->children()->with(['trainingCenter', 'student'])->latest()->get();
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
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer',
            'ic_number' => 'nullable|string|max:12|unique:children,ic_number',
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'guardian_name' => 'required|string|max:255',
            'guardian_occupation' => 'nullable|string|max:255',
            'guardian_ic_number' => 'nullable|string|max:20',
            'guardian_age' => 'nullable|integer',
            'guardian_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'postcode' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string|max:20',
            'school_name' => 'nullable|string|max:255',
            'school_class' => 'nullable|string|max:50',
        ]);

        // Handle file upload
        if ($request->hasFile('belt_certificate')) {
            $path = $request->file('belt_certificate')->store('belt_certificates', 'public');
            $validated['belt_certificate'] = $path;
        }

        $child = Auth::user()->children()->create($validated);

        // Create Student Record Immediately (Generate No. Keahlian)
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
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer',
            'ic_number' => 'nullable|string|max:12|unique:children,ic_number,' . $child->id,
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
            'is_active' => 'boolean',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'guardian_name' => 'required|string|max:255',
            'guardian_occupation' => 'nullable|string|max:255',
            'guardian_ic_number' => 'nullable|string|max:20',
            'guardian_age' => 'nullable|integer',
            'guardian_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'postcode' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string|max:20',
            'school_name' => 'nullable|string|max:255',
            'school_class' => 'nullable|string|max:50',
        ]);

        // Handle file upload
        if ($request->hasFile('belt_certificate')) {
            // Delete old certificate if exists
            if ($child->belt_certificate) {
                \Storage::disk('public')->delete($child->belt_certificate);
            }
            $path = $request->file('belt_certificate')->store('belt_certificates', 'public');
            $validated['belt_certificate'] = $path;
        }

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

        // Calculate fees based on age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Pelajar (Bawah 18 tahun)' : 'Dewasa (18 tahun ke atas)';
        } else {
            $yearlyFee = $feeSettings->yearly_fee_below_18;
            $monthlyFee = $feeSettings->monthly_fee_below_18;
            $ageCategory = 'Pelajar (Bawah 18 tahun)';
        }

        // Calculate total: Yuran Tahunan + Yuran Bulanan (current month)
        $totalAmount = $yearlyFee + $monthlyFee;
        $currentMonth = \Carbon\Carbon::now()->translatedFormat('F Y'); // e.g., "Januari 2026"

        return Inertia::render('Children/Payment', [
            'child' => $child->load('trainingCenter'),
            'yearlyFee' => (float) $yearlyFee,
            'monthlyFee' => (float) $monthlyFee,
            'totalAmount' => (float) $totalAmount,
            'currentMonth' => $currentMonth,
            'ageCategory' => $ageCategory,
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

        // Calculate fees based on age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Bawah 18 tahun' : '18 tahun ke atas';
        } else {
            // Default to below 18 if no DOB
            $yearlyFee = $feeSettings->yearly_fee_below_18;
            $monthlyFee = $feeSettings->monthly_fee_below_18;
            $ageCategory = 'Bawah 18 tahun (tiada tarikh lahir)';
        }

        // Calculate total payment: Yuran Tahunan + Yuran Bulanan (current month only)
        $currentMonth = \Carbon\Carbon::now()->format('F'); // e.g., "February"
        $totalAmount = $yearlyFee + $monthlyFee;

        // Create ToyyibPay bill
        $toyyibPay = new \App\Services\ToyyibPayService();
        
        $billDescription = sprintf(
            'Yuran Tahunan (RM%.2f) + Yuran Bulanan %s (RM%.2f) - %s',
            $yearlyFee,
            $currentMonth,
            $monthlyFee,
            $ageCategory
        );
        
        // ToyyibPay limits billName to 30 characters
        $billName = 'Yuran - ' . mb_substr($child->name, 0, 21);
        
        $billData = [
            'billName' => $billName,
            'billDescription' => $billDescription,
            'billAmount' => $totalAmount,
            'billReturnUrl' => route('children.payment.callback'),
            'billCallbackUrl' => route('children.payment.callback.post'),
            'billExternalReferenceNo' => 'CHILD-' . $child->id . '-' . time(),
            'billTo' => mb_substr(Auth::user()->name, 0, 30),
            'billEmail' => Auth::user()->email ?? '',
            'billPhone' => Auth::user()->phone_number ?? '',
        ];

        $result = $toyyibPay->createBill($billData);

        if ($result['success']) {
            // Update child with payment reference and registration fee
            $child->update([
                'registration_fee' => $yearlyFee,
                'payment_reference' => $result['billCode'],
            ]);

            // Redirect to ToyyibPay payment page
            return redirect($result['paymentUrl']);
        }

        // Log the error for debugging
        \Illuminate\Support\Facades\Log::error('ToyyibPay Error for Child ID ' . $child->id, [
            'result' => $result,
            'billData' => $billData
        ]);

        // Redirect back to payment page with error message
        $errorMessage = $result['message'] ?? 'Ralat tidak diketahui';
        if (isset($result['response'])) {
            $errorMessage .= ' - ' . json_encode($result['response']);
        }

        return redirect()->route('children.payment', $child->id)
            ->with('error', 'Gagal memulakan pembayaran: ' . $errorMessage);
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

        // Calculate yearly fee based on age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Bawah 18 tahun' : '18 tahun ke atas';
        } else {
            $yearlyFee = $feeSettings->yearly_fee_below_18;
            $ageCategory = 'Bawah 18 tahun';
        }

        return Inertia::render('Children/OfflinePayment', [
            'child' => $child->load('trainingCenter'),
            'yearlyFee' => $yearlyFee,
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

        // Calculate yearly fee based on age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
        } else {
            $yearlyFee = $feeSettings->yearly_fee_below_18;
        }

        // Handle file upload
        $path = $request->file('payment_slip')->store('payment_slips', 'public');

        // Mark as offline payment pending
        $child->update([
            'payment_method' => 'offline',
            'registration_fee' => $yearlyFee,
            'payment_reference' => 'OFFLINE-' . $child->id . '-' . time(),
            'payment_slip' => $path,
        ]);

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

                // Create/Sync Student Record (Generate No. Keahlian)
                $studentService = new \App\Services\StudentService();
                $studentService->syncChildToStudent($child);

                // Notify Admin
                \App\Models\Notification::createPaymentPaidNotification($child);

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
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        if (!$child->payment_completed) {
            return back()->with('payment_error', 'Pembayaran belum dibuat.');
        }

        // Calculate fee breakdown
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
        } else {
            $yearlyFee = $feeSettings->yearly_fee_below_18;
            $monthlyFee = $feeSettings->monthly_fee_below_18;
        }

        $items = [
            'yearly_fee' => $yearlyFee,
            'monthly_fee' => $monthlyFee,
            'total' => $yearlyFee + $monthlyFee
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.registration', [
            'child' => $child,
            'user' => Auth::user(),
            'items' => $items,
        ]);

        return $pdf->stream('Resit_Yuran_' . preg_replace('/[^A-Za-z0-9]/', '_', $child->name) . '.pdf');
    }
}
