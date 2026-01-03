import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Toast from '@/Components/Toast';

export default function PendingPayments({ auth, pendingPayments, flash }) {
    const [toast, setToast] = useState(null);

    // Initial toast from flash messages
    useState(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const handleApprove = (childId, childName) => {
        if (confirm(`Adakah anda pasti mahu meluluskan pembayaran untuk ${childName}?`)) {
            router.post(route('admin.pending-payments.approve', childId), {}, {
                onSuccess: (page) => {
                    // Update toast from new flash message
                    if (page.props.flash?.success) {
                        setToast({ message: page.props.flash.success, type: 'success' });
                    }
                }
            });
        }
    };

    const handleReject = (childId, childName) => {
        if (confirm(`Adakah anda pasti mahu menolak permohonan pembayaran untuk ${childName}?`)) {
            router.post(route('admin.pending-payments.reject', childId), {}, {
                onSuccess: (page) => {
                    // Update toast from new flash message
                    if (page.props.flash?.success) {
                        setToast({ message: page.props.flash.success, type: 'success' });
                    }
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Kelulusan Pembayaran Offline</h2>}
        >
            <Head title="Kelulusan Pembayaran" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 items-center justify-between flex">
                        <div>
                            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Senarai Menunggu Kelulusan</h1>
                            <p className="text-zinc-500 mt-1">Sahkan pembayaran manual yang dibuat oleh ibu bapa.</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tarikh Mohon</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Peserta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Ibu Bapa / Penjaga</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Pusat Latihan</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Amaun</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-100">
                                    {pendingPayments && pendingPayments.length > 0 ? (
                                        pendingPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-zinc-50/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                    {new Date(payment.updated_at).toLocaleDateString('ms-MY', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-zinc-900">{payment.name}</div>
                                                    <div className="text-xs text-zinc-500 font-mono">{payment.ic_number || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-zinc-900">{payment.parent?.name || '-'}</div>
                                                    <div className="text-xs text-zinc-500">{payment.parent?.email || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {payment.training_center?.name || 'Tiada'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                                                    RM {parseFloat(payment.registration_fee || 50).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => handleReject(payment.id, payment.name)}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm hover:shadow"
                                                        >
                                                            Tolak
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(payment.id, payment.name)}
                                                            className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm hover:shadow"
                                                        >
                                                            Luluskan
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center text-zinc-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="font-medium">Tiada pembayaran menunggu kelulusan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
