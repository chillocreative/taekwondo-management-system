import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, pesertaData, stats, studentCount }) {
    const user = auth.user;

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

                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 mb-8 shadow-xl">
                        <div className="relative z-10">
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
                                Selamat Datang, {user.name} 👋
                            </h3>
                            <p className="text-blue-100 text-lg sm:text-xl max-w-2xl">
                                {user.role === 'admin' && 'Sistem Pengurusan Taekwondo Pintar. Urus pusat latihan, pelajar dan kewangan anda di satu tempat.'}
                                {user.role === 'user' && 'Nikmati perjalanan seni bela diri anak-anak anda. Pantau kemajuan dan kehadiran mereka dengan mudah.'}
                            </p>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl"></div>
                    </div>

                    {user.role === 'user' && pesertaData && pesertaData.length > 0 && (
                        <>
                            {/* Parent Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Anak Berdaftar</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-zinc-900">{stats.total_anak}</span>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Jumlah Kehadiran</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-emerald-600">{stats.total_hadir}</span>
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-between">
                                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider mb-2">Yuran Berbayar</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-indigo-600">{pesertaData.reduce((acc, curr) => acc + curr.paid_months, 0)}</span>
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <span className="font-bold text-[10px] uppercase">Bulan</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-between">
                                    <span className="text-rose-500 text-sm font-bold uppercase tracking-wider mb-2">Yuran Tertunggak</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-4xl font-black text-rose-600">{pesertaData.reduce((acc, curr) => acc + curr.outstanding_months, 0)}</span>
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
                                                    <div className="text-zinc-400 text-xs font-bold uppercase mb-1">{child.no_siri}</div>
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
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="w-8 h-8 rounded-full border-4 flex items-center justify-center font-bold text-[10px]" style={{ borderColor: child.belt.toLowerCase().includes('black') ? '#000' : child.belt.toLowerCase().includes('red') ? '#ef4444' : child.belt.toLowerCase().includes('blue') ? '#3b82f6' : child.belt.toLowerCase().includes('green') ? '#10b981' : child.belt.toLowerCase().includes('yellow') ? '#facc15' : '#e4e4e7' }}>
                                                        </div>
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
                                href={route('students.create')}
                                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Coach Dashboard View */}
                    {user.role === 'coach' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Students */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Total Pelajar</p>
                                        <h3 className="text-4xl font-black text-zinc-900 mt-2 relative z-10">{stats.total_students}</h3>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                                            +{stats.new_students} Baru
                                        </span>
                                        <span className="text-xs text-zinc-400 font-medium">Bulan Ini</span>
                                    </div>
                                </div>

                                {/* Today's Attendance */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Kehadiran Hari Ini</p>
                                        <h3 className="text-4xl font-black text-emerald-600 mt-2 relative z-10">{stats.present_today}</h3>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <span className="text-xs text-zinc-500 font-medium">Daripada</span>
                                        <span className="font-bold text-zinc-900">{stats.total_today_marked}</span>
                                        <span className="text-xs text-zinc-500 font-medium">ditanda</span>
                                    </div>
                                </div>

                                {/* Monthly Sessions */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Sesi Latihan</p>
                                        <h3 className="text-4xl font-black text-violet-600 mt-2 relative z-10">{stats.monthly_sessions}</h3>
                                    </div>
                                    <div className="mt-4 relative z-10">
                                        <p className="text-xs text-zinc-400 font-medium">Sesi dijalankan bulan ini</p>
                                    </div>
                                </div>

                                {/* Financial Health */}
                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 flex flex-col justify-between relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                    <div>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider relative z-10">Yuran ({stats.current_month})</p>
                                        <div className="flex items-baseline gap-2 mt-2 relative z-10">
                                            <h3 className="text-4xl font-black text-zinc-900">{stats.paid_month}</h3>
                                            <span className="text-xs font-bold text-emerald-600 uppercase">Berjaya</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 relative z-10">
                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                        <span className="text-xs text-zinc-500 font-medium">
                                            <span className="font-bold text-zinc-900">{stats.unpaid_month}</span> Belum Jelas
                                        </span>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 text-zinc-50 group-hover:text-blue-500 transition-colors">
                                    <svg className="w-16 h-16 opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                </div>
                                <h4 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-2">Jumlah Pelajar Keseluruhan</h4>
                                <div className="text-5xl font-black text-zinc-900 mb-6">{stats.total_students}</div>
                                <Link
                                    href={route('students.index')}
                                    className="inline-flex items-center text-blue-600 font-bold hover:gap-2 transition-all"
                                >
                                    Urus Pelajar <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </Link>
                            </div>

                            <Link
                                href={route('training-centers.index')}
                                className="bg-white p-8 rounded-3xl shadow-xl border border-zinc-100 hover:border-blue-400 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                </div>
                                <h4 className="text-2xl font-black text-zinc-900 mb-2">Pusat Latihan</h4>
                                <p className="text-zinc-500 font-medium">Urus semua lokasi latihan aktif di seluruh negeri.</p>
                            </Link>

                            <Link
                                href={route('admin.attendance.index')}
                                className="bg-zinc-900 p-8 rounded-3xl shadow-2xl text-white hover:scale-[1.02] transition-all group"
                            >
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <h4 className="text-2xl font-black mb-2">Pantau Kehadiran</h4>
                                <p className="text-zinc-400 font-medium">Analisis statistik kehadiran pelajar secara harian dan bulanan.</p>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
