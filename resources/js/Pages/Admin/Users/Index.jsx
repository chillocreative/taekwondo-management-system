import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Toast from '@/Components/Toast';

export default function UsersIndex({ auth, users, trainingCenters, filters, flash }) {
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email: '',
        address: '',
        role: 'user',
        password: '',
        password_confirmation: '',
    });

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
        router.get(route('admin.users.index'), {
            search,
            role: roleFilter,
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setRoleFilter('');
        router.get(route('admin.users.index'));
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            phone_number: '',
            email: '',
            address: '',
            role: 'user',
            password: '',
            password_confirmation: '',
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            phone_number: user.phone_number,
            email: user.email || '',
            address: user.address || '',
            role: user.role,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            router.patch(route('admin.users.update', editingUser.id), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setToast({ message: 'Pengguna berjaya dikemaskini', type: 'success' });
                }
            });
        } else {
            router.post(route('admin.users.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setToast({ message: 'Pengguna berjaya ditambah', type: 'success' });
                }
            });
        }
    };

    const handleDelete = (user) => {
        if (confirm(`Adakah anda pasti mahu memadam pengguna ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id), {
                onSuccess: () => {
                    setToast({ message: 'Pengguna berjaya dipadam', type: 'success' });
                }
            });
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-red-100 text-red-800',
            coach: 'bg-blue-100 text-blue-800',
            user: 'bg-green-100 text-green-800',
        };
        const labels = {
            admin: 'Admin',
            coach: 'Jurulatih',
            user: 'Pengguna',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role]}`}>
                {labels[role]}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Pengurusan Pengguna Sistem</h2>}
        >
            <Head title="Pengurusan Pengguna" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Senarai Pengguna</h1>
                            <p className="text-zinc-500 mt-1">Urus pengguna sistem (Admin, Jurulatih, Pengguna)</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            + Tambah Pengguna
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Cari Pengguna</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nama, telefon, atau email..."
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Peranan</label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">Semua Peranan</option>
                                        <option value="admin">Admin</option>
                                        <option value="coach">Jurulatih</option>
                                        <option value="user">Pengguna</option>
                                    </select>
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
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Telefon</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Peranan</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-100">
                                    {users.data && users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-zinc-50/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-600">
                                                    {user.phone_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                    {user.email || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getRoleBadge(user.role)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="text-blue-600 hover:text-blue-900 font-bold"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="text-red-600 hover:text-red-900 font-bold"
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
                                                <p className="font-medium">Tiada pengguna dijumpai.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links && users.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-zinc-600">
                                        Menunjukkan {users.from} hingga {users.to} daripada {users.total} rekod
                                    </div>
                                    <div className="flex gap-1">
                                        {users.links.map((link, k) => (
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-zinc-200">
                            <h3 className="text-xl font-bold text-zinc-900">
                                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Nama *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Nombor Telefon *</label>
                                <input
                                    type="text"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Alamat</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                    rows="2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Peranan *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="user">Pengguna</option>
                                    <option value="coach">Jurulatih</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            {!editingUser && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Kata Laluan *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                            required={!editingUser}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Sahkan Kata Laluan *</label>
                                        <input
                                            type="password"
                                            value={formData.password_confirmation}
                                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                            className="w-full rounded-lg border-zinc-300 focus:border-blue-500 focus:ring-blue-500"
                                            required={!editingUser}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                                >
                                    {editingUser ? 'Kemaskini' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
