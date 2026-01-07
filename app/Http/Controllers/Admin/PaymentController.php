<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin' && $user->role !== 'coach') {
            abort(403);
        }

        $query = StudentPayment::with(['student.child.parent']);

        // Filter by Training Center if Coach has one
        if ($user->role === 'coach' && $user->training_center_id) {
            $query->whereHas('student.child', function($q) use ($user) {
                $q->where('training_center_id', $user->training_center_id);
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

        // Add filter by status if needed
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
}
