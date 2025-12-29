import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ChildrenIndex({ auth, children }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChild, setEditingChild] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        date_of_birth: '',
        ic_number: '',
        belt_level: 'white',
        is_active: true,
    });

    const beltLevels = [
        { value: 'white', label: 'Putih' },
        { value: 'yellow', label: 'Kuning' },
        { value: 'green', label: 'Hijau' },
        { value: 'blue', label: 'Biru' },
        { value: 'red', label: 'Merah' },
        { value: 'black_1', label: 'Hitam 1 Dan' },
        { value: 'black_2', label: 'Hitam 2 Dan' },
        { value: 'black_3', label: 'Hitam 3 Dan' },
        { value: 'black_4', label: 'Hitam 4 Dan' },
        { value: 'black_5', label: 'Hitam 5 Dan' },
    ];

    const openModal = (child = null) => {
        if (child) {
            setEditingChild(child);
            setData({
                name: child.name,
                date_of_birth: child.date_of_birth || '',
                ic_number: child.ic_number || '',
                belt_level: child.belt_level,
                is_active: child.is_active,
            });
        } else {
            setEditingChild(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingChild(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingChild) {
            put(route('children.update', editingChild.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('children.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Adakah anda pasti mahu memadam anak ini?')) {
            destroy(route('children.destroy', id));
        }
    };

    const getBeltLevelLabel = (value) => {
        return beltLevels.find(level => level.value === value)?.label || value;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Pengurusan Anak
                </h2>
            }
        >
            <Head title="Anak-Anak Saya" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header with Add Button */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Anak-Anak Saya</h3>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium w-full sm:w-auto"
                        >
                            + Tambah Anak
                        </button>
                    </div>

                    {/* Children Grid */}
                    {children.length === 0 ? (
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
                            <p className="text-zinc-500">Tiada anak didaftarkan lagi.</p>
                            <button
                                onClick={() => openModal()}
                                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                            >
                                Tambah Anak Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {children.map((child) => (
                                <div key={child.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 hover:border-zinc-300 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-lg font-bold text-zinc-900">{child.name}</h4>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${child.is_active
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                            }`}>
                                            {child.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-zinc-600 mb-4">
                                        {child.date_of_birth && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-400">📅</span>
                                                <span>{new Date(child.date_of_birth).toLocaleDateString('ms-MY')}</span>
                                            </div>
                                        )}
                                        {child.ic_number && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-400">🆔</span>
                                                <span>{child.ic_number}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400">🥋</span>
                                            <span className="font-medium">{getBeltLevelLabel(child.belt_level)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-zinc-100">
                                        <button
                                            onClick={() => openModal(child)}
                                            className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(child.id)}
                                            className="flex-1 px-3 py-2 text-sm border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Padam
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">
                            {editingChild ? 'Edit Maklumat Anak' : 'Tambah Anak Baru'}
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
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Tarikh Lahir
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        No. Kad Pengenalan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.ic_number}
                                        onChange={(e) => setData('ic_number', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Contoh: 120101-01-1234"
                                    />
                                    {errors.ic_number && <p className="text-red-500 text-xs mt-1">{errors.ic_number}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Tahap Tali Pinggang
                                    </label>
                                    <select
                                        value={data.belt_level}
                                        onChange={(e) => setData('belt_level', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {beltLevels.map((level) => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.belt_level && <p className="text-red-500 text-xs mt-1">{errors.belt_level}</p>}
                                </div>

                                {editingChild && (
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
                                )}
                            </div>

                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
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
