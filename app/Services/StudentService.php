<?php

namespace App\Services;

use App\Models\Child;
use App\Models\Student;

class StudentService
{
    /**
     * Sync or create a Student record from a Child record.
     * Use this when a child's payment is completed and they become active.
     */
    public function syncChildToStudent(Child $child): Student
    {
        // Check if child is already linked to a student
        $student = null;
        if ($child->student_id) {
            $student = Student::find($child->student_id);
        }

        if (!$student) {
            // Create new student
            $student = new Student();
            // Status bayaran set to 0 strictly. It will be managed via separate logic.
            $student->status_bayaran = 0;
        }

        // Map fields
        $student->nama_pelajar = $child->name;
        
        $parent = $child->parent;
        if ($parent) {
            $student->nama_penjaga = $parent->name;
            $student->no_tel = $parent->phone_number ?? '-';
            // User model does not have address field, so we use placeholder or handle if extended later
            $student->alamat = '-'; 
        } else {
            $student->nama_penjaga = 'Unknown';
            $student->no_tel = '-';
            $student->alamat = '-';
        }

        // Determine category based on age
        if ($child->date_of_birth) {
            // age < 18 ? 'kanak-kanak' : 'dewasa'
            $age = $child->date_of_birth->age;
            $student->kategori = $age < 18 ? 'kanak-kanak' : 'dewasa';
        } else {
            $student->kategori = 'kanak-kanak'; // Default
        }

        $student->tarikh_kemaskini = now();
        $student->save(); // Generates no_siri (ANZxxxx) if new via boot method

        // Link back if needed
        if ($child->student_id !== $student->id) {
            $child->student_id = $student->id;
            $child->save();
        }

        // Handle Monthly Payment for the registration month
        if ($child->payment_completed && $child->payment_date) {
            $paymentDate = $child->payment_date instanceof \Carbon\Carbon ? $child->payment_date : \Carbon\Carbon::parse($child->payment_date);
            
            // Ensure monthly payments exist for that year
            \App\Models\MonthlyPayment::generateForChild($child, $paymentDate->year);

            $monthlyPayment = \App\Models\MonthlyPayment::where('child_id', $child->id)
                ->where('year', $paymentDate->year)
                ->where('month', $paymentDate->month)
                ->first();

            if ($monthlyPayment && !$monthlyPayment->is_paid) {
                $monthlyPayment->update([
                    'is_paid' => true,
                    'paid_date' => $paymentDate,
                    'payment_method' => $child->payment_method ?? 'manual',
                    'payment_reference' => $child->payment_reference,
                ]);
            }
        }

        return $student;
    }
}
