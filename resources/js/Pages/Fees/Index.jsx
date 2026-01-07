import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function FeesIndex({ auth, feesData }) {
    const [expandedChildId, setExpandedChildId] = useState(null);

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
                                            <p className="text-sm text-zinc-500">No. Siri: {child.no_siri}</p>
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
                                                                {fee.is_paid ? (
                                                                    <span className="text-emerald-600 text-xs">
                                                                        ✓ Dibayar {fee.paid_date}
                                                                    </span>
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
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
