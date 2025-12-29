<?php

namespace App\Http\Controllers;

use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class TrainingCenterController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of training centers (Admin only)
     */
    public function index()
    {
        $this->authorize('viewAny', TrainingCenter::class);

        $trainingCenters = TrainingCenter::latest()->get();

        return Inertia::render('Admin/TrainingCenters/Index', [
            'trainingCenters' => $trainingCenters,
        ]);
    }

    /**
     * Store a newly created training center
     */
    public function store(Request $request)
    {
        $this->authorize('create', TrainingCenter::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        TrainingCenter::create($validated);

        return redirect()->route('training-centers.index')
            ->with('success', 'Pusat latihan berjaya ditambah.');
    }

    /**
     * Update the specified training center
     */
    public function update(Request $request, TrainingCenter $trainingCenter)
    {
        $this->authorize('update', $trainingCenter);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $trainingCenter->update($validated);

        return redirect()->route('training-centers.index')
            ->with('success', 'Pusat latihan berjaya dikemaskini.');
    }

    /**
     * Remove the specified training center
     */
    public function destroy(TrainingCenter $trainingCenter)
    {
        $this->authorize('delete', $trainingCenter);

        $trainingCenter->delete();

        return redirect()->route('training-centers.index')
            ->with('success', 'Pusat latihan berjaya dipadam.');
    }
}
