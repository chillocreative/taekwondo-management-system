import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminPaymentsIndex({ auth, payments, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.payments.index'), { search }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengurusan Pembayaran</h2>}
        >
            <Head title="Pengurusan Pembayaran" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Senarai Pembayaran</h1>
                        <p className="text-gray-500 mt-1">Urus semua transaksi pembayaran yuran.</p>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari No. Resit, No. Keahlian, atau Nama Peserta..."
                                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-md"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tarikh</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No. Resit</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Peserta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Keterangan</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-blue-50/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(payment.payment_date || payment.created_at).toLocaleDateString('ms-MY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {payment.receipt_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="font-bold text-gray-900">{payment.student?.nama_pelajar}</div>
                                                    <div className="text-xs">{payment.student?.no_siri}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Yuran {payment.month}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    RM {parseFloat(payment.total).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {payment.status === 'paid' ? 'BERJAYA' : payment.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {payment.status === 'paid' && (
                                                        <div className="flex justify-end gap-2">
                                                            <a
                                                                href={route('receipts.stream', payment.id)}
                                                                target="_blank"
                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors focus:ring-2 focus:ring-zinc-200 focus:outline-none"
                                                                title="Lihat Resit"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                                    <circle cx="12" cy="12" r="3" />
                                                                </svg>
                                                            </a>
                                                            <a
                                                                href={route('receipts.download', payment.id)}
                                                                target="_blank"
                                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors focus:ring-2 focus:ring-zinc-200 focus:outline-none"
                                                                title="Muat Turun"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                    <polyline points="7 10 12 15 17 10" />
                                                                    <line x1="12" x2="12" y1="15" y2="3" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                Tiada rekod pembayaran dijumpai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination if needed */}
                        {payments.links && payments.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                {/* Simple Pagination Implementation or use Link component from Inertia */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        Menunjukkan {payments.from} hingga {payments.to} daripada {payments.total} rekod
                                    </div>
                                    <div className="flex gap-1">
                                        {payments.links.map((link, k) => (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1 border rounded ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
