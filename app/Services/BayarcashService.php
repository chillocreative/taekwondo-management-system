<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BayarcashService
{
    protected $baseUrl;
    protected $accessToken;
    protected $portalKey;
    protected $isSandbox;

    public function __construct()
    {
        $settings = PaymentSetting::first();
        
        if ($settings && $settings->bayarcash_is_active) {
            $this->isSandbox = $settings->bayarcash_is_sandbox;
            $this->baseUrl = $this->isSandbox 
                ? 'https://api.console.bayarcash-sandbox.com/v3' 
                : 'https://api.console.bayar.cash/v3';
            $this->accessToken = $settings->bayarcash_access_token;
            $this->portalKey = $settings->bayarcash_portal_key;
        }
    }

    /**
     * Create a payment intent
     * 
     * @param array $data Payment data
     * @return array Response with payment URL or error
     */
    public function createPaymentIntent($data)
    {
        try {
            $payload = [
                'payment_channel' => 5, // FPX
                'portal_key' => $this->portalKey,
                'order_number' => $data['order_number'],
                'amount' => (int) ($data['amount'] * 100), // Convert to cents
                'payer_name' => $data['payer_name'],
                'payer_email' => $data['payer_email'],
                'payer_telephone_number' => $data['payer_telephone_number'] ?? '',
                'return_url' => $data['return_url'] ?? '',
                'callback_url' => $data['callback_url'] ?? '',
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->accessToken,
            ])->post("{$this->baseUrl}/payment-intents", $payload);

            $result = $response->json();
            
            if ($response->successful() && isset($result['url'])) {
                return [
                    'success' => true,
                    'payment_intent_id' => $result['id'] ?? null,
                    'payment_url' => $result['url'],
                    'order_number' => $result['order_number'] ?? null,
                ];
            }

            Log::error('Bayarcash createPaymentIntent failed', [
                'response' => $result,
                'status' => $response->status(),
            ]);

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Failed to create payment intent',
                'response' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('Bayarcash createPaymentIntent error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get transaction details by payment intent ID
     * 
     * @param string $paymentIntentId
     * @return array|null
     */
    public function getTransaction($paymentIntentId)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
            ])->get("{$this->baseUrl}/payment-intents/{$paymentIntentId}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Bayarcash getTransaction failed', [
                'payment_intent_id' => $paymentIntentId,
                'status' => $response->status(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Bayarcash getTransaction error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify callback checksum
     * 
     * @param array $data Callback data
     * @return bool
     */
    public function verifyCallback($data)
    {
        // Implement checksum verification based on Bayarcash documentation
        // This is a placeholder - actual implementation depends on Bayarcash's checksum algorithm
        return true;
    }

    /**
     * Check if Bayarcash is active
     * 
     * @return bool
     */
    public static function isActive()
    {
        $settings = PaymentSetting::first();
        return $settings && $settings->bayarcash_is_active;
    }
}
