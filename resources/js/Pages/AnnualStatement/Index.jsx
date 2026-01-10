import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, children, selectedChildId }) {
    const [selectedChild, setSelectedChild] = useState(selectedChildId || (children.length > 0 ? children[0].id : null));

    const currentChild = children.find(child => child.id === parseInt(selectedChild));

    const handleChildChange = (e) => {
        const childId = e.target.value;
        setSelectedChild(childId);
        window.location.href = route('annual-statement.index', { child_id: childId });
    };

    const getStatusBadge = (payment) => {
        if (payment.is_paid) {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    ✅ SUDAH DIBAYAR
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                ❌ BELUM BAYAR
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Penyata Tahunan</h2>}
        >
            <Head title="Penyata Tahunan" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Penyata Tahunan</h1>
                        <p className="text-gray-500 mt-1">Lihat penyata pembayaran yuran tahunan peserta.</p>
                    </div>

                    {children.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <span className="text-6xl mb-4 block">📋</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Tiada Peserta</h3>
                            <p className="text-gray-500 mb-6">Anda belum mempunyai peserta berdaftar.</p>
                            <Link
                                href={route('children.index')}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200"
                            >
                                <span>➕</span>
                                <span>Tambah Peserta</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Child Selector */}
                            {children.length > 1 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Peserta
                                    </label>
                                    <select
                                        value={selectedChild}
                                        onChange={handleChildChange}
                                        className="block w-full md:w-1/2 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                    >
                                        {children.map((child) => (
                                            <option key={child.id} value={child.id}>
                                                {child.name} - {child.no_siri}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Statement Card */}
                            {currentChild && (
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    {/* Child Info Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">Nama</p>
                                                <p className="text-xl font-bold">{currentChild.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">No. Siri</p>
                                                <p className="text-xl font-bold">{currentChild.no_siri}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium mb-1">Pusat Latihan</p>
                                                <p className="text-xl font-bold">{currentChild.training_center?.name || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                                        Yuran Bulan
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                                        Tarikh Pembayaran
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                                        No. Resit
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Resit
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentChild.monthly_payments && currentChild.monthly_payments.length > 0 ? (
                                                    currentChild.monthly_payments.map((payment) => (
                                                        <tr key={payment.id} className="hover:bg-gray-50 transition">
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {payment.month_name} {payment.year}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                {getStatusBadge(payment)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="text-sm text-gray-900">
                                                                    {payment.payment_date || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                                                                <div className="text-sm font-mono text-gray-900">
                                                                    {payment.receipt_number || '-'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                {payment.is_paid && payment.receipt_url ? (
                                                                    <a
                                                                        href={payment.receipt_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                                                                    >
                                                                        <span>📄</span>
                                                                        <span>Lihat Resit</span>
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400 text-sm">-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                                <span className="text-4xl mb-3">📋</span>
                                                                <p className="text-lg font-medium">Tiada rekod pembayaran.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
