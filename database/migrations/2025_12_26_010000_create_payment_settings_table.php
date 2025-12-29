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
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('toyyibpay'); // toyyibpay, stripe, etc
            $table->boolean('is_sandbox')->default(true);
            $table->text('secret_key')->nullable();
            $table->string('category_code')->nullable();
            $table->text('settings')->nullable(); // JSON for additional settings
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
