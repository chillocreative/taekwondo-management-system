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
        Carbon::setLocale('ms');
        $currentMonthName = Carbon::now()->translatedFormat('F');
        $currentYear = Carbon::now()->year;

        // Statistics calculation
        $totalStudents = Student::count();
        $totalCenters = \App\Models\TrainingCenter::count();
        $totalCoaches = \App\Models\User::where('role', 'coach')->count();
        $totalParents = \App\Models\User::where('role', 'user')->count();
        
        // Pending registrations (approvals/payments)
        $pendingApprovals = Child::where('payment_completed', false)->count();

        // Actual Monthly Revenue
        $monthlyRevenue = \App\Models\StudentPayment::where('month', $currentMonthName)
            ->whereYear('payment_date', $currentYear)
            ->where('status', 'paid')
            ->sum('total');

        return Inertia::render('Dashboard', [
            'studentCount' => $totalStudents,
            'stats' => [
                'total_students' => $totalStudents,
                'total_centers' => $totalCenters,
                'total_coaches' => $totalCoaches,
                'total_parents' => $totalParents,
                'pending_approvals' => $pendingApprovals,
                'monthly_revenue' => $monthlyRevenue,
                'current_month' => $currentMonthName,
            ]
        ]);
    }

    private function coachDashboard($user)
    {
        Carbon::setLocale('ms');
        $currentMonthName = Carbon::now()->translatedFormat('F');
        $currentYear = Carbon::now()->year;
        $centerId = $user->training_center_id;

        // Scopes for reuse
        $studentsQuery = Student::whereHas('child', function($q) use ($centerId) {
            $q->where('training_center_id', $centerId);
        });

        // 1. Student Stats
        $totalStudents = $studentsQuery->count();
        $newStudentsMonth = (clone $studentsQuery)->whereMonth('created_at', Carbon::now()->month)->count();

        // 2. Attendance Stats
        $todayAttendance = Attendance::where('attendance_date', Carbon::today()->toDateString())
            ->where('training_center_id', $centerId);
        
        $presentToday = (clone $todayAttendance)->where('status', 'hadir')->count();
        $totalToday = $todayAttendance->count(); // Can be used to show "X / Y marked"

        // Monthly Attendance Rate (Sessions Held)
        $monthlySessions = Attendance::where('training_center_id', $centerId)
            ->whereMonth('attendance_date', Carbon::now()->month)
            ->distinct('attendance_date')
            ->count();

        // 3. Finance Stats
        $paidCount = \App\Models\StudentPayment::whereHas('student.child', function($q) use ($centerId) {
                $q->where('training_center_id', $centerId);
            })
            ->where('month', $currentMonthName)
            ->whereYear('payment_date', $currentYear) // Use whereYear on payment_date
            ->where('status', 'paid')
            ->count();
            
        // Estimated Unpaid (Total Active Students - Paid)
        // This is a rough estimate as some might not be liable, but good for a simple dashboard
        $unpaidCount = max(0, $totalStudents - $paidCount);

        return Inertia::render('Dashboard', [
            'studentCount' => $totalStudents, 
            'stats' => [
                'total_students' => $totalStudents,
                'new_students' => $newStudentsMonth,
                'present_today' => $presentToday,
                'total_today_marked' => $totalToday,
                'monthly_sessions' => $monthlySessions,
                'paid_month' => $paidCount,
                'unpaid_month' => $unpaidCount,
                'current_month' => $currentMonthName,
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
