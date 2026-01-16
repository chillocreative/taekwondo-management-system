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
        Schema::table('payment_settings', function (Blueprint $table) {
            // Bayarcash fields
            $table->text('bayarcash_access_token')->nullable()->after('category_code');
            $table->string('bayarcash_portal_key')->nullable()->after('bayarcash_access_token');
            $table->boolean('bayarcash_is_sandbox')->default(true)->after('bayarcash_portal_key');
            $table->boolean('bayarcash_is_active')->default(false)->after('bayarcash_is_sandbox');
            
            // SenangPay fields
            $table->string('senangpay_merchant_id')->nullable()->after('bayarcash_is_active');
            $table->text('senangpay_secret_key')->nullable()->after('senangpay_merchant_id');
            $table->boolean('senangpay_is_sandbox')->default(true)->after('senangpay_secret_key');
            $table->boolean('senangpay_is_active')->default(false)->after('senangpay_is_sandbox');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'bayarcash_access_token',
                'bayarcash_portal_key',
                'bayarcash_is_sandbox',
                'bayarcash_is_active',
                'senangpay_merchant_id',
                'senangpay_secret_key',
                'senangpay_is_sandbox',
                'senangpay_is_active',
            ]);
        });
    }
};
