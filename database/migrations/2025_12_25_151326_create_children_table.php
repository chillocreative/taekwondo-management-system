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
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->date('date_of_birth')->nullable();
            $table->string('ic_number')->nullable();
            $table->enum('belt_level', [
                'white',
                'yellow',
                'green',
                'blue',
                'red',
                'black_1',
                'black_2',
                'black_3',
                'black_4',
                'black_5'
            ])->default('white');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
