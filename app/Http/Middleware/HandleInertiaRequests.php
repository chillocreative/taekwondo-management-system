<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $currentYear = \Carbon\Carbon::now()->year;
        
        $needsYearlyNotification = false;
        $allPesertaUpdated = true;
        
        if ($user && $user->role === 'user') {
            // Check if user has been notified for this year
            $needsYearlyNotification = $user->last_notified_year < $currentYear;
            
            // Re-check: only show if they still have unpaid children for this year
            $unpaidChildrenCount = $user->children()
                ->where(function($q) use ($currentYear) {
                    $q->where('last_updated_year', '<', $currentYear)
                      ->orWhereYear('payment_date', '<', $currentYear)
                      ->orWhereNull('payment_date');
                })->count();
            
            if ($unpaidChildrenCount === 0) {
                $needsYearlyNotification = false;
            }

            $allPesertaUpdated = $user->children()
                ->where('last_updated_year', '<', $currentYear)
                ->count() === 0;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('trainingCenter') : null,
            ],
            'yearlyReset' => [
                'currentYear' => $currentYear,
                'needsNotification' => $needsYearlyNotification,
                'allPesertaUpdated' => $allPesertaUpdated,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'payment_success' => fn () => $request->session()->get('payment_success'),
                'payment_error' => fn () => $request->session()->get('payment_error'),
            ],
        ];
    }
}
