<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Child;
use App\Models\MonthlyPayment;
use App\Models\StudentPayment;
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
        $currentMonthName = Carbon::now()->translatedFormat('F Y');
        $currentMonthNumeric = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // Base query for active students (either via Child profile or those who have made payments)
        $totalStudents = Student::count();
        $totalCenters = \App\Models\TrainingCenter::count();
        $totalCoaches = \App\Models\User::where('role', 'coach')->count();
        $totalParents = \App\Models\User::where('role', 'user')->count();
        
        // Pending registrations (approvals/payments/inactive)
        $pendingApprovals = Child::where(function($q) {
            $q->where('payment_completed', false)
              ->orWhere('is_active', false);
        })->count();

        // --- ACTUAL FINANCIAL DATA SYNC ---
        // We use StudentPayment as the primary transaction log for "Actual Data"
        
        // 1. Total Overall Collection (Year-to-Date) - Everything collected in the current year
        $totalOverallCollection = StudentPayment::whereYear('payment_date', $currentYear)
            ->where('status', 'paid')
            ->sum('total');

        // 2. Annual/Registration Fees (Year-to-Date) from Child records
        $annualFees = Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            ->sum('registration_fee');

        // 3. Yearly Monthly Fees (Total - Annual)
        $yearlyMonthlyFees = max(0, $totalOverallCollection - $annualFees);

        // 4. Monthly Revenue (Current Month) - All collections within this month
        $currentMonthTotalRevenue = StudentPayment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonthNumeric)
            ->where('status', 'paid')
            ->sum('total');
            
        // 4b. Subtract registration fees collected this month to get "strictly" monthly fee revenue
        $currentMonthRegFees = Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonthNumeric)
            ->sum('registration_fee');
            
        $currentMonthRevenue = max(0, $currentMonthTotalRevenue - $currentMonthRegFees);

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
        $currentMonthName = Carbon::now()->translatedFormat('F Y');
        $currentYear = Carbon::now()->year;
        $centerId = $user->training_center_id;

        // Scopes for reuse - only show paid & active students for this coach's center
        $studentsQuery = Student::whereHas('child', function($q) use ($centerId) {
            $q->where('payment_completed', true)
              ->where('is_active', true);
            if ($centerId) {
                $q->where('training_center_id', $centerId);
            }
        });

        // 1. Student Stats
        $totalStudents = $studentsQuery->count();
        $newStudentsMonth = (clone $studentsQuery)->whereMonth('students.created_at', Carbon::now()->month)->count();

        // 2. Attendance Stats
        $todayAttendance = Attendance::where('attendance_date', Carbon::today()->toDateString());
        if ($centerId) {
            $todayAttendance->where('training_center_id', $centerId);
        }
        
        $presentToday = (clone $todayAttendance)->where('status', 'hadir')->count();
        $totalToday = (clone $todayAttendance)->count();

        // Monthly Attendance Rate (Sessions Held)
        $monthlySessionsQuery = Attendance::whereYear('attendance_date', $currentYear)
            ->whereMonth('attendance_date', Carbon::now()->month);
        
        if ($centerId) {
            $monthlySessionsQuery->where('training_center_id', $centerId);
        }
        
        $monthlySessions = $monthlySessionsQuery->distinct('attendance_date', 'training_center_id')->count();

        // 3. Finance Stats - Using MonthlyPayment for more accuracy per month
        $baseMonthlyPaymentQuery = \App\Models\MonthlyPayment::whereHas('child', function($q) use ($centerId) {
                $q->where('payment_completed', true)
                  ->where('is_active', true);
                if ($centerId) {
                    $q->where('training_center_id', $centerId);
                }
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
