<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of students for coach (read-only)
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if ($user->role !== 'coach') {
            abort(403, 'Akses ditolak.');
        }

        // Eager load child, parent, and monthly payments for current year
        $query = Student::query()->with(['child.parent', 'child.monthlyPayments' => function($q) {
            $q->where('year', now()->year);
        }]);

        // Show students with completed payment OR from SRI Bahrul Ulum
        $query->whereHas('child', function($q) {
            $q->where(function($subQ) {
                $subQ->where(function($activeQ) {
                    $activeQ->where('payment_completed', true)
                           ->where('is_active', true);
                })->orWhereHas('trainingCenter', function($tcQ) {
                    $tcQ->where('name', 'Sek Ren Islam Bahrul Ulum');
                });
            });
        });

        // Apply search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Apply training center filter
        if ($request->filled('training_center_id')) {
            $query->whereHas('child', function($q) use ($request) {
                $q->where('training_center_id', $request->training_center_id);
            });
        }

        // Apply category filter
        if ($request->has('kategori')) {
            $query->byCategory($request->kategori);
        }

        // Sort by latest update
        $query->orderBy('tarikh_kemaskini', 'desc');

        $students = $query->paginate(10)->withQueryString();

        // Calculate dynamic fields
        $students->getCollection()->transform(function ($student) {
            $paidCount = 0;
            if ($student->child && $student->child->monthlyPayments) {
                $paidCount = $student->child->monthlyPayments->where('is_paid', true)->count();
            }
            $student->status_bayaran = $paidCount; 
            return $student;
        });

        // Calculate statistics - include SRI Bahrul Ulum students
        $statsQuery = Student::whereHas('child', function($q) {
            $q->where(function($subQ) {
                $subQ->where(function($activeQ) {
                    $activeQ->where('payment_completed', true)
                           ->where('is_active', true);
                })->orWhereHas('trainingCenter', function($tcQ) {
                    $tcQ->where('name', 'Sek Ren Islam Bahrul Ulum');
                });
            });
        });

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'total_below_18' => (clone $statsQuery)->where('kategori', 'kanak-kanak')->count(),
            'total_above_18' => (clone $statsQuery)->where('kategori', 'dewasa')->count(),
        ];

        return Inertia::render('Coach/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'kategori', 'training_center_id']),
            'stats' => $stats,
            'trainingCenters' => \App\Models\TrainingCenter::all(),
        ]);
    }

    /**
     * Display the specified student (read-only)
     */
    public function show(Student $student)
    {
        $user = auth()->user();
        
        if ($user->role !== 'coach') {
            abort(403, 'Akses ditolak.');
        }

        // Verify student is active and paid OR from SRI Bahrul Ulum
        $isSRIBahrulUlum = $student->child && 
                          $student->child->trainingCenter && 
                          $student->child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';
        
        $hasAccess = $student->child && 
                     (($student->child->payment_completed && $student->child->is_active) || $isSRIBahrulUlum);
        
        if (!$hasAccess) {
            abort(403, 'Rekod pelajar ini belum aktif atau belum berbayar.');
        }


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
            $student->child->monthly_payments = $student->child->monthlyPayments->map(function($mp) {
                return [
                    'month' => $mp->month,
                    'is_paid' => $mp->is_paid,
                    'paid_date' => $mp->paid_date,
                    'receipt_number' => $mp->payment?->receipt_number,
                    'student_payment_id' => $mp->student_payment_id,
                ];
            });
        }

        $student->append('total_payment');
        
        return Inertia::render('Coach/Students/Show', [
            'student' => $student,
            'currentYear' => now()->year,
            'readOnly' => true,
        ]);
    }
}
