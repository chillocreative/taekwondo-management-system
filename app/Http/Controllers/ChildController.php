<?php

namespace App\Http\Controllers;

use App\Models\Child;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChildController extends Controller
{
    /**
     * Display a listing of the user's children
     */
    public function index()
    {
        $children = Auth::user()->children()->latest()->get();

        return Inertia::render('Children/Index', [
            'children' => $children,
        ]);
    }

    /**
     * Store a newly created child
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'ic_number' => 'nullable|string|max:20',
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
        ]);

        Auth::user()->children()->create($validated);

        return redirect()->route('children.index')
            ->with('success', 'Anak berjaya ditambah.');
    }

    /**
     * Update the specified child
     */
    public function update(Request $request, Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'ic_number' => 'nullable|string|max:20',
            'belt_level' => 'required|in:white,yellow,green,blue,red,black_1,black_2,black_3,black_4,black_5',
            'is_active' => 'boolean',
        ]);

        $child->update($validated);

        return redirect()->route('children.index')
            ->with('success', 'Maklumat anak berjaya dikemaskini.');
    }

    /**
     * Remove the specified child
     */
    public function destroy(Child $child)
    {
        // Ensure the child belongs to the authenticated user
        if ($child->parent_id !== Auth::id()) {
            abort(403);
        }

        $child->delete();

        return redirect()->route('children.index')
            ->with('success', 'Anak berjaya dipadam.');
    }
}
