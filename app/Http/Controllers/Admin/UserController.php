<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\TrainingCenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::with('trainingCenter');

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or phone
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone_number' => $user->phone_number,
                    'email' => $user->email,
                    'address' => $user->address,
                    'role' => $user->role,
                    'training_center' => $user->trainingCenter ? [
                        'id' => $user->trainingCenter->id,
                        'name' => $user->trainingCenter->name,
                    ] : null,
                    'created_at' => $user->created_at->format('d/m/Y'),
                ];
            });

        $trainingCenters = TrainingCenter::active()->get(['id', 'name']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'trainingCenters' => $trainingCenters,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'role' => 'required|in:admin,coach,user',
            'training_center_id' => 'nullable|exists:training_centers,id',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berjaya ditambah.');
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20|unique:users,phone_number,' . $user->id,
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'role' => 'required|in:admin,coach,user',
            'training_center_id' => 'nullable|exists:training_centers,id',
        ]);

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berjaya dikemaskini.');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')
                ->with('error', 'Anda tidak boleh memadam akaun anda sendiri.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berjaya dipadam.');
    }
}
