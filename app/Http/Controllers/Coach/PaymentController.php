<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\StudentPayment;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if ($user->role !== 'coach' && $user->role !== 'admin') {
            abort(403);
        }

        $query = StudentPayment::with(['student.child.parent']);

        // Filter by Training Center from Request
        if ($request->filled('training_center_id')) {
            $query->whereHas('student.child', function($q) use ($request) {
                $q->where('training_center_id', $request->training_center_id);
            });
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function($sq) use ($search) {
                      $sq->where('no_siri', 'like', "%{$search}%")
                        ->orWhere('nama_pelajar', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Coach/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'training_center_id']),
            'trainingCenters' => TrainingCenter::all(['id', 'name']),
        ]);
    }
}
