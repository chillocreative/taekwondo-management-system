Spesifikasi Sistem Pengurusan Pelajar Taekwondo (TSMS)
1. Gambaran Keseluruhan
Sistem ini direka untuk memudahkan pengurusan kelab Taekwondo, merangkumi pendaftaran, pembayaran yuran, kehadiran, dan pengurusan ujian tali pinggang dalam Bahasa Malaysia.

2. Konsep Rekaan (UI/UX)
• Tema: Japanese Card Aesthetic (Minimalis, penggunaan 'whitespace', border halus).

• Komponen: Shadcn UI (Radix UI).

• Bahasa: Bahasa Malaysia sepenuhnya.

3. Modul & Ciri-Ciri Utama
A. Pendaftaran & Profil

• Borang pendaftaran ahli baru (Nama, IC, Umur, Alamat, Kecemasan).

• Penjanaan ID Pelajar secara automatik.

• Status keahlian (Aktif/Tamat Tempoh).

B. Pembaharuan (Renewal)

• Notifikasi automatik sebelum tempoh keahlian tamat.

• Butang "Renew" pantas di dashboard pelajar.

C. Integrasi Pembayaran (ToyyibPay)

• Pembayaran yuran bulanan dan pendaftaran.

• Penghasilan 'Bill Code' secara dinamik.

• Webhook untuk mengemaskini status bayaran secara 'real-time' (Paid/Unpaid).

D. Sistem Kehadiran

• Imbasan Kod QR untuk kehadiran kelas.

• Log kehadiran mengikut tarikh dan sesi.

• Laporan peratusan kehadiran bulanan.

E. Ujian Kenaikan Tali Pinggang (Grading)

• Pendaftaran calon ujian berdasarkan kriteria (contoh: cukup kehadiran).

• Modul kemas kini tahap (Belt Level) selepas lulus.

• Pembayaran yuran ujian melalui ToyyibPay.

F. Integrasi WhatsApp (WBM Server)

• Penghantaran notifikasi automatik melalui WhatsApp WBM Server.

• Resit bayaran automatik dihantar ke WhatsApp penjaga/pelajar.

• Peringatan yuran tertunggak secara berkala.

• Hebahan aktiviti kelab dan jemputan ujian kenaikan tali pinggang.

• Integrasi API WBM Server untuk status penghantaran mesej.

4. Struktur Data (Schema Ringkas)
• Pelajar: id, nama, ic, tahap_tali_pinggang, status_yuran, tarikh_daftar.

• Kehadiran: id_pelajar, tarikh, masa, status.

• Transaksi: id_pelajar, amount, bill_code, status_bayaran, tarikh_bayar.

5. Keperluan Teknikal
• Framework: Next.js 14+

• Database: PostgreSQL (Supabase/Prisma)

• Styling: Tailwind CSS + Shadcn UI

• API Payment: ToyyibPay API V2

• WhatsApp Gateway: WBM Server API
