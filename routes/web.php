<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TrainingCenterController;
use App\Http\Controllers\ChildController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use App\Models\Student;

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'studentCount' => Student::count(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Student Management Routes
    Route::post('students/bulk-destroy', [StudentController::class, 'bulkDestroy'])
        ->name('students.bulk-destroy');
    Route::resource('students', StudentController::class);
    
    // Payment Summary Routes
    Route::get('students/{student}/ringkasan', [StudentController::class, 'previewRingkasan'])
        ->name('students.ringkasan');
    Route::get('students/{student}/export-pdf', [StudentController::class, 'exportPDF'])
        ->name('students.export-pdf');
    
    // Training Center Management (Admin only)
    Route::resource('training-centers', TrainingCenterController::class)
        ->except(['show', 'create', 'edit']);
    
    // Children Management (Parents)
    Route::resource('children', ChildController::class)
        ->except(['show', 'create', 'edit']);

    Route::get('/fees', [App\Http\Controllers\FeeController::class, 'index'])->name('fees.index');
    Route::post('/fees/pay', [App\Http\Controllers\FeeController::class, 'pay'])->name('fees.pay');

    // Payment Settings (Admin only)
    Route::get('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'index'])->name('settings.payment');
    Route::post('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'update'])->name('settings.payment.update');
    Route::post('/settings/payment/create-category', [App\Http\Controllers\PaymentSettingController::class, 'createCategory'])->name('settings.payment.create-category');
    Route::post('/settings/payment/test-connection', [App\Http\Controllers\PaymentSettingController::class, 'testConnection'])->name('settings.payment.test');
});

require __DIR__.'/auth.php';
