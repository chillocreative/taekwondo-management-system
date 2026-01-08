import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ auth, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        message: 'Hello! This is a test message from TSMS WhatsApp Server.'
    });

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
                            <div className="bg-white overflow-hidden shadow-xl sm:rounded-3xl p-8 border border-zinc-100 h-full flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 mb-2">Status Server</h3>
                                    <p className="text-zinc-500 font-medium mb-8">Pantau status sambungan WhatsApp server anda.</p>

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`w-4 h-4 rounded-full ${status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        <span className={`font-black uppercase tracking-widest text-sm ${status.connected ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {status.connected ? 'Bersambung' : 'Terputus'}
                                        </span>
                                    </div>

                                    {!status.connected && (
                                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6">
                                            <p className="text-amber-800 text-sm font-medium">
                                                Sila pastikan Node.js server berjalan dan anda telah mengimbas kod QR di terminal.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Server Endpoint</p>
                                        <p className="font-mono text-sm text-zinc-600">http://localhost:3001</p>
                                    </div>
                                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-xs text-zinc-400 font-bold uppercase mb-1">Library</p>
                                        <p className="font-mono text-sm text-zinc-600">wbm (WhatsApp Bot Manager)</p>
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
                                            disabled={processing || !status.connected}
                                            className={`px-8 py-4 rounded-2xl font-black text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-3 ${status.connected
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
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Notifikasi Pendaftaran Baru
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Resit Yuran Bulanan Digital
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Peringatan Yuran Tertunggak
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            Pengesahan Status Pelajar
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
