import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const MONTHS = [
    'JANUARI 2025',
    'FEBRUARI 2025',
    'MAC 2025',
    'APRIL 2025',
    'MEI 2025',
    'JUN 2025',
    'JULAI 2025',
    'OGOS 2025',
    'SEPTEMBER 2025',
    'OKTOBER 2025',
    'NOVEMBER 2025',
    'DISEMBER 2025'
];

export default function Edit({ auth, student }) {
    // Helper to find payment for a specific month
    const findPayment = (month) => {
        return student.payments?.find(p => p.month === month);
    };

    // Initialize quantities from payments or status_bayaran (fallback)
    const initialQuantities = MONTHS.map((month, index) => {
        const payment = findPayment(month);
        if (payment) return payment.quantity;
        return index < student.status_bayaran ? 1 : 0;
    });

    // Initialize kategori from payments or student's main kategori (fallback)
    const initialKategoris = MONTHS.map((month) => {
        const payment = findPayment(month);
        if (payment) return payment.kategori;
        return student.kategori || 'kanak-kanak';
    });

    const [quantities, setQuantities] = useState(initialQuantities);
    const [kategoris, setKategoris] = useState(initialKategoris);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Form data state
    const [formData, setFormData] = useState({
        nama_pelajar: student.nama_pelajar || '',
        nama_penjaga: student.nama_penjaga || '',
        alamat: student.alamat || '',
        no_tel: student.no_tel || '',
    });

    // Get price based on kategori for a specific row
    const getPrice = (index) => {
        return kategoris[index] === 'kanak-kanak' ? 30 : 50;
    };

    // Calculate total from all rows
    const calculateTotal = () => {
        return quantities.reduce((sum, qty, index) => {
            return sum + (qty * getPrice(index));
        }, 0);
    };

    // Calculate status_bayaran from quantities
    const getStatusBayaran = () => {
        return quantities.filter(qty => qty > 0).length;
    };

    // Get main kategori based on most common selection
    const getMainKategori = () => {
        const activeKategoris = kategoris.filter((_, i) => quantities[i] > 0);
        if (activeKategoris.length > 0) {
            const kanakCount = activeKategoris.filter(k => k === 'kanak-kanak').length;
            const dewasaCount = activeKategoris.filter(k => k === 'dewasa').length;
            return kanakCount >= dewasaCount ? 'kanak-kanak' : 'dewasa';
        }
        return student.kategori || 'kanak-kanak';
    };

    const handleQuantityChange = (index, value) => {
        // Only allow digits and max 2 digits
        const numValue = value.replace(/\D/g, '').slice(0, 2);
        const newQuantities = [...quantities];
        newQuantities[index] = parseInt(numValue) || 0;
        setQuantities(newQuantities);
    };

    const handleKategoriChange = (index, value) => {
        const newKategoris = [...kategoris];
        newKategoris[index] = value;
        setKategoris(newKategoris);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Build payment details array
        const paymentDetails = MONTHS.map((month, index) => ({
            month: month,
            kategori: kategoris[index],
            quantity: quantities[index],
            amount: getPrice(index),
            total: quantities[index] * getPrice(index)
        }));

        // Build the complete data object at submission time
        const submitData = {
            nama_pelajar: formData.nama_pelajar,
            nama_penjaga: formData.nama_penjaga,
            alamat: formData.alamat,
            no_tel: formData.no_tel,
            kategori: getMainKategori(),
            status_bayaran: getStatusBayaran(),
            payment_details: paymentDetails,
        };

        router.put(route('students.update', student.id), submitData, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Pelajar</h2>}
        >
            <Head title="Edit Pelajar" />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit}>
                                {/* Student Info Section */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 uppercase">
                                                {formData.nama_pelajar || 'Nama Pelajar'}
                                            </h2>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">No Siri:</div>
                                            <div className="text-xl font-bold">{student.no_siri}</div>
                                        </div>
                                    </div>

                                    {/* Row 1: Nama Pelajar and No. Telefon */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <InputLabel htmlFor="nama_pelajar" value="Nama Pelajar *" />
                                            <TextInput
                                                id="nama_pelajar"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={formData.nama_pelajar}
                                                onChange={(e) => handleInputChange('nama_pelajar', e.target.value.toUpperCase())}
                                                required
                                            />
                                            <InputError message={errors.nama_pelajar} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="no_tel" value="No. Telefon *" />
                                            <TextInput
                                                id="no_tel"
                                                type="text"
                                                inputMode="numeric"
                                                className="mt-1 block w-full"
                                                value={formData.no_tel}
                                                onChange={(e) => handleInputChange('no_tel', e.target.value.replace(/\D/g, ''))}
                                                required
                                                placeholder="Contoh: 0123456789"
                                            />
                                            <InputError message={errors.no_tel} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Row 2: Nama Penjaga (full width) */}
                                    <div className="mb-4">
                                        <InputLabel htmlFor="nama_penjaga" value="Nama Penjaga *" />
                                        <TextInput
                                            id="nama_penjaga"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={formData.nama_penjaga}
                                            onChange={(e) => handleInputChange('nama_penjaga', e.target.value.toUpperCase())}
                                            required
                                        />
                                        <InputError message={errors.nama_penjaga} className="mt-2" />
                                    </div>

                                    {/* Row 3: Alamat (full width, expandable textarea) */}
                                    <div className="mb-4">
                                        <InputLabel htmlFor="alamat" value="Alamat *" />
                                        <textarea
                                            id="alamat"
                                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm resize-y"
                                            value={formData.alamat}
                                            onChange={(e) => handleInputChange('alamat', e.target.value)}
                                            rows="3"
                                            style={{ minHeight: '80px' }}
                                            required
                                        />
                                        <InputError message={errors.alamat} className="mt-2" />
                                    </div>
                                </div>

                                {/* Payment Table Section */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Butiran Pembayaran</h3>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-blue-500">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                                                        Butiran Pembayaran
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                        Kategori
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                        Jumlah Bayaran
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                                                        Kuantiti
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {MONTHS.map((month, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {month}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                                            <select
                                                                value={kategoris[index]}
                                                                onChange={(e) => handleKategoriChange(index, e.target.value)}
                                                                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="kanak-kanak">Kanak-kanak</option>
                                                                <option value="dewasa">Dewasa</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                            RM{getPrice(index).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength="2"
                                                                value={quantities[index] || ''}
                                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                className="w-12 text-center border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                placeholder=""
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                            RM{(quantities[index] * getPrice(index)).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="w-64">
                                            <div className="flex justify-between py-2 border-b">
                                                <span className="font-semibold text-gray-600">SUBTOTAL</span>
                                                <span className="font-semibold">RM {calculateTotal().toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="font-bold text-gray-800">TOTAL</span>
                                                <span className="font-bold text-gray-800">RM {calculateTotal().toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Debug info - hidden */}
                                <input type="hidden" name="status_bayaran" value={getStatusBayaran()} />
                                <input type="hidden" name="kategori" value={getMainKategori()} />

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Link
                                        href={route('students.index')}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                    >
                                        ← Kembali
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Mengemaskini...' : '💾 Kemaskini'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
