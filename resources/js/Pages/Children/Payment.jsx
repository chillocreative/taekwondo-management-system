import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Payment({ auth, child, yearlyFee, monthlyFee, totalAmount, currentMonth, ageCategory }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ms-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const handlePayment = () => {
        window.location.href = route('children.payment.online', child.id);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('children.index')}
                        className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                        Pengesahan Pembayaran
                    </h2>
                </div>
            }
        >
            <Head title="Pengesahan Pembayaran" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-2xl px-4 sm:px-6">
                    {/* Participant Info Card */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h3 className="text-lg font-bold text-white">Maklumat Peserta</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500">Nama</p>
                                    <p className="text-lg font-semibold text-zinc-900">{child.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Kategori</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        {ageCategory}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">Pusat Latihan</p>
                                    <p className="font-medium text-zinc-900">
                                        {child.training_center?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500">No. Kad Pengenalan</p>
                                    <p className="font-medium text-zinc-900">{child.ic_number || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details Card */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                            <h3 className="text-lg font-bold text-white">Butiran Pembayaran</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Yuran Tahunan */}
                            <div className="flex items-center justify-between py-4 border-b border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-xl">📅</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-900">Yuran Tahunan</p>
                                        <p className="text-sm text-zinc-500">Yuran pendaftaran tahunan</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-zinc-900">{formatCurrency(yearlyFee)}</p>
                            </div>

                            {/* Yuran Bulanan */}
                            <div className="flex items-center justify-between py-4 border-b border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-xl">📆</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-zinc-900">Yuran Bulanan</p>
                                        <p className="text-sm text-zinc-500">Bulan {currentMonth}</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-zinc-900">{formatCurrency(monthlyFee)}</p>
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-4 -mx-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <span className="text-xl text-white">💰</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900 text-lg">Jumlah Keseluruhan</p>
                                        <p className="text-sm text-zinc-500">Termasuk semua yuran</p>
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">💡</span>
                            <div>
                                <p className="font-medium text-amber-800">Nota Pembayaran</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Pembayaran akan diproses melalui ToyyibPay. Sila pastikan maklumat peserta adalah betul sebelum meneruskan pembayaran.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href={route('children.index')}
                            className="flex-1 px-6 py-4 text-center border border-zinc-300 rounded-xl text-zinc-700 font-semibold hover:bg-zinc-50 transition-colors"
                        >
                            ← Kembali
                        </Link>
                        <button
                            onClick={handlePayment}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <span>Teruskan Pembayaran</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
