import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Toast from '@/Components/Toast';

export default function AdminAttendanceIndex({ auth, attendances, stats, filters, flash }) {
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState('');
    const [editNotes, setEditNotes] = useState('');

    // Show flash messages
    useState(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.attendance.index'), {
            search,
            status,
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setStartDate('');
        setEndDate('');
        router.get(route('admin.attendance.index'));
    };

    const handleEdit = (attendance) => {
        setEditingId(attendance.id);
        setEditStatus(attendance.status);
        setEditNotes(attendance.notes || '');
    };

    const handleSaveEdit = (attendanceId) => {
        router.post(route('attendance.mark'), {
            student_id: attendances.data.find(a => a.id === attendanceId).student_id,
            attendance_date: attendances.data.find(a => a.id === attendanceId).attendance_date,
            status: editStatus,
            notes: editNotes,
        }, {
            onSuccess: () => {
                setEditingId(null);
                setToast({ message: 'Kehadiran berjaya dikemaskini', type: 'success' });
            }
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditStatus('');
        setEditNotes('');
    };

    const getStatusBadge = (status) => {
        const badges = {
            hadir: 'bg-emerald-100 text-emerald-800',
            tidak_hadir: 'bg-rose-100 text-rose-800',
            sakit: 'bg-amber-100 text-amber-800',
            cuti: 'bg-purple-100 text-purple-800',
        };
        const labels = {
            hadir: 'Hadir',
            tidak_hadir: 'Tidak Hadir',
            sakit: 'Sakit',
            cuti: 'Cuti',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-zinc-100 text-zinc-800'}`}>
                {labels[status] || status}
            </span>
        );
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white rounded-xl border border-zinc-200 p-4">
                                <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Jumlah</div>
                            </div>
                            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                                <div className="text-2xl font-bold text-emerald-700">{stats.hadir}</div>
                                <div className="text-xs text-emerald-600 uppercase tracking-wider">Hadir</div>
                            </div>
                            <div className="bg-rose-50 rounded-xl border border-rose-200 p-4">
                                <div className="text-2xl font-bold text-rose-700">{stats.tidak_hadir}</div>
                                <div className="text-xs text-rose-600 uppercase tracking-wider">Tidak Hadir</div>
                            </div>
                            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                                <div className="text-2xl font-bold text-amber-700">{stats.sakit}</div>
                                <div className="text-xs text-amber-600 uppercase tracking-wider">Sakit</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                                <div className="text-2xl font-bold text-purple-700">{stats.cuti}</div>
                                <div className="text-xs text-purple-600 uppercase tracking-wider">Cuti</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Cari Peserta</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nama atau No. Keahlian..."
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="hadir">Hadir</option>
                                        <option value="tidak_hadir">Tidak Hadir</option>
                                        <option value="sakit">Sakit</option>
                                        <option value="cuti">Cuti</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Tarikh Mula</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Tarikh Akhir</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                                >
                                    Tapis
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Tarikh</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">No. Keahlian</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Peserta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Catatan</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-100">
                                    {attendances.data && attendances.data.length > 0 ? (
                                        attendances.data.map((attendance) => (
                                            <tr key={attendance.id} className="hover:bg-zinc-50/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                    {new Date(attendance.attendance_date).toLocaleDateString('ms-MY', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-900">
                                                    {attendance.student_no_siri}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                    {attendance.student_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {editingId === attendance.id ? (
                                                        <select
                                                            value={editStatus}
                                                            onChange={(e) => setEditStatus(e.target.value)}
                                                            className="text-sm rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                                        >
                                                            <option value="hadir">Hadir</option>
                                                            <option value="tidak_hadir">Tidak Hadir</option>
                                                            <option value="sakit">Sakit</option>
                                                            <option value="cuti">Cuti</option>
                                                        </select>
                                                    ) : (
                                                        getStatusBadge(attendance.status)
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-500">
                                                    {editingId === attendance.id ? (
                                                        <input
                                                            type="text"
                                                            value={editNotes}
                                                            onChange={(e) => setEditNotes(e.target.value)}
                                                            className="w-full text-sm rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                                            placeholder="Catatan..."
                                                        />
                                                    ) : (
                                                        attendance.notes || '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {editingId === attendance.id ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(attendance.id)}
                                                                className="text-emerald-600 hover:text-emerald-900 font-bold"
                                                            >
                                                                Simpan
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-zinc-600 hover:text-zinc-900 font-bold"
                                                            >
                                                                Batal
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEdit(attendance)}
                                                            className="text-blue-600 hover:text-blue-900 font-bold"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center text-zinc-400">
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
                                        Menunjukkan {attendances.from} hingga {attendances.to} daripada {attendances.total} rekod
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
