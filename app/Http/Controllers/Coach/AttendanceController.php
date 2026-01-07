<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Step 1: Display the "Select Training Center" page.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if ($user->role !== 'coach' && $user->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        // Fetch ALL training centers for the coach to choose from
        $trainingCenters = TrainingCenter::all();

        return Inertia::render('Coach/Attendance/Select', [
            'trainingCenters' => $trainingCenters,
        ]);
    }

    /**
     * Step 2: Show the attendance sheet for the selected center.
     */
    public function show(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'coach' && $user->role !== 'admin') {
            abort(403, 'Akses ditolak.');
        }

        $centerId = $request->input('center_id');
        $date = $request->input('date', Carbon::today()->toDateString());

        if (!$centerId) {
            return redirect()->route('coach.attendance.index')->with('error', 'Sila pilih pusat latihan.');
        }
        
        // Fetch the selected training center
        $trainingCenter = TrainingCenter::findOrFail($centerId);

        // Fetch students belonging to this training center
        $students = Student::whereHas('child', function ($query) use ($centerId) {
                $query->where('training_center_id', $centerId)
                      ->where('is_active', true);
            })
            ->with(['child', 'attendances' => function ($query) use ($date) {
                $query->where('attendance_date', $date);
            }])
            ->get()
            ->map(function ($student) {
                $attendance = $student->attendances->first();
                return [
                    'id' => $student->id,
                    'name' => $student->child->name,
                    'no_siri' => $student->no_siri,
                    'status' => $attendance ? $attendance->status : null,
                    'notes' => $attendance ? $attendance->notes : '',
                ];
            })
            ->values(); // Ensure it serializes as an array, not object (prevents frontend crash)

        return Inertia::render('Coach/Attendance/Show', [
            'trainingCenter' => $trainingCenter,
            'students' => $students,
            'date' => $date,
        ]);
    }

    /**
     * Store or update attendance records.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'center_id' => 'required|exists:training_centers,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:hadir,tidak_hadir,sakit,cuti',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $date = $request->input('date');
        $centerId = $request->input('center_id');

        // Security: Ensure coach can only edit *today* (admins can edit anytime)
        if ($user->role !== 'admin') {
            if (!Carbon::parse($date)->isToday() && $request->input('force') !== true) {
                 if (Carbon::parse($date)->lt(Carbon::today())) {
                     return back()->with('error', 'Anda hanya boleh mengemaskini kehadiran untuk hari ini.');
                 }
            }
        }


        foreach ($request->input('attendances') as $data) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $data['student_id'],
                    'attendance_date' => $date,
                ],
                [
                    'status' => $data['status'],
                    'notes' => $data['notes'] ?? null,
                    'coach_id' => $user->id,
                    'training_center_id' => $centerId,
                ]
            );

            // Check for 3 consecutive absences
            if ($data['status'] === 'tidak_hadir') {
                $pastAbsences = Attendance::where('student_id', $data['student_id'])
                    ->where('attendance_date', '<', $date)
                    ->orderBy('attendance_date', 'desc')
                    ->take(2)
                    ->get();

                if ($pastAbsences->count() === 2) {
                    $consecutive = true;
                    foreach ($pastAbsences as $pa) {
                        if ($pa->status !== 'tidak_hadir') {
                            $consecutive = false;
                            break;
                        }
                    }

                    if ($consecutive) {
                        $student = Student::with('child')->find($data['student_id']);
                        if ($student && $student->child) {
                            $name = $student->child->name;
                            // Check if we already notified today to prevent spam during updates
                            $alreadyNotified = \App\Models\Notification::where('type', 'absent')
                                ->where('message', 'LIKE', "%$name%")
                                ->where('created_at', '>=', Carbon::today())
                                ->exists();
                                
                            if (!$alreadyNotified) {
                                \App\Models\Notification::createAbsentNotification($name);
                            }
                        }
                    }
                }
            }
        }

        return redirect()->back()->with('success', 'Kehadiran berjaya dikemaskini.');
    }
}
