import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Sheet({ auth, trainingCenter, attendances, date, day, stats, total }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Rekod Kehadiran Sesi</h2>}
        >
            <Head title={`Kehadiran - ${trainingCenter.name} (${date})`} />

            <div className="py-12 bg-zinc-100 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Excel Style Sheet Container */}
                    <div className="bg-white shadow-2xl border border-zinc-300 overflow-hidden rounded-sm">

                        {/* Sheet Header */}
                        <div className="bg-[#1D6F42] p-4 text-white flex justify-between items-center print:hidden">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-1 rounded">
                                    <svg className="w-6 h-6 text-[#1D6F42]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1.5 5.5l3 3h-3v-3zM16 19H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V9h8v2z" />
                                    </svg>
                                </div>
                                <h1 className="font-bold text-lg uppercase tracking-wider">LAPORAN KEHADIRAN</h1>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-1.5 bg-[#217346] hover:bg-[#1a5a37] border border-white/20 rounded text-sm font-bold transition-colors flex items-center gap-2"
                                >
                                    <span>🖨️</span> Cetak Laporan
                                </button>
                                <Link
                                    href={route('admin.attendance.index')}
                                    className="px-4 py-1.5 bg-zinc-800 hover:bg-black rounded text-sm font-bold transition-colors"
                                >
                                    Tutup
                                </Link>
                            </div>
                        </div>

                        {/* Sheet Content Area */}
                        <div className="p-10 bg-white">

                            {/* Document Title Section */}
                            <div className="text-center mb-10 border-b-2 border-zinc-900 pb-6">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase mb-1">Pusat Latihan Taekwondo A&Z</h2>
                                <p className="text-sm font-bold text-zinc-600">KEHADIRAN PESERTA HARIAN</p>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-0 mb-8 border border-zinc-800">
                                <div className="p-3 border-r border-b border-zinc-800 bg-zinc-50 font-bold text-xs uppercase tracking-widest text-zinc-600">Nama Pusat Latihan</div>
                                <div className="p-3 border-b border-zinc-800 font-black text-sm uppercase">{trainingCenter.name}</div>

                                <div className="p-3 border-r border-zinc-800 bg-zinc-50 font-bold text-xs uppercase tracking-widest text-zinc-600">Tarikh / Hari</div>
                                <div className="p-3 font-black text-sm uppercase">
                                    {new Date(date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })} ({day})
                                </div>
                            </div>

                            {/* Stats Summary Panel */}
                            <div className="grid grid-cols-5 gap-0 mb-8 border border-zinc-800 text-center">
                                <div className="p-4 border-r border-zinc-800 bg-zinc-100">
                                    <div className="text-[10px] font-black uppercase text-zinc-500 mb-1">Jumlah Peserta</div>
                                    <div className="text-xl font-black">{total}</div>
                                </div>
                                <div className="p-4 border-r border-zinc-800">
                                    <div className="text-[10px] font-black uppercase text-zinc-500 mb-1">Hadir</div>
                                    <div className="text-xl font-black text-emerald-600">{stats.hadir}</div>
                                </div>
                                <div className="p-4 border-r border-zinc-800">
                                    <div className="text-[10px] font-black uppercase text-zinc-500 mb-1">Tidak Hadir</div>
                                    <div className="text-xl font-black text-rose-600">{stats.tidak_hadir}</div>
                                </div>
                                <div className="p-4 border-r border-zinc-800">
                                    <div className="text-[10px] font-black uppercase text-zinc-500 mb-1">Lain-lain (Sakit/Cuti)</div>
                                    <div className="text-xl font-black text-amber-600">{stats.sakit + stats.cuti}</div>
                                </div>
                                <div className="p-4 bg-zinc-900 text-white">
                                    <div className="text-[10px] font-black uppercase text-zinc-400 mb-1">Peratus Hadir</div>
                                    <div className="text-xl font-black">{stats.percentage}%</div>
                                </div>
                            </div>

                            {/* Main Table */}
                            <table className="w-full border-collapse border border-zinc-800">
                                <thead>
                                    <tr className="bg-zinc-800 text-white uppercase text-[10px] tracking-widest font-black">
                                        <th className="p-3 border border-zinc-700 w-16 text-center italic">No</th>
                                        <th className="p-3 border border-zinc-700 text-left">Nama Penuh Peserta</th>
                                        <th className="p-3 border border-zinc-700 w-40 text-center">Status Kehadiran</th>
                                        <th className="p-3 border border-zinc-700 w-32 text-center print:hidden">Tanda</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendances.map((att, index) => (
                                        <tr key={index} className="border-b border-zinc-300 hover:bg-zinc-50">
                                            <td className="p-3 border-x border-zinc-800 text-center text-xs font-bold text-zinc-500">{index + 1}</td>
                                            <td className="p-3 border-r border-zinc-800 text-sm font-black text-zinc-800 uppercase">{att.student_name}</td>
                                            <td className="p-3 border-r border-zinc-800 text-center">
                                                <span className={`text-[10px] font-black px-3 py-1 border rounded-sm tracking-tighter ${att.status === 'hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    att.status === 'tidak_hadir' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {att.status_label.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center print:hidden">
                                                <div className="flex justify-center">
                                                    {att.status === 'hadir' ? (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border border-zinc-300"></div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Removed Signature Section */}

                            {/* Footer Info */}
                            <div className="mt-20 pt-4 border-t border-zinc-200 text-center">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Sistem Pengurusan Taekwondo A&Z • Dicetak pada {new Date().toLocaleString('ms-MY')}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Navigation Hint */}
                    <div className="mt-6 text-center print:hidden">
                        <Link
                            href={route('admin.attendance.index')}
                            className="text-zinc-500 hover:text-zinc-900 text-sm font-bold flex items-center justify-center gap-2"
                        >
                            ← Kembali ke Senarai Utama
                        </Link>
                    </div>

                </div>
            </div>

            {/* Print Styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .print-hidden { display: none !important; }
                    body { background: white !important; }
                    .py-12 { padding: 0 !important; }
                    .max-w-4xl { max-width: 100% !important; }
                    .shadow-2xl { shadow: none !important; border: none !important; }
                    .rounded-sm { border-radius: 0 !important; }
                    .bg-zinc-100 { background: white !important; }
                    @page { margin: 2cm; }
                }
            `}} />
        </AuthenticatedLayout>
    );
}
