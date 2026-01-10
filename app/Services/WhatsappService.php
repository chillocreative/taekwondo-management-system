<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WhatsappService
{
    protected static function getBaseUrl()
    {
        $url = rtrim(env('WHATSAPP_SERVER_URL', 'http://localhost:3001'), '/');
        
        // Internal status check shows user hit /whatsapp-api/status
        // Our updated server supports both / and /whatsapp-api
        // We will stick to the standard /whatsapp-api suffix for clarity
        if (str_contains($url, 'yuran.taekwondoanz.com')) {
             return $url . '/whatsapp-api';
        }

        if (str_ends_with($url, '/whatsapp-api')) {
            return $url;
        }
        
        return $url . '/whatsapp-api';
    }

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
            $response = Http::timeout(10)
                ->withoutVerifying()
                ->post(self::getBaseUrl() . '/send', [
                'phone' => $phone,
                'message' => $message
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp sent successfully to {$phone}");
                return true;
            }

            Log::error("WhatsApp failed to {$phone}! URL: " . self::getBaseUrl() . "/send. Status: " . $response->status() . " Body: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("WhatsApp connection error to {$phone}: " . $e->getMessage() . " (URL: " . self::getBaseUrl() . ")");
            return false;
        }
    }

    public static function sendFile($phone, $message, $fileBase64, $filename = 'document.pdf')
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (strlen($phone) == 10 && strpos($phone, '01') === 0) {
            $phone = '60' . substr($phone, 1);
        } elseif (strlen($phone) == 11 && strpos($phone, '01') === 0) {
            $phone = '60' . substr($phone, 1);
        }

        try {
            $response = Http::timeout(30)
                ->withoutVerifying()
                ->post(self::getBaseUrl() . '/send-file', [
                'phone' => $phone,
                'message' => $message,
                'file' => $fileBase64,
                'filename' => $filename
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp File sent successfully to {$phone}");
                return true;
            }

            Log::error("WhatsApp File failed to {$phone}! URL: " . self::getBaseUrl() . "/send-file. Status: " . $response->status() . " Body: " . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error("WhatsApp File connection error to {$phone}: " . $e->getMessage() . " (URL: " . self::getBaseUrl() . ")");
            return false;
        }
    }

    public static function getAdminPhone()
    {
        // Try to get from Cache first
        $cachedAdmin = Cache::get('whatsapp_admin_phone');
        if ($cachedAdmin) return $cachedAdmin;

        // Otherwise try to get from /me
        try {
            $response = Http::timeout(2)
                ->withoutVerifying()
                ->get(self::getBaseUrl() . '/me');
            if ($response->successful()) {
                $phone = $response->json('phone');
                if ($phone) {
                    Cache::put('whatsapp_admin_phone', $phone, 3600); // cache for 1 hour
                    return $phone;
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to get Admin phone from WhatsApp server: " . $e->getMessage());
        }

        return env('WHATSAPP_ADMIN_PHONE', '60124794200'); // Default fallback
    }

    public static function notifyAdmin($message)
    {
        $adminPhone = self::getAdminPhone();
        return self::send($adminPhone, $message);
    }

    /**
     * Notify Admin about 3 consecutive absences
     */
    public static function notifyConsecutiveAbsenceAdmin($studentName, $studentId)
    {
        $link = url("/admin/students/{$studentId}");
        $message = "*[TSMS NOTIFIKASI]*\n\n{$studentName} telah tidak hadir sebanyak 3 kali.\n\nLink details: {$link}";
        return self::notifyAdmin($message);
    }

    /**
     * Notify Waris about 3 consecutive absences
     */
    public static function notifyConsecutiveAbsenceWaris($phone, $studentName)
    {
        $message = "*[TSMS NOTIFIKASI]*\n\n*{$studentName}* telah tidak hadir sebanyak 3 kali.\n\nMohon waris berhubung dengan jurulatih untuk memaklumkan sebab ketidakhadiran (jika masih belum berbuat demikian) atau berdepan pembatalan keahlian.\n\nHarap Maklum.";
        return self::send($phone, $message);
    }

    /**
     * Notify Admin about new successful registration payment
     */
    public static function notifyAdminNewPaidPeserta($pesertaName, $amount)
    {
        $message = "*[TSMS PEMBAYARAN BARU]*\n\nTahniah! Pembayaran pendaftaran baru telah diterima.\n\n*Nama:* {$pesertaName}\n*Jumlah:* RM{$amount}\n*Status:* Berjaya\n\nSila semak sistem untuk maklumat lanjut.";
        return self::notifyAdmin($message);
    }

    /**
     * Send monthly fee reminder to Waris
     */
    public static function sendMonthlyFeeReminder($phone, $pesertaName, $monthName)
    {
        $message = "*[TSMS PERINGATAN YURAN]*\n\nAssalamualaikum & Salam Sejahtera Ibu/Bapa/Penjaga,\n\nIni adalah peringatan mesra untuk pembayaran yuran bulanan ({$monthName}) bagi *{$pesertaName}*.\n\nSila layari " . url('/fees') . " untuk membuat pembayaran secara atas talian. Sekiranya anda telah membuat pembayaran, sila abaikan mesej ini.\n\nTerima Kasih.";
        return self::send($phone, $message);
    }
}
