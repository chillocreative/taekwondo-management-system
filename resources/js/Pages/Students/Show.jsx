import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, student, currentYear }) {
    const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    const monthlyFee = student.kategori === 'kanak-kanak' ? 30 : 50;
    // Use total_payment from backend if available, otherwise fallback
    const totalPayment = student.total_payment !== undefined
        ? student.total_payment
        : monthlyFee * student.status_bayaran;

    const outstandingMonths = Math.max(0, 12 - student.status_bayaran);
    // Note: Outstanding amount is still an estimate based on current category
    const outstandingAmount = monthlyFee * outstandingMonths;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maklumat Pelajar</h2>}
        >
            <Head title={`Maklumat Pelajar - ${student.nama_pelajar}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Maklumat Pelajar</h2>
                                <div className="space-x-2">
                                    <Link
                                        href={route('students.edit', student.id)}
                                        className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        ✏️ Edit
                                    </Link>
                                    <a
                                        href={route('students.export-pdf', student.id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 inline-block"
                                        target="_blank"
                                    >
                                        📄 Muat Turun PDF
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">No. Siri</p>
                                    <p className="text-lg font-semibold">{student.no_siri}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Nama Pelajar</p>
                                    <p className="text-lg font-semibold">{student.nama_pelajar}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Nama Penjaga</p>
                                    <p className="text-lg font-semibold">{student.nama_penjaga}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">No. Telefon</p>
                                    <p className="text-lg font-semibold">{student.no_tel}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-1">Alamat</p>
                                    <p className="text-lg font-semibold">{student.alamat}</p>
                                </div>
                                {student.child && student.child.belt_certificate && (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg md:col-span-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-700 font-medium mb-1">📄 Sijil Tali Pinggang</p>
                                                <p className="text-xs text-green-600">Sijil ujian tali pinggang telah dimuat naik</p>
                                            </div>
                                            <a
                                                href={`/storage/${student.child.belt_certificate}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Lihat Sijil
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Kategori</p>
                                    <p className="text-lg font-semibold">
                                        {student.kategori === 'kanak-kanak' ? 'Kanak-kanak' : 'Dewasa'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Yuran Bulanan</p>
                                    <p className="text-lg font-semibold">RM {monthlyFee}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Jadual Pembayaran Yuran ({currentYear})</h3>
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarikh Bayaran</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rujukan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {student.child?.monthly_payments?.map((payment, idx) => (
                                                    <tr key={idx} className={payment.is_paid ? 'bg-green-50/30' : 'hover:bg-gray-50'}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {months[payment.month - 1]}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RM {monthlyFee}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {payment.is_paid ? 'Dibayar' : 'Tertunggak'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {payment.payment_reference || '-'}
                                                        </td>
                                                    </tr>
                                                )) || (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                                Tiada rekod pembayaran dijumpai.
                                                            </td>
                                                        </tr>
                                                    )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <p className="text-sm text-gray-500">
                                    Tarikh Kemaskini: {new Date(student.tarikh_kemaskini).toLocaleString('ms-MY', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className="mt-6 flex justify-between">
                                <Link
                                    href={route('students.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                >
                                    ← Kembali
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
