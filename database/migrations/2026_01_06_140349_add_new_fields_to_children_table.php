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
            $table->string('guardian_name')->nullable()->after('parent_id');
            $table->string('guardian_occupation')->nullable()->after('guardian_name');
            $table->string('guardian_ic_number')->nullable()->after('guardian_occupation');
            $table->integer('guardian_age')->nullable()->after('guardian_ic_number');
            $table->string('guardian_phone')->nullable()->after('guardian_age');
            
            $table->text('address')->nullable()->after('name');
            $table->string('phone_number')->nullable()->after('address'); // Child's phone
            $table->string('school_name')->nullable()->after('phone_number');
            $table->string('school_class')->nullable()->after('school_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropColumn([
                'guardian_name',
                'guardian_occupation',
                'guardian_ic_number',
                'guardian_age',
                'guardian_phone',
                'address',
                'phone_number',
                'school_name',
                'school_class',
            ]);
        });
    }
};
