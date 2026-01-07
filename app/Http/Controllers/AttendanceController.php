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
        $query = Attendance::query()
            ->selectRaw('attendance_date, training_center_id, COUNT(*) as total_students, SUM(CASE WHEN status = "hadir" THEN 1 ELSE 0 END) as present_count')
            ->groupBy('attendance_date', 'training_center_id')
            ->orderBy('attendance_date', 'desc');

        // Filter by Training Center
        if ($request->filled('training_center_id')) {
            $query->where('training_center_id', $request->training_center_id);
        }

        // Filter by search (Date)
        if ($request->filled('search')) {
            $query->where('attendance_date', 'like', "%{$request->search}%");
        }

        $attendances = $query->paginate(20)->through(function($session) {
            $center = \App\Models\TrainingCenter::find($session->training_center_id);
            return [
                'id' => $session->attendance_date->toDateString() . '-' . $session->training_center_id,
                'attendance_date' => $session->attendance_date,
                'training_center_id' => $session->training_center_id,
                'training_center_name' => $center->name ?? 'Unknown',
                'present_count' => (int)$session->present_count,
                'total_students' => (int)$session->total_students,
                'status_label' => $session->present_count . ' / ' . $session->total_students . ' Hadir',
            ];
        });

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'training_centers' => \App\Models\TrainingCenter::all(['id', 'name']),
            'filters' => $request->only(['search', 'training_center_id']),
            'stats' => [
                'total_records' => Attendance::count(),
                'total_sessions' => Attendance::distinct()->count(['attendance_date', 'training_center_id']),
            ]
        ]);
    }

    /**
     * Bulk delete attendance sessions
     */
    public function bulkDestroySessions(Request $request)
    {
        $sessionIds = $request->input('ids', []); // Format: YYYY-MM-DD-CenterID
        
        foreach ($sessionIds as $id) {
            $parts = explode('-', $id);
            if (count($parts) >= 4) {
                $centerId = array_pop($parts);
                $date = implode('-', $parts);
                
                Attendance::where('attendance_date', $date)
                    ->where('training_center_id', $centerId)
                    ->delete();
            }
        }

        return back()->with('success', 'Rekod kehadiran berjaya dipadam.');
    }
}
