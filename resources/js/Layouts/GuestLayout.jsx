import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function GuestLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Laman Utama', href: 'https://taekwondoanz.com/', external: true },
        {
            name: 'Daftar',
            submenu: [
                { name: 'Pendaftaran 18 Tahun Ke Atas', href: 'https://taekwondoanz.com/pendaftaran-18-tahun-ke-atas/' },
                { name: 'Pendaftaran 18 Tahun Ke Bawah', href: 'https://taekwondoanz.com/pendaftaran-18-tahun-ke-bawah/' },
                { name: 'Pembaharuan Keahlian', href: 'https://taekwondoanz.com/pembaharuan/' },
                { name: 'Ujian Kenaikan Tali Pinggang', href: 'https://taekwondoanz.com/ujian-kenaikan-tali-pinggang/' },
            ],
        },
        {
            name: 'Bayaran',
            submenu: [
                { name: 'Yuran Bulanan', href: 'https://taekwondoanz.com/bayaran/' },
                { name: 'QR Code', href: 'https://taekwondoanz.com/thank-you-page-2/' },
            ],
        },
        { name: 'Jadual Kelas', href: 'https://taekwondoanz.com/jadual-kelas/', external: true },
        { name: 'Taekwondo Shop', href: 'https://taekwondoanz.com/shop/', external: true },
    ];

    const [openSubmenu, setOpenSubmenu] = useState(null);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-900 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-5">
                <img
                    src="/images/hero-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Header Navigation - Replicating taekwondoanz.com */}
            <header className="relative z-20 bg-black/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <a href="https://taekwondoanz.com/" className="flex items-center gap-3 group">
                            <img
                                src="/images/logo_new.jpg"
                                alt="Logo"
                                className="h-14 w-14 rounded-full shadow-lg border-2 border-red-600 group-hover:border-yellow-500 transition-colors"
                            />
                            <div className="hidden sm:block">
                                <span className="text-white font-bold text-lg tracking-tight">TAEKWONDO</span>
                                <span className="text-red-500 font-bold text-lg ml-1">A&Z</span>
                            </div>
                        </a>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {menuItems.map((item, index) => (
                                <div key={index} className="relative group">
                                    {item.submenu ? (
                                        <>
                                            <button
                                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                                onMouseEnter={() => setOpenSubmenu(item.name)}
                                            >
                                                {item.name}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {openSubmenu === item.name && (
                                                <div
                                                    className="absolute left-0 top-full mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 z-50"
                                                    onMouseEnter={() => setOpenSubmenu(item.name)}
                                                    onMouseLeave={() => setOpenSubmenu(null)}
                                                >
                                                    {item.submenu.map((subItem, subIndex) => (
                                                        <a
                                                            key={subIndex}
                                                            href={subItem.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                                                        >
                                                            {subItem.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <a
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            {item.name}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-zinc-900 border-t border-zinc-800 py-4 px-4">
                        {menuItems.map((item, index) => (
                            <div key={index} className="mb-2">
                                {item.submenu ? (
                                    <div>
                                        <button
                                            onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            {item.name}
                                            <svg className={`w-4 h-4 transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {openSubmenu === item.name && (
                                            <div className="ml-4 mt-1 space-y-1">
                                                {item.submenu.map((subItem, subIndex) => (
                                                    <a
                                                        key={subIndex}
                                                        href={subItem.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                                    >
                                                        {subItem.name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {/* Content Container */}
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 relative z-10">
                <div className="w-full sm:max-w-md px-6 py-8 bg-white shadow-2xl overflow-hidden sm:rounded-2xl border border-gray-100">
                    <div className="flex justify-center mb-8">
                        <Link href="/">
                            <div className="flex flex-col items-center gap-2">
                                <img src="/images/logo_new.jpg" alt="Logo" className="h-20 w-20 rounded-full shadow-md border-2 border-red-600" />
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    TAEKWONDO A&Z
                                </span>
                            </div>
                        </Link>
                    </div>

                    {children}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 py-6 bg-black/80 backdrop-blur-md border-t border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-zinc-500 text-sm">
                        &copy; {new Date().getFullYear()} Taekwondo A&Z. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
