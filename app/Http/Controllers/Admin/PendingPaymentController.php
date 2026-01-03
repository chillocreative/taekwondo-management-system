<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Child;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PendingPaymentController extends Controller
{
    /**
     * Display pending offline payments
     */
    public function index()
    {
        $pendingPayments = Child::with(['parent', 'trainingCenter'])
            ->where('payment_method', 'offline')
            ->where('payment_completed', false)
            ->latest()
            ->get();

        return Inertia::render('Admin/PendingPayments', [
            'pendingPayments' => $pendingPayments,
        ]);
    }

    /**
     * Approve offline payment and activate participant
     */
    public function approve(Child $child)
    {
        if ($child->payment_method !== 'offline' || $child->payment_completed) {
            return redirect()->back()
                ->with('error', 'Pembayaran ini tidak boleh diluluskan.');
        }

        $child->update([
            'payment_completed' => true,
            'payment_date' => now(),
            'is_active' => true,
        ]);

        // Create/Sync Student Record (Generate No. Keahlian)
        $studentService = new \App\Services\StudentService();
        $studentService->syncChildToStudent($child);

        // Create notification for admin
        \App\Models\Notification::createPaymentPaidNotification($child);

        return redirect()->back()
            ->with('success', 'Pembayaran telah diluluskan dan peserta telah diaktifkan.');
    }

    /**
     * Reject offline payment request
     */
    public function reject(Child $child)
    {
        if ($child->payment_method !== 'offline' || $child->payment_completed) {
            return redirect()->back()
                ->with('error', 'Pembayaran ini tidak boleh ditolak.');
        }

        $child->update([
            'payment_method' => 'none',
            'payment_reference' => null,
        ]);

        return redirect()->back()
            ->with('success', 'Permohonan pembayaran telah ditolak.');
    }
}
