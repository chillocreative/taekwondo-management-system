import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Belt Color Helper logic
const getBeltColor = (beltName) => {
    const belt = beltName?.toLowerCase() || '';
    if (belt.includes('putih')) return '#FFFFFF';
    if (belt.includes('kuning')) return '#FACC15';
    if (belt.includes('hijau')) return '#10B981';
    if (belt.includes('biru')) return '#3B82F6';
    if (belt.includes('merah')) return '#EF4444';
    if (belt.includes('poom') || belt.includes('dan')) return '#000000';
    return '#E4E4E7';
};

// Custom Belt Icon Component
const BeltIcon = ({ color }) => (
    <div className="flex items-center justify-center p-1.5 bg-zinc-50 rounded-xl border border-zinc-100 shadow-sm">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" style={{ color: color, filter: color === '#FFFFFF' ? 'drop-shadow(0 0 1px rgba(0,0,0,0.2))' : 'none' }}>
            <path d="M3 10h18v2.5H3V10z" />
            <path d="M10.5 11l-2.5 7h3.5l1-2.5 1 2.5h3.5l-2.5-7h-4z" />
        </svg>
    </div>
);

export default function Dashboard({ auth, pesertaData, stats, yearlyReset }) {
    const user = auth.user;
    const { currentYear, needsNotification, allPesertaUpdated } = yearlyReset || {};

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                    Utama
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* New Year Popup Notification */}
                    {needsNotification && user.role === 'user' && (
                        <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h4 className="text-2xl font-black text-amber-900 mb-1">
                                        Selamat Tahun Baru {currentYear}! 🎉
                                    </h4>
                                    <p className="text-amber-800 text-lg font-medium">
                                        Sila kemaskini maklumat peserta anda untuk mengaktifkan butang bayaran yuran tahunan {currentYear}.
                                    </p>
                                </div>
                                <Link
                                    href={route('children.index')}
                                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                >
                                    Kemaskini Sekarang
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    )}

                    {!allPesertaUpdated && !needsNotification && user.role === 'user' && (
                        <div className="mb-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-blue-800 font-semibold">Terdapat peserta yang belum dikemaskini untuk tahun {currentYear}.</span>
                            <Link href={route('children.index')} className="text-blue-600 font-bold underline ml-auto">Kemaskini</Link>
                        </div>
                    )}

                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 mb-8 shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                                    Selamat Datang, {user.name} 👋
                                </h3>
                                <p className="text-blue-100 text-lg sm:text-xl max-w-2xl">
                                    {user.role === 'admin' && 'Sistem Pengurusan Taekwondo Pintar. Urus pusat latihan, pelajar dan kewangan anda di satu tempat.'}
                                    {user.role === 'user' && 'Nikmati perjalanan seni bela diri anak-anak anda. Pantau kemajuan dan kehadiran mereka dengan mudah.'}
                                </p>
                            </div>
                            {user.role === 'admin' && (
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md border ${stats?.whatsapp_connected ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' : 'bg-rose-500/20 border-rose-400/30 text-rose-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${stats?.whatsapp_connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
                                        <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">WA Server: {stats?.whatsapp_connected ? 'Online' : 'Offline'}</span>
                                    </div>
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tighter opacity-70">Status Masa Nyata</p>
                                </div>
                            )}
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>
                    </div>

                    {user.role === 'user' && (
                        <>
                            {/* Parent Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Anak Berdaftar</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-zinc-900">{stats?.total_anak || 0}</span>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Jumlah Kehadiran</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-emerald-600">{stats?.total_hadir || 0}</span>
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Yuran Berbayar</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-indigo-600">{stats?.total_paid || 0}</span>
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <span className="font-bold text-[10px] uppercase">Bulan</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-between">
                                    <span className="text-rose-500 text-sm font-bold uppercase tracking-wider mb-2">Yuran Tertunggak</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-rose-600">{stats?.total_outstanding || 0}</span>
                                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                                            <span className="font-bold text-sm text-[10px]">Bulan</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Title */}
                            <div className="flex items-center gap-3 mb-6">
                                <h4 className="text-2xl font-black text-zinc-900">Maklumat Anak</h4>
                                <div className="h-px flex-1 bg-zinc-200"></div>
                            </div>

                            {/* Children Detail Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {pesertaData.map((child) => (
                                    <div key={child.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-100 flex flex-col">
                                        {/* Card Header (Peserta Color Strip) */}
                                        <div className="h-4 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h5 className="text-2xl font-black text-zinc-900 leading-tight">{child.name}</h5>
                                                    <div className="text-sm text-zinc-500 font-medium mt-1">{child.training_center}</div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${child.status_bayaran === 'Aktif'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {child.status_bayaran}
                                                    </span>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <BeltIcon color={getBeltColor(child.belt)} />
                                                        <span className="text-sm font-bold text-zinc-700 uppercase">{child.belt}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col">
                                                    <span className="text-zinc-400 text-[10px] font-bold uppercase mb-1">Kehadiran</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-zinc-900">{child.attendance_rate}%</span>
                                                        <span className="text-xs text-zinc-500 font-medium">Kadar</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2">
                                                        <div
                                                            className={`h-1.5 rounded-full ${child.attendance_rate > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${child.attendance_rate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col">
                                                    <span className="text-zinc-400 text-[10px] font-bold uppercase mb-1">Kemaskini Terakhir</span>
                                                    <div className="text-lg font-bold text-zinc-800 mt-1">{child.last_attendance}</div>
                                                    <span className="text-[10px] text-zinc-500 font-medium mt-1 uppercase">Tarikh Kehadiran</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Link
                                                    href={route('attendance.index')}
                                                    className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002-2z"></path></svg>
                                                        </div>
                                                        <span className="font-bold text-zinc-700">Monitor Kehadiran</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-zinc-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </Link>
                                                <Link
                                                    href={route('fees.index')}
                                                    className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                        </div>
                                                        <span className="font-bold text-zinc-700">Bayar Yuran & Invois</span>
                                                    </div>
                                                    <svg className="w-5 h-5 text-zinc-300 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {(!pesertaData || pesertaData.length === 0) && user.role === 'user' && (
                        <div className="bg-white p-12 rounded-3xl shadow-xl border border-dashed border-zinc-300 text-center max-w-2xl mx-auto">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            </div>
                            <h4 className="text-2xl font-black text-zinc-900 mb-2">Tiada Daftar Pelajar</h4>
                            <p className="text-zinc-500 mb-8">Anda belum mendaftarkan anak anda dalam sistem kami.</p>
                            <Link
                                href={route('children.index', { add: 1 })}
                                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Coach Dashboard View */}
                    {user.role === 'coach' && (
                        <div className="space-y-8">
                            {/* New Year Overview - Yearly Summary Card */}
                            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl mb-4 backdrop-blur-md border border-white/10">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                                <span className="text-sm font-black uppercase tracking-widest text-blue-100">Ringkasan Sesi {new Date().getFullYear()}</span>
                                            </div>
                                            <h3 className="text-4xl font-black mb-2 leading-tight">Status Pendaftaran & Pembaharuan</h3>
                                            <p className="text-zinc-400 font-medium max-w-xl">Pantau perkembangan kemasukan pelajar bagi tahun ini secara langsung.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md min-w-[160px]">
                                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">Selesai</div>
                                                <div className="text-4xl font-black text-emerald-400">{stats?.yearly_summary?.renewed || 0}</div>
                                                <div className="text-xs font-bold text-zinc-500 mt-1 uppercase">Pelajar Aktif</div>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md min-w-[160px]">
                                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">Tunggakan</div>
                                                <div className="text-4xl font-black text-amber-400">{stats?.yearly_summary?.pending || 0}</div>
                                                <div className="text-xs font-bold text-zinc-500 mt-1 uppercase">Menunggu Data</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Renewals */}
                                    <div className="mt-10">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-sm font-black uppercase tracking-widest text-zinc-400">Kemajuan Pembaharuan Keseluruhan</span>
                                            <span className="text-2xl font-black text-white">
                                                {stats?.yearly_summary?.total > 0
                                                    ? Math.round((stats.yearly_summary.renewed / stats.yearly_summary.total) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-4 border border-white/5 p-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${stats?.yearly_summary?.total > 0 ? (stats.yearly_summary.renewed / stats.yearly_summary.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Students - Split View */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Jumlah Pelajar</p>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className="text-4xl font-black text-zinc-900 mt-2 relative z-10">{stats?.total_students || 0}</h3>
                                            <span className="text-xs font-bold text-zinc-400 mt-2">Daripada {new Date().getFullYear() - 1}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2 relative z-10">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                            <span>Selesai Bayar</span>
                                            <span>{stats?.renewed_students || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                                            <span>Menunggu Update</span>
                                            <span>{stats?.pending_renewal || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Attendance */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Kehadiran Hari Ini</p>
                                        <h3 className="text-4xl font-black text-emerald-600 mt-2 relative z-10">{stats?.present_today || 0}</h3>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <span className="text-xs text-zinc-500 font-medium">Daripada</span>
                                        <span className="font-bold text-zinc-900">{stats?.total_today_marked || 0}</span>
                                        <span className="text-xs text-zinc-500 font-medium">aktif</span>
                                    </div>
                                </div>

                                {/* Monthly Sessions */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Sesi Latihan</p>
                                        <h3 className="text-4xl font-black text-violet-600 mt-2 relative z-10">{stats?.monthly_sessions || 0}</h3>
                                    </div>
                                    <div className="mt-4 relative z-10">
                                        <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest font-black italic">{stats?.current_month}</p>
                                    </div>
                                </div>

                                {/* Financial Health */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Yuran Bulanan</p>
                                        <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                            <h3 className="text-4xl font-black text-zinc-900">{stats?.paid_month || 0}</h3>
                                            <span className="text-xs font-bold text-emerald-600 uppercase">Jelas</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{stats?.unpaid_month || 0} Belum Jelas</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link
                                    href={route('coach.attendance.index')}
                                    className="group relative overflow-hidden rounded-3xl bg-zinc-900 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                                    <div className="relative z-10 flex items-start justify-between">
                                        <div>
                                            <div className="p-3 bg-white/10 w-fit rounded-xl mb-6 text-white group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-2">Rekod Kehadiran</h3>
                                            <p className="text-zinc-400 font-medium max-w-xs">Tanda kehadiran pelajar untuk sesi latihan hari ini atau semak rekod lepas.</p>
                                        </div>
                                        <div className="p-4 bg-white/10 rounded-full group-hover:bg-white group-hover:text-zinc-900 text-white transition-all">
                                            <svg className="w-6 h-6 transform group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </div>
                                    </div>
                                </Link>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Link
                                        href={route('coach.students.index')}
                                        className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-zinc-900 text-lg mb-1">Senarai Pelajar</h4>
                                            <p className="text-xs text-zinc-500 font-medium">Lihat profil & info pelajar</p>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('admin.payments.index')}
                                        className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 hover:border-rose-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                                    >
                                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-zinc-900 text-lg mb-1">Status Yuran</h4>
                                            <p className="text-xs text-zinc-500 font-medium">Semak pembayaran bulanan</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Dashboard View */}
                    {user.role === 'admin' && (
                        <div className="space-y-8">
                            {/* New Year Transition & Retention Summary */}
                            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="p-10 relative z-10">
                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                                        <div className="flex-1">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl mb-4 border border-indigo-100">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Kadar Pengekalan {stats?.current_year}</span>
                                            </div>
                                            <h3 className="text-4xl font-black text-zinc-900 mb-2 leading-tight">Ringkasan Pembaharuan</h3>
                                            <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-xl">
                                                Sehingga kini, <span className="text-indigo-600 font-black">{stats?.retention_stats?.renewed || 0}</span> daripada <span className="text-zinc-900 font-black">{stats?.retention_stats?.prev_year_total || 0}</span> pelajar ({stats?.retention_stats?.percentage || 0}%) kohort {stats?.current_year - 1} telah memperbaharui keahlian.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-4">
                                            <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-3xl min-w-[180px] group/card hover:border-indigo-200 transition-all">
                                                <div className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">Kohort {stats?.current_year - 1}</div>
                                                <div className="text-4xl font-black text-zinc-900 group-hover/card:text-indigo-600 transition-colors">{stats?.retention_stats?.prev_year_total || 0}</div>
                                                <div className="text-xs font-bold text-zinc-400 mt-1 uppercase">Jumlah Pelajar</div>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl min-w-[180px] group/card hover:shadow-lg transition-all">
                                                <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-2">Renewed</div>
                                                <div className="text-4xl font-black text-emerald-700">{stats?.retention_stats?.renewed || 0}</div>
                                                <div className="text-xs font-bold text-emerald-600 mt-1 uppercase">Selesai Bayar</div>
                                            </div>
                                            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl min-w-[150px] flex flex-col items-center justify-center text-center">
                                                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Pencapaian</div>
                                                <div className="text-3xl font-black text-white">{stats?.retention_stats?.percentage || 0}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Visual */}
                                    <div className="mt-10">
                                        <div className="w-full bg-zinc-100 rounded-full h-4 p-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                                                style={{ width: `${stats?.retention_stats?.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Students Card */}
                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Jumlah Pelajar</h4>
                                    <div className="flex items-baseline gap-2 mt-4 relative z-10">
                                        <span className="text-5xl font-black text-zinc-900">{stats?.total_students || 0}</span>
                                        <span className="text-xs font-bold text-indigo-600 uppercase">Pelajar</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-4 relative z-10">Aktif di platform</p>
                                </div>

                                {/* Training Centers Card */}
                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Pusat Latihan</h4>
                                    <div className="flex items-baseline gap-2 mt-4 relative z-10">
                                        <span className="text-5xl font-black text-emerald-600">{stats?.total_centers || 0}</span>
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Lokasi</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-4 relative z-10">Beroperasi aktif</p>
                                </div>

                                {/* User Accounts Card */}
                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Akaun Pengguna</h4>
                                    <div className="space-y-2 mt-4 relative z-10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 font-medium">Jurulatih:</span>
                                            <span className="font-black text-zinc-900">{stats?.total_coaches || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 font-medium">Ibu Bapa:</span>
                                            <span className="font-black text-zinc-900">{stats?.total_parents || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top 5 Students Card */}
                                <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">5 Pelajar Terbaik {new Date().getFullYear()}</h4>
                                    <div className="mt-4 space-y-2 relative z-10 outline-none">
                                        {stats.top_students && stats.top_students.length > 0 ? (
                                            stats.top_students.map((student, index) => (
                                                <Link
                                                    key={student.id}
                                                    href={route('students.show', student.id)}
                                                    className="flex items-center justify-between text-[11px] group/item hover:bg-zinc-50 p-1 rounded-lg transition-all"
                                                >
                                                    <span className="text-zinc-600 group-hover/item:text-rose-600 font-bold truncate max-w-[120px]">
                                                        {index + 1}. {student.name}
                                                    </span>
                                                    <span className="font-black text-rose-600">{student.percentage}%</span>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-xs text-zinc-400 text-center py-4 italic">Tiada data kehadiran</p>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-4 font-medium relative z-10">Berdasarkan peratus kehadiran</p>
                                </div>
                            </div>

                            {/* Financial Performance Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-zinc-900 border-l-4 border-zinc-900 pl-3">Analisis Kewangan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Monthly Collection (Current Month) */}
                                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                        <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Yuran Bulanan ({stats?.current_month || '-'})</h4>
                                        <div className="flex items-baseline gap-1 mt-4 relative z-10">
                                            <span className="text-xs font-bold text-zinc-400">RM</span>
                                            <span className="text-3xl font-black text-zinc-900">
                                                {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0 }).format(stats?.monthly_revenue || 0)}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Bulan Lepas/Tahun Lepas</span>
                                                <span className="text-xs font-black text-zinc-900">RM {new Intl.NumberFormat('ms-MY').format(stats?.last_year_revenue || 0)}</span>
                                            </div>
                                            {stats?.monthly_revenue > stats?.last_year_revenue && (
                                                <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Annual Fee Collection (Yearly/Reg) */}
                                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                        <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Yuran Pendaftaran (Tahunan)</h4>
                                        <div className="flex items-baseline gap-1 mt-4 relative z-10">
                                            <span className="text-xs font-bold text-zinc-400">RM</span>
                                            <span className="text-3xl font-black text-zinc-900">
                                                {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0 }).format(stats?.annual_fees || 0)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-4 font-medium relative z-10">Terkumpul dari pendaftaran baru</p>
                                    </div>

                                    {/* Total Monthly Year-to-Date */}
                                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                        <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Yuran Bulanan (Terkumpul)</h4>
                                        <div className="flex items-baseline gap-1 mt-4 relative z-10">
                                            <span className="text-xs font-bold text-zinc-400">RM</span>
                                            <span className="text-3xl font-black text-emerald-600">
                                                {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0 }).format(stats?.yearly_monthly_fees || 0)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-4 font-medium relative z-10">Jumlah kutipan bulanan tahun {new Date().getFullYear()}</p>
                                    </div>

                                    {/* Grand Total Revenue */}
                                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                        <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Jumlah Keseluruhan (Tahun Ini)</h4>
                                        <div className="mt-4 relative z-10 flex items-baseline gap-1">
                                            <span className="text-xs font-bold text-zinc-400">RM</span>
                                            <span className="text-4xl font-black text-white">
                                                {new Intl.NumberFormat('ms-MY', { minimumFractionDigits: 0 }).format(stats?.total_revenue || 0)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-emerald-400 font-bold mt-4 uppercase tracking-widest relative z-10 group-hover:animate-pulse">Prestasi Cemerlang</p>
                                    </div>
                                </div>
                            </div>



                            {/* Management Hub Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Link
                                    href={route('students.index')}
                                    className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 hover:border-blue-400 transition-all group"
                                >
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </div>
                                    <h4 className="text-2xl font-black text-zinc-900 mb-2">Urus Pelajar</h4>
                                    <p className="text-zinc-500 font-medium text-sm">Urus profil, pertukaran tali pinggang, dan maklumat waris pelajar.</p>
                                    <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm uppercase tracking-widest">
                                        Akses Sistem <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg>
                                    </div>
                                </Link>

                                <Link
                                    href={route('training-centers.index')}
                                    className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 hover:border-emerald-400 transition-all group"
                                >
                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <h4 className="text-2xl font-black text-zinc-900 mb-2">Pusat Latihan</h4>
                                    <p className="text-zinc-500 font-medium text-sm">Pantau lokasi latihan, tetapkan jurulatih, dan jadual sesi.</p>
                                    <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm uppercase tracking-widest">
                                        Urus Lokasi <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg>
                                    </div>
                                </Link>

                                <Link
                                    href={route('admin.attendance.index')}
                                    className="bg-zinc-900 p-8 rounded-3xl shadow-2xl text-white hover:scale-[1.02] transition-all group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl"></div>
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-all">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <h4 className="text-2xl font-black mb-2 relative z-10">Pantau Kehadiran</h4>
                                    <p className="text-zinc-400 font-medium text-sm relative z-10">Analisis statistik kehadiran pelajar secara harian dan bulanan merentas semua pusat.</p>
                                    <div className="mt-6 flex items-center text-indigo-400 font-bold text-sm uppercase tracking-widest relative z-10 group-hover:text-white transition-colors">
                                        Lihat Laporan <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7"></path></svg>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
