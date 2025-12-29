<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('no_siri')->unique()->comment('Payment Summary Serial Number');
            $table->string('nama_pelajar')->comment('Full Name');
            $table->string('nama_penjaga')->comment('Parent/Guardian Name');
            $table->text('alamat')->comment('Address');
            $table->string('no_tel')->comment('Phone Number');
            $table->enum('kategori', ['kanak-kanak', 'dewasa'])->comment('Category: Children or Adult');
            $table->integer('status_bayaran')->default(0)->comment('Number of months paid');
            $table->timestamp('tarikh_kemaskini')->useCurrent()->useCurrentOnUpdate()->comment('Last update timestamp');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
