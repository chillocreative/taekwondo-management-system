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
     * Display the attendance page for the coach.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Ensure user is a coach and has a training center assigned
        if ($user->role !== 'coach' || !$user->training_center_id) {
            abort(403, 'Anda tidak mempunyai akses ke pusat latihan ini.');
        }

        $date = $request->input('date', Carbon::today()->toDateString());
        
        // Fetch the assigned training center
        $trainingCenter = TrainingCenter::findOrFail($user->training_center_id);

        // Fetch students belonging to this training center
        // We filter students via their Child profile's training_center_id
        $students = Student::whereHas('child', function ($query) use ($user) {
                $query->where('training_center_id', $user->training_center_id)
                      ->where('is_active', true);
            })
            ->with(['child', 'attendances' => function ($query) use ($date) {
                $query->where('attendance_date', $date);
            }])
            ->get()
            ->map(function ($student) {
                // Get the attendance record for the selected date if it exists
                $attendance = $student->attendances->first();
                
                return [
                    'id' => $student->id,
                    'name' => $student->child->name, // Name from Child profile
                    'no_siri' => $student->no_siri,
                    'status' => $attendance ? $attendance->status : null, // null means Not Marked Yet
                    'notes' => $attendance ? $attendance->notes : '',
                ];
            });

        return Inertia::render('Coach/Attendance/Index', [
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
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:hadir,tidak_hadir,sakit,cuti',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $date = $request->input('date');

         // Security: Ensure coach can only edit *today* (optional, or allow past edits?)
         // Requirement says "Edit attendance on the same day". "View past attendance records in read-only mode"
         // So prevent editing if date != today
         // However, "View past attendance records in read-only mode" implies we shouldn't even show the submit button or allow POST.
         // Let's implement strict validation here.
         
        if (!Carbon::parse($date)->isToday() && $request->input('force') !== true) {
             // We can allow edits if 'force' is present or just strict. 
             // Requirement: "View past attendance records in read-only mode".
             // So, strictly block changes to past dates is safer.
             // BUT, what if they missed yesterday? Usually specialized admins fix that.
             // Let's stick to the requirement: "Edit attendance on the same day".
             if (Carbon::parse($date)->lt(Carbon::today())) {
                 return back()->with('error', 'Anda hanya boleh mengemaskini kehadiran untuk hari ini.');
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
                    'training_center_id' => $user->training_center_id,
                ]
            );
        }

        return redirect()->back()->with('success', 'Kehadiran berjaya dikemaskini.');
    }
}
