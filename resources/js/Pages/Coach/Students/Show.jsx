import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, student, readOnly = true }) {
    const monthlyFee = student.monthly_fee || (student.kategori === 'kanak-kanak' ? 30 : 50);
    const totalPayment = student.total_payment !== undefined
        ? student.total_payment
        : monthlyFee * student.status_bayaran;

    const outstandingMonths = Math.max(0, 12 - student.status_bayaran);
    const outstandingAmount = monthlyFee * outstandingMonths;

    // Group payments by month for display
    const paymentsByMonth = student.payments || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Maklumat Peserta</h2>}
        >
            <Head title={`Maklumat Peserta - ${student.nama_pelajar}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Maklumat Peserta</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">No. Keahlian</p>
                                    <p className="text-lg font-semibold">{student.no_siri}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Nama Peserta</p>
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
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Kategori</p>
                                    <p className="text-lg font-semibold">
                                        {student.kategori === 'kanak-kanak' ? 'Kanak-kanak' : 'Dewasa'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Yuran Bulanan</p>
                                    <p className="text-lg font-semibold">RM {monthlyFee.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Pembayaran</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg text-center">
                                        <p className="text-sm text-green-600 mb-2">Bulan Dibayar</p>
                                        <p className="text-3xl font-bold text-green-800">{student.status_bayaran}/12</p>
                                        <p className="text-xs text-green-600 mt-1">bulan</p>
                                    </div>
                                    <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg text-center">
                                        <p className="text-sm text-blue-600 mb-2">Jumlah Dibayar</p>
                                        <p className="text-3xl font-bold text-blue-800">RM {totalPayment.toFixed(2)}</p>
                                        <p className="text-xs text-blue-600 mt-1">untuk {student.status_bayaran} bulan</p>
                                    </div>
                                    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg text-center">
                                        <p className="text-sm text-red-600 mb-2">Baki Tertunggak</p>
                                        <p className="text-3xl font-bold text-red-800">RM {outstandingAmount.toFixed(2)}</p>
                                        <p className="text-xs text-red-600 mt-1">({outstandingMonths} bulan lagi)</p>
                                    </div>
                                </div>

                                {/* Payment Details Table */}
                                {paymentsByMonth.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Butiran Pembayaran</h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-blue-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Bulan
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                            Jumlah
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paymentsByMonth.map((payment, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {payment.month}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                {payment.quantity > 0 ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        ✓ Dibayar
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        ✗ Belum Dibayar
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                                                RM {parseFloat(payment.total || 0).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
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
                                    href={route('coach.students.index')}
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
