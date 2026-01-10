<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset request via WhatsApp.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'phone_number' => 'required',
        ]);

        $user = \App\Models\User::where('phone_number', $request->phone_number)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'phone_number' => ['Nombor telefon tidak dijumpai dalam rekod kami.'],
            ]);
        }

        // Generate a new random password
        $newPassword = \Illuminate\Support\Str::random(6);
        
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($newPassword)
        ]);

        // Send via WhatsApp
        $msg = "*[LUPA KATA LALUAN]*\n\nAssalamualaikum & Salam Sejahtera,\n\nIni adalah kata laluan baharu anda untuk sistem Taekwondo A&Z.\n\n*ID:* {$user->phone_number}\n*KATA LALUAN:* {$newPassword}\n\nSila log masuk dan tukar kata laluan anda dengan segera di bahagian profil.";
        
        $sent = \App\Services\WhatsappService::send($user->phone_number, $msg);

        if ($sent) {
            return back()->with('status', 'Kata laluan baharu telah dihantar ke WhatsApp anda.');
        }

        return back()->with('error', 'Gagal menghantar WhatsApp. Sila cuba lagi atau hubungi admin.');
    }
}
