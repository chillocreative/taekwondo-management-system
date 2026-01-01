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
        Schema::table('student_payments', function (Blueprint $table) {
            $table->string('receipt_number')->nullable()->after('total');
            $table->string('transaction_ref')->nullable()->after('receipt_number');
            $table->string('payment_method')->default('manual')->after('transaction_ref'); // manual/online
            $table->string('status')->default('pending')->after('payment_method'); // pending, paid, failed
            $table->timestamp('payment_date')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_payments', function (Blueprint $table) {
            $table->dropColumn(['receipt_number', 'transaction_ref', 'payment_method', 'status', 'payment_date']);
        });
    }
};
