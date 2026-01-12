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
        \Carbon\Carbon::setLocale('ms');
        $currentMonthName = \App\Models\MonthlyPayment::getMalayName(\Carbon\Carbon::now()->month) . ' ' . \Carbon\Carbon::now()->year;
        $currentMonthNumeric = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $prevYear = $currentYear - 1;

        // 1. WhatsApp Server Heartbeat
        $serverUrl = env('WHATSAPP_SERVER_URL', 'http://localhost:3001');
        $whatsappConnected = false;
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(1)
                ->withoutVerifying()
                ->get($serverUrl . '/whatsapp-api/status');
            if ($response->successful()) {
                $whatsappConnected = $response->json('connected', false);
            }
        } catch (\Exception $e) {
            // Offline
        }

        // 2. Retention Metrics (New Year Logic)
        $totalStudentsPrevYear = Student::whereYear('created_at', '<=', $prevYear)->count();
        $renewedStudents = Student::whereHas('child', function($q) use ($currentYear) {
            $q->where('payment_completed', true)
              ->whereNotNull('payment_date')
              ->whereYear('payment_date', $currentYear);
        })->count();

        // 3. Base Stats
        $totalStudents = Student::count();
        $totalCenters = \App\Models\TrainingCenter::count();
        $totalCoaches = \App\Models\User::where('role', 'coach')->count();
        $totalParents = \App\Models\User::where('role', 'user')->count();
        
        $pendingApprovals = Child::where(function($q) use ($currentYear) {
            $q->where('payment_completed', false)
              ->orWhere('last_updated_year', '<', $currentYear);
        })->count();

        // --- ACTUAL FINANCIAL DATA SYNC ---
        // Source of Truth: 
        // 1. Registration Fees = registration_fee in Child model
        // 2. Monthly Fees = portions of StudentPayment total that are NOT registration_fee
        
        $annualFees = Child::where('payment_completed', true)
            ->whereYear('payment_date', $currentYear)
            ->sum('registration_fee');

        $allSpThisYear = StudentPayment::whereYear('payment_date', $currentYear)
            ->where('status', 'paid')
            ->get();
            
        $yearlyMonthlyFees = 0;
        $currentMonthRevenue = 0;
        
        foreach ($allSpThisYear as $sp) {
            // Check if this payment matches a registration transaction
            $regMatch = Child::where('payment_completed', true)
                ->where('payment_reference', $sp->transaction_ref)
                ->whereNotNull('payment_reference')
                ->first();
                
            $monthlyPortion = $sp->total;
            if ($regMatch) {
                // Subtract registration part to get only the monthly fee component
                $monthlyPortion = max(0, $sp->total - $regMatch->registration_fee);
            }
            
            $yearlyMonthlyFees += $monthlyPortion;
            
            // Current month calculation
            if ($sp->payment_date && $sp->payment_date->month == $currentMonthNumeric) {
                $currentMonthRevenue += $monthlyPortion;
            }
        }

        // Comparison for current month vs last year's same month
        $lastYearMonthRevenue = StudentPayment::whereYear('payment_date', $prevYear)
            ->whereMonth('payment_date', $currentMonthNumeric)
            ->where('status', 'paid')
            ->sum('total');

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
                'last_year_revenue' => $lastYearMonthRevenue,
                'annual_fees' => $annualFees,
                'yearly_monthly_fees' => $yearlyMonthlyFees,
                'total_revenue' => $totalOverallCollection,
                'top_students' => $topStudents,
                'current_month' => $currentMonthName,
                'retention_stats' => [
                    'prev_year_total' => $totalStudentsPrevYear,
                    'renewed' => $renewedStudents,
                    'percentage' => $totalStudentsPrevYear > 0 ? round(($renewedStudents / $totalStudentsPrevYear) * 100, 1) : 0
                ],
                'whatsapp_connected' => $whatsappConnected,
                'current_year' => $currentYear
            ]
        ]);
    }

    private function coachDashboard($user)
    {
        Carbon::setLocale('ms');
        $currentMonthNumeric = Carbon::now()->month;
        $currentMonthName = \App\Models\MonthlyPayment::getMalayName(\Carbon\Carbon::now()->month) . ' ' . \Carbon\Carbon::now()->year;
        $currentYear = Carbon::now()->year;
        $centerId = $user->training_center_id;

        // Scopes for reuse - show paid & active students OR those from SRI Bahrul Ulum
        $studentsQuery = Student::whereHas('child', function($q) {
            $q->where(function($subQ) {
                $subQ->where(function($activeQ) {
                    $activeQ->where('payment_completed', true)
                           ->where('is_active', true);
                })->orWhereHas('trainingCenter', function($tcQ) {
                    $tcQ->where('name', 'Sek Ren Islam Bahrul Ulum');
                });
            });
        });

        // 1. Student Stats
        // Get all students associated with children who are registered under this coach's training center
        $studentsQuery = Student::whereHas('child', function($q) use ($centerId) {
            $q->where('training_center_id', $centerId);
        });

        $totalStudents = $studentsQuery->count();
        $studentIds = (clone $studentsQuery)->pluck('id');
        
        // Renewed = payment_completed AND is_active for CURRENT YEAR
        // Check if child has payment_completed = true AND is_active = true
        $renewedCount = (clone $studentsQuery)->whereHas('child', function($q) use ($currentYear) {
            $q->where('payment_completed', true)
              ->where('is_active', true)
              ->where('last_updated_year', $currentYear);
        })->count();

        // Pending Renewal = those who are NOT renewed yet
        // Exclude special center (Sek Ren Islam Bahrul Ulum) from pending count
        $pendingRenewalCount = (clone $studentsQuery)->whereHas('child', function($q) use ($currentYear) {
            $q->where(function($subQ) use ($currentYear) {
                // Not paid/active for current year
                $subQ->where('payment_completed', false)
                     ->orWhere('is_active', false)
                     ->orWhere('last_updated_year', '<', $currentYear)
                     ->orWhereNull('last_updated_year');
            })
            // Exclude special center
            ->whereDoesntHave('trainingCenter', function($tcQ) {
                $tcQ->where('name', 'Sek Ren Islam Bahrul Ulum');
            });
        })->count();

        $newStudentsMonth = (clone $studentsQuery)->whereMonth('students.created_at', Carbon::now()->month)
            ->whereYear('students.created_at', $currentYear)
            ->count();

        // 2. Attendance Stats
        $todayAttendance = Attendance::where('attendance_date', Carbon::today()->toDateString());
        
        $presentToday = (clone $todayAttendance)->where('status', 'hadir')->count();
        // Set totalToday to total students in this training center
        $totalToday = $totalStudents;

        // Monthly Attendance Rate (Sessions Held)
        $monthlySessionsQuery = Attendance::whereYear('attendance_date', $currentYear)
            ->whereMonth('attendance_date', Carbon::now()->month)
            ->where('training_center_id', $centerId);
        
        $monthlySessions = $monthlySessionsQuery->distinct('attendance_date')->count();

        // 3. Finance Stats - Count UNIQUE STUDENTS who paid for current month
    $paidStudentIds = \App\Models\MonthlyPayment::whereHas('child', function($q) use ($centerId) {
            $q->where('training_center_id', $centerId);
        })
        ->where('year', $currentYear)
        ->where('month', $currentMonthNumeric)
        ->where('is_paid', true)
        ->distinct()
        ->pluck('child_id');
    
    $paidCount = $paidStudentIds->count();

    // Unpaid = active students who haven't paid for current month
    // (excluding special center students who don't pay monthly)
    $unpaidCount = (clone $studentsQuery)->whereHas('child', function($q) use ($currentYear, $paidStudentIds, $currentMonthNumeric) {
        $q->where('payment_completed', true)
          ->where('is_active', true)
          ->where('last_updated_year', $currentYear)
          ->whereNotIn('id', $paidStudentIds)
          // Exclude special center
          ->whereDoesntHave('trainingCenter', function($tcQ) {
              $tcQ->where('name', 'Sek Ren Islam Bahrul Ulum');
          });
    })->count();

        return Inertia::render('Dashboard', [
            'studentCount' => $totalStudents, 
            'renewedCount' => $renewedCount,
            'pendingRenewalCount' => $pendingRenewalCount,
            'stats' => [
                'total_students' => $totalStudents,
                'renewed_students' => $renewedCount,
                'pending_renewal' => $pendingRenewalCount,
                'new_students' => $newStudentsMonth,
                'present_today' => $presentToday,
                'total_today_marked' => $totalToday,
                'monthly_sessions' => $monthlySessions,
                'paid_month' => $paidCount,
                'unpaid_month' => $unpaidCount,
                'current_month' => $currentMonthName,
                'yearly_summary' => [
                    'renewed' => $renewedCount,
                    'pending' => $pendingRenewalCount,
                    'new' => $newStudentsMonth,
                    'total' => $totalStudents
                ]
            ]
        ]);
    }

    private function userDashboard($user)
    {
        $currentYear = now()->year;
        $currentMonth = now()->month;

        $children = Child::where('parent_id', $user->id)
            ->with(['student.attendances' => function($q) use ($currentYear) {
                $q->whereYear('attendance_date', $currentYear);
            }, 'trainingCenter', 'monthlyPayments' => function($q) use ($currentYear) {
                $q->where('year', $currentYear);
            }])
            ->get();

        $pesertaData = $children->map(function($child) use ($currentYear, $currentMonth) {
            $student = $child->student;
            
            // Attendance summary (Current Year)
            $attendanceCount = $student ? $student->attendances->count() : 0;
            $presentCount = $student ? $student->attendances->where('status', 'hadir')->count() : 0;
            
            // Payment summary (Current Year)
            $monthlyPayments = $child->monthlyPayments;
            $paidMonthsCount = $monthlyPayments->where('is_paid', true)->count();
            
            // Payment status - must be paid in current year to be "Aktif"
            $isPaidForCurrentYear = $child->payment_completed && 
                                   $child->payment_date && 
                                   $child->payment_date->year === $currentYear;

            return [
                'id' => $child->id,
                'name' => $child->name,
                'no_siri' => $student?->no_siri ?? '-',
                'belt' => $child->belt_level_malay,
                'training_center' => $child->trainingCenter->name ?? '-',
                'attendance_rate' => $attendanceCount > 0 ? round(($presentCount / $attendanceCount) * 100) : 0,
                'paid_months' => $paidMonthsCount,
                'outstanding_months' => max(0, $currentMonth - $paidMonthsCount),
                'last_attendance' => $student ? $student->attendances->sortByDesc('attendance_date')->first()?->attendance_date?->format('d/m/Y') : 'Tiada rekod',
                'status_bayaran' => $isPaidForCurrentYear ? 'Aktif' : 'Menunggu Bayaran',
                'needs_update' => $child->last_updated_year < $currentYear,
                'payment_completed' => $isPaidForCurrentYear,
            ];
        });

        return Inertia::render('Dashboard', [
            'pesertaData' => $pesertaData,
            'stats' => [
                'total_anak' => $children->count(),
                'total_hadir' => $children->sum(function($c) use ($currentYear) { 
                    return $c->student ? $c->student->attendances()->whereYear('attendance_date', $currentYear)->where('status', 'hadir')->count() : 0; 
                }),
                'total_paid' => $children->sum(function($c) {
                    return $c->monthlyPayments->where('is_paid', true)->count();
                }),
                'total_outstanding' => $children->sum(function($c) use ($currentMonth) {
                    $paid = $c->monthlyPayments->where('is_paid', true)->count();
                    return max(0, $currentMonth - $paid);
                }),
            ]
        ]);
    }
}
