import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const programs = [
        {
            title: 'Mini Rangers',
            age: '3-6 Tahun',
            description: 'Program pengenalan asas Taekwondo yang menyeronokkan untuk anak-anak kecil. Fokus kepada disiplin, koordinasi dan keyakinan diri.',
            image: '/images/kids.png',
            color: 'bg-yellow-400'
        },
        {
            title: 'Kanak-kanak',
            age: '7-12 Tahun',
            description: 'Membangunkan asas teknik beladiri yang kukuh, disiplin diri, hormat-menghormati dan kecergasan fizikal.',
            image: '/images/hero.png', // Using hero as placeholder
            color: 'bg-blue-600'
        },
        {
            title: 'Remaja',
            age: '13-17 Tahun',
            description: 'Latihan intensif yang mencabar mental dan fizikal, sesuai untuk remaja yang ingin membina jati diri dan kemahiran pertahanan diri.',
            image: '/images/hero.png',
            color: 'bg-red-600'
        },
        {
            title: 'Dewasa',
            age: '18+ Tahun',
            description: 'Program kecergasan dan pertahanan diri menyeluruh untuk dewasa. Kurangkan stress dan tingkatkan stamina.',
            image: '/images/hero.png',
            color: 'bg-slate-800'
        }
    ];

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">

                {/* Navbar */}
                <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo_new.jpg" alt="Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover" />
                            <span className={`text-xl sm:text-2xl font-bold tracking-tight ${scrolled ? 'text-zinc-900' : 'text-white'}`}>
                                TAEKWONDO <span className="text-blue-600">A&Z</span>
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            {['Home', 'Program', 'Tentang Kami', 'Hubungi'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className={`text-sm font-medium hover:text-blue-500 transition-colors ${scrolled ? 'text-zinc-600' : 'text-zinc-200'}`}>
                                    {item}
                                </a>
                            ))}

                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-blue-600/30"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route('login')}
                                        className={`text-sm font-medium hover:text-blue-500 transition-colors ${scrolled ? 'text-zinc-900' : 'text-white'}`}
                                    >
                                        Log Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-blue-600/30"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-zinc-500"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className={`w-8 h-8 ${scrolled ? 'text-zinc-900' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-zinc-100 p-4 flex flex-col gap-4 md:hidden">
                            {['Home', 'Program', 'Tentang Kami', 'Hubungi'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-zinc-600 font-medium py-2 border-b border-zinc-50">
                                    {item}
                                </a>
                            ))}
                            <div className="flex flex-col gap-3 mt-2">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-bold">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="w-full text-center px-4 py-3 border border-zinc-200 text-zinc-700 rounded-lg font-bold">
                                            Log Masuk
                                        </Link>
                                        <Link href={route('register')} className="w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-bold">
                                            Daftar Sekarang
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <header id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/hero.png"
                            alt="Taekwondo Class"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="max-w-2xl animate-fade-in-up">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-medium text-sm mb-6 backdrop-blur-sm">
                                #1 Taekwondo Academy in Penang
                            </span>
                            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight mb-6">
                                Bina Keyakinan <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                    Melalui Disiplin
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl text-zinc-300 mb-8 leading-relaxed max-w-lg">
                                Sertai kami untuk membentuk jati diri, kecergasan fizikal dan mental melalui seni mempertahankan diri Taekwondo yang authentic.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href={route('register')}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-full transition-all shadow-lg shadow-blue-600/40 text-center"
                                >
                                    Mulakan Sekarang
                                </Link>
                                <a
                                    href="#program"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-lg font-bold rounded-full transition-all backdrop-blur-sm text-center"
                                >
                                    Lihat Program
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Programs Section */}
                <section id="program" className="py-20 sm:py-32 bg-zinc-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">Program Kami</h2>
                            <p className="text-zinc-500 text-lg">
                                Kami menawarkan kelas yang sesuai untuk setiap peringkat umur dan kebolehan. Dari pemula hingga atlit elit.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {programs.map((program, index) => (
                                <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100">
                                    <div className="relative h-48 overflow-hidden">
                                        <div className={`absolute inset-0 ${program.color} opacity-90 transition-opacity group-hover:opacity-80`}></div>
                                        <img
                                            src={program.image}
                                            alt={program.title}
                                            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                                            {program.age}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {program.title}
                                        </h3>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            {program.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section id="tentang-kami" className="py-20 sm:py-32 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
                                <img
                                    src="/images/hero.png"
                                    alt="Instructor"
                                    className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500"
                                />
                            </div>
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
                                    Kenapa Pilih <span className="text-blue-600">Taekwondo A&Z?</span>
                                </h2>
                                <div className="space-y-8">
                                    {[
                                        {
                                            title: 'Jurulatih Berpengalaman',
                                            desc: 'Dibimbing oleh tenaga pengajar bertauliah dan berpengalaman luas dalam seni beladiri Taekwondo.',
                                            icon: '🏆'
                                        },
                                        {
                                            title: 'Fasiliti Lengkap & Selesa',
                                            desc: 'Pusat latihan yang kondusif, bersih dan dilengkapi peralatan latihan moden untuk keselamatan pelajar.',
                                            icon: 'oss'
                                        },
                                        {
                                            title: 'Komuniti Positif',
                                            desc: 'Suasana pembelajaran yang menyokong, mesra keluarga dan menerapkan nilai-nilai murni.',
                                            icon: '🤝'
                                        }
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl text-blue-600 border border-blue-100">
                                                {feature.icon === 'oss' ? '🥋' : feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-zinc-900 mb-2">{feature.title}</h4>
                                                <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-zinc-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/20"></div>
                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                            Sedia untuk mulakan perjalanan anda?
                        </h2>
                        <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
                            Daftar hari ini untuk kelas percubaan percuma. Jangan tunggu lagi untuk menjadi versi terbaik diri anda.
                        </p>
                        <Link
                            href={route('register')}
                            className="inline-block px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-full transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transform hover:-translate-y-1"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer id="hubungi" className="bg-white border-t border-zinc-200 pt-16 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center gap-2 mb-6">
                                    <img src="/images/logo_new.jpg" alt="Logo" className="w-10 h-10 rounded-full" />
                                    <span className="text-xl font-bold text-zinc-900">TAEKWONDO A&Z</span>
                                </div>
                                <p className="text-zinc-500 max-w-sm mb-6">
                                    Melahirkan juara masa hadapan melalui disiplin, dedikasi dan latihan berkualiti tinggi.
                                </p>
                                <div className="flex gap-4">
                                    {/* Social Icons Placeholder */}
                                    <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-blue-600 hover:text-white transition-colors">FB</a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-pink-600 hover:text-white transition-colors">IG</a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-green-600 hover:text-white transition-colors">WA</a>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-zinc-900 mb-6">Pautan Pantas</h4>
                                <ul className="space-y-4">
                                    {['Home', 'Program', 'Tentang Kami', 'Pendaftaran'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-zinc-500 hover:text-blue-600 transition-colors">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-zinc-900 mb-6">Hubungi Kami</h4>
                                <ul className="space-y-4 text-zinc-500">
                                    <li className="flex items-start gap-3">
                                        <span className="mt-1">📍</span>
                                        <span>Pusat Latihan Utama,<br />Permatang Sintok, Pulau Pinang</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span>📞</span>
                                        <span>012-345 6789</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span>✉️</span>
                                        <span>info@taekwondoanz.com</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-8 text-center text-zinc-400 text-sm">
                            <p>&copy; {new Date().getFullYear()} Taekwondo A&Z. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
