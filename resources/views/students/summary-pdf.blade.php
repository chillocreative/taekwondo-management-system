<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Pembayaran - {{ $student->nama_pelajar }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            padding: 40px;
            padding-bottom: 80px; /* Space for footer */
            color: #333;
        }
        
        /* Header & Content Styles */
        .header {
            width: 100%;
            margin-bottom: 40px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        
        .header-table { width: 100%; }
        .logo-cell { width: 100px; vertical-align: middle; }
        .club-info-cell { vertical-align: middle; }
        .title-cell { text-align: right; vertical-align: middle; }
        
        .club-name { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 5px; }
        .club-location { font-size: 12px; color: #666; }
        .title { font-size: 24px; font-weight: bold; color: #e74c3c; line-height: 1.1; text-align: right; }
        
        .student-info { margin-bottom: 30px; position: relative; }
        .student-name { font-size: 16px; font-weight: bold; color: #000; margin-bottom: 15px; text-transform: uppercase; }
        .info-table { width: 100%; }
        .info-label { width: 80px; color: #666; font-size: 11px; vertical-align: top; padding-bottom: 5px; }
        .info-value { color: #000; font-size: 11px; vertical-align: top; padding-bottom: 5px; }
        
        .no-siri-box { position: absolute; top: 0; right: 0; text-align: right; }
        .no-siri-label { font-size: 11px; color: #666; margin-bottom: 5px; }
        .no-siri-value { font-size: 16px; font-weight: bold; color: #000; }
        
        .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .payment-table thead th { background-color: #3498db; color: white; padding: 12px 10px; text-align: left; font-weight: bold; font-size: 11px; text-transform: uppercase; }
        .payment-table th.center { text-align: center; }
        .payment-table th.right { text-align: right; }
        .payment-table tbody td { padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; }
        .payment-table td.center { text-align: center; }
        .payment-table td.right { text-align: right; }
        
        .summary-section { width: 100%; margin-top: 20px; }
        .summary-table { width: 250px; margin-left: auto; }
        .summary-table td { padding: 5px 0; text-align: right; }
        .summary-label { font-weight: bold; color: #666; font-size: 12px; padding-right: 20px; }
        .summary-value { font-weight: bold; color: #000; font-size: 12px; }
        .total-row .summary-label, .total-row .summary-value { font-size: 14px; color: #000; padding-top: 10px; }

        /* Minimalist Footer Styles */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 70px;
            background-color: #004aad;
            color: white;
            font-family: 'Poppins', sans-serif;
            text-align: center;
            padding-top: 10px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="logo-cell">
                    <img src="{{ public_path('images/logo_new.jpg') }}" alt="Logo" style="width: 80px; height: auto;">
                </td>
                <td class="club-info-cell">
                    <div class="club-name">KELAB TAEKWONDO A&Z</div>
                    <div class="club-location">Kepala Batas, Pulau Pinang</div>
                </td>
                <td class="title-cell">
                    <div class="title">RINGKASAN<br>PEMBAYARAN</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Student Info -->
    <div class="student-info">
        <div class="student-name">{{ strtoupper($student->nama_pelajar) }}</div>
        
        <table class="info-table">
            <tr>
                <td class="info-label">Alamat:</td>
                <td class="info-value">{{ $student->alamat }}</td>
            </tr>
            <tr>
                <td class="info-label">No Tel:</td>
                <td class="info-value">{{ $student->no_tel }}</td>
            </tr>
        </table>

        <div class="no-siri-box">
            <div class="no-siri-label">No Siri:</div>
            <div class="no-siri-value">{{ $student->no_siri }}</div>
        </div>
    </div>

    <!-- Payment Table -->
    <table class="payment-table">
        <thead>
            <tr>
                <th>BUTIRAN PEMBAYARAN</th>
                <th class="center">KATEGORI</th>
                <th class="right">JUMLAH PEMBAYARAN</th>
                <th class="center">KUANTITI</th>
                <th class="right">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @php $grandTotal = 0; @endphp
            @foreach($paymentData as $data)
                @if($data['paid'])
                @php $grandTotal += $data['total']; @endphp
                <tr>
                    <td>{{ $data['month'] }}</td>
                    <td class="center">{{ ucfirst($data['kategori']) }}</td>
                    <td class="right">RM{{ number_format($data['amount'], 2) }}</td>
                    <td class="center">{{ $data['quantity'] }}</td>
                    <td class="right">RM{{ number_format($data['total'], 2) }}</td>
                </tr>
                @endif
            @endforeach
        </tbody>
    </table>

    <!-- Summary -->
    <div class="summary-section">
        <table class="summary-table">
            <tr>
                <td class="summary-label">SUBTOTAL</td>
                <td class="summary-value">RM {{ number_format($grandTotal, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td class="summary-label">TOTAL</td>
                <td class="summary-value">RM {{ number_format($grandTotal, 2) }}</td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div style="font-weight: bold;">Kelas Taekwondo A&Z</div>
        <div>012 - 479 4200</div>
        <div>www.taekwondoanz.com</div>
    </div>
</body>
</html>
