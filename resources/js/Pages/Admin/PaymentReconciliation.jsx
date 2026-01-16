import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PaymentReconciliation({ pendingPayments, paidPayments, stats }) {
    const [checking, setChecking] = useState({});
    const [fixing, setFix] = useState({});
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [results, setResults] = useState({});
    const [bulkResults, setBulkResults] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');

    const checkStatus = async (childId) => {
        setChecking(prev => ({ ...prev, [childId]: true }));

        try {
            const response = await fetch(route('admin.payment-reconciliation.check'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ child_id: childId }),
            });

            const data = await response.json();
            setResults(prev => ({ ...prev, [childId]: data }));
        } catch (error) {
            setResults(prev => ({ ...prev, [childId]: { error: error.message } }));
        }

        setChecking(prev => ({ ...prev, [childId]: false }));
    };

    const fixStatus = async (childId) => {
        setFix(prev => ({ ...prev, [childId]: true }));

        try {
            const response = await fetch(route('admin.payment-reconciliation.fix'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ child_id: childId }),
            });

            const data = await response.json();

            if (data.success) {
                // Reload the page to show updated status
                router.reload();
            } else {
                setResults(prev => ({ ...prev, [childId]: { error: data.error } }));
            }
        } catch (error) {
            setResults(prev => ({ ...prev, [childId]: { error: error.message } }));
        }

        setFix(prev => ({ ...prev, [childId]: false }));
    };

    const bulkReconcile = async () => {
        if (!confirm('Ini akan menyemak SEMUA pembayaran pending dengan ToyyibPay dan memperbaiki status yang tidak sepadan. Teruskan?')) {
            return;
        }

        setBulkProcessing(true);
        setBulkResults(null);

        try {
            const response = await fetch(route('admin.payment-reconciliation.bulk'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const data = await response.json();
            setBulkResults(data);

            if (data.fixed > 0) {
                // Reload after a short delay to show results
                setTimeout(() => {
                    router.reload();
                }, 3000);
            }
        } catch (error) {
            setBulkResults({ error: error.message });
        }

        setBulkProcessing(false);
    };

    const manualFix = async (childId, childName) => {
        if (!confirm(`Anda pasti mahu MANUAL FIX pembayaran untuk ${childName}?\n\nIni akan menandakan pembayaran sebagai SELESAI walaupun API ToyyibPay tidak mengembalikan data.\n\nPastikan anda mempunyai bukti pembayaran (email/resit).`)) {
            return;
        }

        setFix(prev => ({ ...prev, [childId]: true }));

        try {
            const response = await fetch(route('admin.payment-reconciliation.manual-fix'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ child_id: childId }),
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ ' + data.message);
                router.reload();
            } else {
                setResults(prev => ({ ...prev, [childId]: { error: data.error } }));
            }
        } catch (error) {
            setResults(prev => ({ ...prev, [childId]: { error: error.message } }));
        }

        setFix(prev => ({ ...prev, [childId]: false }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Reconciliation" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">Payment Reconciliation</h1>
                                <p className="text-zinc-500 mt-1">Semak dan perbaiki status pembayaran yang tidak sepadan dengan ToyyibPay</p>
                            </div>

                            <button
                                onClick={bulkReconcile}
                                disabled={bulkProcessing}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                            >
                                {bulkProcessing ? 'Memproses...' : '🔧 Auto-Repair All Pending'}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-amber-800 font-medium">Menunggu Bayaran</p>
                                <p className="text-3xl font-bold text-amber-900">{stats.total_pending}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">Sudah Dibayar</p>
                                <p className="text-3xl font-bold text-green-900">{stats.total_paid}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Results */}
                    {bulkResults && (
                        <div className={`rounded-xl border shadow-sm p-6 mb-6 ${bulkResults.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            {bulkResults.error ? (
                                <p className="text-red-700">{bulkResults.error}</p>
                            ) : (
                                <>
                                    <h3 className="font-bold text-lg mb-3">📊 Hasil Auto-Repair</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-zinc-600 text-sm">Disemak</p>
                                            <p className="text-2xl font-bold">{bulkResults.checked}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-green-600 text-sm">Diperbaiki</p>
                                            <p className="text-2xl font-bold text-green-700">{bulkResults.fixed}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 text-sm">Ralat</p>
                                            <p className="text-2xl font-bold text-red-700">{bulkResults.errors?.length || 0}</p>
                                        </div>
                                    </div>

                                    {bulkResults.details && bulkResults.details.length > 0 && (
                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900">Lihat Details</summary>
                                            <div className="mt-2 bg-white rounded-lg p-4 max-h-60 overflow-y-auto">
                                                {bulkResults.details.map((detail, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                                        <span>{detail.child}</span>
                                                        <span className={detail.action === 'Fixed' ? 'text-green-600' : 'text-zinc-500'}>
                                                            {detail.action}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
                        <div className="border-b border-zinc-200">
                            <div className="flex">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-6 py-4 font-medium transition-colors ${activeTab === 'pending'
                                        ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50'
                                        : 'text-zinc-500 hover:text-zinc-900'
                                        }`}
                                >
                                    ⏳ Menunggu Bayaran ({pendingPayments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('paid')}
                                    className={`px-6 py-4 font-medium transition-colors ${activeTab === 'paid'
                                        ? 'text-green-700 border-b-2 border-green-500 bg-green-50'
                                        : 'text-zinc-500 hover:text-zinc-900'
                                        }`}
                                >
                                    ✅ Sudah Dibayar ({paidPayments.length})
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'pending' && (
                                <div className="overflow-x-auto">
                                    {pendingPayments.length === 0 ? (
                                        <div className="text-center py-12 text-zinc-500">
                                            <p className="text-4xl mb-4">🎉</p>
                                            <p>Tiada pembayaran pending yang perlu disemak!</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-zinc-50">
                                                    <th className="text-left p-3">Peserta</th>
                                                    <th className="text-left p-3">Penjaga</th>
                                                    <th className="text-left p-3">Pusat</th>
                                                    <th className="text-left p-3">Bill Code</th>
                                                    <th className="text-left p-3">Status ToyyibPay</th>
                                                    <th className="text-right p-3">Tindakan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingPayments.map(payment => (
                                                    <tr key={payment.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                                                        <td className="p-3">
                                                            <div className="font-medium">{payment.name}</div>
                                                            <div className="text-xs text-zinc-500">{payment.no_siri}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div>{payment.parent_name}</div>
                                                            <div className="text-xs text-zinc-500">{payment.parent_phone}</div>
                                                        </td>
                                                        <td className="p-3 text-zinc-600">{payment.training_center}</td>
                                                        <td className="p-3">
                                                            <code className="bg-zinc-100 px-2 py-1 rounded text-xs">
                                                                {payment.payment_reference}
                                                            </code>
                                                        </td>
                                                        <td className="p-3">
                                                            {results[payment.id] ? (
                                                                <div className="text-sm">
                                                                    {results[payment.id].error ? (
                                                                        <span className="text-red-600">{results[payment.id].error}</span>
                                                                    ) : (
                                                                        <div>
                                                                            <span className={results[payment.id].toyyibpay_status === 'Paid' ? 'text-green-600 font-medium' : 'text-amber-600'}>
                                                                                {results[payment.id].toyyibpay_status}
                                                                            </span>
                                                                            {results[payment.id].needs_update && (
                                                                                <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                                                                                    Perlu perbaiki!
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-zinc-400">Belum disemak</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex gap-2 justify-end flex-wrap">
                                                                <button
                                                                    onClick={() => checkStatus(payment.id)}
                                                                    disabled={checking[payment.id]}
                                                                    className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200 transition-colors text-sm disabled:opacity-50"
                                                                >
                                                                    {checking[payment.id] ? '...' : '🔍 Semak'}
                                                                </button>
                                                                {results[payment.id]?.needs_update && (
                                                                    <button
                                                                        onClick={() => fixStatus(payment.id)}
                                                                        disabled={fixing[payment.id]}
                                                                        className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                                                                    >
                                                                        {fixing[payment.id] ? '...' : '✅ Perbaiki'}
                                                                    </button>
                                                                )}
                                                                {/* Manual Fix button - always show for pending payments */}
                                                                <button
                                                                    onClick={() => manualFix(payment.id, payment.name)}
                                                                    disabled={fixing[payment.id]}
                                                                    className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors text-sm disabled:opacity-50"
                                                                    title="Manual fix dengan bukti pembayaran"
                                                                >
                                                                    {fixing[payment.id] ? '...' : '🔧 Manual Fix'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {activeTab === 'paid' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-zinc-50">
                                                <th className="text-left p-3">Peserta</th>
                                                <th className="text-left p-3">No. Siri</th>
                                                <th className="text-left p-3">Pusat</th>
                                                <th className="text-left p-3">Bill Code</th>
                                                <th className="text-left p-3">Tarikh Bayar</th>
                                                <th className="text-right p-3">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paidPayments.map(payment => (
                                                <tr key={payment.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                                                    <td className="p-3 font-medium">{payment.name}</td>
                                                    <td className="p-3 text-zinc-600">{payment.no_siri}</td>
                                                    <td className="p-3 text-zinc-600">{payment.training_center}</td>
                                                    <td className="p-3">
                                                        <code className="bg-green-100 px-2 py-1 rounded text-xs text-green-700">
                                                            {payment.payment_reference}
                                                        </code>
                                                    </td>
                                                    <td className="p-3 text-zinc-600">{payment.payment_date}</td>
                                                    <td className="p-3 text-right font-medium text-green-600">
                                                        RM {payment.registration_fee?.toFixed(2) || '-'}
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
