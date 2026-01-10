import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, children }) {
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
                        <p className="text-gray-500 mt-1">Sila muat turun penyata tahunan mengikut nama peserta di bawah.</p>
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
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Nama Peserta
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Download Penyata Tahunan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {children.map((child) => (
                                            <tr key={child.id} className="hover:bg-blue-50/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{child.name}</span>
                                                        <span className="text-xs text-gray-500">{child.no_siri}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <a
                                                        href={route('annual-statement.download', child.id)}
                                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition duration-200 shadow-lg shadow-blue-100"
                                                    >
                                                        <span>📥</span>
                                                        <span>Download</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
