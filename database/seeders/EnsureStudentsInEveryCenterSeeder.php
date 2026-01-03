<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TrainingCenter;
use App\Models\Child;
use App\Models\Student;
use App\Models\User;

class EnsureStudentsInEveryCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $centers = TrainingCenter::all();

        foreach ($centers as $center) {
            // Count active students in this center
            $count = Child::where('training_center_id', $center->id)->count();
            
            $this->command->info("Center '{$center->name}' has {$count} students.");

            if ($count < 5) {
                $needed = 5 - $count;
                $this->command->info("  -> Creating {$needed} more students for this center...");

                $parents = User::factory($needed)->create(['role' => 'user']);
                
                foreach ($parents as $parent) {
                    $child = Child::create([
                        'parent_id' => $parent->id,
                        'name' => fake()->firstName() . ' ' . fake()->lastName(),
                        'ic_number' => fake()->numerify('############'),
                        'date_of_birth' => fake()->date('Y-m-d', '-5 years'),
                        'belt_level' => 'white',
                        'training_center_id' => $center->id,
                        'is_active' => true,
                    ]);
                    
                    $this->ensureStudentRecord($child, $parent);
                }
            }
        }
    }

    private function ensureStudentRecord($child, $parent)
    {
        if (!$child->student_id) {
            $student = Student::create([
                'nama_pelajar' => $child->name,
                'nama_penjaga' => $parent->name,
                'alamat' => $parent->address ?? 'Alamat Test 123',
                'no_tel' => $parent->phone_number ?? '0123456789',
                'kategori' => 'kanak-kanak',
                'status_bayaran' => 1,
                'tarikh_kemaskini' => now(),
            ]);

            $child->student_id = $student->id;
            $child->save();
        }
    }
}
