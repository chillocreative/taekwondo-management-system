import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ auth, serverUrl }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        message: 'Hello! This is a test message from TSMS WhatsApp Server.'
    });

    const [serverStatus, setServerStatus] = useState({
        connected: false,
        status: 'checking',
        qr: null
    });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${serverUrl}/status`);
                const data = await response.json();
                setServerStatus(data);
            } catch (error) {
                setServerStatus({ connected: false, status: 'offline', qr: null });
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.whatsapp.test'), {
            onSuccess: () => reset('phone'),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Pengurusan WhatsApp</h2>}
        >
            <Head title="WhatsApp Management" />

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Status Card */}
                        <div className="md:col-span-1">
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-3xl p-8 border border-zinc-100 flex flex-col h-full">
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 mb-2">Status Server</h3>
                                    <p className="text-zinc-500 font-medium mb-8">Pantau status sambungan WhatsApp server anda.</p>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`w-4 h-4 rounded-full ${serverStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        <span className={`font-black uppercase tracking-widest text-sm ${serverStatus.connected ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {serverStatus.connected ? 'Bersambung' : (serverStatus.status === 'offline' ? 'Offline' : 'Terputus')}
                                        </span>
                                    </div>

                                    {!serverStatus.connected && (
                                        <div className="flex flex-col items-center">
                                            {serverStatus.qr ? (
                                                <div className="bg-white p-4 rounded-3xl border-4 border-zinc-900 shadow-2xl mb-6 group transition-all hover:scale-105">
                                                    <img src={serverStatus.qr} alt="Scan to connect" className="w-56 h-56" />
                                                    <p className="mt-4 text-center text-xs font-black text-zinc-900 uppercase tracking-widest">Sila Imbas Sekarang</p>
                                                </div>
                                            ) : (
                                                <div className="bg-zinc-50 w-full p-8 rounded-3xl border border-dashed border-zinc-300 flex flex-col items-center justify-center mb-6 aspect-square">
                                                    {serverStatus.status === 'offline' ? (
                                                        <div className="text-center">
                                                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                                                </svg>
                                                            </div>
                                                            <p className="text-sm font-bold text-zinc-900">Server Offline</p>
                                                            <p className="text-xs text-zinc-500 mt-1">Sila pastikan `node whatsapp-server.js` sedang berjalan.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
                                                            <p className="text-sm font-bold text-zinc-900 italic tracking-widest">Menjana Kod QR...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-8 border-t border-zinc-100 space-y-4">
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Server Endpoint</p>
                                        <p className="font-mono text-xs text-zinc-600 truncate">{serverUrl}</p>
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Status Enjin</p>
                                        <p className="font-mono text-xs text-zinc-600 uppercase">{serverStatus.status}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Message Card */}
                        <div className="md:col-span-2">
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-3xl p-8 border border-zinc-100">
                                <h3 className="text-2xl font-black text-zinc-900 mb-2">Uji Penghantaran</h3>
                                <p className="text-zinc-500 font-medium mb-8">Hantar mesej ujian untuk memastikan server berfungsi dengan baik.</p>

                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black text-zinc-700 uppercase tracking-widest mb-2">Nombor Telefon</label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            placeholder="Contoh: 60123456789"
                                            className="w-full bg-zinc-50 border-zinc-200 rounded-2xl p-4 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-medium"
                                        />
                                        {errors.phone && <p className="mt-2 text-sm text-rose-600 font-bold">{errors.phone}</p>}
                                        <p className="mt-2 text-xs text-zinc-400 italic font-medium">Sila sertakan kod negara tanpa simbol +. Contoh: 60123456789</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-zinc-700 uppercase tracking-widest mb-2">Mesej</label>
                                        <textarea
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            rows="4"
                                            className="w-full bg-zinc-50 border-zinc-200 rounded-2xl p-4 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-medium"
                                        ></textarea>
                                        {errors.message && <p className="mt-2 text-sm text-rose-600 font-bold">{errors.message}</p>}
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing || !serverStatus.connected}
                                            className={`px-8 py-4 rounded-2xl font-black text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-3 ${serverStatus.connected
                                                ? 'bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200'
                                                : 'bg-zinc-300 cursor-not-allowed shadow-none'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                            </svg>
                                            Hantar Mesej Ujian
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Automation Info */}
                            <div className="mt-8 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="p-3 bg-white/10 w-fit rounded-xl mb-6">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                    </div>
                                    <h4 className="text-2xl font-black mb-2">Automasi Pembayaran</h4>
                                    <p className="text-zinc-400 font-medium mb-6">Sistem kini dikonfigurasi untuk menghantar notifikasi WhatsApp secara automatik kepada Admin dan Ibu Bapa apabila pembayaran pendaftaran atau yuran bulanan berjaya dilakukan.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                            Notifikasi Pendaftaran (Admin)
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                            Resit Pendaftaran (Ibu Bapa)
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                            Resit Yuran Bulanan (Ibu Bapa)
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                            Peringatan Yuran Bulanan
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                            Amaran Ketidakhadiran
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold opacity-50">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Update Grading (Akan Datang)
                                        </div>
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
