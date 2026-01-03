<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fee_settings', function (Blueprint $table) {
            $table->id();
            
            // Yearly Fees
            $table->decimal('yearly_fee_below_18', 10, 2)->default(100.00);
            $table->decimal('yearly_fee_above_18', 10, 2)->default(200.00);
            
            // Monthly Fees
            $table->decimal('monthly_fee_below_18', 10, 2)->default(30.00);
            $table->decimal('monthly_fee_above_18', 10, 2)->default(50.00);
            
            $table->timestamps();
        });

        // Insert default settings
        DB::table('fee_settings')->insert([
            'yearly_fee_below_18' => 100.00,
            'yearly_fee_above_18' => 200.00,
            'monthly_fee_below_18' => 30.00,
            'monthly_fee_above_18' => 50.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_settings');
    }
};
