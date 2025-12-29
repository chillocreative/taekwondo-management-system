<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin User
        $admin = User::firstOrCreate(
            ['phone_number' => '0123456789'], // Admin phone number
            [
                'name' => 'Admin User',
                'email' => 'admin@taekwondo.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
        $this->command->info('Admin user created/found: 0123456789 / password');

        // 2. Coach User
        $coach = User::firstOrCreate(
            ['phone_number' => '0198765432'], // Coach phone number
            [
                'name' => 'Coach User',
                'email' => 'coach@taekwondo.com',
                'password' => Hash::make('password'),
                'role' => 'coach',
                'email_verified_at' => now(),
            ]
        );
         $this->command->info('Coach user created/found: 0198765432 / password');


        // 3. Regular User
        $user = User::firstOrCreate(
            ['phone_number' => '01122334455'], // Regular User phone number
            [
                'name' => 'Regular User',
                'email' => 'user@taekwondo.com',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
         $this->command->info('Regular user created/found: 01122334455 / password');
    }
}
