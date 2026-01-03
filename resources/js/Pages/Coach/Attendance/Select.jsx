import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function CoachAttendanceSelect({ auth, trainingCenter }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Pilih Pusat Latihan</h2>}
        >
            <Head title="Kehadiran - Pilih Pusat Latihan" />

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {!trainingCenter ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Tiada Pusat Latihan</h3>
                            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                                Anda belum ditugaskan ke mana-mana pusat latihan. Sila hubungi Admin untuk menetapkan pusat latihan anda.
                            </p>
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center px-4 py-2 bg-white border border-zinc-300 rounded-md font-semibold text-xs text-zinc-700 uppercase tracking-widest shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Kembali
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{trainingCenter.name}</h3>
                                    <p className="text-zinc-500 text-sm mb-6">
                                        Urus kehadiran pelajar untuk pusat latihan ini.
                                    </p>
                                    <Link
                                        href={route('coach.attendance.show')}
                                        className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                                    >
                                        Masuk Kelas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
