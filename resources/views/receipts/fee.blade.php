<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resit Rasmi - Taekwondo A&Z</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #D4AF37; /* Gold border */
            padding-bottom: 20px;
        }
        .logo {
            max-width: 100px;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin: 0;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin: 5px 0 0;
        }
        .meta-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .meta-left {
            display: table-cell;
            text-align: left;
            vertical-align: top;
        }
        .meta-right {
            display: table-cell;
            text-align: right;
            vertical-align: top;
        }
        .receipt-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
        }
        .content-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .content-table th {
            background-color: #f1ebd6; /* Light Gold */
            color: #333;
            font-weight: bold;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #D4AF37;
        }
        .content-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .total-row td {
            font-weight: bold;
            font-size: 1.1em;
            background-color: #f8f9fa;
            border-top: 2px solid #333;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .status-paid {
            color: #2e7d32;
            font-weight: bold;
            border: 3px solid #2e7d32;
            padding: 8px 15px;
            border-radius: 8px;
            transform: rotate(-8deg);
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 15px;
            font-size: 16px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="header">
        @if(file_exists(public_path('images/logo.png')))
            <img src="{{ public_path('images/logo.png') }}" class="logo" alt="Logo" style="max-height: 80px;">
        @endif
        <h1 class="title">Taekwondo A&Z</h1>
        <p class="subtitle">Resit Rasmi Pembayaran Yuran</p>
    </div>

    <div class="meta-info">
        <div class="meta-left">
            <strong>Kepada:</strong><br>
            {{ strtoupper($payment->student->nama_pelajar) }}<br>
            {{ $payment->student->no_siri }}<br>
            Penjaga: {{ strtoupper($payment->student->nama_penjaga ?? '-') }}
        </div>
        <div class="meta-right">
            <div class="receipt-box">
                <div><strong>No. Resit:</strong> {{ $payment->receipt_number }}</div>
                <div><strong>Tarikh:</strong> {{ $payment->payment_date ? $payment->payment_date->format('d/m/Y') : ($payment->created_at ? $payment->created_at->format('d/m/Y') : date('d/m/Y')) }}</div>
            </div>
            <div style="margin-top: 10px;">
                <span class="status-paid">TELAH DIBAYAR</span>
            </div>
        </div>
    </div>

    @php
        $child = $payment->student->child;
        
        // Find linked monthly payments to show breakdown
        $monthlyPayments = \App\Models\MonthlyPayment::where('student_payment_id', $payment->id)->get();
        if ($monthlyPayments->isEmpty()) {
            // Fallback: If not linked via ID, maybe it's just a single month fee
            $monthlyPayments = \App\Models\MonthlyPayment::where('payment_reference', $payment->transaction_ref)->get();
        }

        $totalMonthly = $monthlyPayments->sum('amount');
        
        // Detect if this is a registration/renewal or a surplus payment
        // We consider it a registration payment if:
        // 1. The transaction reference matches the child's registration reference, OR
        // 2. There is a surplus (Total Paid > Sum of Monthly Payments) AND it's a 4-digit numeric receipt (from ChildController flow)
        $isRegistrationPayment = false;
        $yearlyFee = 0;
        
        if ($child) {
            $surplus = (float)$payment->total - (float)$totalMonthly;
            
            // Case 1: Direct match with registration reference
            if ($child->payment_reference === $payment->transaction_ref) {
                $isRegistrationPayment = true;
                $yearlyFee = (float) $child->registration_fee > 0 ? (float) $child->registration_fee : 0;
                
                // If yearly fee is not set on child but there's a surplus, use surplus
                if ($yearlyFee <= 0 && $surplus > 0) {
                    $yearlyFee = $surplus;
                }
            } 
            // Case 2: Surplus detected in January (Renewal month)
            else if ($surplus > 0) {
                $paymentMonth = $payment->payment_date ? $payment->payment_date->month : null;
                // If it's January AND there's a surplus, it's likely a renewal
                if ($paymentMonth == 1) {
                    $isRegistrationPayment = true;
                    $yearlyFee = $surplus;
                }
            }
        }
    @endphp

    <table class="content-table">
        <thead>
            <tr>
                <th>Keterangan Pembayaran</th>
                <th style="width: 150px; text-align: right;">Jumlah (RM)</th>
            </tr>
        </thead>
        <tbody>
            @if($isRegistrationPayment)
            <tr>
                <td>
                    @php
                        $paymentYear = $payment->payment_date ? $payment->payment_date->year : ($payment->created_at ? $payment->created_at->year : date('Y'));
                    @endphp
                    @if($child->registration_type === 'renewal')
                        <strong>Yuran Pembaharuan Keahlian ({{ $paymentYear }})</strong><br>
                        <span style="font-size: 12px; color: #666;">Pembaharuan keahlian tahunan.</span>
                    @else
                        <strong>Yuran Pendaftaran / Tahunan ({{ $paymentYear }})</strong><br>
                        <span style="font-size: 12px; color: #666;">Pendaftaran ahli baru dan pembaharuan tahunan.</span>
                    @endif
                </td>
                <td style="text-align: right;">
                    {{ number_format($yearlyFee, 2) }}
                </td>
            </tr>
            @endif

            @if(!$monthlyPayments->isEmpty())
                @foreach($monthlyPayments as $mp)
                    @php
                        $currentPaymentYear = $payment->payment_date ? $payment->payment_date->year : ($payment->created_at ? $payment->created_at->year : date('Y'));
                        $isPreYear = $mp->year < $currentPaymentYear;
                    @endphp
                    <tr>
                        <td>
                            @if($isPreYear)
                                <strong>Tunggakan Yuran Bulanan ({{ $mp->month_name }} {{ $mp->year }})</strong><br>
                                <span style="font-size: 12px; color: #666;">Tunggakan yuran dari sesi sebelum ini.</span>
                            @else
                                <strong>Yuran Bulanan ({{ $mp->month_name }} {{ $mp->year }})</strong><br>
                                <span style="font-size: 12px; color: #666;">Yuran latihan bulanan.</span>
                            @endif
                        </td>
                        <td style="text-align: right;">
                            {{ number_format($mp->amount, 2) }}
                        </td>
                    </tr>
                @endforeach
            @elseif(!$isRegistrationPayment)
                {{-- Fallback for older records or simple fee records --}}
                <tr>
                    <td>
                        <strong>Yuran Bulanan Taekwondo - {{ $payment->month }}</strong><br>
                        <span style="font-size: 12px; color: #666;">Kategori: {{ ucfirst($payment->kategori) }}</span>
                    </td>
                    <td style="text-align: right;">{{ number_format($payment->amount, 2) }}</td>
                </tr>
            @endif
            
            <tr class="total-row">
                <td style="text-align: right;">Jumlah Keseluruhan</td>
                <td style="text-align: right;">RM {{ number_format($payment->total, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Resit ini adalah cetakan komputer dan tidak memerlukan tandatangan.</p>
        <p>Terima kasih kerana memilih Taekwondo A&Z.</p>
    </div>
</body>
</html>

