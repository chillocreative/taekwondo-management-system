import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function ChildrenIndex({ auth, children, trainingCenters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChild, setEditingChild] = useState(null);

    const states = [
        "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
        "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
        "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan (Kuala Lumpur)",
        "Wilayah Persekutuan (Labuan)", "Wilayah Persekutuan (Putrajaya)"
    ];

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        training_center_id: '',
        name: '',
        date_of_birth: '',
        age: '',
        ic_number: '',
        belt_level: 'white',
        is_active: true,
        from_other_club: false,
        tm_number: '',
        belt_certificate: null,
        guardian_name: '',
        guardian_occupation: '',
        guardian_ic_number: '',
        guardian_age: '',
        guardian_phone: '',
        phone_number: '',
        address: '',
        postcode: '',
        city: '',
        state: '',
        school_name: '',
        school_class: '',
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

            // Calculate DOB from IC if possible
            let dob = child.date_of_birth || '';
            if (child.ic_number && child.ic_number.length >= 6) {
                const value = child.ic_number.replace(/\D/g, '');
                if (value.length >= 6) {
                    const year = value.substring(0, 2);
                    const month = value.substring(2, 4);
                    const day = value.substring(4, 6);

                    const currentYear = new Date().getFullYear();
                    const currentYearLastTwo = currentYear % 100;
                    const century = parseInt(year) > currentYearLastTwo ? '19' : '20';
                    const fullYear = century + year;

                    // Simple validation
                    const monthNum = parseInt(month);
                    const dayNum = parseInt(day);
                    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
                        dob = `${fullYear}-${month}-${day}`;
                    }
                }
            }

            setData({
                training_center_id: child.training_center_id || '',
                name: child.name,
                date_of_birth: dob,
                ic_number: child.ic_number || '',
                belt_level: child.belt_level,
                is_active: child.is_active,
                from_other_club: child.from_other_club || false,
                tm_number: child.tm_number || '',
                belt_certificate: null,
                guardian_name: child.guardian_name || '',
                guardian_occupation: child.guardian_occupation || '',
                guardian_ic_number: child.guardian_ic_number || '',
                guardian_age: child.guardian_age || '',
                guardian_phone: child.guardian_phone || '',
                phone_number: child.phone_number || '',
                address: child.address || '',
                postcode: child.postcode || '',
                city: child.city || '',
                state: child.state || '',
                school_name: child.school_name || '',
                school_class: child.school_class || '',
            });

            // Calculate child age on load
            if (child.ic_number) {
                const value = child.ic_number.replace(/\D/g, '').slice(0, 12);
                if (value.length >= 2) {
                    const year = parseInt(value.substring(0, 2));
                    const currentYear = new Date().getFullYear();
                    const currentYearLastTwo = currentYear % 100;
                    const fullYear = year > currentYearLastTwo ? 1900 + year : 2000 + year;
                    const age = currentYear - fullYear;
                    setData(prev => ({ ...prev, age: age }));
                }
            }
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

        console.log('=== FORM SUBMITTED ===');
        console.log('Current form data:', data);
        console.log('Editing child:', editingChild);

        if (editingChild) {
            // For updates with file, use router.post with _method
            if (data.belt_certificate) {
                router.post(route('children.update', editingChild.id), {
                    _method: 'PUT',
                    ...data,
                }, {
                    preserveScroll: true,
                    onSuccess: () => closeModal(),
                    onError: (errors) => {
                        console.error('Validation errors:', errors);
                    },
                });
            } else {
                put(route('children.update', editingChild.id), {
                    preserveScroll: true,
                    onSuccess: () => closeModal(),
                    onError: (errors) => {
                        console.error('Validation errors:', errors);
                    },
                });
            }
        } else {
            // For create, post handles files automatically
            post(route('children.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Adakah anda pasti mahu memadam peserta ini?')) {
            destroy(route('children.destroy', id));
        }
    };

    const handlePayment = (id) => {
        // Redirect directly to online payment (ToyyibPay)
        window.location.href = route('children.payment.online', id);
    };

    const getBeltLevelLabel = (value) => {
        return beltLevels.find(level => level.value === value)?.label || value;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Pengurusan Peserta
                </h2>
            }
        >
            <Head title="Nama Peserta" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header with Add Button */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-zinc-900">Nama Peserta</h3>
                        <button
                            onClick={() => openModal()}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium w-full sm:w-auto"
                        >
                            + Tambah Peserta
                        </button>
                    </div>

                    {/* Children Grid */}
                    {children.length === 0 ? (
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
                            <p className="text-zinc-500">Tiada peserta didaftarkan lagi.</p>
                            <button
                                onClick={() => openModal()}
                                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                            >
                                Tambah Peserta Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-zinc-200">
                                    <thead className="bg-zinc-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Nama
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                No. Keahlian
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Pusat Latihan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                No Kad Pengenalan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Kategori
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Status Keahlian
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Status Pembayaran
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Tindakan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-zinc-200">
                                        {children.map((child) => (
                                            <tr key={child.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-zinc-900">{child.name}</div>
                                                    <div className="text-xs text-zinc-500">{getBeltLevelLabel(child.belt_level)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-zinc-900">
                                                        {child.student ? child.student.no_siri : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-zinc-900">
                                                        {child.training_center ? child.training_center.name : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-zinc-900">
                                                        {child.ic_number || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-zinc-900">
                                                        {(() => {
                                                            if (!child.date_of_birth) return '-';
                                                            const birthDate = new Date(child.date_of_birth);
                                                            const today = new Date();
                                                            let age = today.getFullYear() - birthDate.getFullYear();
                                                            const monthDiff = today.getMonth() - birthDate.getMonth();
                                                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                                                age--;
                                                            }
                                                            const kategori = age < 18 ? 'Pelajar' : 'Dewasa';
                                                            return (
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${age < 18
                                                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                    }`}>
                                                                    {kategori}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${child.payment_completed
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                                                        }`}>
                                                        {child.payment_completed ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {child.payment_completed ? (
                                                        <div>
                                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                Sudah Bayar
                                                            </span>
                                                            {child.payment_method && (
                                                                <div className="text-xs text-zinc-500 mt-1">
                                                                    {child.payment_method === 'online' ? 'Online' : 'Offline'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : child.payment_method === 'offline' && child.payment_reference ? (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                            Menunggu Pengesahan
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                                                            Belum Bayar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        {child.belt_certificate && (
                                                            <a
                                                                href={`/storage/${child.belt_certificate}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 text-xs border border-green-300 bg-green-50 rounded-lg text-green-700 hover:bg-green-100 transition-colors"
                                                                title="Lihat Sijil"
                                                            >
                                                                📄 Sijil
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => openModal(child)}
                                                            className="px-3 py-1.5 text-xs border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        {!child.payment_completed && (
                                                            <button
                                                                onClick={() => handlePayment(child.id)}
                                                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                            >
                                                                Bayar
                                                            </button>
                                                        )}
                                                    </div>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">
                            {editingChild ? 'Edit Maklumat Peserta' : 'Tambah Peserta Baru'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* MAKLUMAT WARIS */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-zinc-900 border-b border-zinc-200 pb-2">MAKLUMAT WARIS</h4>

                                    {/* Nama Waris */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Nama Waris
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guardian_name}
                                            onChange={(e) => setData('guardian_name', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                            required
                                        />
                                        {errors.guardian_name && <p className="text-red-500 text-xs mt-1">{errors.guardian_name}</p>}
                                    </div>

                                    {/* Pekerjaan */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Pekerjaan
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guardian_occupation}
                                            onChange={(e) => setData('guardian_occupation', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                        />
                                    </div>

                                    {/* No Kad Pengenalan Waris */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            No Kad Pengenalan
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guardian_ic_number}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                let age = data.guardian_age;

                                                if (value.length >= 2) {
                                                    const year = parseInt(value.substring(0, 2));
                                                    const currentYear = new Date().getFullYear();
                                                    const currentYearLastTwo = currentYear % 100;
                                                    const fullYear = year > currentYearLastTwo ? 1900 + year : 2000 + year;
                                                    age = currentYear - fullYear;
                                                }

                                                setData(prev => ({
                                                    ...prev,
                                                    guardian_ic_number: value,
                                                    guardian_age: age
                                                }));
                                            }}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: 811010011234"
                                            maxLength="12"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">12 digit sahaja, tanpa simbol (Umur akan dikira automatik)</p>
                                    </div>

                                    {/* Umur */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Umur
                                        </label>
                                        <input
                                            type="number"
                                            value={data.guardian_age}
                                            onChange={(e) => setData('guardian_age', e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            readOnly
                                        />
                                    </div>

                                    {/* No Telefon Waris */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            No Telefon
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.guardian_phone}
                                            onChange={(e) => setData('guardian_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: 0123456789"
                                            maxLength="11"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">Nombor sahaja, maksimum 11 digit</p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <hr className="border-4 border-zinc-100" />

                                {/* MAKLUMAT PESERTA */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-zinc-900 border-b border-zinc-200 pb-2">MAKLUMAT PESERTA</h4>

                                    {/* Nama Penuh */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Nama Penuh
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    {/* No Kad Pengenalan & Umur & Tarikh Lahir */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* No Kad Pengenalan & Umur & Tarikh Lahir */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="col-span-3">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                        No Kad Pengenalan
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.ic_number}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                            let dob = data.date_of_birth;
                                                            let age = data.age;

                                                            if (value.length >= 6) {
                                                                const year = parseInt(value.substring(0, 2));
                                                                const month = value.substring(2, 4);
                                                                const day = value.substring(4, 6);

                                                                // Determine century
                                                                const currentYear = new Date().getFullYear();
                                                                const currentYearLastTwo = currentYear % 100;
                                                                const fullYear = year > currentYearLastTwo ? 1900 + year : 2000 + year;

                                                                if (!isNaN(fullYear) && parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
                                                                    dob = `${fullYear}-${month}-${day}`;
                                                                    age = currentYear - fullYear;
                                                                }
                                                            }

                                                            setData(prev => ({
                                                                ...prev,
                                                                ic_number: value,
                                                                date_of_birth: dob,
                                                                age: age
                                                            }));
                                                        }}
                                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Contoh: 150101011234"
                                                        maxLength="12"
                                                    />
                                                    <p className="text-xs text-zinc-500 mt-1">12 digit sahaja, tanpa simbol</p>
                                                    {errors.ic_number && <p className="text-red-500 text-xs mt-1">{errors.ic_number}</p>}
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                        Umur
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={data.age}
                                                        onChange={(e) => setData('age', e.target.value)}
                                                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-50"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                    Tarikh Lahir
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-50 cursor-not-allowed"
                                                    readOnly
                                                />
                                                <p className="text-xs text-zinc-500 mt-1">automatik mengikut no kad pengenalan</p>
                                            </div>
                                        </div>

                                    </div>
                                    {/* No Telefon Child */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-zinc-700">
                                                No Telefon
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setData('phone_number', data.guardian_phone);
                                                        } else {
                                                            setData('phone_number', '');
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-xs text-zinc-500">Sama seperti waris</span>
                                            </label>
                                        </div>
                                        <input
                                            type="tel"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Contoh: 0123456789"
                                            maxLength="11"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">Nombor sahaja, maksimum 11 digit</p>
                                    </div>

                                    {/* Alamat Rumah */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Alamat Rumah
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none uppercase"
                                        ></textarea>
                                    </div>

                                    {/* Postcode, City, State */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                Poskod
                                            </label>
                                            <input
                                                type="text"
                                                value={data.postcode}
                                                onChange={(e) => setData('postcode', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                Bandar
                                            </label>
                                            <input
                                                type="text"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value.toUpperCase())}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                Negeri
                                            </label>
                                            <select
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Pilih Negeri</option>
                                                {states.map((state) => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Nama Sekolah */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Nama Sekolah
                                        </label>
                                        <input
                                            type="text"
                                            value={data.school_name}
                                            onChange={(e) => setData('school_name', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                        />
                                    </div>

                                    {/* Kelas */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Kelas
                                        </label>
                                        <input
                                            type="text"
                                            value={data.school_class}
                                            onChange={(e) => setData('school_class', e.target.value.toUpperCase())}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                        />
                                    </div>

                                    {/* Pusat Latihan */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                                            Pusat Latihan
                                        </label>
                                        <select
                                            value={data.training_center_id}
                                            onChange={(e) => setData('training_center_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Pilih Pusat Latihan</option>
                                            {trainingCenters.map((center) => (
                                                <option key={center.id} value={center.id}>
                                                    {center.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.training_center_id && <p className="text-red-500 text-xs mt-1">{errors.training_center_id}</p>}
                                    </div>

                                    {/* From Other Club Section */}
                                    <div className="pt-4 border-t border-zinc-200">
                                        <label className="block text-sm font-medium text-zinc-700 mb-3">
                                            Adakah anda dari kelab lain?
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="from_other_club"
                                                    checked={data.from_other_club === true}
                                                    onChange={() => setData('from_other_club', true)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300"
                                                />
                                                <span className="ml-2 text-sm text-zinc-700">Ya</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="from_other_club"
                                                    checked={data.from_other_club === false}
                                                    onChange={() => {
                                                        setData(prev => ({ ...prev, from_other_club: false, belt_level: 'white' }));
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-300"
                                                />
                                                <span className="ml-2 text-sm text-zinc-700">Tidak</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Conditional fields when from other club */}
                                    {data.from_other_club && (
                                        <div className="space-y-4 pl-4 border-l-2 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
                                            {/* Tahap Tali Pinggang */}
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

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-1">
                                                    Isikan No. TM
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.tm_number}
                                                    onChange={(e) => setData('tm_number', e.target.value)}
                                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                                    placeholder="Masukkan No. TM"
                                                />
                                                {errors.tm_number && <p className="text-red-500 text-xs mt-1">{errors.tm_number}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                    Upload sijil ujian tali pinggang terkini
                                                </label>

                                                {editingChild && editingChild.belt_certificate && (
                                                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-600">📄</span>
                                                                <span className="text-sm text-green-700 font-medium">Sijil Sedia Ada</span>
                                                            </div>
                                                            <a
                                                                href={`/storage/${editingChild.belt_certificate}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                            >
                                                                Lihat Sijil
                                                            </a>
                                                        </div>
                                                        <p className="text-xs text-green-600 mt-1">Upload fail baru untuk menggantikan sijil sedia ada</p>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    onChange={(e) => setData('belt_certificate', e.target.files[0])}
                                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    accept="image/*,.pdf"
                                                />
                                                <p className="text-xs text-zinc-500 mt-1">Format: JPG, PNG, atau PDF (Maks: 2MB)</p>
                                                {errors.belt_certificate && <p className="text-red-500 text-xs mt-1">{errors.belt_certificate}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
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
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
