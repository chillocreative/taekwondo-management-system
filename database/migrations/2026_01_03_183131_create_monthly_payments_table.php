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
        Schema::create('monthly_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained()->onDelete('cascade');
            $table->integer('year');
            $table->integer('month'); // 1-12
            $table->decimal('amount', 10, 2);
            $table->date('due_date'); // Last day of the month
            $table->boolean('is_paid')->default(false);
            $table->date('paid_date')->nullable();
            $table->string('payment_method')->nullable(); // online, offline, cash
            $table->string('payment_reference')->nullable();
            $table->timestamps();

            // Unique constraint to prevent duplicate monthly payments
            $table->unique(['child_id', 'year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_payments');
    }
};
