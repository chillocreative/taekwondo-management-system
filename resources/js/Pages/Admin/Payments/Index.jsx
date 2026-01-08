import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AdminPaymentsIndex({ auth, payments, filters, trainingCenters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [tcId, setTcId] = useState(filters?.training_center_id || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Master checkbox logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(payments.data.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`Adakah anda pasti untuk memadam ${selectedIds.length} rekod pembayaran ini?`)) return;

        setIsDeleting(true);
        router.post(route('admin.payments.bulk-destroy'), {
            ids: selectedIds
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false)
        });
    };

    // Consolidated auto-filter logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== (filters?.search || '') || tcId !== (filters?.training_center_id || '')) {
                router.get(route('admin.payments.index'), {
                    ...(filters || {}),
                    search: search,
                    training_center_id: tcId,
                }, { preserveState: true, replace: true, preserveScroll: true });
            }
        }, 500); // Debounce search to prevent excessive requests

        return () => clearTimeout(timeoutId);
    }, [search, tcId]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengurusan Pembayaran</h2>}
        >
            <Head title="Pengurusan Pembayaran" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Senarai Pembayaran</h1>
                            <p className="text-gray-500 mt-1">Urus semua transaksi pembayaran yuran.</p>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cari Transaksi</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari No. Resit, No. Siri, atau Nama Peserta..."
                                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                                />
                            </div>

                            <div className="w-full md:w-64">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pusat Latihan</label>
                                <select
                                    value={tcId}
                                    onChange={(e) => setTcId(e.target.value)}
                                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
                                >
                                    <option value="">Semua Pusat Latihan</option>
                                    {trainingCenters?.map(tc => (
                                        <option key={tc.id} value={tc.id}>{tc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && auth.user.role === 'admin' && (
                        <div className="mb-4 flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                            <span className="text-sm font-bold text-red-700">{selectedIds.length} rekod dipilih</span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={isDeleting}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                {isDeleting ? 'Memadam...' : 'Hapus Pilihan'}
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {auth.user.role === 'admin' && (
                                            <th className="px-6 py-4 w-10">
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedIds.length === payments?.data?.length && payments?.data?.length > 0}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </th>
                                        )}
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
                                    {payments?.data && payments.data.length > 0 ? (
                                        payments.data.map((payment) => (
                                            <tr key={payment.id} className={`hover:bg-blue-50/50 transition duration-150 ${selectedIds.includes(payment.id) ? 'bg-blue-50' : ''}`}>
                                                {auth.user.role === 'admin' && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(payment.id)}
                                                            onChange={() => handleSelectOne(payment.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {(() => {
                                                        const dateVal = payment.payment_date || payment.created_at;
                                                        if (!dateVal) return '-';
                                                        try {
                                                            return new Date(dateVal).toLocaleDateString('ms-MY');
                                                        } catch (e) {
                                                            return '-';
                                                        }
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {payment.receipt_number || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="font-bold text-gray-900">{payment.student?.nama_pelajar}</div>
                                                    <div className="text-xs">{payment.student?.no_siri}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Yuran {payment.month || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    RM {parseFloat(payment.total || 0).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {payment.status === 'paid' ? 'BERJAYA' : (payment.status ? String(payment.status).toUpperCase() : 'PENDING')}
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
                        {payments?.links && payments?.links?.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                {/* Simple Pagination Implementation or use Link component from Inertia */}
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Menunjukkan {payments?.from || 0} hingga {payments?.to || 0} daripada {payments?.total || 0} rekod
                                    </div>
                                    <div className="flex gap-1">
                                        {payments?.links?.map((link, k) => (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
        </AuthenticatedLayout >
    );
}
