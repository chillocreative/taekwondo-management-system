import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);

    // Define menu structure based on user role
    const getMenuItems = () => {
        const baseMenu = [
            {
                name: 'Dashboard',
                icon: '🏠',
                route: 'dashboard',
                active: route().current('dashboard'),
            },
        ];

        const adminMenu = [
            {
                name: 'Pengurusan',
                icon: '⚙️',
                submenu: [
                    {
                        name: 'Pusat Latihan',
                        route: 'training-centers.index',
                        active: route().current('training-centers.*'),
                    },
                    {
                        name: 'Pelajar',
                        route: 'students.index',
                        active: route().current('students.*'),
                    },
                    {
                        name: 'Kehadiran',
                        route: 'admin.attendance.index',
                        active: route().current('admin.attendance.*'),
                    },
                ],
            },
            {
                name: 'Kewangan',
                icon: '💰',
                submenu: [
                    {
                        name: 'Senarai Pembayaran',
                        route: 'admin.payments.index',
                        active: route().current('admin.payments.*'),
                    },
                ],
            },
            {
                name: 'Tetapan',
                icon: '🔧',
                submenu: [
                    {
                        name: 'Pembayaran',
                        route: 'settings.payment',
                        active: route().current('settings.payment'),
                    },
                    {
                        name: 'Yuran',
                        route: 'settings.fees.index',
                        active: route().current('settings.fees.*'),
                    },
                    {
                        name: 'Kelulusan Pembayaran',
                        route: 'admin.pending-payments',
                        active: route().current('admin.pending-payments'),
                    },
                ],
            },
        ];

        const coachMenu = [
            {
                name: 'Pelajar',
                icon: '👥',
                route: 'students.index',
                active: route().current('students.*'),
            },
        ];

        const userMenu = [
            {
                name: 'Nama Peserta',
                icon: '👨‍👩‍👧‍👦',
                route: 'children.index',
                active: route().current('children.*'),
            },
            {
                name: 'Kehadiran',
                icon: '📋',
                route: 'attendance.index',
                active: route().current('attendance.*'),
            },
            {
                name: 'Yuran',
                icon: '💰',
                route: 'fees.index',
                active: route().current('fees.*'),
            },
        ];

        if (user.role === 'admin') {
            return [...baseMenu, ...adminMenu];
        } else if (user.role === 'coach') {
            return [...baseMenu, ...coachMenu];
        } else {
            return [...baseMenu, ...userMenu];
        }
    };

    const menuItems = getMenuItems();

    const toggleSubmenu = (menuName) => {
        setOpenSubmenu(openSubmenu === menuName ? null : menuName);
    };

    const MenuItem = ({ item, isMobile = false }) => {
        if (item.submenu) {
            const isOpen = openSubmenu === item.name;
            return (
                <div>
                    <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isMobile
                            ? 'text-zinc-700 hover:bg-zinc-100'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {isOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                            {item.submenu.map((subItem) => (
                                <Link
                                    key={subItem.name}
                                    href={route(subItem.route)}
                                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${subItem.active
                                        ? 'bg-black text-white'
                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                        }`}
                                    onClick={() => isMobile && setSidebarOpen(false)}
                                >
                                    {subItem.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                href={route(item.route)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${item.active
                    ? 'bg-black text-white'
                    : isMobile
                        ? 'text-zinc-700 hover:bg-zinc-100'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                onClick={() => isMobile && setSidebarOpen(false)}
            >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-200">
                <div className="flex items-center justify-between px-4 h-16">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-10 rounded-full" />
                    </Link>

                    {/* Mobile User Dropdown */}
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-50">
                                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" width="56" contentClasses="py-2 bg-white shadow-xl rounded-xl border border-zinc-100">
                            <div className="px-4 py-3 border-b border-zinc-100">
                                <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user.phone_number}</p>
                            </div>
                            <Dropdown.Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                            >
                                <span>👤</span>
                                <span>Profil Saya</span>
                            </Dropdown.Link>
                            <div className="border-t border-zinc-100 my-1"></div>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                                <span>🚪</span>
                                <span>Log Keluar</span>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-zinc-200 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-100">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-12 w-12 rounded-full" />
                            <div>
                                <h1 className="text-lg font-bold text-zinc-900">TSMS</h1>
                                <p className="text-xs text-zinc-500">Taekwondo A&Z</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => (
                            <MenuItem key={item.name} item={item} />
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                        <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                            <ApplicationLogo className="h-10 w-10 rounded-full" />
                            <div>
                                <h1 className="text-base font-bold text-zinc-900">TSMS</h1>
                                <p className="text-xs text-zinc-500">Taekwondo A&Z</p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => (
                            <MenuItem key={item.name} item={item} isMobile={true} />
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Desktop Top Bar with User Dropdown */}
                <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-zinc-100">
                    <div className="flex items-center justify-end px-6 h-16">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                                        <p className="text-xs text-zinc-500">{user.phone_number}</p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right" width="56" contentClasses="py-2 bg-white shadow-xl rounded-xl border border-zinc-100">
                                <div className="px-4 py-3 border-b border-zinc-100">
                                    <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                                    <p className="text-xs text-zinc-500">{user.phone_number}</p>
                                    {user.training_center && (
                                        <p className="text-xs text-zinc-400 mt-1">{user.training_center.name}</p>
                                    )}
                                </div>
                                <Dropdown.Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                                >
                                    <span>👤</span>
                                    <span>Profil Saya</span>
                                </Dropdown.Link>
                                <div className="border-t border-zinc-100 my-1"></div>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                    <span>🚪</span>
                                    <span>Log Keluar</span>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>

                {/* Header */}
                {header && (
                    <header className="bg-white border-b border-zinc-100 mt-16 lg:mt-0">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="mt-16 lg:mt-0">{children}</main>
            </div>
        </div>
    );
}
