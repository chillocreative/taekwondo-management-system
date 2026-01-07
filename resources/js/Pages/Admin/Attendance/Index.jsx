import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Toast from '@/Components/Toast';

export default function AdminAttendanceIndex({ auth, attendances, training_centers, stats, filters, flash }) {
    const [toast, setToast] = useState(null);
    const [tcId, setTcId] = useState(filters?.training_center_id || '');
    const [selectedIds, setSelectedIds] = useState([]);

    // Auto-filter logic
    useEffect(() => {
        if (tcId !== (filters?.training_center_id || '')) {
            router.get(route('admin.attendance.index'), {
                training_center_id: tcId,
            }, { preserveState: true, replace: true, preserveScroll: true });
        }
    }, [tcId]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(attendances.data.map(a => a.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Adakah anda pasti mahu memadam ${selectedIds.length} rekod sesi kehadiran ini?`)) {
            router.post(route('attendance.bulk-destroy-sessions'), {
                ids: selectedIds
            }, {
                onSuccess: () => {
                    setSelectedIds([]);
                    setToast({ message: 'Rekod berjaya dipadam', type: 'success' });
                }
            });
        }
    };

    const handleDeleteSingle = (id) => {
        if (confirm('Adakah anda pasti mahu memadam rekod sesi kehadiran ini?')) {
            router.post(route('attendance.bulk-destroy-sessions'), {
                ids: [id]
            }, {
                onSuccess: () => setToast({ message: 'Rekod berjaya dipadam', type: 'success' })
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Pemantauan Kehadiran</h2>}
        >
            <Head title="Pemantauan Kehadiran" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header & Stats */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-4">Senarai Kehadiran Peserta</h1>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                                <div className="text-2xl font-bold text-zinc-900">{stats.yearly_sessions}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Jumlah Kelas Tahun {stats.current_year}</div>
                            </div>
                            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                                <div className="text-2xl font-bold text-zinc-900">{stats.monthly_sessions}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Jumlah Kelas {stats.current_month_name} {stats.current_year}</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                                <div className="text-2xl font-bold text-emerald-700">{stats.hadir}</div>
                                <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">Hadir</div>
                            </div>
                            <div className="bg-rose-50 rounded-xl border border-rose-200 p-4">
                                <div className="text-2xl font-bold text-rose-700">{stats.tidak_hadir}</div>
                                <div className="text-[10px] text-rose-600 uppercase tracking-wider font-bold">Tidak Hadir</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                                <div className="text-2xl font-bold text-amber-700">{stats.sakit}</div>
                                <div className="text-[10px] text-amber-600 uppercase tracking-wider font-bold">Sakit</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                                <div className="text-2xl font-bold text-purple-700">{stats.cuti}</div>
                                <div className="text-[10px] text-purple-600 uppercase tracking-wider font-bold">Cuti</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Bulk Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-zinc-700 mb-1 font-bold">Pusat Latihan</label>
                                <select
                                    value={tcId}
                                    onChange={(e) => setTcId(e.target.value)}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Semua Pusat Latihan</option>
                                    {training_centers.map(tc => (
                                        <option key={tc.id} value={tc.id}>{tc.name}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-bold flex items-center gap-2 h-fit"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Padam Terpilih ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedIds.length === attendances.data?.length && attendances.data?.length > 0}
                                                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tarikh Kehadiran</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Pusat Latihan</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">Status (Hadir / Jumlah)</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-100">
                                    {attendances.data && attendances.data.length > 0 ? (
                                        attendances.data.map((session) => (
                                            <tr key={session.id} className="hover:bg-zinc-50/50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(session.id)}
                                                        onChange={() => handleSelect(session.id)}
                                                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                                                    {new Date(session.attendance_date).toLocaleDateString('ms-MY', {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 uppercase font-medium">
                                                    {session.training_center_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${session.present_count === session.total_students
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {session.status_label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            href={route('admin.attendance.show-sheet', {
                                                                date: session.attendance_date,
                                                                training_center_id: session.training_center_id
                                                            })}
                                                            className="text-blue-600 hover:text-blue-900 font-bold flex items-center gap-1"
                                                        >
                                                            Lihat
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteSingle(session.id)}
                                                            className="text-rose-600 hover:text-rose-900 font-bold"
                                                        >
                                                            Padam
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center text-zinc-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="font-medium">Tiada rekod kehadiran dijumpai.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {attendances.links && attendances.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-zinc-600">
                                        Menunjukkan {attendances.from} hingga {attendances.to} daripada {attendances.total} sesi
                                    </div>
                                    <div className="flex gap-1">
                                        {attendances.links.map((link, k) => (
                                            <button
                                                key={k}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 border rounded text-sm ${link.active
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
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
