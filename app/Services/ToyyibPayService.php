<?php

namespace App\Services;

use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ToyyibPayService
{
    protected $baseUrl;
    protected $secretKey;
    protected $categoryCode;

    public function __construct()
    {
        $settings = PaymentSetting::getActive();
        
        if ($settings && $settings->provider === 'toyyibpay') {
            $this->baseUrl = $settings->is_sandbox 
                ? 'https://dev.toyyibpay.com' 
                : 'https://toyyibpay.com';
            $this->secretKey = $settings->secret_key;
            $this->categoryCode = $settings->category_code;
        }
    }

    /**
     * Create a new bill for payment
     */
    public function createBill($data)
    {
        try {
            $response = Http::asForm()->post("{$this->baseUrl}/index.php/api/createBill", [
                'userSecretKey' => $this->secretKey,
                'categoryCode' => $this->categoryCode,
                'billName' => $data['billName'],
                'billDescription' => $data['billDescription'],
                'billPriceSetting' => 1, // Fixed amount
                'billPayorInfo' => 1, // Require payer info
                'billAmount' => $data['billAmount'] * 100, // Convert to cents
                'billReturnUrl' => $data['billReturnUrl'],
                'billCallbackUrl' => $data['billCallbackUrl'] ?? '',
                'billExternalReferenceNo' => $data['billExternalReferenceNo'] ?? '',
                'billTo' => $data['billTo'] ?? '',
                'billEmail' => $data['billEmail'] ?? '',
                'billPhone' => $data['billPhone'] ?? '',
                'billPaymentChannel' => 0, // FPX only
            ]);

            $result = $response->json();
            
            if (isset($result[0]['BillCode'])) {
                return [
                    'success' => true,
                    'billCode' => $result[0]['BillCode'],
                    'paymentUrl' => "{$this->baseUrl}/{$result[0]['BillCode']}",
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create bill',
                'response' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('ToyyibPay createBill error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get bill transactions
     */
    public function getBillTransactions($billCode)
    {
        try {
            $response = Http::asForm()->post("{$this->baseUrl}/index.php/api/getBillTransactions", [
                'billCode' => $billCode,
                'userSecretKey' => $this->secretKey,
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('ToyyibPay getBillTransactions error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create category (one-time setup)
     */
    public function createCategory($catName, $catDescription)
    {
        try {
            $response = Http::asForm()->post("{$this->baseUrl}/index.php/api/createCategory", [
                'userSecretKey' => $this->secretKey,
                'catname' => $catName,
                'catdescription' => $catDescription,
            ]);

            $result = $response->json();
            
            if (isset($result[0]['CategoryCode'])) {
                return [
                    'success' => true,
                    'categoryCode' => $result[0]['CategoryCode'],
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create category',
                'response' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('ToyyibPay createCategory error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
