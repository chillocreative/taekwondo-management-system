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
            $table->string('registration_type')->default('new')->after('is_active');
            $table->string('belt_level')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn('registration_type');
            // Reverting belt_level to enum is complex in some DBs without specific values, 
            // but we'll leave it as string as it's more flexible anyway.
        });
    }
};
