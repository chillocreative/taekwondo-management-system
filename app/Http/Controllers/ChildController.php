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
            'ic_number' => 'nullable|string|max:12',
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
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
            'ic_number' => 'nullable|string|max:12',
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
            'is_active' => 'boolean',
            'from_other_club' => 'boolean',
            'tm_number' => 'nullable|string|max:50',
            'belt_certificate' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
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
     * Show payment page
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

        return Inertia::render('Children/Payment', [
            'child' => $child->load('trainingCenter'),
            'yearlyFee' => $yearlyFee,
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

        // Calculate yearly fee based on age
        $feeSettings = \App\Models\FeeSetting::current();
        
        if ($child->date_of_birth) {
            $yearlyFee = $feeSettings->getYearlyFeeByDob($child->date_of_birth);
            $age = \Carbon\Carbon::parse($child->date_of_birth)->age;
            $ageCategory = $age < 18 ? 'Bawah 18 tahun' : '18 tahun ke atas';
        } else {
            // Default to below 18 if no DOB
            $yearlyFee = $feeSettings->yearly_fee_below_18;
            $ageCategory = 'Bawah 18 tahun (tiada tarikh lahir)';
        }

        // Create ToyyibPay bill
        $toyyibPay = new \App\Services\ToyyibPayService();
        
        $billData = [
            'billName' => 'Yuran Tahunan - ' . $child->name,
            'billDescription' => 'Yuran tahunan peserta taekwondo (' . $ageCategory . ')',
            'billAmount' => $yearlyFee,
            'billReturnUrl' => route('children.payment.callback'),
            'billCallbackUrl' => route('children.payment.callback.post'),
            'billExternalReferenceNo' => 'CHILD-' . $child->id . '-' . time(),
            'billTo' => Auth::user()->name,
            'billEmail' => Auth::user()->email,
            'billPhone' => Auth::user()->phone ?? '',
        ];

        $result = $toyyibPay->createBill($billData);

        if ($result['success']) {
            // Update child with payment reference
            $child->update([
                'registration_fee' => $yearlyFee,
                'payment_reference' => $result['billCode'],
            ]);

            // Redirect to ToyyibPay payment page
            return redirect($result['paymentUrl']);
        }

        return redirect()->route('children.index')
            ->with('error', 'Gagal memulakan pembayaran. Sila cuba lagi.');
    }

    /**
     * Request offline payment (pending admin approval)
     */
    public function requestOfflinePayment(Child $child)
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
        } else {
            $yearlyFee = $feeSettings->yearly_fee_below_18;
        }

        // Mark as offline payment pending
        $child->update([
            'payment_method' => 'offline',
            'registration_fee' => $yearlyFee,
            'payment_reference' => 'OFFLINE-' . $child->id . '-' . time(),
        ]);

        return redirect()->route('children.index')
            ->with('success', 'Permohonan pembayaran offline telah dihantar. Sila tunggu kelulusan admin.');
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

                return redirect()->route('children.index')
                    ->with('success', 'Pembayaran berjaya! Peserta telah diaktifkan.');
            }
        }

        return redirect()->route('children.index')
            ->with('error', 'Pembayaran gagal atau belum selesai.');
    }
}
