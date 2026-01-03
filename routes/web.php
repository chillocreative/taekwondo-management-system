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
    
    // Children Payment Routes
    Route::get('/children/{child}/payment', [ChildController::class, 'payment'])->name('children.payment');
    Route::get('/children/{child}/payment/online', [ChildController::class, 'initiateOnlinePayment'])->name('children.payment.online');
    Route::post('/children/{child}/payment/offline', [ChildController::class, 'requestOfflinePayment'])->name('children.payment.offline');
    Route::get('/children/payment/callback', [ChildController::class, 'paymentCallback'])->name('children.payment.callback');
    Route::post('/children/payment/callback', [ChildController::class, 'paymentCallback'])->name('children.payment.callback.post');

    Route::get('/fees', [App\Http\Controllers\FeeController::class, 'index'])->name('fees.index');
    Route::post('/fees/pay', [App\Http\Controllers\FeeController::class, 'pay'])->name('fees.pay');
    Route::get('/fees/payment/return', [App\Http\Controllers\FeeController::class, 'paymentReturn'])->name('fees.payment.return');
    Route::any('/fees/payment/callback', [App\Http\Controllers\FeeController::class, 'paymentCallback'])->name('fees.payment.callback'); // Support POST/GET
    Route::get('/receipts/{payment}/stream', [App\Http\Controllers\FeeController::class, 'streamReceipt'])->name('receipts.stream');
    Route::get('/receipts/{payment}/download', [App\Http\Controllers\FeeController::class, 'downloadReceipt'])->name('receipts.download');

    // Attendance Routes
    Route::get('/attendance', [App\Http\Controllers\AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/mark', [App\Http\Controllers\AttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('/attendance/bulk-mark', [App\Http\Controllers\AttendanceController::class, 'bulkMark'])->name('attendance.bulk-mark');

    // Payment Settings (Admin only)
    Route::get('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'index'])->name('settings.payment');
    Route::post('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'update'])->name('settings.payment.update');
    Route::post('/settings/payment/create-category', [App\Http\Controllers\PaymentSettingController::class, 'createCategory'])->name('settings.payment.create-category');
    Route::post('/settings/payment/test-connection', [App\Http\Controllers\PaymentSettingController::class, 'testConnection'])->name('settings.payment.test');
    
    // Admin - Pending Payment Approvals
    Route::get('/admin/pending-payments', [App\Http\Controllers\Admin\PendingPaymentController::class, 'index'])->name('admin.pending-payments');
    Route::post('/admin/pending-payments/{child}/approve', [App\Http\Controllers\Admin\PendingPaymentController::class, 'approve'])->name('admin.pending-payments.approve');
    Route::post('/admin/pending-payments/{child}/reject', [App\Http\Controllers\Admin\PendingPaymentController::class, 'reject'])->name('admin.pending-payments.reject');

    // Admin - Payment Management
    Route::get('/admin/payments', [App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
});

// Temporary Migrate Route
Route::get('/migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    return nl2br(Artisan::output());
});

require __DIR__.'/auth.php';
