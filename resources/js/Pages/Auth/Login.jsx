import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone_number: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log Masuk" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="phone_number" value="Nombor Telefon" />

                    <TextInput
                        id="phone_number"
                        type="tel"
                        name="phone_number"
                        value={data.phone_number}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('phone_number', e.target.value)}
                        placeholder="Contoh: 0123456789"
                    />

                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Kata Laluan" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Lupa kata laluan?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900" disabled={processing}>
                        Log Masuk
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center">
                    <span className="text-sm text-gray-600">Belum mempunyai akaun? </span>
                    <Link
                        href={route('register')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline"
                    >
                        Daftar Sekarang
                    </Link>
                </div>

                {/* Test Credentials Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Akaun Ujian</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Admin */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">👨‍💼</span>
                                <span className="text-xs font-bold text-blue-900">ADMIN</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Tel:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-blue-700 font-mono">0123456789</code>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Pass:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-blue-700 font-mono">password</code>
                                </div>
                            </div>
                        </div>

                        {/* Coach */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">🥋</span>
                                <span className="text-xs font-bold text-green-900">COACH</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Tel:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-green-700 font-mono">0198765432</code>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Pass:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-green-700 font-mono">password</code>
                                </div>
                            </div>
                        </div>

                        {/* User */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">👤</span>
                                <span className="text-xs font-bold text-purple-900">USER</span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Tel:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-purple-700 font-mono">0112345678</code>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-600">Pass:</span>
                                    <code className="bg-white px-2 py-0.5 rounded text-purple-700 font-mono">password</code>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        💡 Klik pada nombor telefon untuk salin
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
