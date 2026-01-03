<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Display attendance page
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // IF PARENT (USER): Show their children's attendance history
        if ($user->role === 'user') {
            $children = $user->children()->with(['student.attendances' => function($query) {
                $query->whereYear('attendance_date', date('Y'))
                      ->orderBy('attendance_date', 'desc');
            }])->get()->map(function($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'student_id' => $child->student?->id,
                    'no_keahlian' => $child->student?->no_siri ?? '-',
                    'attendances' => $child->student?->attendances ?? [],
                    'stats' => [
                        'total_classes' => $child->student?->attendances()->count() ?? 0,
                        'present' => $child->student?->attendances()->where('status', 'hadir')->count() ?? 0,
                    ]
                ];
            });

            return Inertia::render('Attendance/Index', [
                'isParent' => true,
                'children' => $children,
            ]);
        }

        // IF ADMIN/COACH: Show class attendance for specific date
        $selectedDate = $request->input('date', Carbon::today()->toDateString());
        
        $students = Student::with(['attendances' => function($query) use ($selectedDate) {
            $query->where('attendance_date', $selectedDate);
        }])
        ->orderBy('no_siri')
        ->get()
        ->map(function($student) {
            $attendance = $student->attendances->first();
            
            return [
                'id' => $student->id,
                'no_siri' => $student->no_siri,
                'nama_pelajar' => $student->nama_pelajar,
                'kategori' => $student->kategori,
                'attendance_status' => $attendance?->status ?? null,
                'attendance_id' => $attendance?->id ?? null,
                'notes' => $attendance?->notes ?? null,
            ];
        });

        return Inertia::render('Attendance/Index', [
            'isParent' => false,
            'students' => $students,
            'selectedDate' => $selectedDate,
        ]);
    }

    /**
     * Mark attendance for a student
     */
    public function mark(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'attendance_date' => 'required|date',
            'status' => 'required|in:hadir,tidak_hadir,cuti,sakit',
            'notes' => 'nullable|string|max:500',
        ]);

        Attendance::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'attendance_date' => $validated['attendance_date'],
            ],
            [
                'status' => $validated['status'],
                'notes' => $validated['notes'],
            ]
        );

        return back()->with('success', 'Kehadiran berjaya dikemaskini.');
    }

    /**
     * Bulk mark attendance
     */
    public function bulkMark(Request $request)
    {
        $validated = $request->validate([
            'attendance_date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:hadir,tidak_hadir,cuti,sakit',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

        foreach ($validated['attendances'] as $attendance) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $attendance['student_id'],
                    'attendance_date' => $validated['attendance_date'],
                ],
                [
                    'status' => $attendance['status'],
                    'notes' => $attendance['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Kehadiran berjaya disimpan untuk ' . count($validated['attendances']) . ' peserta.');
    }

    /**
     * Admin attendance monitoring - view all attendance records
     */
    public function adminIndex(Request $request)
    {
        $query = Attendance::with(['student'])
            ->orderBy('attendance_date', 'desc');

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('attendance_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('attendance_date', '<=', $request->end_date);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student name or no_siri
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('nama_pelajar', 'like', "%{$search}%")
                  ->orWhere('no_siri', 'like', "%{$search}%");
            });
        }

        $attendances = $query->paginate(50)->through(function($attendance) {
            return [
                'id' => $attendance->id,
                'student_id' => $attendance->student_id,
                'student_name' => $attendance->student->nama_pelajar ?? '-',
                'student_no_siri' => $attendance->student->no_siri ?? '-',
                'attendance_date' => $attendance->attendance_date,
                'status' => $attendance->status,
                'notes' => $attendance->notes,
                'created_at' => $attendance->created_at,
            ];
        });

        // Get summary statistics
        $stats = [
            'total' => Attendance::count(),
            'hadir' => Attendance::where('status', 'hadir')->count(),
            'tidak_hadir' => Attendance::where('status', 'tidak_hadir')->count(),
            'sakit' => Attendance::where('status', 'sakit')->count(),
            'cuti' => Attendance::where('status', 'cuti')->count(),
        ];

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date']),
        ]);
    }
}
