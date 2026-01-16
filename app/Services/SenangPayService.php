<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SenangPayService
{
    protected $baseUrl;
    protected $merchantId;
    protected $secretKey;
    protected $isSandbox;

    public function __construct()
    {
        $settings = PaymentSetting::first();
        
        if ($settings && $settings->senangpay_is_active) {
            $this->isSandbox = $settings->senangpay_is_sandbox;
            // SenangPay uses the same URL for both sandbox and production
            $this->baseUrl = 'https://app.senangpay.my';
            $this->merchantId = $settings->senangpay_merchant_id;
            $this->secretKey = $settings->senangpay_secret_key;
        }
    }

    /**
     * Create a payment request
     * 
     * @param array $data Payment data
     * @return array Response with payment URL or error
     */
    public function createPayment($data)
    {
        try {
            $detail = $data['detail'] ?? $data['order_id'];
            $amount = number_format($data['amount'], 2, '.', '');
            $orderId = $data['order_id'];
            $name = $data['name'];
            $email = $data['email'];
            $phone = $data['phone'] ?? '';

            // Generate hash for payment request
            $hash = $this->generateHash($detail, $amount, $orderId);

            // Build payment URL with query parameters
            $paymentUrl = $this->baseUrl . '/payment/' . $this->merchantId;
            $queryParams = http_build_query([
                'detail' => $detail,
                'amount' => $amount,
                'order_id' => $orderId,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'hash' => $hash,
            ]);

            return [
                'success' => true,
                'payment_url' => $paymentUrl . '?' . $queryParams,
                'order_id' => $orderId,
                'hash' => $hash,
            ];
        } catch (\Exception $e) {
            Log::error('SenangPay createPayment error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify callback hash
     * 
     * @param array $data Callback data
     * @return bool
     */
    public function verifyCallback($data)
    {
        try {
            $statusId = $data['status_id'] ?? '';
            $orderId = $data['order_id'] ?? '';
            $transactionId = $data['transaction_id'] ?? '';
            $msg = $data['msg'] ?? '';
            $receivedHash = $data['hash'] ?? '';

            // Generate hash for verification
            $calculatedHash = md5($this->secretKey . $statusId . $orderId . $transactionId . $msg);

            return hash_equals($calculatedHash, $receivedHash);
        } catch (\Exception $e) {
            Log::error('SenangPay verifyCallback error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Query order status
     * 
     * @param string $orderId
     * @return array|null
     */
    public function queryOrderStatus($orderId)
    {
        try {
            $hash = md5($this->merchantId . $this->secretKey . $orderId);

            $response = Http::get("{$this->baseUrl}/apiv1/query_order_status", [
                'merchant_id' => $this->merchantId,
                'order_id' => $orderId,
                'hash' => $hash,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('SenangPay queryOrderStatus failed', [
                'order_id' => $orderId,
                'status' => $response->status(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SenangPay queryOrderStatus error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Query transaction status
     * 
     * @param string $transactionReference
     * @return array|null
     */
    public function queryTransactionStatus($transactionReference)
    {
        try {
            $hash = md5($this->merchantId . $this->secretKey . $transactionReference);

            $response = Http::get("{$this->baseUrl}/apiv1/query_transaction_status", [
                'merchant_id' => $this->merchantId,
                'transaction_reference' => $transactionReference,
                'hash' => $hash,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('SenangPay queryTransactionStatus failed', [
                'transaction_reference' => $transactionReference,
                'status' => $response->status(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('SenangPay queryTransactionStatus error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate hash for payment request
     * 
     * @param string $detail
     * @param string $amount
     * @param string $orderId
     * @return string
     */
    protected function generateHash($detail, $amount, $orderId)
    {
        return md5($this->secretKey . $detail . $amount . $orderId);
    }

    /**
     * Check if SenangPay is active
     * 
     * @return bool
     */
    public static function isActive()
    {
        $settings = PaymentSetting::first();
        return $settings && $settings->senangpay_is_active;
    }
}
