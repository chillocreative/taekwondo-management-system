<?php

namespace App\Http\Controllers;

use App\Models\FeeSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeSettingController extends Controller
{
    /**
     * Display the fee settings page
     */
    public function index()
    {
        $settings = FeeSetting::current();

        return Inertia::render('Settings/Fees', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update fee settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'yearly_fee_below_18' => 'required|numeric|min:0',
            'yearly_fee_above_18' => 'required|numeric|min:0',
            'monthly_fee_below_18' => 'required|numeric|min:0',
            'monthly_fee_above_18' => 'required|numeric|min:0',
        ]);

        $settings = FeeSetting::current();
        $settings->update($validated);

        return redirect()->route('settings.fees.index')
            ->with('success', 'Tetapan yuran berjaya dikemaskini.');
    }
}
