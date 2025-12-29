import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function FeesIndex({ auth, feesData }) {
    const handlePay = (childId, month, amount) => {
        if (confirm(`Anda pasti mahu membayar yuran untuk bulan ${month}?`)) {
            router.post(route('fees.pay'), {
                child_id: childId,
                month: month,
                amount: amount,
            });
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
                            <p className="text-zinc-500">Tiada rekod anak dijumpai. Sila tambah anak anda terlebih dahulu di menu "Nama Anak".</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {feesData.map((child) => (
                                <div key={child.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900">{child.name}</h3>
                                            <p className="text-sm text-zinc-500">No. Siri: {child.no_siri}</p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-zinc-200">
                                            <thead className="bg-white">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-1/3">
                                                        Yuran Bulan
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-1/3">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-1/3">
                                                        Tindakan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-zinc-200">
                                                {child.fees.map((fee, index) => (
                                                    <tr key={index} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                            {fee.month}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${fee.status === 'Telah Dibayar'
                                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                    : fee.status === 'Tiada Rekod Pelajar'
                                                                        ? 'bg-gray-100 text-gray-500 border border-gray-200'
                                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                }`}>
                                                                {fee.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            {fee.has_receipt ? (
                                                                <button className="text-blue-600 hover:text-blue-900 hover:underline flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                                    Lihat Invoice
                                                                </button>
                                                            ) : fee.can_pay ? (
                                                                <button
                                                                    onClick={() => handlePay(child.id, fee.month, fee.amount)}
                                                                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
