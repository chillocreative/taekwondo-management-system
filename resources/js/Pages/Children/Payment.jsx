import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Payment({ auth, child }) {
    const handleOnlinePayment = () => {
        window.location.href = route('children.payment.online', child.id);
    };

    const handleOfflinePayment = () => {
        if (confirm('Adakah anda pasti mahu membuat pembayaran offline? Sila tunggu kelulusan admin selepas membuat pembayaran.')) {
            router.post(route('children.payment.offline', child.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-zinc-800 leading-tight">Pembayaran Yuran Pendaftaran</h2>}
        >
            <Head title="Pembayaran" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            {/* Participant Info */}
                            <div className="mb-8 pb-6 border-b border-zinc-200">
                                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Maklumat Peserta</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-zinc-500">Nama</p>
                                        <p className="text-base font-medium text-zinc-900">{child.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">No. Kad Pengenalan</p>
                                        <p className="text-base font-medium text-zinc-900">{child.ic_number || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Pusat Latihan</p>
                                        <p className="text-base font-medium text-zinc-900">
                                            {child.training_center ? child.training_center.name : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500">Yuran Pendaftaran</p>
                                        <p className="text-2xl font-bold text-blue-600">RM 50.00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-4">Pilih Kaedah Pembayaran</h3>
                                <p className="text-sm text-zinc-600 mb-6">
                                    Sila pilih kaedah pembayaran yang sesuai untuk yuran pendaftaran peserta.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Online Payment */}
                                    <div className="border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 transition-colors cursor-pointer bg-blue-50"
                                        onClick={handleOnlinePayment}>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-bold text-zinc-900 mb-2">Bayar Online</h4>
                                            <p className="text-sm text-zinc-600 mb-4">
                                                Pembayaran melalui FPX menggunakan ToyyibPay
                                            </p>
                                            <ul className="text-xs text-zinc-500 mb-4 space-y-1 text-left w-full">
                                                <li>✓ Proses segera</li>
                                                <li>✓ Peserta diaktifkan automatik</li>
                                                <li>✓ Resit digital</li>
                                            </ul>
                                            <button
                                                onClick={handleOnlinePayment}
                                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                            >
                                                Teruskan ke ToyyibPay
                                            </button>
                                        </div>
                                    </div>

                                    {/* Offline Payment */}
                                    <div className="border-2 border-zinc-200 rounded-xl p-6 hover:border-zinc-400 transition-colors cursor-pointer"
                                        onClick={handleOfflinePayment}>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-16 h-16 bg-zinc-600 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-bold text-zinc-900 mb-2">Bayar Offline</h4>
                                            <p className="text-sm text-zinc-600 mb-4">
                                                Pembayaran tunai atau pindahan bank
                                            </p>
                                            <ul className="text-xs text-zinc-500 mb-4 space-y-1 text-left w-full">
                                                <li>⏳ Menunggu kelulusan admin</li>
                                                <li>⏳ Proses manual</li>
                                                <li>⏳ Sila hubungi admin</li>
                                            </ul>
                                            <button
                                                onClick={handleOfflinePayment}
                                                className="w-full px-6 py-3 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
                                            >
                                                Hantar Permohonan
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Back Button */}
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => window.location.href = route('children.index')}
                                        className="text-zinc-600 hover:text-zinc-900 text-sm font-medium"
                                    >
                                        ← Kembali ke Senarai Peserta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
