import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Index({ auth, students, filters, stats, trainingCenters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || '');
    const [trainingCenterId, setTrainingCenterId] = useState(filters.training_center_id || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const isFirstRender = useRef(true);

    // Auto-filter effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(route('students.index'), {
                search,
                kategori,
                training_center_id: trainingCenterId
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, kategori, trainingCenterId]);

    const handleDelete = (id) => {
        if (confirm('Adakah anda pasti untuk memadam rekod ini?')) {
            router.delete(route('students.destroy', id));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(students.data.map(student => student.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            alert('Sila pilih sekurang-kurangnya satu rekod untuk dipadam.');
            return;
        }

        if (confirm(`Adakah anda pasti untuk memadam ${selectedIds.length} rekod yang dipilih?`)) {
            router.post(route('students.bulk-destroy'), {
                ids: selectedIds
            }, {
                onSuccess: () => {
                    setSelectedIds([]);
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Pengurusan Peserta</h2>}
        >
            <Head title="Pengurusan Pelajar" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Senarai Peserta</h1>
                            <p className="text-gray-500 mt-1">Urus maklumat peserta.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">

                            <Link
                                href={route('students.create')}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 shadow-lg hover:shadow-blue-500/30 w-full md:w-auto"
                            >
                                <span>➕</span>
                                <span>Peserta Baru</span>
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Paid Students */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-green-50 rounded-xl text-green-600">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Pelajar Berbayar</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_paid}</p>
                                </div>
                            </div>

                            {/* Under 18 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
                                    <span className="text-3xl">👶</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Bawah 18 Tahun</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_below_18}</p>
                                </div>
                            </div>

                            {/* Above 18 */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
                                    <span className="text-3xl">🧑</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">18 Tahun Atas</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_above_18}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Carian</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari nama, no. siri..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition duration-200"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pusat Latihan</label>
                                <select
                                    value={trainingCenterId}
                                    onChange={(e) => setTrainingCenterId(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition duration-200"
                                >
                                    <option value="">Semua Pusat</option>
                                    {trainingCenters && trainingCenters.map((center) => (
                                        <option key={center.id} value={center.id}>
                                            {center.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    value={kategori}
                                    onChange={(e) => setKategori(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition duration-200"
                                >
                                    <option value="">Semua Kategori</option>
                                    <option value="kanak-kanak">Bawah 18 Tahun</option>
                                    <option value="dewasa">18 Tahun ke atas</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                                        <span className="animate-pulse">⚓</span>
                                        {selectedIds.length} rekod dipilih
                                    </div>
                                    <button
                                        onClick={() => setSelectedIds([])}
                                        className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
                                    >
                                        Batal Pilihan
                                    </button>
                                </div>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl transition duration-200 shadow-lg shadow-red-200"
                                >
                                    <span>🗑️</span>
                                    <span>Padam Terpilih</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Students Table Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === students.data.length && students.data.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-5 w-5"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No. Siri</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Penjaga</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Bayaran</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {students.data.length > 0 ? (
                                        students.data.map((student) => (
                                            <tr key={student.id} className="hover:bg-blue-50/50 transition duration-150 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(student.id)}
                                                        onChange={() => handleSelectOne(student.id)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 h-5 w-5"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link href={route('students.show', student.id)} className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline">
                                                        {student.no_siri}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{student.child?.name || student.nama_pelajar}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{student.child?.parent?.name || student.nama_penjaga}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.kategori === 'kanak-kanak'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                        }`}>
                                                        {student.kategori === 'kanak-kanak' ? 'Bawah 18 Tahun' : '18 Tahun ke atas'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        {student.yuran_tahunan_paid ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center">
                                                                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${student.status_bayaran >= 12 ? 'bg-green-500' :
                                                                        student.status_bayaran >= 6 ? 'bg-yellow-500' :
                                                                            'bg-red-500'
                                                                        }`}></div>
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {student.status_bayaran}/12 bulan
                                                                    </span>
                                                                </div>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                                                    ✅ Yuran Tahunan
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 w-fit animate-pulse border border-rose-200">
                                                                    ⏳ Menunggu Bayaran
                                                                </span>
                                                                {student.child?.payment_method === 'offline' && (
                                                                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-tighter">
                                                                        Pembayaran Offline
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        {!student.yuran_tahunan_paid && student.child?.payment_slip && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Sahkan pembayaran untuk ${student.nama_pelajar}?`)) {
                                                                        router.post(route('students.approve', student.id));
                                                                    }
                                                                }}
                                                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition shadow-sm hover:shadow-green-200"
                                                                title="Luluskan Pendaftaran"
                                                            >
                                                                <span>✅</span>
                                                                <span>Lulus</span>
                                                            </button>
                                                        )}
                                                        {student.child?.payment_slip && (
                                                            <a
                                                                href={`/storage/${student.child.payment_slip}`}
                                                                target="_blank"
                                                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition"
                                                                title="Lihat Resit"
                                                            >
                                                                📄
                                                            </a>
                                                        )}
                                                        <Link
                                                            href={route('students.show', student.id)}
                                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                                            title="Lihat"
                                                        >
                                                            👁️
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(student.id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                            title="Padam"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <span className="text-4xl mb-3">🔍</span>
                                                    <p className="text-lg font-medium">Tiada rekod pelajar dijumpai.</p>
                                                    <p className="text-sm">Cuba ubah carian atau tapis kategori anda.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {students.links.length > 3 && (
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-center">
                                <div className="flex gap-1">
                                    {students.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${link.active
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </AuthenticatedLayout >
    );
}
