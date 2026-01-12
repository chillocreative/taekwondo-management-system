<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TrainingCenterController;
use App\Http\Controllers\ChildController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Models\Student;



Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Student Management Routes
    Route::post('students/bulk-destroy', [StudentController::class, 'bulkDestroy'])
        ->name('students.bulk-destroy');
    Route::post('students/{student}/approve', [StudentController::class, 'approvePayment'])
        ->name('students.approve');
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
    Route::get('/children/{child}/payment/offline', [ChildController::class, 'showOfflinePayment'])->name('children.payment.offline');
    Route::post('/children/{child}/payment/offline', [ChildController::class, 'submitOfflinePayment'])->name('children.payment.offline.submit');
    Route::get('/children/{child}/payment/receipt', [ChildController::class, 'downloadReceipt'])->name('children.payment.receipt');
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
    
    // Admin Attendance Monitoring
    Route::get('/admin/attendance', [App\Http\Controllers\AttendanceController::class, 'adminIndex'])->name('admin.attendance.index');
    Route::get('/admin/attendance/sheet', [App\Http\Controllers\AttendanceController::class, 'showSheet'])->name('admin.attendance.show-sheet');
    Route::post('/attendance/bulk-destroy-sessions', [App\Http\Controllers\AttendanceController::class, 'bulkDestroySessions'])->name('attendance.bulk-destroy-sessions');

    // Payment Settings (Admin only)
    Route::get('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'index'])->name('settings.payment');
    Route::post('/settings/payment', [App\Http\Controllers\PaymentSettingController::class, 'update'])->name('settings.payment.update');
    Route::post('/settings/payment/create-category', [App\Http\Controllers\PaymentSettingController::class, 'createCategory'])->name('settings.payment.create-category');
    Route::post('/settings/payment/test-connection', [App\Http\Controllers\PaymentSettingController::class, 'testConnection'])->name('settings.payment.test');
    
    // Fee Settings (Admin only)
    Route::get('/settings/fees', [App\Http\Controllers\FeeSettingController::class, 'index'])->name('settings.fees.index');
    Route::post('/settings/fees', [App\Http\Controllers\FeeSettingController::class, 'update'])->name('settings.fees.update');
    


    // Admin - Payment Management
    Route::get('/admin/payments', [App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('admin.payments.index');
    Route::post('/admin/payments/bulk-destroy', [App\Http\Controllers\Admin\PaymentController::class, 'bulkDestroy'])->name('admin.payments.bulk-destroy');
    
    // Admin - User Management
    Route::get('/admin/users', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [App\Http\Controllers\Admin\UserController::class, 'store'])->name('admin.users.store');
    Route::patch('/admin/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');

    // Admin - Future Modules
    // Admin - Whatsapp Management
    Route::get('/admin/whatsapp', [App\Http\Controllers\Admin\WhatsappController::class, 'index'])->name('admin.whatsapp');
    Route::post('/admin/whatsapp/test', [App\Http\Controllers\Admin\WhatsappController::class, 'sendTest'])->name('admin.whatsapp.test');

    Route::get('/admin/grading', function () {
        if (auth()->user()->role !== 'admin') abort(403);
        return Inertia::render('Admin/ComingSoon', ['title' => 'Grading Management']);
    })->name('admin.grading');

    Route::get('/admin/tournament', function () {
        if (auth()->user()->role !== 'admin') abort(403);
        return Inertia::render('Admin/ComingSoon', ['title' => 'Tournament Management']);
    })->name('admin.tournament');

    // Coach Routes
    Route::get('/coach/attendance', [App\Http\Controllers\Coach\AttendanceController::class, 'index'])->name('coach.attendance.index');
    Route::get('/coach/attendance/sheet', [App\Http\Controllers\Coach\AttendanceController::class, 'show'])->name('coach.attendance.show');
    Route::post('/coach/attendance', [App\Http\Controllers\Coach\AttendanceController::class, 'store'])->name('coach.attendance.store');
    
    // Coach Students (Read-only)
    Route::get('/coach/students', [App\Http\Controllers\Coach\StudentController::class, 'index'])->name('coach.students.index');
    Route::get('/coach/students/{student}', [App\Http\Controllers\Coach\StudentController::class, 'show'])->name('coach.students.show');

    // Coach Payments (View-only)
    Route::get('/coach/payments', [App\Http\Controllers\Coach\PaymentController::class, 'index'])->name('coach.payments.index');

    // Notification Routes
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('/notifications/{id}/mark-read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');

    // Annual Statement Routes
    Route::get('/annual-statement', [App\Http\Controllers\AnnualStatementController::class, 'index'])->name('annual-statement.index');
    Route::get('/annual-statement/{child}/download', [App\Http\Controllers\AnnualStatementController::class, 'downloadPdf'])->name('annual-statement.download');
});

// Temporary Migrate Route
Route::get('/migrate', function () {
    Artisan::call('migrate', ['--force' => true]);
    return nl2br(Artisan::output());
});

// Temporary Cache Clear Route
Route::get('/clear-cache', function () {
    $output = '';
    
    // Clear route cache
    Artisan::call('route:clear');
    $output .= "Route cache cleared!\n";
    
    // Clear config cache
    Artisan::call('config:clear');
    $output .= "Config cache cleared!\n";
    
    // Clear view cache
    Artisan::call('view:clear');
    $output .= "View cache cleared!\n";
    
    // Clear application cache
    Artisan::call('cache:clear');
    $output .= "Application cache cleared!\n";
    
    return nl2br($output . "\nAll caches cleared successfully!");
});

// Storage Link Route (for cPanel)
Route::get('/storage-link', function () {
    try {
        Artisan::call('storage:link');
        return 'Storage link created successfully! ' . Artisan::output();
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// Sync Fees Route
Route::get('/sync-fees', function () {
    $settings = \App\Models\FeeSetting::current();
    $settings->syncWithExistingRecords();
    return "Fee synchronization complete! All records have been updated based on the latest settings.";
});

Route::get('/reset-receipts', function () {
    if (auth()->user()->role !== 'admin') abort(403);
    
    \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
    
    // 1. Clear all StudentPayment records
    \App\Models\StudentPayment::truncate();
    
    // 2. Reset all MonthlyPayment records
    \App\Models\MonthlyPayment::query()->update([
        'is_paid' => false,
        'paid_date' => null,
        'payment_method' => null,
        'payment_reference' => null,
        'receipt_number' => null,
        'student_payment_id' => null
    ]);
    
    // 3. Reset Children payment statuses
    \App\Models\Child::query()->update([
        'payment_completed' => false,
        'payment_date' => null,
        'payment_method' => null,
        'payment_reference' => null,
        'payment_slip' => null
    ]);
    
    \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();
    
    return "✅ Semua rekod pembayaran telah direset. Nombor resit baru akan bermula dari 0001.";
});

// Repair Pending Payments - Re-verify with ToyyibPay and fix stuck records
Route::get('/repair-pending-payments', function () {
    if (!auth()->check() || auth()->user()->role !== 'admin') {
        return "❌ Akses ditolak. Sila log masuk sebagai Admin.";
    }
    
    $output = "<h2>🔧 Repair Pending Payments</h2>";
    $output .= "<p>Scanning for children with payment_reference but not payment_completed...</p>";
    
    // Find all children with a payment reference but not marked as completed
    $pendingChildren = \App\Models\Child::whereNotNull('payment_reference')
        ->where('payment_reference', '!=', '')
        ->where(function($q) {
            $q->where('payment_completed', false)
              ->orWhereNull('payment_completed');
        })
        ->with(['student', 'trainingCenter', 'parent'])
        ->get();
    
    $output .= "<p>Found <strong>" . $pendingChildren->count() . "</strong> pending records to verify.</p>";
    
    if ($pendingChildren->isEmpty()) {
        return $output . "<p>✅ Tiada rekod yang perlu diperbaiki.</p>";
    }
    
    $toyyibPay = new \App\Services\ToyyibPayService();
    $repaired = 0;
    $failed = 0;
    $alreadyPaid = 0;
    
    $output .= "<table border='1' cellpadding='8' style='border-collapse: collapse; margin-top: 20px;'>";
    $output .= "<tr style='background: #f0f0f0;'><th>#</th><th>Nama</th><th>BillCode</th><th>Status ToyyibPay</th><th>Action</th></tr>";
    
    foreach ($pendingChildren as $index => $child) {
        $billCode = $child->payment_reference;
        $transactions = $toyyibPay->getBillTransactions($billCode);
        
        $status = 'Unknown';
        $action = '-';
        $rowColor = '#fff';
        
        if ($transactions && isset($transactions[0])) {
            $paymentStatus = $transactions[0]['billpaymentStatus'] ?? 'N/A';
            
            if ($paymentStatus == '1') {
                $status = '✅ PAID';
                $rowColor = '#d4edda';
                
                // Update child record
                $child->update([
                    'payment_completed' => true,
                    'payment_method' => 'online',  
                    'payment_date' => now(),
                    'is_active' => true,
                ]);
                
                // Sync student record
                $studentService = new \App\Services\StudentService();
                $studentService->syncChildToStudent($child);
                $child->refresh();
                
                // Create StudentPayment if not exists
                if ($child->student) {
                    $existingPayment = \App\Models\StudentPayment::where('transaction_ref', $billCode)->first();
                    
                    if (!$existingPayment) {
                        $currentMonth = \App\Models\MonthlyPayment::getMalayName(now()->month) . ' ' . now()->year;
                        $payment = \App\Models\StudentPayment::create([
                            'student_id' => $child->student->id,
                            'month' => $currentMonth,
                            'kategori' => $child->student->kategori ?? 'kanak-kanak',
                            'quantity' => 1,
                            'amount' => $child->registration_fee ?? 0,
                            'total' => $child->registration_fee ?? 0,
                            'transaction_ref' => $billCode,
                            'payment_method' => 'online',
                            'status' => 'paid',
                            'payment_date' => now(),
                        ]);
                        $payment->receipt_number = str_pad($payment->id, 4, '0', STR_PAD_LEFT);
                        $payment->save();
                    }
                }
                
                $action = '🔧 REPAIRED';
                $repaired++;
            } else {
                $status = '❌ NOT PAID (Status: ' . $paymentStatus . ')';
                $rowColor = '#f8d7da';
                $action = 'No action needed';
                $failed++;
            }
        } else {
            $status = '⚠️ API Error / No Data';
            $rowColor = '#fff3cd';
            $action = 'Manual check needed';
            $failed++;
        }
        
        $output .= "<tr style='background: {$rowColor};'>";
        $output .= "<td>" . ($index + 1) . "</td>";
        $output .= "<td>" . e($child->name) . "</td>";
        $output .= "<td><code>" . e($billCode) . "</code></td>";
        $output .= "<td>{$status}</td>";
        $output .= "<td><strong>{$action}</strong></td>";
        $output .= "</tr>";
    }
    
    $output .= "</table>";
    
    $output .= "<h3 style='margin-top: 20px;'>📊 Ringkasan</h3>";
    $output .= "<ul>";
    $output .= "<li>✅ Berjaya diperbaiki: <strong>{$repaired}</strong></li>";
    $output .= "<li>❌ Tidak dibayar / Gagal: <strong>{$failed}</strong></li>";
    $output .= "</ul>";
    
    if ($repaired > 0) {
        $output .= "<p style='color: green; font-weight: bold;'>🎉 {$repaired} rekod telah berjaya diperbaiki!</p>";
    }
    
    return $output;
});

require __DIR__.'/auth.php';
