<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them
| will be assigned to the "api" middleware group.
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Notification API Routes (JSON responses)
Route::middleware(['web', 'auth'])->prefix('notifications')->group(function () {
    Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('api.notifications.mark-all-read');
    Route::post('/{id}/mark-read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('api.notifications.mark-read');
});
