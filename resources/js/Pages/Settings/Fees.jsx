import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast';

export default function Fees({ auth, settings, flash }) {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const { data, setData, post, processing, errors } = useForm({
        yearly_fee_below_18: settings?.yearly_fee_below_18 || 100.00,
        yearly_fee_above_18: settings?.yearly_fee_above_18 || 200.00,
        monthly_fee_below_18: settings?.monthly_fee_below_18 || 40.00,
        monthly_fee_above_18: settings?.monthly_fee_above_18 || 60.00,
        renewal_fee_gup: settings?.renewal_fee_gup || 30.00,
        renewal_fee_black_poom: settings?.renewal_fee_black_poom || 50.00,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.fees.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">Tetapan Yuran</h2>}
        >
            <Head title="Tetapan Yuran" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-6">Konfigurasi Yuran Peserta</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                {/* Yearly Fees Section */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                        <span className="text-blue-600">📅</span> Yuran Tahunan
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Bawah 18 Tahun (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.yearly_fee_below_18}
                                                onChange={(e) => setData('yearly_fee_below_18', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.yearly_fee_below_18 && (
                                                <p className="text-red-500 text-xs mt-1">{errors.yearly_fee_below_18}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                18 Tahun ke Atas (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.yearly_fee_above_18}
                                                onChange={(e) => setData('yearly_fee_above_18', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.yearly_fee_above_18 && (
                                                <p className="text-red-500 text-xs mt-1">{errors.yearly_fee_above_18}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-blue-200 pt-4 mt-4">
                                        <h5 className="text-sm font-bold text-zinc-900 mb-3">Yuran Pembaharuan</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                    GUP: Putih - Merah (RM) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.renewal_fee_gup}
                                                    onChange={(e) => setData('renewal_fee_gup', e.target.value)}
                                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                                {errors.renewal_fee_gup && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.renewal_fee_gup}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                    Black & Poom (RM) *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={data.renewal_fee_black_poom}
                                                    onChange={(e) => setData('renewal_fee_black_poom', e.target.value)}
                                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                                {errors.renewal_fee_black_poom && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.renewal_fee_black_poom}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Fees Section */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                        <span className="text-green-600">📆</span> Yuran Bulanan
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Bawah 18 Tahun (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.monthly_fee_below_18}
                                                onChange={(e) => setData('monthly_fee_below_18', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.monthly_fee_below_18 && (
                                                <p className="text-red-500 text-xs mt-1">{errors.monthly_fee_below_18}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                18 Tahun ke Atas (RM) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.monthly_fee_above_18}
                                                onChange={(e) => setData('monthly_fee_above_18', e.target.value)}
                                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.monthly_fee_above_18 && (
                                                <p className="text-red-500 text-xs mt-1">{errors.monthly_fee_above_18}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <p className="text-sm text-amber-800">
                                        <strong>Nota:</strong> Yuran akan dikira secara automatik berdasarkan umur peserta semasa pembayaran.
                                        Umur ditentukan dari tarikh lahir yang didaftarkan.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4 border-t border-zinc-200">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm font-medium"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Tetapan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Fee Summary */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Ringkasan Yuran Semasa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-zinc-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-zinc-500 mb-2">Yuran Tahunan</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">Bawah 18 tahun:</span>
                                        <span className="text-sm font-bold text-blue-600">RM {parseFloat(data.yearly_fee_below_18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">18 tahun ke atas:</span>
                                        <span className="text-sm font-bold text-blue-600">RM {parseFloat(data.yearly_fee_above_18).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-zinc-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-zinc-500 mb-2">Yuran Bulanan</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">Bawah 18 tahun:</span>
                                        <span className="text-sm font-bold text-green-600">RM {parseFloat(data.monthly_fee_below_18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">18 tahun ke atas:</span>
                                        <span className="text-sm font-bold text-green-600">RM {parseFloat(data.monthly_fee_above_18).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-zinc-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-zinc-500 mb-2">Yuran Pembaharuan</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">GUP (Putih-Merah):</span>
                                        <span className="text-sm font-bold text-purple-600">RM {parseFloat(data.renewal_fee_gup).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-zinc-600">Black & Poom:</span>
                                        <span className="text-sm font-bold text-purple-600">RM {parseFloat(data.renewal_fee_black_poom).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
