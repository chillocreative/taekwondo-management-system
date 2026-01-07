<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Pelajar - {{ $student->nama_pelajar }}</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            background-color: #fff;
            padding: 20pt 30pt;
            border-bottom: 2pt solid #eee;
        }
        
        .header-table { width: 100%; border-collapse: collapse; }
        .logo { width: 60pt; height: auto; }
        .club-name { font-size: 16pt; font-weight: bold; color: #1a365d; }
        .club-sub { font-size: 9pt; color: #718096; }
        .doc-title { font-size: 18pt; font-weight: bold; color: #e53e3e; text-align: right; }
        
        .content { padding: 20pt 30pt; }
        
        .section-title {
            background-color: #f7fafc;
            padding: 5pt 10pt;
            font-weight: bold;
            color: #2d3748;
            font-size: 11pt;
            border-left: 3pt solid #4299e1;
            margin-bottom: 10pt;
            text-transform: uppercase;
        }
        
        .info-grid { width: 100%; border-collapse: collapse; margin-bottom: 20pt; }
        .info-grid td { padding: 4pt 0; vertical-align: top; }
        .label { width: 100pt; color: #718096; font-size: 9pt; font-weight: bold; }
        .value { color: #2d3748; font-weight: 500; }
        
        .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 20pt; }
        .payment-table th { 
            background-color: #4a5568; 
            color: white; 
            padding: 8pt; 
            font-size: 9pt; 
            text-align: left; 
            font-weight: bold;
            text-transform: uppercase;
        }
        .payment-table td { 
            padding: 7pt 8pt; 
            border-bottom: 1px solid #edf2f7; 
            font-size: 9pt; 
        }
        .payment-table tr:nth-child(even) { background-color: #f8fafc; }
        
        .status-paid { color: #38a169; font-weight: bold; }
        .status-unpaid { color: #e53e3e; font-weight: bold; }
        
        .no-siri { font-size: 14pt; font-weight: bold; color: #2d3748; border: 1pt solid #cbd5e0; padding: 5pt 10pt; display: inline-block; margin-top: 10pt; }
        
        .footer {
            position: fixed;
            bottom: 0pt;
            left: 0pt;
            right: 0pt;
            height: 40pt;
            background-color: #1a365d;
            color: white;
            text-align: center;
            padding-top: 10pt;
            font-size: 8pt;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 70pt;">
                    <img src="{{ public_path('images/logo_new.jpg') }}" class="logo">
                </td>
                <td>
                    <div class="club-name">KELAB TAEKWONDO A&Z</div>
                    <div class="club-sub">Kepala Batas, Pulau Pinang • 012 - 479 4200</div>
                </td>
                <td>
                    <div class="doc-title">MAKLUMAT &<br>YURAN PELAJAR</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="content">
        <div style="float: right; text-align: right;">
            <div style="font-size: 9pt; color: #718096;">NO. SIRI KEAHLIAN</div>
            <div class="no-siri">{{ $student->no_siri }}</div>
        </div>
        
        <div style="margin-bottom: 30pt;">
            <h1 style="font-size: 18pt; margin: 0; color: #1a202c;">{{ strtoupper($student->nama_pelajar) }}</h1>
            <div style="color: #4a5568; font-size: 10pt; margin-top: 5pt;">Kategori: <span class="bold uppercase">{{ $student->kategori == 'kanak-kanak' ? 'Bawah 18 Tahun' : '18 Tahun Ke Atas' }}</span></div>
        </div>

        <div style="clear: both;"></div>

        <div class="section-title">A. MAKLUMAT PERIBADI PESERTA</div>
        <table class="info-grid">
            <tr>
                <td class="label">No. Kad Pengenalan:</td>
                <td class="value">{{ $student->child->ic_number ?? '-' }}</td>
                <td class="label">Tarikh Lahir:</td>
                <td class="value">{{ $student->child->date_of_birth ? $student->child->date_of_birth->format('d/m/Y') : '-' }}</td>
            </tr>
            <tr>
                <td class="label">Pusat Latihan:</td>
                <td class="value">{{ $student->child->trainingCenter->name ?? '-' }}</td>
                <td class="label">Tali Pinggang:</td>
                <td class="value uppercase">{{ $student->child->belt_level ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">No. TM:</td>
                <td class="value">{{ $student->child->tm_number ?? '-' }}</td>
                <td class="label">Umur:</td>
                <td class="value">{{ $student->child->age ?? '-' }} Tahun</td>
            </tr>
            <tr>
                <td class="label">Sekolah:</td>
                <td class="value">{{ $student->child->school_name ?? '-' }}</td>
                <td class="label">Kelas:</td>
                <td class="value">{{ $student->child->school_class ?? '-' }}</td>
            </tr>
        </table>

        <div class="section-title">B. MAKLUMAT WARIS & HUBUNGAN</div>
        <table class="info-grid">
            <tr>
                <td class="label">Nama Penjaga:</td>
                <td class="value">{{ $student->nama_penjaga }}</td>
                <td class="label">No. Telefon:</td>
                <td class="value">{{ $student->no_tel }}</td>
            </tr>
            <tr>
                <td class="label">Alamat:</td>
                <td class="value" colspan="3">{{ $student->alamat }} {{ $student->child->postcode ?? '' }} {{ $student->child->city ?? '' }} {{ $student->child->state ?? '' }}</td>
            </tr>
        </table>

        <div class="section-title">C. JADUAL PEMBAYARAN YURAN (TAHUN {{ $year }})</div>
        <table class="payment-table">
            <thead>
                <tr>
                    <th style="width: 30%;">BULAN</th>
                    <th style="width: 25%;" class="text-center">STATUS</th>
                    <th style="width: 20%;" class="text-right">TARIKH BAYARAN</th>
                    <th style="width: 25%;" class="text-center">NO. RESIT</th>
                </tr>
            </thead>
            <tbody>
                @foreach($monthlyPayments as $item)
                <tr>
                    <td class="bold">{{ $item['month'] }}</td>
                    <td class="text-center">
                        <span class="{{ $item['is_paid'] ? 'status-paid' : 'status-unpaid' }}">
                            {{ $item['status'] }}
                        </span>
                    </td>
                    <td class="text-right">{{ $item['date'] }}</td>
                    <td class="text-center font-mono" style="font-family: monospace;">{{ $item['receipt'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        @if(count($paymentData) > 0)
        <div style="margin-top: 10pt; font-size: 8pt; color: #718096; font-style: italic;">
            * Dokumen ini dijana secara automatik daripada sistem pengurusan taekwondo.
        </div>
        @endif
    </div>

    <div class="footer">
        <div class="bold">KELAB TAEKWONDO A&Z</div>
        <div>Kepala Batas, Pulau Pinang • Kelas Taekwondo Terbaik di Utara</div>
        <div>www.taekwondoanz.com</div>
    </div>
</body>
</html>
