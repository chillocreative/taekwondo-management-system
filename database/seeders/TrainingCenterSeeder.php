<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TrainingCenter;

class TrainingCenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $centers = [
            [
                'name' => 'Pusat Latihan Utama, Permatang Sintok',
                'address' => 'Permatang Sintok, Pulau Pinang',
                'contact_number' => '04-5751234',
                'is_active' => true,
            ],
            [
                'name' => 'Dewan Komuniti Bandar Putra Bertam',
                'address' => 'Bandar Putra Bertam, Pulau Pinang',
                'contact_number' => '04-3325678',
                'is_active' => true,
            ],
            [
                'name' => 'Dewan Banjir Air Melintas Kecil',
                'address' => 'Banjir Air Melintas Kecil, Pulau Pinang',
                'contact_number' => '04-5389012',
                'is_active' => true,
            ],
            [
                'name' => 'Dewan Komuniti Shahbandar',
                'address' => 'Shahbandar, Pulau Pinang',
                'contact_number' => '04-5751111',
                'is_active' => true,
            ],
            [
                'name' => 'Sek Ren Islam Bahrul Ulum',
                'address' => 'Bahrul Ulum, Pulau Pinang',
                'contact_number' => '04-5752222',
                'is_active' => true,
            ],
        ];

        foreach ($centers as $center) {
            TrainingCenter::create($center);
        }

        $this->command->info('Training centers seeded successfully!');
    }
}
