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
        Schema::table('children', function (Blueprint $table) {
            // Change default is_active to false (inactive until payment)
            $table->boolean('is_active')->default(false)->change();
            
            // Add payment tracking fields
            $table->boolean('payment_completed')->default(false)->after('is_active');
            $table->enum('payment_method', ['online', 'offline', 'none'])->default('none')->after('payment_completed');
            $table->decimal('registration_fee', 10, 2)->nullable()->after('payment_method');
            $table->timestamp('payment_date')->nullable()->after('registration_fee');
            $table->string('payment_reference')->nullable()->after('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->change();
            $table->dropColumn([
                'payment_completed',
                'payment_method',
                'registration_fee',
                'payment_date',
                'payment_reference'
            ]);
        });
    }
};
