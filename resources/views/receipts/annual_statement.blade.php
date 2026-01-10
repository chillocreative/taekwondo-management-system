<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Penyata Tahunan - Taekwondo A&Z</title>
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
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .logo {
            max-width: 80px;
            margin-bottom: 10px;
        }
        .title {
            font-size: 22px;
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
        .info-section {
            margin-bottom: 25px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .info-grid {
            display: table;
            width: 100%;
        }
        .info-item {
            display: table-cell;
            width: 33.33%;
        }
        .info-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .info-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }
        .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #e2e8f0;
        }
        .statement-table th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: bold;
            text-align: left;
            padding: 12px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
            text-transform: uppercase;
        }
        .statement-table td {
            padding: 12px;
            border: 1px solid #e2e8f0;
            font-size: 13px;
        }
        .status-paid {
            color: #166534;
            font-weight: bold;
            background-color: #dcfce7;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
        .status-unpaid {
            color: #991b1b;
            font-weight: bold;
            background-color: #fee2e2;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Taekwondo A&Z</h1>
        <p class="subtitle">Penyata Pembayaran Yuran Tahunan ({{ date('Y') }})</p>
    </div>

    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Nama Peserta</div>
                <div class="info-value">{{ strtoupper($child_name) }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">No. Siri</div>
                <div class="info-value">{{ $no_siri }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Pusat Latihan</div>
                <div class="info-value">{{ $training_center }}</div>
            </div>
        </div>
    </div>

    <table class="statement-table">
        <thead>
            <tr>
                <th style="width: 20%;">Yuran Bulan</th>
                <th style="width: 20%;">Status</th>
                <th style="width: 25%;">Tarikh Pembayaran</th>
                <th style="width: 20%;">No. Resit</th>
                <th style="width: 15%; text-align: right;">Jumlah (RM)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
            <tr>
                <td><strong>{{ $payment['month_name'] }} {{ $payment['year'] }}</strong></td>
                <td>
                    @if($payment['is_paid'])
                        <span class="status-paid">SUDAH DIBAYAR</span>
                    @else
                        <span class="status-unpaid">BELUM BAYAR</span>
                    @endif
                </td>
                <td>{{ $payment['payment_date'] ?: '-' }}</td>
                <td>{{ $payment['receipt_number'] ?: '-' }}</td>
                <td style="text-align: right;">{{ number_format($payment['amount'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Penyata ini dijana secara digital pada {{ date('d/m/Y H:i:s') }}</p>
        <p>Sila simpan penyata ini untuk rujukan masa hadapan.</p>
    </div>
</body>
</html>
