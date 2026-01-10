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
        Schema::table('fee_settings', function (Blueprint $table) {
            $table->decimal('renewal_fee_gup', 8, 2)->default(30.00)->after('monthly_fee_above_18');
            $table->decimal('renewal_fee_black_poom', 8, 2)->default(50.00)->after('renewal_fee_gup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fee_settings', function (Blueprint $table) {
            $table->dropColumn(['renewal_fee_gup', 'renewal_fee_black_poom']);
        });
    }
};
