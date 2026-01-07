import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, student, currentYear }) {
    const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    const monthlyFee = student.kategori === 'kanak-kanak' ? 30 : 50;

    const beltLevels = {
        'white': 'Putih',
        'yellow': 'Kuning',
        'green': 'Hijau',
        'blue': 'Biru',
        'red': 'Merah',
        'black_1': 'Hitam 1 Dan',
        'black_2': 'Hitam 2 Dan',
        'black_3': 'Hitam 3 Dan',
        'black_4': 'Hitam 4 Dan',
        'black_5': 'Hitam 5 Dan',
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maklumat Pelajar (Coach View)</h2>}
        >
            <Head title={`Maklumat Pelajar - ${student.nama_pelajar}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">Maklumat Pelajar</h2>
                                <div className="space-x-3">
                                    <a
                                        href={route('students.export-pdf', student.id)}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150"
                                        target="_blank"
                                    >
                                        📄 Muat Turun PDF
                                    </a>
                                </div>
                            </div>

                            {/* Info Sections Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

                                {/* MAKLUMAT WARIS */}
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <span>👤</span> MAKLUMAT WARIS
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Nama Waris</p>
                                            <p className="text-md font-bold text-gray-900 uppercase">{student.nama_penjaga}</p>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pekerjaan</p>
                                            <p className="text-md font-medium text-gray-900 uppercase">{student.child?.guardian_occupation || '-'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">IC Waris</p>
                                                <p className="text-md font-medium text-gray-900">{student.child?.guardian_ic_number || '-'}</p>
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Umur Waris</p>
                                                <p className="text-md font-medium text-gray-900">{student.child?.guardian_age || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">No. Telefon Waris</p>
                                            <p className="text-md font-medium text-gray-900">{student.no_tel}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* MAKLUMAT PESERTA */}
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <span>🥋</span> MAKLUMAT PESERTA
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Nama Penuh</p>
                                                    <p className="text-lg font-bold text-gray-900 uppercase">{student.nama_pelajar}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">No. Siri</p>
                                                    <p className="text-md font-black text-gray-900">{student.no_siri}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">No. IC</p>
                                                <p className="text-md font-medium text-gray-900">{student.child?.ic_number || '-'}</p>
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Umur</p>
                                                <p className="text-md font-medium text-gray-900">{student.child?.age || '-'} Tahun</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Tarikh Lahir</p>
                                                <p className="text-md font-medium text-gray-900">
                                                    {student.child?.date_of_birth ? new Date(student.child.date_of_birth).toLocaleDateString('ms-MY') : '-'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Tali Pinggang</p>
                                                <p className="text-md font-bold text-gray-900 capitalize">
                                                    {beltLevels[student.child?.belt_level] || student.child?.belt_level || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pusat Latihan</p>
                                            <p className="text-md font-medium text-gray-900">{student.child?.training_center?.name || student.child?.trainingCenter?.name || '-'}</p>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">No. TM</p>
                                            <p className="text-md font-medium text-gray-900">{student.child?.tm_number || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="mb-10" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                {/* LOKASI & HUBUNGAN */}
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <span>📍</span> LOKASI & HUBUNGAN
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Alamat</p>
                                            <p className="text-md font-medium text-gray-900">{student.alamat}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Poskod</p>
                                                <p className="text-md font-medium text-gray-900">{student.child?.postcode || '-'}</p>
                                            </div>
                                            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bandar</p>
                                                <p className="text-md font-medium text-gray-900 uppercase">{student.child?.city || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Negeri</p>
                                            <p className="text-md font-medium text-gray-900">{student.child?.state || '-'}</p>
                                        </div>

                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">No. Telefon Peserta</p>
                                            <p className="text-md font-medium text-gray-900">{student.child?.phone_number || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* MAKLUMAT SEKOLAH */}
                                <div className="space-y-6">
                                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                        <span>🏫</span> MAKLUMAT SEKOLAH
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Nama Sekolah</p>
                                            <p className="text-md font-medium text-gray-900 uppercase">{student.child?.school_name || '-'}</p>
                                        </div>
                                        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Kelas</p>
                                            <p className="text-md font-medium text-gray-900 uppercase">{student.child?.school_class || '-'}</p>
                                        </div>

                                        {student.child && student.child.belt_certificate && (
                                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-green-700 uppercase mb-1">📄 Sijil Tali Pinggang</p>
                                                        <p className="text-sm text-green-600">Sijil telah dimuat naik</p>
                                                    </div>
                                                    <a
                                                        href={`/storage/${student.child.belt_certificate}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-bold uppercase"
                                                    >
                                                        Lihat Sijil
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Schedule Table */}
                            <div className="mt-12">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <span>💳</span> Jadual Pembayaran Yuran (Tahun {currentYear})
                                </h3>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bulan</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Yuran</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Tarikh Bayaran</th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">No. Resit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {student.child?.monthly_payments?.map((payment, idx) => (
                                                    <tr key={idx} className={payment.is_paid ? 'bg-green-50/20' : 'hover:bg-gray-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r">
                                                            {months[payment.month - 1]}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 border-r">RM {monthlyFee}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center border-r">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${payment.is_paid
                                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                                : 'bg-red-50 text-red-600 border border-red-100'
                                                                }`}>
                                                                {payment.is_paid ? 'SUDAH DIBAYAR' : 'TERTUNGGAK'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r">
                                                            {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('ms-MY') : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 font-mono text-xs font-bold uppercase">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span>{payment.receipt_number || '-'}</span>
                                                                {payment.is_paid && (
                                                                    <a
                                                                        href={payment.student_payment_id
                                                                            ? route('receipts.stream', payment.student_payment_id)
                                                                            : route('children.payment.receipt', student.child.id)
                                                                        }
                                                                        target="_blank"
                                                                        className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        Lihat Resit
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )) || (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                                                Tiada rekod pembayaran dijumpai untuk tahun ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                                <Link
                                    href={route('coach.students.index')}
                                    className="font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                >
                                    ← Kembali
                                </Link>
                                <span>
                                    Tarikh Kemaskini: {new Date(student.tarikh_kemaskini).toLocaleString('ms-MY', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
