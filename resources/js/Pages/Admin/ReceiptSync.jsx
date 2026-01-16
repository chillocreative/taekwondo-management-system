import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ReceiptSync({ payments, stats }) {
    const [syncing, setSyncing] = useState(false);
    const [syncResults, setSyncResults] = useState(null);
    const [filter, setFilter] = useState('all'); // all, needs_fix, synced, no_receipt

    const handleRepairMissedRenewals = async () => {
        if (!confirm('Ini akan membaiki status pelajar yang terlepas bayaran renewal tetapi sudah diaktifkan. Pelajar terbabit akan diminta membayar semula renewal pada bulan depan. Teruskan?')) {
            return;
        }

        setSyncing(true);
        setSyncResults(null);

        try {
            const response = await fetch(route('admin.repair-missed-renewals'), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            setSyncResults({
                title: '📊 Hasil Baik Pulih Renewal',
                checked: data.checked,
                fixed: data.fixed,
                message: `${data.fixed} pelajar telah dibaiki status renewal mereka.`
            });

            if (data.fixed > 0) {
                setTimeout(() => {
                    router.reload();
                }, 3000);
            }
        } catch (error) {
            setSyncResults({ error: error.message });
        }

        setSyncing(false);
    };

    const handleSync = async () => {
        if (!confirm('Ini akan menyegerakkan semua nombor resit dari StudentPayment ke MonthlyPayment. Teruskan?')) {
            return;
        }

        setSyncing(true);
        setSyncResults(null);

        try {
            const response = await fetch(route('admin.receipt-sync.sync'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const data = await response.json();
            setSyncResults(data);

            if (data.fixed > 0) {
                setTimeout(() => {
                    router.reload();
                }, 3000);
            }
        } catch (error) {
            setSyncResults({ error: error.message });
        }

        setSyncing(false);
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'needs_fix') return p.needs_fix;
        if (filter === 'synced') return p.is_synced;
        if (filter === 'no_receipt') return !p.mp_receipt_number && !p.sp_receipt_number;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Receipt Sync" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">Receipt Number Sync</h1>
                                <p className="text-zinc-500 mt-1">Segerakkan nombor resit antara StudentPayment dan MonthlyPayment</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                    onClick={handleRepairMissedRenewals}
                                    disabled={syncing}
                                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-medium"
                                >
                                    🛠️ Repair Missed Renewals
                                </button>
                                <button
                                    onClick={handleSync}
                                    disabled={syncing || stats.needs_fix === 0}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                                >
                                    {syncing ? 'Menyegerak...' : `🔄 Sync All (${stats.needs_fix} items)`}
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100" onClick={() => setFilter('all')}>
                                <p className="text-blue-800 font-medium text-sm">Jumlah Dibayar</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100" onClick={() => setFilter('synced')}>
                                <p className="text-green-800 font-medium text-sm">Sudah Sync</p>
                                <p className="text-2xl font-bold text-green-900">{stats.synced}</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer hover:bg-amber-100" onClick={() => setFilter('needs_fix')}>
                                <p className="text-amber-800 font-medium text-sm">Perlu Perbaiki</p>
                                <p className="text-2xl font-bold text-amber-900">{stats.needs_fix}</p>
                            </div>
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-100" onClick={() => setFilter('no_receipt')}>
                                <p className="text-zinc-700 font-medium text-sm">Tiada Resit</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.no_receipt}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sync Results */}
                    {syncResults && (
                        <div className={`rounded-xl border shadow-sm p-6 mb-6 ${syncResults.error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            {syncResults.error ? (
                                <p className="text-red-700">{syncResults.error}</p>
                            ) : (
                                <>
                                    <h3 className="font-bold text-lg mb-3">{syncResults.title || '📊 Hasil Sync'}</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center">
                                            <p className="text-zinc-600 text-sm">Disemak</p>
                                            <p className="text-2xl font-bold">{syncResults.checked}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-green-600 text-sm">{syncResults.fixed_label || 'Diperbaiki'}</p>
                                            <p className="text-2xl font-bold text-green-700">{syncResults.fixed}</p>
                                        </div>
                                    </div>
                                    {syncResults.message && (
                                        <p className="text-sm text-green-700 mt-2 bg-green-100/50 p-2 rounded text-center font-medium">
                                            {syncResults.message}
                                        </p>
                                    )}

                                    {syncResults.details && syncResults.details.length > 0 && (
                                        <details className="mt-4">
                                            <summary className="cursor-pointer text-zinc-600 hover:text-zinc-900">Lihat Details ({syncResults.details.length})</summary>
                                            <div className="mt-2 bg-white rounded-lg p-4 max-h-60 overflow-y-auto">
                                                {syncResults.details.map((detail, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                                                        <span>{detail.child_name} - {detail.month}</span>
                                                        <span className={detail.action === 'Fixed' ? 'text-green-600 font-medium' : 'text-zinc-500'}>
                                                            {detail.action === 'Fixed' ? `✅ ${detail.receipt_number}` : detail.status || detail.action}
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

                    {/* Filter Info */}
                    {filter !== 'all' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex justify-between items-center">
                            <span className="text-blue-800">
                                Menapis: <strong className="capitalize">{filter.replace('_', ' ')}</strong> ({filteredPayments.length} rekod)
                            </span>
                            <button
                                onClick={() => setFilter('all')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Padam Filter ✕
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="text-left p-4 font-bold text-zinc-600">Peserta</th>
                                        <th className="text-left p-4 font-bold text-zinc-600">Bulan</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">No. Resit (MonthlyPayment)</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">No. Resit (StudentPayment)</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Status</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Tarikh Bayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-zinc-500">
                                                Tiada rekod ditemui
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment, idx) => (
                                            <tr key={idx} className={`hover:bg-zinc-50 ${payment.needs_fix ? 'bg-amber-50/50' : ''}`}>
                                                <td className="p-4 font-medium">{payment.child_name}</td>
                                                <td className="p-4 text-zinc-600">{payment.month}</td>
                                                <td className="p-4 text-center">
                                                    {payment.mp_receipt_number ? (
                                                        payment.is_bill_code ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <code className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs line-through">{payment.mp_receipt_number}</code>
                                                                <span className="text-xs text-red-600">⚠️ Bill Code</span>
                                                            </div>
                                                        ) : (
                                                            <code className="bg-zinc-100 px-2 py-1 rounded text-xs">{payment.mp_receipt_number}</code>
                                                        )
                                                    ) : (
                                                        <span className="text-red-500">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {payment.sp_receipt_number ? (
                                                        <code className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{payment.sp_receipt_number}</code>
                                                    ) : (
                                                        <span className="text-zinc-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {payment.is_synced ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✅ Synced</span>
                                                    ) : payment.needs_fix ? (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">⚠️ Perlu Sync</span>
                                                    ) : !payment.sp_receipt_number ? (
                                                        <span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-full text-xs font-medium">❓ Tiada Resit</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">ℹ️ OK</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center text-zinc-500">{payment.paid_date || '-'}</td>
                                            </tr>
                                        ))
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
