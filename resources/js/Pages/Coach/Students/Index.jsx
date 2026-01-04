import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, students, filters, stats }) {
    const [search, setSearch] = useState(filters.search || '');
    const [kategori, setKategori] = useState(filters.kategori || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('coach.students.index'), { search, kategori }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">Senarai Pelajar</h2>}
        >
            <Head title="Senarai Pelajar" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Senarai Pelajar</h1>
                            <p className="text-gray-500 mt-1">Lihat maklumat pelajar dan status pembayaran.</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-lg">
                            👁️ Mod Lihat Sahaja
                        </span>
                    </div>

                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Total Students */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
                                    <span className="text-3xl">👥</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Jumlah Pelajar</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>

                            {/* Paid Students */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-green-50 rounded-xl text-green-600">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Selesai Bayaran (12 Bulan)</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                                </div>
                            </div>

                            {/* Pending Payments */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                                <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
                                    <span className="text-3xl">⏳</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Bayaran Tertunggak</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="md:col-span-5">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Carian</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari nama, no. keahlian, penjaga..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition duration-200"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select
                                    value={kategori}
                                    onChange={(e) => setKategori(e.target.value)}
                                    className="block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition duration-200"
                                >
                                    <option value="">Semua Kategori</option>
                                    <option value="kanak-kanak">Kanak-kanak</option>
                                    <option value="dewasa">Dewasa</option>
                                </select>
                            </div>
                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl transition duration-200 shadow-md"
                                >
                                    Tapis Hasil
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Students Table Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No. Keahlian</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pelajar</th>
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
                                                    <Link
                                                        href={route('coach.students.show', student.id)}
                                                        className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {student.no_siri}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{student.nama_pelajar}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{student.nama_penjaga}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.kategori === 'kanak-kanak'
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                        }`}>
                                                        {student.kategori === 'kanak-kanak' ? 'Kanak-kanak' : 'Dewasa'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${student.status_bayaran >= 12 ? 'bg-green-500' :
                                                            student.status_bayaran >= 6 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`}></div>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {student.status_bayaran}/12 bulan
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        href={route('coach.students.show', student.id)}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition inline-block"
                                                        title="Lihat"
                                                    >
                                                        👁️ Lihat
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
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
            </div>
        </AuthenticatedLayout>
    );
}
