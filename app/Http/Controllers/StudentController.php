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
        $query = Student::query();

        // Apply search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Apply category filter
        if ($request->has('kategori')) {
            $query->byCategory($request->kategori);
        }

        // Sort by latest update
        $query->orderBy('tarikh_kemaskini', 'desc');

        $students = $query->paginate(10)->withQueryString();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'kategori']),
        ]);
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
        $student->load('payments');
        $student->append('total_payment');
        
        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for editing the specified student
     */
    public function edit(Student $student)
    {
        // Load payments relationship
        $student->load('payments');
        return Inertia::render('Students/Edit', [
            'student' => $student
        ]);
    }

    /**
     * Update the specified student in storage
     */
    public function update(Request $request, Student $student)
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

        $student->update($validated);

        // Update payment details
        if ($request->has('payment_details')) {
            // Delete existing payments and recreate (simplest approach for full update)
            $student->payments()->delete();
            
            foreach ($request->payment_details as $detail) {
                $student->payments()->create($detail);
            }
        }

        return redirect()->route('students.index')
            ->with('success', 'Student record updated successfully.');
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

        Student::whereIn('id', $validated['ids'])->delete();

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
                // Fallback if no payment record exists
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

        $pdf = Pdf::loadView('students.summary-pdf', compact('student', 'year', 'months', 'paymentData'));
        
        // Set paper size to A4
        $pdf->setPaper('A4', 'portrait');

        $filename = 'RingkasanPembayaran-' . str_replace(' ', '-', $student->nama_pelajar) . '-' . $year . '.pdf';

        return $pdf->download($filename);
    }
}
