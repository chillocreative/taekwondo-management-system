import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function TrainingCentersIndex({ auth, trainingCenters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        address: '',
        contact_number: '',
        is_active: true,
    });

    const openModal = (center = null) => {
        if (center) {
            setEditingCenter(center);
            setData({
                name: center.name,
                address: center.address || '',
                contact_number: center.contact_number || '',
                is_active: center.is_active,
            });
        } else {
            setEditingCenter(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCenter(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCenter) {
            put(route('training-centers.update', editingCenter.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('training-centers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Adakah anda pasti mahu memadam pusat latihan ini?')) {
            destroy(route('training-centers.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Pengurusan Pusat Latihan
                </h2>
            }
        >
            <Head title="Pusat Latihan" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header with Add Button */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Senarai Pusat Latihan</h3>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium w-full sm:w-auto"
                        >
                            + Tambah Pusat Latihan
                        </button>
                    </div>

                    {/* Training Centers List - Desktop Table */}
                    <div className="hidden md:block bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Alamat
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Tindakan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-200">
                                    {trainingCenters.map((center) => (
                                        <tr key={center.id} className="hover:bg-zinc-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                {center.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-zinc-500">
                                                {center.address || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${center.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                                    }`}>
                                                    {center.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openModal(center)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(center.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Padam
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Training Centers List - Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {trainingCenters.map((center) => (
                            <div key={center.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-base font-bold text-zinc-900">{center.name}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${center.is_active
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                        }`}>
                                        {center.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-zinc-600 mb-4">
                                    {center.address && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-zinc-400 mt-0.5">📍</span>
                                            <span className="flex-1">{center.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-zinc-100">
                                    <button
                                        onClick={() => openModal(center)}
                                        className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(center.id)}
                                        className="flex-1 px-3 py-2 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Padam
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">
                            {editingCenter ? 'Edit Pusat Latihan' : 'Tambah Pusat Latihan'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Nama
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Alamat
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        rows="3"
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-zinc-700">
                                        Aktif
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
