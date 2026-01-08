<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    protected static $url = 'http://localhost:3001/send';

    public static function send($phone, $message)
    {
        // Clean phone number (remove +, spaces, etc)
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Ensure starting with 60 for Malaysia if not provided
        if (strlen($phone) == 10 && strpos($phone, '01') === 0) {
            $phone = '60' . substr($phone, 1);
        } elseif (strlen($phone) == 11 && strpos($phone, '01') === 0) {
            $phone = '60' . substr($phone, 1);
        }

        try {
            $response = Http::timeout(5)->post(self::$url, [
                'phone' => $phone,
                'message' => $message
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp sent to {$phone}");
                return true;
            }

            Log::error("WhatsApp failed to {$phone}: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("WhatsApp connection error: " . $e->getMessage());
            return false;
        }
    }

    public static function notifyAdmin($message)
    {
        // Get admin phone from settings or env
        $adminPhone = env('WHATSAPP_ADMIN_PHONE', '60123456789');
        return self::send($adminPhone, "*[TSMS ADMIN]*\n\n" . $message);
    }
}
