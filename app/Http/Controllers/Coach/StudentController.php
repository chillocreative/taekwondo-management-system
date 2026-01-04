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

        $query = Student::query();

        // Only show students with completed payment
        $query->whereHas('child', function($q) use ($user) {
            $q->where('payment_completed', true)
              ->where('is_active', true);
            
            // If coach has assigned training center, filter by it
            if ($user->training_center_id) {
                $q->where('training_center_id', $user->training_center_id);
            }
        });

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

        // Calculate statistics
        $statsQuery = Student::whereHas('child', function($q) use ($user) {
            $q->where('payment_completed', true)
              ->where('is_active', true);
            
            if ($user->training_center_id) {
                $q->where('training_center_id', $user->training_center_id);
            }
        });

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'paid' => (clone $statsQuery)->where('status_bayaran', '>=', 12)->count(),
            'pending' => (clone $statsQuery)->where('status_bayaran', '<', 12)->count(),
        ];

        return Inertia::render('Coach/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'kategori']),
            'stats' => $stats,
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

        // Verify coach has access to this student
        $hasAccess = $student->child && 
                     $student->child->payment_completed && 
                     $student->child->is_active;
        
        if ($user->training_center_id) {
            $hasAccess = $hasAccess && 
                        $student->child->training_center_id === $user->training_center_id;
        }

        if (!$hasAccess) {
            abort(403, 'Anda tidak mempunyai akses ke pelajar ini.');
        }

        $student->load('payments');
        $student->append('total_payment');
        
        return Inertia::render('Coach/Students/Show', [
            'student' => $student,
            'readOnly' => true, // Flag for frontend to disable editing
        ]);
    }
}
