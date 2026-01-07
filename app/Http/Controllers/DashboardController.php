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

        $currentMonthYear = Carbon::now()->translatedFormat('F Y');
        $currentMonthNumeric = Carbon::now()->month;

        // 1. Monthly Revenue (Current Month Monthly Portion Only)
        // Total from StudentPayment for this month
        $thisMonthTotal = \App\Models\StudentPayment::where('month', $currentMonthYear)
            ->where('status', 'paid')
            ->sum('total');
        
        // Registration fees collected this month
        $regFeesThisMonth = \App\Models\Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonthNumeric)
            ->sum('registration_fee');
        
        $currentMonthRevenue = max(0, $thisMonthTotal - $regFeesThisMonth);

        // 2. Annual/Registration Fees (Total Year-to-Date)
        $annualFees = \App\Models\Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            ->sum('registration_fee');

        // 3. Total Monthly Fees Only (Year-to-Date)
        $allTimeStudentPaymentsTotal = \App\Models\StudentPayment::whereYear('payment_date', $currentYear)
            ->where('status', 'paid')
            ->sum('total');
        
        $allTimeRegFeesInPayments = \App\Models\Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            // Only count registration fees if they actually have a StudentPayment record to avoid over-deducting
            ->whereHas('student.payments') 
            ->sum('registration_fee');

        $yearlyMonthlyFees = max(0, $allTimeStudentPaymentsTotal - $allTimeRegFeesInPayments);

        // 4. Total Overall Collection (No double counting)
        $totalOverallCollection = $annualFees + $yearlyMonthlyFees;

        // 5. Top 5 Students by Attendance Percentage (Current Year)
        $topStudents = Student::withCount([
            'attendances as total_attended' => function ($query) use ($currentYear) {
                $query->whereYear('attendance_date', $currentYear)
                      ->where('status', 'hadir');
            },
            'attendances as total_sessions' => function ($query) use ($currentYear) {
                $query->whereYear('attendance_date', $currentYear);
            }
        ])
        ->get()
        ->map(function ($student) {
            $student->attendance_percentage = $student->total_sessions > 0 
                ? round(($student->total_attended / $student->total_sessions) * 100, 1) 
                : 0;
            return $student;
        })
        ->sortByDesc(function($student) {
            return [$student->attendance_percentage, $student->total_attended];
        })
        ->take(5)
        ->values()
        ->map(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->nama_pelajar,
                'percentage' => $student->attendance_percentage,
            ];
        });

        return Inertia::render('Dashboard', [
            'studentCount' => $totalStudents,
            'stats' => [
                'total_students' => $totalStudents,
                'total_centers' => $totalCenters,
                'total_coaches' => $totalCoaches,
                'total_parents' => $totalParents,
                'pending_approvals' => $pendingApprovals,
                'monthly_revenue' => $currentMonthRevenue,
                'annual_fees' => $annualFees,
                'yearly_monthly_fees' => $yearlyMonthlyFees,
                'total_revenue' => $totalOverallCollection,
                'top_students' => $topStudents,
                'current_month' => $currentMonthName,
            ]
        ]);
    }

    private function coachDashboard($user)
    {
        Carbon::setLocale('ms');
        $currentMonthNumeric = Carbon::now()->month;
        $currentMonthName = Carbon::now()->translatedFormat('F');
        $currentYear = Carbon::now()->year;
        $centerId = $user->training_center_id;

        // Scopes for reuse - only show paid & active students
        $studentsQuery = Student::whereHas('child', function($q) {
            $q->where('payment_completed', true)
              ->where('is_active', true);
        });

        // 1. Student Stats
        $totalStudents = $studentsQuery->count();
        $newStudentsMonth = (clone $studentsQuery)->whereMonth('students.created_at', Carbon::now()->month)->count();

        // 2. Attendance Stats
        $todayAttendance = Attendance::where('attendance_date', Carbon::today()->toDateString());
        
        $presentToday = (clone $todayAttendance)->where('status', 'hadir')->count();
        $totalToday = (clone $todayAttendance)->count();

        // Monthly Attendance Rate (Sessions Held)
        $monthlySessions = Attendance::whereYear('attendance_date', $currentYear)
            ->whereMonth('attendance_date', Carbon::now()->month)
            ->distinct('attendance_date', 'training_center_id')
            ->count();

        // 3. Finance Stats - Using MonthlyPayment for more accuracy per month
        $baseMonthlyPaymentQuery = \App\Models\MonthlyPayment::whereHas('child', function($q) {
                $q->where('payment_completed', true)
                  ->where('is_active', true);
            })
            ->where('year', $currentYear)
            ->where('month', $currentMonthNumeric);

        $paidCount = (clone $baseMonthlyPaymentQuery)->where('is_paid', true)->count();
        $unpaidCount = (clone $baseMonthlyPaymentQuery)->where('is_paid', false)->count();

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
