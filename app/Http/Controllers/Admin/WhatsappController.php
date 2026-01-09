<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class WhatsappController extends Controller
{
    public function index()
    {
        $serverUrl = env('WHATSAPP_SERVER_URL', 'http://localhost:3001');
        $status = ['connected' => false];
        try {
            $response = Http::timeout(2)
                ->withoutVerifying()
                ->get($serverUrl . '/status');
            if ($response->successful()) {
                $status = $response->json();
            }
        } catch (\Exception $e) {
            // Server might be down
        }

        return Inertia::render('Admin/Whatsapp/Index', [
            'status' => $status,
            'serverUrl' => $serverUrl
        ]);
    }

    public function sendTest(Request $request)
    {
        $serverUrl = env('WHATSAPP_SERVER_URL', 'http://localhost:3001');
        $request->validate([
            'phone' => 'required',
            'message' => 'required'
        ]);

        try {
            $response = Http::post($serverUrl . '/send', [
                'phone' => $request->phone,
                'message' => $request->message
            ]);

            return back()->with('success', 'Message sent successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to connect to WhatsApp server: ' . $e->getMessage()]);
        }
    }
}
