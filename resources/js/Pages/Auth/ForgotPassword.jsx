import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        phone_number: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Laluan" />

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-zinc-900">Lupa Kata Laluan?</h2>
                <p className="text-zinc-500 mt-2 font-medium">
                    Jangan risau! Masukkan nombor telefon anda dan kami akan hantar kata laluan baharu terus ke WhatsApp anda.
                </p>
            </div>

            {status && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {status}
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-sm font-black text-zinc-700 uppercase tracking-widest mb-2 px-1">
                        Nombor Telefon
                    </label>
                    <TextInput
                        id="phone_number"
                        type="text"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full px-4 py-3.5 bg-zinc-50 border-zinc-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all"
                        isFocused={true}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 11) {
                                setData('phone_number', value);
                            }
                        }}
                        placeholder="Contoh: 0123456789"
                    />
                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4">
                    <PrimaryButton
                        className="w-full justify-center py-4 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 text-white font-black text-sm uppercase tracking-widest rounded-xl transform transition-all active:scale-95 disabled:opacity-70"
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sedang Diproses...
                            </span>
                        ) : 'Hantar Kata Laluan via WhatsApp'}
                    </PrimaryButton>

                    <Link
                        href={route('login')}
                        className="text-center text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors py-2"
                    >
                        Kembali ke Log Masuk
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
