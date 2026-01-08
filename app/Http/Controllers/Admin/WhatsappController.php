<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class WhatsappController extends Controller
{
    protected $whatsappServerUrl = 'http://localhost:3001';

    public function index()
    {
        $status = ['connected' => false];
        try {
            $response = Http::timeout(2)->get($this->whatsappServerUrl . '/status');
            if ($response->successful()) {
                $status = $response->json();
            }
        } catch (\Exception $e) {
            // Server might be down
        }

        return Inertia::render('Admin/Whatsapp/Index', [
            'status' => $status
        ]);
    }

    public function sendTest(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'message' => 'required'
        ]);

        try {
            $response = Http::post($this->whatsappServerUrl . '/send', [
                'phone' => $request->phone,
                'message' => $request->message
            ]);

            return back()->with('success', 'Message sent successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to connect to WhatsApp server: ' . $e->getMessage()]);
        }
    }
}
