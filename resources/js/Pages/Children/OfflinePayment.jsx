import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function OfflinePayment({ auth, child, yearlyFee, ageCategory }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        payment_slip: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('payment_slip', file);
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('children.payment.offline.submit', child.id));
    };

    const handleDownloadQR = () => {
        const link = document.createElement('a');
        link.href = '/images/duitnow-qr.png';
        link.download = 'Taekwondo-ANZ-DuitNow-QR.png';
        link.click();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-zinc-800 leading-tight">Pembayaran Offline</h2>}
        >
            <Head title="Pembayaran Offline" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            {/* Header */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Bayar Offline</h3>
                                <p className="text-zinc-600">Sila imbas kod QR di bawah untuk membuat pembayaran</p>
                            </div>

                            {/* Child Info */}
                            <div className="bg-zinc-50 rounded-lg p-6 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-zinc-500">Nama Peserta</p>
                                        <p className="text-base font-medium text-zinc-900">{child.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Pusat Latihan</p>
                                        <p className="text-base font-medium text-zinc-900">
                                            {child.training_center ? child.training_center.name : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Yuran Tahunan ({ageCategory})</p>
                                        <p className="text-2xl font-bold text-blue-600">RM {parseFloat(yearlyFee).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="mb-8">
                                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 text-center">
                                    <div className="bg-white rounded-xl p-6 inline-block">
                                        <img
                                            src="/images/duitnow-qr.png"
                                            alt="DuitNow QR Code"
                                            className="w-80 h-auto mx-auto"
                                        />
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={handleDownloadQR}
                                            className="px-6 py-3 bg-white text-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium inline-flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Muat Turun Kod QR
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                                <h4 className="font-bold text-blue-900 mb-3">Langkah-langkah Pembayaran:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                    <li>Imbas kod QR di atas menggunakan aplikasi perbankan anda</li>
                                    <li>Masukkan jumlah <strong>RM {parseFloat(yearlyFee).toFixed(2)}</strong></li>
                                    <li>Selesaikan pembayaran</li>
                                    <li>Ambil tangkapan skrin resit pembayaran</li>
                                    <li>Muat naik resit di bawah dan hantar</li>
                                </ol>
                            </div>

                            {/* Upload Section */}
                            <form onSubmit={handleSubmit}>
                                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 mb-6">
                                    <h4 className="font-bold text-zinc-900 mb-4">Muat Naik Resit Pembayaran</h4>

                                    <div className="mb-4">
                                        <label className="block">
                                            <span className="sr-only">Pilih fail</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-zinc-500
                                                    file:mr-4 file:py-3 file:px-6
                                                    file:rounded-lg file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100
                                                    cursor-pointer"
                                                required
                                            />
                                        </label>
                                        <p className="text-xs text-zinc-500 mt-2">Format: JPG, PNG, atau PDF (Maks: 5MB)</p>
                                        {errors.payment_slip && (
                                            <p className="text-red-500 text-sm mt-2">{errors.payment_slip}</p>
                                        )}
                                    </div>

                                    {/* Preview */}
                                    {previewUrl && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-zinc-700 mb-2">Pratonton:</p>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-w-md h-auto border border-zinc-200 rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => window.location.href = route('children.index')}
                                        className="flex-1 px-6 py-3 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.payment_slip}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Menghantar...' : 'Hantar Resit'}
                                    </button>
                                </div>
                            </form>

                            {/* Note */}
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    <strong>Nota:</strong> Selepas menghantar resit, sila tunggu kelulusan daripada admin.
                                    Peserta akan diaktifkan setelah pembayaran disahkan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
