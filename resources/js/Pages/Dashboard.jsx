import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, studentCount }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen font-sans">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Welcome Section - Japanese Minimalist Style */}
                    <div className="mb-6 sm:mb-10">
                        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                            Selamat Datang, {user.name}
                        </h3>
                        <p className="text-sm sm:text-base text-zinc-500">
                            {user.role === 'admin' && 'Panel pentadbir sistem pengurusan Taekwondo.'}
                            {user.role === 'coach' && 'Panel jurulatih untuk pengurusan kelas dan pelajar.'}
                            {user.role === 'user' && 'Berikut adalah ringkasan aktiviti kelab anda hari ini.'}
                        </p>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">

                        {/* Role Badge & Info */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <div>
                                    <h4 className="text-base sm:text-lg font-bold text-zinc-900">Status Akaun</h4>
                                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">Maklumat pengguna anda.</p>
                                </div>
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                        : user.role === 'coach'
                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                    {user.role === 'admin' && 'Admin'}
                                    {user.role === 'coach' && 'Jurulatih'}
                                    {user.role === 'user' && 'Pengguna'}
                                </span>
                            </div>

                            <div className="bg-zinc-50 rounded-lg p-3 sm:p-4 border border-zinc-100 space-y-2">
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span className="text-zinc-500">Nombor Telefon</span>
                                    <span className="font-semibold text-zinc-900">{user.phone_number}</span>
                                </div>
                                {user.training_center && (
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs sm:text-sm">
                                        <span className="text-zinc-500">Pusat Latihan</span>
                                        <span className="font-semibold text-zinc-900 text-right">{user.training_center.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats / Counts */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {/* Total Students */}
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm transition hover:border-zinc-300">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-zinc-500 text-xs sm:text-sm font-medium">Jumlah Pelajar</span>
                                    <span className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    </span>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{studentCount}</div>
                            </div>
                        </div>
                    </div>

                    {/* Management Sections Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                        {/* Admin-only: Training Centers */}
                        {user.role === 'admin' && (
                            <Link href={route('training-centers.index')} className="group block h-full">
                                <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm h-full hover:border-zinc-400 hover:shadow-md transition-all">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 sm:mb-2">Pusat Latihan</h4>
                                    <p className="text-zinc-500 text-xs sm:text-sm">Urus pusat latihan dan lokasi kelas.</p>
                                </div>
                            </Link>
                        )}

                        {/* Pengurusan Pelajar Card */}
                        <Link href={route('students.index')} className="group block h-full">
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm h-full hover:border-zinc-400 hover:shadow-md transition-all">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 sm:mb-2">Pengurusan Pelajar</h4>
                                <p className="text-zinc-500 text-xs sm:text-sm">Lihat senarai pelajar, kemaskini maklumat dan rekod kehadiran.</p>
                            </div>
                        </Link>

                        {/* Tambah Pelajar Card */}
                        <Link href={route('students.create')} className="group block h-full">
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm h-full hover:border-zinc-400 hover:shadow-md transition-all">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 sm:mb-2">Tambah Pelajar</h4>
                                <p className="text-zinc-500 text-xs sm:text-sm">Daftar pelajar baru dengan mudah dan pantas.</p>
                            </div>
                        </Link>

                        {/* User-only: Manage Children */}
                        {user.role === 'user' && (
                            <Link href={route('children.index')} className="group block h-full">
                                <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm h-full hover:border-zinc-400 hover:shadow-md transition-all">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <h4 className="text-base sm:text-lg font-bold text-zinc-900 mb-1 sm:mb-2">Anak-Anak Saya</h4>
                                    <p className="text-zinc-500 text-xs sm:text-sm">Urus maklumat anak yang mengikuti kelas.</p>
                                </div>
                            </Link>
                        )}

                        {/* Laporan Card (Coming Soon) */}
                        <div className="group block h-full cursor-not-allowed opacity-60">
                            <div className="bg-zinc-50 p-4 sm:p-6 rounded-xl border border-zinc-200 h-full border-dashed">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-zinc-200 text-zinc-400 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold text-zinc-400 mb-1 sm:mb-2">Laporan (Akan Datang)</h4>
                                <p className="text-zinc-400 text-xs sm:text-sm">Statistik kehadiran dan pembayaran secara terperinci.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
