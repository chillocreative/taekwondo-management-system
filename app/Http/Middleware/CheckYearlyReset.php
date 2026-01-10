<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CheckYearlyReset
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $currentYear = Carbon::now()->year;
            $sessionYear = session('auth_year');

            // 1. Force Logout if Year has changed since last session established
            if ($sessionYear && $sessionYear < $currentYear) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('login')->with('error', 'Sesi anda telah tamat untuk tahun lepas. Sila log masuk semula untuk tahun ' . $currentYear . '.');
            }

            // 2. Set current year in session if not set
            if (!$sessionYear) {
                session(['auth_year' => $currentYear]);
            }
        }

        return $next($request);
    }
}
