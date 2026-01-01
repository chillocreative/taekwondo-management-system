import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function PendingPayments({ auth, pendingPayments }) {
    const handleApprove = (childId) => {
        if (confirm('Adakah anda pasti mahu meluluskan pembayaran ini? Peserta akan diaktifkan.')) {
            router.post(route('admin.pending-payments.approve', childId), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = (childId) => {
        if (confirm('Adakah anda pasti mahu menolak permohonan pembayaran ini?')) {
            router.post(route('admin.pending-payments.reject', childId), {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-zinc-800 leading-tight">Kelulusan Pembayaran</h2>}
        >
            <Head title="Kelulusan Pembayaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                                Pembayaran Offline Menunggu Kelulusan
                            </h3>

                            {pendingPayments.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-zinc-500">Tiada pembayaran menunggu kelulusan.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-zinc-200">
                                        <thead className="bg-zinc-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Nama Peserta
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Ibu Bapa
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Pusat Latihan
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Yuran
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Rujukan
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                    Tindakan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-zinc-200">
                                            {pendingPayments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-zinc-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-zinc-900">
                                                            {payment.name}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {payment.ic_number || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-zinc-900">
                                                            {payment.parent?.name || '-'}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {payment.parent?.email || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-zinc-900">
                                                            {payment.training_center?.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-zinc-900">
                                                            RM {payment.registration_fee ? payment.registration_fee.toFixed(2) : '50.00'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-xs text-zinc-500 font-mono">
                                                            {payment.payment_reference}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleApprove(payment.id)}
                                                                className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                                            >
                                                                Lulus
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(payment.id)}
                                                                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                            >
                                                                Tolak
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
