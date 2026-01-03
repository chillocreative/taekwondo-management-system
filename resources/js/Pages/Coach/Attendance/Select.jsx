import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function CoachAttendanceSelect({ auth, trainingCenters }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Pilih Pusat Latihan</h2>}
        >
            <Head title="Kehadiran - Pilih Pusat Latihan" />

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trainingCenters.map((center) => (
                            <div key={center.id} className="bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{center.name}</h3>
                                    <p className="text-zinc-500 text-sm mb-6">
                                        Urus kehadiran pelajar untuk pusat latihan ini.
                                    </p>
                                    <Link
                                        href={route('coach.attendance.show', { center_id: center.id })}
                                        className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                                    >
                                        Masuk Kelas
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
