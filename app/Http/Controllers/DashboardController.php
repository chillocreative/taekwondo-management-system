<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Child;
use App\Models\MonthlyPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return $this->adminDashboard();
        }

        if ($user->role === 'coach') {
            return $this->coachDashboard($user);
        }

        return $this->userDashboard($user);
    }

    private function adminDashboard()
    {
        return Inertia::render('Dashboard', [
            'studentCount' => Student::count(),
            'stats' => [
                'total_students' => Student::count(),
                'active_students' => Student::count(), // Add more logic if needed
                'pending_registrations' => Child::where('payment_completed', false)->count(),
                'monthly_revenue' => MonthlyPayment::where('year', now()->year)->where('month', now()->format('F'))->count() * 50, // Placeholder
            ]
        ]);
    }

    private function coachDashboard($user)
    {
        return Inertia::render('Dashboard', [
            'studentCount' => Student::count(),
            'stats' => [
                'my_students' => Student::whereHas('child', function($q) use ($user) {
                    $q->where('training_center_id', $user->training_center_id);
                })->count(),
                'attendance_today' => Attendance::where('attendance_date', now()->toDateString())
                    ->whereHas('student.child', function($q) use ($user) {
                        $q->where('training_center_id', $user->training_center_id);
                    })->count(),
            ]
        ]);
    }

    private function userDashboard($user)
    {
        $children = Child::where('parent_id', $user->id)
            ->with(['student.attendances', 'trainingCenter', 'monthlyPayments' => function($q) {
                $q->where('year', now()->year);
            }])
            ->get();

        $pesertaData = $children->map(function($child) {
            $student = $child->student;
            
            // Attendance summary
            $attendanceCount = $student ? $student->attendances()->whereYear('attendance_date', now()->year)->count() : 0;
            $presentCount = $student ? $student->attendances()->whereYear('attendance_date', now()->year)->where('status', 'hadir')->count() : 0;
            
            // Payment summary
            $monthlyPayments = $child->monthlyPayments;
            $paidMonthsCount = $monthlyPayments->where('is_paid', true)->count();
            
            return [
                'id' => $child->id,
                'name' => $child->name,
                'no_siri' => $student?->no_siri ?? '-',
                'belt' => $child->belt_level_malay,
                'training_center' => $child->trainingCenter->name ?? '-',
                'attendance_rate' => $attendanceCount > 0 ? round(($presentCount / $attendanceCount) * 100) : 0,
                'paid_months' => $paidMonthsCount,
                'outstanding_months' => max(0, now()->month - $paidMonthsCount), // Simple logic
                'last_attendance' => $student ? $student->attendances()->latest('attendance_date')->first()?->attendance_date?->format('d/m/Y') : 'Tiada rekod',
                'status_bayaran' => $child->payment_completed ? 'Aktif' : 'Menunggu Bayaran',
            ];
        });

        return Inertia::render('Dashboard', [
            'pesertaData' => $pesertaData,
            'stats' => [
                'total_anak' => $children->count(),
                'total_hadir' => $children->sum(function($c) { 
                    return $c->student ? $c->student->attendances()->where('status', 'hadir')->count() : 0; 
                }),
            ]
        ]);
    }
}
