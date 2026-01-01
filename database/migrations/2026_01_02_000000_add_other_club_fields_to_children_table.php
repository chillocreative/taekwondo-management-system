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
            $table->boolean('from_other_club')->default(false)->after('belt_level');
            $table->string('tm_number')->nullable()->after('from_other_club');
            $table->string('belt_certificate')->nullable()->after('tm_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn(['from_other_club', 'tm_number', 'belt_certificate']);
        });
    }
};
