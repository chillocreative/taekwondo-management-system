<?php

namespace App\Http\Controllers;

use App\Models\PaymentSetting;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class PaymentSettingController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display payment settings page
     */
    public function index()
    {
        // Only admin can access
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $settings = PaymentSetting::first();

        return Inertia::render('Settings/Payment', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update payment settings
     */
    public function update(Request $request)
    {
        // Only admin can access
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'provider' => 'required|string',
            'is_sandbox' => 'required|boolean',
            'secret_key' => 'required|string',
            'category_code' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $settings = PaymentSetting::first();

        if ($settings) {
            $settings->update($validated);
        } else {
            $settings = PaymentSetting::create($validated);
        }

        return redirect()->route('settings.payment')
            ->with('success', 'Payment settings updated successfully.');
    }

    /**
     * Create ToyyibPay category
     */
    public function createCategory(Request $request)
    {
        // Only admin can access
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'catname' => 'required|string|max:255',
            'catdescription' => 'required|string|max:500',
        ]);

        $toyyibPay = new ToyyibPayService();
        $result = $toyyibPay->createCategory(
            $validated['catname'],
            $validated['catdescription']
        );

        if ($result['success']) {
            // Update settings with new category code
            $settings = PaymentSetting::first();
            if ($settings) {
                $settings->update(['category_code' => $result['categoryCode']]);
            }

            return redirect()->route('settings.payment')
                ->with('success', 'Category created successfully. Category Code: ' . $result['categoryCode']);
        }

        return redirect()->route('settings.payment')
            ->with('error', 'Failed to create category: ' . ($result['message'] ?? 'Unknown error'));
    }

    /**
     * Test connection
     */
    public function testConnection()
    {
        // Only admin can access
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $settings = PaymentSetting::getActive();

        if (!$settings) {
            return redirect()->route('settings.payment')
                ->with('error', 'No active payment settings found. Please configure and activate payment settings first.');
        }

        // Test by creating a test category
        $toyyibPay = new ToyyibPayService();
        $result = $toyyibPay->createCategory(
            'Test Category ' . now()->format('YmdHis'),
            'Test category for connection verification'
        );

        if ($result['success'] ?? false) {
            return redirect()->route('settings.payment')
                ->with('success', 'Connection test successful! ToyyibPay API is working correctly.');
        }

        return redirect()->route('settings.payment')
            ->with('error', 'Connection test failed: ' . ($result['message'] ?? 'Unknown error'));
    }
}
