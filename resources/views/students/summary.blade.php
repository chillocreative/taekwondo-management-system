<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Pembayaran - {{ $student->nama_pelajar }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            padding: 40px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            background-color: #f9f9f9;
        }
        
        .container {
            background-color: white;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
            width: 100%;
            margin-bottom: 40px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .club-info {
            flex: 1;
        }
        
        .club-name { font-size: 20px; font-weight: bold; color: #000; margin-bottom: 5px; }
        .club-location { font-size: 14px; color: #666; }
        .title { font-size: 24px; font-weight: bold; color: #e74c3c; line-height: 1.1; text-align: right; }
        
        .student-info { margin-bottom: 30px; position: relative; }
        .student-name { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 15px; text-transform: uppercase; }
        .info-row { display: flex; margin-bottom: 5px; }
        .info-label { width: 100px; color: #666; }
        .info-value { color: #000; font-weight: 500; }
        
        .no-siri-box { position: absolute; top: 0; right: 0; text-align: right; }
        .no-siri-label { font-size: 12px; color: #666; margin-bottom: 5px; }
        .no-siri-value { font-size: 18px; font-weight: bold; color: #000; }
        
        .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .payment-table th { background-color: #3498db; color: white; padding: 12px 15px; text-align: left; font-weight: bold; text-transform: uppercase; font-size: 12px; }
        .payment-table th.center { text-align: center; }
        .payment-table th.right { text-align: right; }
        .payment-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .payment-table td.center { text-align: center; }
        .payment-table td.right { text-align: right; }
        
        .summary-section { display: flex; justify-content: flex-end; }
        .summary-table { width: 300px; }
        .summary-table td { padding: 5px 0; text-align: right; }
        .summary-label { font-weight: bold; color: #666; padding-right: 20px; }
        .summary-value { font-weight: bold; color: #000; }
        .total-row .summary-label, .total-row .summary-value { font-size: 16px; color: #000; padding-top: 10px; border-top: 1px solid #eee; }

        .footer {
            margin-top: 50px;
            background-color: #004aad;
            color: white;
            padding: 20px;
            text-align: center;
            font-family: 'Poppins', sans-serif;
            line-height: 1.5;
        }
        
        .print-button {
            display: block;
            width: 100%;
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
        }
        .print-button:hover { background-color: #2980b9; }
        
        @media print {
            body { background-color: white; padding: 0; }
            .container { box-shadow: none; padding: 0; }
            .print-button { display: none; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo" style="margin-right: 20px;">
                <img src="{{ asset('images/logo_new.jpg') }}" alt="Logo" style="width: 80px; height: auto;">
            </div>
            <div class="club-info">
                <div class="club-name">KELAB TAEKWONDO A&Z</div>
                <div class="club-location">Kepala Batas, Pulau Pinang</div>
            </div>
            <div class="title">
                RINGKASAN<br>PEMBAYARAN
            </div>
        </div>

        <!-- Student Info -->
        <div class="student-info">
            <div class="student-name">{{ strtoupper($student->nama_pelajar) }}</div>
            
            <div class="info-row">
                <div class="info-label">Alamat:</div>
                <div class="info-value">{{ $student->alamat }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">No Tel:</div>
                <div class="info-value">{{ $student->no_tel }}</div>
            </div>

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
        
        <a href="{{ route('students.export-pdf', $student->id) }}" class="print-button">Muat Turun PDF</a>
    </div>
</body>
</html>
