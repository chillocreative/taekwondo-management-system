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
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('coach_id')->nullable()->after('student_id')->constrained('users')->nullOnDelete();
            $table->foreignId('training_center_id')->nullable()->after('coach_id')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['coach_id']);
            $table->dropForeign(['training_center_id']);
            $table->dropColumn(['coach_id', 'training_center_id']);
        });
    }
};
