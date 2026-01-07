import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const MONTHS = [
    'JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN',
    'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'
];

export default function Edit({ auth, student, trainingCenters, currentYear }) {
    const { data, setData, put, processing, errors } = useForm({
        // Student/Child Info
        training_center_id: student.child?.training_center_id || '',
        nama_pelajar: student.nama_pelajar || '',
        date_of_birth: student.child?.date_of_birth || '',
        age: student.child?.age || '',
        ic_number: student.child?.ic_number || '',
        belt_level: student.child?.belt_level || 'white',
        tm_number: student.child?.tm_number || '',

        // Guardian Info
        nama_penjaga: student.nama_penjaga || '',
        guardian_occupation: student.child?.guardian_occupation || '',
        guardian_ic_number: student.child?.guardian_ic_number || '',
        guardian_age: student.child?.guardian_age || '',
        guardian_phone: student.child?.guardian_phone || '',

        // Address & Other
        alamat: student.alamat || '',
        no_tel: student.no_tel || '', // This is the child's phone in Child model sometimes, but synced to no_tel in Student
        phone_number: student.child?.phone_number || '',
        postcode: student.child?.postcode || '',
        city: student.child?.city || '',
        state: student.child?.state || '',
        school_name: student.child?.school_name || '',
        school_class: student.child?.school_class || '',

        // Derived
        kategori: student.kategori || 'kanak-kanak',
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

    const states = [
        "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
        "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
        "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan (Kuala Lumpur)",
        "Wilayah Persekutuan (Labuan)", "Wilayah Persekutuan (Putrajaya)"
    ];

    const handleICChange = (value) => {
        const ic = value.replace(/\D/g, '').slice(0, 12);
        let dob = data.date_of_birth;
        let age = data.age;

        if (ic.length >= 6) {
            const yearStr = ic.substring(0, 2);
            const monthStr = ic.substring(2, 4);
            const dayStr = ic.substring(4, 6);

            const yearPrefix = parseInt(yearStr) > (new Date().getFullYear() % 100) ? '19' : '20';
            const fullYear = yearPrefix + yearStr;

            if (parseInt(monthStr) >= 1 && parseInt(monthStr) <= 12 && parseInt(dayStr) >= 1 && parseInt(dayStr) <= 31) {
                dob = `${fullYear}-${monthStr}-${dayStr}`;
                age = new Date().getFullYear() - parseInt(fullYear);
            }
        }

        setData(prev => ({
            ...prev,
            ic_number: ic,
            date_of_birth: dob,
            age: age,
            kategori: age < 18 ? 'kanak-kanak' : 'dewasa'
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('students.update', student.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Maklumat Pelajar</h2>}
        >
            <Head title="Edit Pelajar" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* MAKLUMAT WARIS */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                            <span>👤</span> MAKLUMAT WARIS
                                        </h3>

                                        <div>
                                            <InputLabel htmlFor="nama_penjaga" value="Nama Waris *" />
                                            <TextInput
                                                id="nama_penjaga"
                                                type="text"
                                                className="mt-1 block w-full uppercase"
                                                value={data.nama_penjaga}
                                                onChange={(e) => setData('nama_penjaga', e.target.value.toUpperCase())}
                                                required
                                            />
                                            <InputError message={errors.nama_penjaga} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="guardian_occupation" value="Pekerjaan" />
                                            <TextInput
                                                id="guardian_occupation"
                                                type="text"
                                                className="mt-1 block w-full uppercase"
                                                value={data.guardian_occupation}
                                                onChange={(e) => setData('guardian_occupation', e.target.value.toUpperCase())}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="guardian_ic_number" value="IC Waris" />
                                                <TextInput
                                                    id="guardian_ic_number"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.guardian_ic_number}
                                                    onChange={(e) => setData('guardian_ic_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
                                                    placeholder="810101011234"
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="guardian_age" value="Umur Waris" />
                                                <TextInput
                                                    id="guardian_age"
                                                    type="number"
                                                    className="mt-1 block w-full bg-gray-50"
                                                    value={data.guardian_age}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="guardian_phone" value="No. Telefon Waris" />
                                            <TextInput
                                                id="guardian_phone"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.guardian_phone}
                                                onChange={(e) => setData('guardian_phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                                placeholder="0123456789"
                                            />
                                        </div>
                                    </div>

                                    {/* MAKLUMAT PESERTA */}
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                            <span>🥋</span> MAKLUMAT PESERTA
                                        </h3>

                                        <div>
                                            <InputLabel htmlFor="nama_pelajar" value="Nama Penuh *" />
                                            <TextInput
                                                id="nama_pelajar"
                                                type="text"
                                                className="mt-1 block w-full uppercase"
                                                value={data.nama_pelajar}
                                                onChange={(e) => setData('nama_pelajar', e.target.value.toUpperCase())}
                                                required
                                            />
                                            <InputError message={errors.nama_pelajar} className="mt-2" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="ic_number" value="No. IC *" />
                                                <TextInput
                                                    id="ic_number"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.ic_number}
                                                    onChange={(e) => handleICChange(e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.ic_number} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="age" value="Umur" />
                                                <TextInput
                                                    id="age"
                                                    type="number"
                                                    className="mt-1 block w-full bg-gray-50"
                                                    value={data.age}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="date_of_birth" value="Tarikh Lahir" />
                                                <TextInput
                                                    id="date_of_birth"
                                                    type="date"
                                                    className="mt-1 block w-full bg-gray-50"
                                                    value={data.date_of_birth}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="belt_level" value="Tali Pinggang *" />
                                                <select
                                                    id="belt_level"
                                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                    value={data.belt_level}
                                                    onChange={(e) => setData('belt_level', e.target.value)}
                                                    required
                                                >
                                                    {beltLevels.map(lvl => (
                                                        <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="training_center_id" value="Pusat Latihan *" />
                                            <select
                                                id="training_center_id"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={data.training_center_id}
                                                onChange={(e) => setData('training_center_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Pilih Pusat Latihan</option>
                                                {trainingCenters.map(center => (
                                                    <option key={center.id} value={center.id}>{center.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.training_center_id} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="tm_number" value="No. TM (Jika ada)" />
                                            <TextInput
                                                id="tm_number"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.tm_number}
                                                onChange={(e) => setData('tm_number', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-4 border-gray-50 mb-8" />

                                {/* ALAMAT & SEKOLAH */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                            <span>📍</span> LOKASI & HUBUNGAN
                                        </h3>
                                        <div>
                                            <InputLabel htmlFor="alamat" value="Alamat *" />
                                            <textarea
                                                id="alamat"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm resize-y"
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                rows="3"
                                                required
                                            />
                                            <InputError message={errors.alamat} className="mt-2" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <InputLabel htmlFor="postcode" value="Poskod" />
                                                <TextInput
                                                    id="postcode"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.postcode}
                                                    onChange={(e) => setData('postcode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="city" value="Bandar" />
                                                <TextInput
                                                    id="city"
                                                    type="text"
                                                    className="mt-1 block w-full uppercase"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value.toUpperCase())}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="state" value="Negeri" />
                                            <select
                                                id="state"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                            >
                                                <option value="">Pilih Negeri</option>
                                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="phone_number" value="No. Telefon Peserta (Jika ada)" />
                                            <TextInput
                                                id="phone_number"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.phone_number}
                                                onChange={(e) => setData('phone_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-lg text-gray-800 border-b pb-2 flex items-center gap-2">
                                            <span>🏫</span> MAKLUMAT SEKOLAH
                                        </h3>
                                        <div>
                                            <InputLabel htmlFor="school_name" value="Nama Sekolah" />
                                            <TextInput
                                                id="school_name"
                                                type="text"
                                                className="mt-1 block w-full uppercase"
                                                value={data.school_name}
                                                onChange={(e) => setData('school_name', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="school_class" value="Kelas" />
                                            <TextInput
                                                id="school_class"
                                                type="text"
                                                className="mt-1 block w-full uppercase"
                                                value={data.school_class}
                                                onChange={(e) => setData('school_class', e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Online Payment Status (Read-Only) */}
                                {student.child && (
                                    <div className="mb-12">
                                        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <span>💳</span> Status Bayaran Online (Tahun {currentYear})
                                        </h3>
                                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r">Bulan</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r">Status</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider border-r">Tarikh Bayaran</th>
                                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Resit</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {student.child.monthly_payments?.map((payment, idx) => (
                                                        <tr key={idx} className={payment.is_paid ? 'bg-green-50/20' : ''}>
                                                            <td className="px-6 py-4 text-sm text-gray-900 font-bold border-r">{MONTHS[payment.month - 1]}</td>
                                                            <td className="px-6 py-4 text-center border-r">
                                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${payment.is_paid
                                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                                    : 'bg-red-50 text-red-600 border border-red-100'
                                                                    }`}>
                                                                    {payment.is_paid ? 'SUDAH DIBAYAR' : 'TERTUNGGAK'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500 text-right border-r">
                                                                {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('ms-MY') : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {payment.is_paid && payment.receipt_number ? (
                                                                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                                        {payment.receipt_number}
                                                                    </span>
                                                                ) : <span className="text-gray-400">-</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!student.child.monthly_payments || student.child.monthly_payments.length === 0) && (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                                                Tiada rekod pembayaran online dijumpai untuk tahun ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                    <Link
                                        href={route('students.index')}
                                        className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2 transition"
                                    >
                                        ← Kembali ke Senarai
                                    </Link>
                                    <div className="flex gap-3">
                                        <PrimaryButton disabled={processing} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                                            {processing ? 'Menyimpan...' : '💾 Simpan Perubahan'}
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
