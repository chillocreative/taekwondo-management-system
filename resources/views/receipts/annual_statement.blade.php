<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Penyata Tahunan - Taekwondo A&Z</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
            text-decoration: none;
            text-transform: uppercase;
        }
        .info-section {
            margin-bottom: 30px;
            font-size: 14px;
        }
        .info-row {
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .statement-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .statement-table th, .statement-table td {
            border: 1px solid #000;
            padding: 5px 10px;
        }
        .statement-table th {
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            background-color: #fff;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            font-weight: bold;
            text-transform: uppercase;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="margin-bottom: 5px;">
            <img src="{{ public_path('images/logo.png') }}" alt="Logo" style="max-height: 80px;">
        </div>
        <div style="font-weight: bold; font-size: 18px; margin-bottom: 10px; text-transform: uppercase;">TAEKWONDO A&Z</div>
        <div style="border-bottom: 1px solid #ccc; margin-bottom: 20px; width: 300px; margin-left: auto; margin-right: auto;"></div>
        
        <h1 class="title">PENYATA PEMBAYARAN BAGI TAHUN {{ $year }}</h1>
    </div>

    <div class="info-section">
        <div class="info-row">NAMA WARIS : {{ strtoupper($guardian_name) }} ({{ $guardian_ic }})</div>
        <div class="info-row">NAMA PESERTA: {{ strtoupper($child_name) }} ({{ $child_ic }})</div>
        <div class="info-row">PUSAT LATIHAN: {{ strtoupper($training_center) }}</div>
    </div>

    <table class="statement-table">
        <thead>
            <tr>
                <th style="width: 10%;">BIL</th>
                <th style="width: 60%; text-align: left;">BAYARAN (BULAN)</th>
                <th style="width: 30%;">JUMLAH BAYARAN (RM)</th>
            </tr>
        </thead>
        <tbody>
            @php $i = 1; @endphp
            @foreach($payments as $payment)
            <tr>
                <td class="text-center">{{ $i++ }}.</td>
                <td style="text-transform: uppercase;">{{ $payment['month_name'] }}</td>
                <td class="text-right">
                    @if($payment['is_paid'])
                        {{ number_format($payment['amount'], 2) }}
                    @else
                        0.00
                    @endif
                </td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="2" class="text-right">TOTAL DITERIMA BAGI TAHUN {{ $year }}:</td>
                <td class="text-right">{{ number_format($total_paid, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Resit ini adalah cetakan komputer dan tidak memerlukan tandatangan.</p>
        <p>Dicetak pada: {{ date('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
