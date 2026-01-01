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
        $query = StudentPayment::with(['student.child.parent']);

        if ($request->search) {
            $search = $request->search;
            $query->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('no_siri', 'like', "%{$search}%")
                        ->orWhere('nama_pelajar', 'like', "%{$search}%");
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
