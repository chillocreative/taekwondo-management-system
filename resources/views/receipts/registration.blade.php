<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Resit Pendaftaran - Taekwondo A&Z</title>
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
            color: green;
            font-weight: bold;
            border: 2px solid green;
            padding: 5px 10px;
            border-radius: 5px;
            transform: rotate(-10deg);
            display: inline-block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logo.png') }}" class="logo" alt="Logo" style="max-height: 80px;">
        <h1 class="title">Taekwondo A&Z</h1>
        <p class="subtitle">Resit Rasmi Pembayaran Yuran</p>
    </div>

    <div class="meta-info">
        <div class="meta-left">
            <strong>Kepada:</strong><br>
            {{ strtoupper($child->name) }}<br>
            {{ $child->ic_number }}<br>
            Penjaga: {{ strtoupper($user->name) }}
        </div>
        <div class="meta-right">
            <div class="receipt-box">
                <div><strong>No. Resit:</strong> {{ $child->payment_reference ?? 'N/A' }}</div>
                <div><strong>Tarikh:</strong> {{ $child->payment_date ? $child->payment_date->format('d/m/Y') : date('d/m/Y') }}</div>
            </div>
            <div style="margin-top: 10px;">
                <span class="status-paid">TELAH DIBAYAR</span>
            </div>
        </div>
    </div>

    <table class="content-table">
        <thead>
            <tr>
                <th>Keterangan Pembayaran</th>
                <th style="width: 150px; text-align: right;">Jumlah (RM)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    @if($child->registration_type === 'renewal')
                        <strong>Yuran Pembaharuan Keahlian ({{ date('Y') }})</strong><br>
                        <span style="font-size: 12px; color: #666;">Pembaharuan keahlian tahunan.</span>
                        <div style="font-size: 11px; margin-top: 5px; color: #D4AF37; font-weight: bold;">
                            TAHAP: {{ strtoupper($child->belt_level_malay) }}
                        </div>
                    @else
                        <strong>Yuran Pendaftaran / Tahunan ({{ date('Y') }})</strong><br>
                        <span style="font-size: 12px; color: #666;">Pendaftaran ahli baru dan pembaharuan tahunan.</span>
                    @endif
                </td>
                <td style="text-align: right;">
                    {{ number_format($items['yearly_fee'], 2) }}
                </td>
            </tr>
            <tr>
                <td>
                    <strong>Yuran Bulanan ({{ \Carbon\Carbon::now()->format('F Y') }})</strong><br>
                    <span style="font-size: 12px; color: #666;">Yuran latihan bulanan semasa.</span>
                </td>
                <td style="text-align: right;">
                    {{ number_format($items['monthly_fee'], 2) }}
                </td>
            </tr>

            @if(isset($items['outstanding_fee']) && $items['outstanding_fee'] > 0)
            <tr>
                <td>
                    <strong>Tunggakan Yuran Bulanan (Tahun Lepas)</strong><br>
                    <span style="font-size: 12px; color: #666;">Tunggakan yuran yang belum dijelaskan dari sesi sebelum ini.</span>
                </td>
                <td style="text-align: right;">
                    {{ number_format($items['outstanding_fee'], 2) }}
                </td>
            </tr>
            @endif
            
            <tr class="total-row">
                <td style="text-align: right;">Jumlah Keseluruhan</td>
                <td style="text-align: right;">RM {{ number_format($items['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Resit ini adalah cetakan komputer dan tidak memerlukan tandatangan.</p>
        <p>Terima kasih kerana menyertai Taekwondo A&Z.</p>
    </div>
</body>
</html>
