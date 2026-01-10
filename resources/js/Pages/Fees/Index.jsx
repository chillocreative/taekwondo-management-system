import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function FeesIndex({ auth, feesData }) {
    const { flash } = usePage().props;
    const [popupState, setPopupState] = useState({ show: false, type: 'success', message: '' });
    const [expandedChildId, setExpandedChildId] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setPopupState({ show: true, type: 'success', message: flash.success });
        } else if (flash?.error) {
            setPopupState({ show: true, type: 'error', message: flash.error });
        }

        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                setPopupState(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handlePay = (childId, month, amount) => {
        if (confirm(`Anda pasti mahu membayar yuran untuk bulan ${month}?`)) {
            router.post(route('fees.pay'), {
                child_id: childId,
                month: month,
                amount: amount,
            });
        }
    };

    const toggleChild = (id) => {
        if (expandedChildId === id) {
            setExpandedChildId(null);
        } else {
            setExpandedChildId(id);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Yuran Pengajian
                </h2>
            }
        >
            <Head title="Yuran Pengajian" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">

                    {feesData.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-zinc-200 text-center shadow-sm">
                            <p className="text-zinc-500">Tiada rekod peserta dijumpai. Sila tambah peserta terlebih dahulu di menu "Nama Peserta".</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {feesData.map((child) => (
                                <div key={child.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                    <div
                                        className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center cursor-pointer hover:bg-zinc-100 transition-colors"
                                        onClick={() => toggleChild(child.id)}
                                    >
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900">{child.name}</h3>
                                        </div>
                                        <div className="text-zinc-400">
                                            <svg
                                                className={`w-6 h-6 transform transition-transform duration-200 ${expandedChildId === child.id ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {expandedChildId === child.id && (
                                        <div className="overflow-x-auto">
                                            {child.is_special_center ? (
                                                <div className="px-6 py-8 text-center bg-white">
                                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-bold text-zinc-900 mb-1">Yuran di bayar kepada pihak sekolah</h4>
                                                    <p className="text-zinc-500 text-sm max-w-md mx-auto">
                                                        Pembayaran yuran bulanan untuk peserta di pusat latihan ini diuruskan terus oleh pihak sekolah.
                                                    </p>
                                                </div>
                                            ) : (
                                                <table className="min-w-full divide-y divide-zinc-200">
                                                    <thead className="bg-white">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                                Yuran Bulan
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                                Tarikh Akhir
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                                Tindakan
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-zinc-200">
                                                        {child.fees.map((fee, index) => (
                                                            <tr key={index} className={`hover:bg-zinc-50 transition-colors ${fee.is_overdue ? 'bg-red-50' : ''}`}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                                    {fee.month}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                                    {fee.due_date}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${fee.status === 'Sudah Dibayar'
                                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                        : fee.status === 'Tertunggak'
                                                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                                                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                        }`}>
                                                                        {fee.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    {fee.hide_action ? (
                                                                        <span className="text-zinc-300 text-xs"></span>
                                                                    ) : fee.is_paid ? (
                                                                        <div className="flex flex-col items-start gap-1">
                                                                            <span className="text-emerald-600 text-xs">
                                                                                ✓ {fee.paid_date}
                                                                            </span>
                                                                            {fee.receipt_url && (
                                                                                <a
                                                                                    href={fee.receipt_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="px-4 py-2 text-xs font-bold border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-1 shadow-sm text-zinc-700 bg-white"
                                                                                >
                                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                                    </svg>
                                                                                    Resit
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    ) : fee.can_pay ? (
                                                                        <button
                                                                            onClick={() => handlePay(child.id, fee.month, fee.amount)}
                                                                            className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors shadow-sm ${fee.is_overdue
                                                                                ? 'bg-red-600 hover:bg-red-700'
                                                                                : 'bg-black hover:bg-zinc-800'
                                                                                }`}
                                                                        >
                                                                            BAYAR
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-zinc-400 text-xs">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Notification Popup */}
            {popupState.show && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none px-4">
                    <div className={`bg-white rounded-xl shadow-2xl border ${popupState.type === 'success' ? 'border-emerald-100' : 'border-red-100'} p-6 max-w-sm w-full transform transition-all duration-300 pointer-events-auto relative animate-fade-in-up`}>
                        <button
                            onClick={() => setPopupState(prev => ({ ...prev, show: false }))}
                            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 ${popupState.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center mb-4`}>
                                {popupState.type === 'success' ? (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">
                                {popupState.type === 'success' ? 'Pembayaran Berjaya!' : 'Pembayaran Gagal!'}
                            </h3>
                            <p className="text-zinc-600">{popupState.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
