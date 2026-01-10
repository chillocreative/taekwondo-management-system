<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of students with search and filter
     */
    public function index(Request $request)
    {
        // Initial query with eager loading
        $query = Student::query()->with(['child.parent', 'child.monthlyPayments' => function($q) {
            $q->where('year', now()->year);
        }]);

        // Apply search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply category filter
        if ($request->filled('kategori')) {
            $query->byCategory($request->kategori);
        }

        // Apply training center filter
        if ($request->filled('training_center_id')) {
            $query->whereHas('child', function($q) use ($request) {
                $q->where('training_center_id', $request->training_center_id);
            });
        }

        // Sort by latest update
        $query->orderBy('tarikh_kemaskini', 'desc');

        $students = $query->paginate(15)->withQueryString();

        // Calculate dynamic fields
        $students->getCollection()->transform(function ($student) {
            $paidCount = 0;
            if ($student->child && $student->child->monthlyPayments) {
                $paidCount = $student->child->monthlyPayments->where('is_paid', true)->count();
            }
            // Override or append calculated status
            $student->status_bayaran = $paidCount; 
            
            // Append Yuran Tahunan status
            $student->yuran_tahunan_paid = $student->child ? $student->child->payment_completed : false;
            
            return $student;
        });

        // Calculate statistics (Synced with Dashboard)
        $stats = [
            'total_paid' => Student::count(),
            'total_below_18' => Student::where('kategori', 'kanak-kanak')->count(),
            'total_above_18' => Student::where('kategori', 'dewasa')->count(),
        ];
        
        $trainingCenters = \App\Models\TrainingCenter::all();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'trainingCenters' => $trainingCenters,
            'filters' => $request->only(['search', 'kategori', 'training_center_id']),
            'stats' => $stats,
        ]);
    }

    /**
     * Approve manual/offline payment for a student
     */
    public function approvePayment(Student $student)
    {
        if (!$student->child) {
            return back()->with('error', 'Rekod profil tidak dijumpai.');
        }

        // Calculate fee if not already set (fallback)
        if (!$student->child->registration_fee) {
            $feeSettings = \App\Models\FeeSetting::current();
            $registrationFee = $student->kategori === 'kanak-kanak' 
                ? $feeSettings->yearly_fee_below_18 
                : $feeSettings->yearly_fee_above_18;
        } else {
            $registrationFee = $student->child->registration_fee;
        }

        // Update child record
        $student->child->update([
            'payment_completed' => true,
            'payment_method' => $student->child->payment_method ?? 'offline',
            'payment_date' => now(),
            'is_active' => true,
            'registration_fee' => $registrationFee,
        ]);

        // Sync and ensure monthly records exist
        $studentService = new \App\Services\StudentService();
        $studentService->syncChildToStudent($student->child);

        return back()->with('success', "Pendaftaran untuk {$student->nama_pelajar} telah berjaya diluluskan.");
    }

    /**
     * Show the form for creating a new student
     */
    public function create()
    {
        return Inertia::render('Students/Create');
    }

    /**
     * Store a newly created student in storage
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pelajar' => 'required|string|max:255',
            'nama_penjaga' => 'required|string|max:255',
            'alamat' => 'required|string',
            'no_tel' => 'required|string|max:20',
            'kategori' => 'required|in:kanak-kanak,dewasa',
            'status_bayaran' => 'required|integer|min:0|max:12',
            'payment_details' => 'nullable|array',
            'payment_details.*.month' => 'required|string',
            'payment_details.*.kategori' => 'required|in:kanak-kanak,dewasa',
            'payment_details.*.quantity' => 'required|integer|min:0',
            'payment_details.*.amount' => 'required|numeric|min:0',
            'payment_details.*.total' => 'required|numeric|min:0',
        ]);

        $validated['tarikh_kemaskini'] = now();

        $student = Student::create($validated);

        // Save payment details
        if ($request->has('payment_details')) {
            foreach ($request->payment_details as $detail) {
                $student->payments()->create($detail);
            }
        }

        return redirect()->route('students.index')
            ->with('success', 'Student record created successfully.');
    }

    /**
     * Display the specified student
     */
    public function show(Student $student)
    {
        $student->load([
            'payments' => function($q) {
                $q->where('status', 'paid');
            }, 
            'child.monthlyPayments' => function($q) {
                 $q->where('year', now()->year)->orderBy('month');
            }, 
            'child.parent', 
            'child.trainingCenter'
        ]);

        // Map receipt IDs to monthly payments for the frontend
        if ($student->child && $student->child->monthlyPayments) {
            $student->child->monthlyPayments->map(function ($mp) use ($student) {
                $monthStr = $mp->month_name . ' ' . $mp->year;
                $sp = $student->payments->first(function ($p) use ($monthStr) {
                    return $p->month === $monthStr;
                });
                
                $mp->student_payment_id = $sp ? $sp->id : null;
                return $mp;
            });
        }
        $student->append('total_payment');
        
        return Inertia::render('Students/Show', [
            'student' => $student,
            'currentYear' => now()->year,
        ]);
    }

    /**
     * Show the form for editing the specified student
     */
    public function edit(Student $student)
    {
        // Load payments relationship and child details
        $student->load([
            'payments',
            'child.monthlyPayments' => function($q) {
                $q->where('year', now()->year)->orderBy('month');
            }
        ]);

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'trainingCenters' => \App\Models\TrainingCenter::active()->orderBy('name')->get(),
            'currentYear' => now()->year
        ]);
    }

    /**
     * Update the specified student in storage
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            // Student specific (some overlap with child)
            'nama_pelajar' => 'required|string|max:255',
            'nama_penjaga' => 'required|string|max:255',
            'alamat' => 'required|string',
            'no_tel' => 'required|string|max:20',
            'kategori' => 'required|in:kanak-kanak,dewasa',
            
            // Child profile fields
            'training_center_id' => 'nullable|exists:training_centers,id',
            'ic_number' => 'nullable|string|max:12',
            'belt_level' => 'nullable|string',
            'tm_number' => 'nullable|string|max:50',
            'guardian_occupation' => 'nullable|string|max:255',
            'guardian_ic_number' => 'nullable|string|max:20',
            'guardian_age' => 'nullable|integer',
            'guardian_phone' => 'nullable|string|max:20',
            'postcode' => 'nullable|string|max:10',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'phone_number' => 'nullable|string|max:20',
            'school_name' => 'nullable|string|max:255',
            'school_class' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'age' => 'nullable|integer',
        ]);

        $student->update([
            'nama_pelajar' => $validated['nama_pelajar'],
            'nama_penjaga' => $validated['nama_penjaga'],
            'alamat' => $validated['alamat'],
            'no_tel' => $validated['no_tel'],
            'kategori' => $validated['kategori'],
            'tarikh_kemaskini' => now(),
        ]);

        // Update linked child if exists
        if ($student->child) {
            $student->child->update([
                'training_center_id' => $validated['training_center_id'],
                'name' => $validated['nama_pelajar'],
                'ic_number' => $validated['ic_number'],
                'belt_level' => $validated['belt_level'],
                'tm_number' => $validated['tm_number'],
                'guardian_name' => $validated['nama_penjaga'],
                'guardian_occupation' => $validated['guardian_occupation'],
                'guardian_ic_number' => $validated['guardian_ic_number'],
                'guardian_age' => $validated['guardian_age'],
                'guardian_phone' => $validated['guardian_phone'],
                'address' => $validated['alamat'],
                'postcode' => $validated['postcode'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'phone_number' => $validated['phone_number'],
                'school_name' => $validated['school_name'],
                'school_class' => $validated['school_class'],
                'date_of_birth' => $validated['date_of_birth'],
            ]);
        }

        return redirect()->route('students.index')
            ->with('success', 'Rekod pelajar berjaya dikemaskini.');
    }

    /**
     * Remove the specified student from storage
     */
    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Student record deleted successfully.');
    }

    /**
     * Remove multiple students from storage
     */
    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:students,id'
        ]);

        $students = Student::whereIn('id', $validated['ids'])->get();
        foreach ($students as $student) {
            $student->delete();
        }

        return redirect()->route('students.index')
            ->with('success', count($validated['ids']) . ' student records deleted successfully.');
    }

    /**
     * Preview payment summary for a student
     */
    public function previewRingkasan(Student $student)
    {
        // Refresh the student data from the database and load payments
        $student->refresh();
        $student->load('payments');
        
        $year = 2025;
        $months = [
            'JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN',
            'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'
        ];

        // Calculate payment data for each month from saved payments
        $paymentData = [];
        $payments = $student->payments->keyBy('month');

        foreach ($months as $monthName) {
            $fullMonthName = $monthName . ' ' . $year;
            $payment = $payments->get($fullMonthName);
            
            if ($payment) {
                $paymentData[] = [
                    'month' => $fullMonthName,
                    'paid' => $payment->quantity > 0,
                    'amount' => $payment->amount,
                    'quantity' => $payment->quantity,
                    'total' => $payment->total,
                    'kategori' => $payment->kategori
                ];
            } else {
                // Fallback if no payment record exists (shouldn't happen if saved correctly)
                $paymentData[] = [
                    'month' => $fullMonthName,
                    'paid' => false,
                    'amount' => $student->monthly_fee,
                    'quantity' => 0,
                    'total' => 0,
                    'kategori' => $student->kategori
                ];
            }
        }

        return view('students.summary', compact('student', 'year', 'months', 'paymentData'));
    }

    /**
     * Export payment summary as PDF
     */
    public function exportPDF(Student $student)
    {
        // Refresh the student data and eager load child, payments, and monthly payments
        $student->refresh();
        $student->load(['payments', 'child.monthlyPayments' => function($q) {
            $q->where('year', now()->year)->orderBy('month');
        }, 'child.trainingCenter', 'child.parent']);
        
        $year = now()->year;
        $months = [
            'JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN',
            'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'
        ];

        // Prepare monthly payment schedule data
        $monthlyPayments = [];
        if ($student->child) {
            $payments = $student->child->monthlyPayments->keyBy('month');
            for ($m = 1; $m <= 12; $m++) {
                $payment = $payments->get($m);
                $monthlyPayments[] = [
                    'month' => $months[$m-1] . ' ' . $year,
                    'status' => $payment && $payment->is_paid ? 'SUDAH DIBAYAR' : 'TERTUNGGAK',
                    'date' => $payment && $payment->paid_date ? $payment->paid_date->format('d/m/Y') : '-',
                    'receipt' => $payment && $payment->receipt_number ? $payment->receipt_number : '-',
                    'is_paid' => $payment && $payment->is_paid,
                    'amount' => $student->monthly_fee
                ];
            }
        }

        // Keep existing paymentData for backward compatibility if needed, 
        // but we'll prioritize monthlyPayments in the new PDF view
        $paymentData = [];
        $manualPayments = $student->payments->keyBy('month');
        foreach ($months as $monthName) {
            $fullMonthName = $monthName . ' ' . $year;
            $payment = $manualPayments->get($fullMonthName);
            if ($payment) {
                $paymentData[] = [
                    'month' => $fullMonthName,
                    'paid' => $payment->quantity > 0,
                    'amount' => $payment->amount,
                    'quantity' => $payment->quantity,
                    'total' => $payment->total,
                    'kategori' => $payment->kategori
                ];
            }
        }

        $pdf = Pdf::loadView('students.summary-pdf', compact('student', 'year', 'months', 'paymentData', 'monthlyPayments'));
        $pdf->setPaper('A4', 'portrait');

        $filename = 'Ringkasan-Pelajar-' . str_replace(' ', '-', $student->nama_pelajar) . '-' . $year . '.pdf';

        return $pdf->download($filename);
    }
}
