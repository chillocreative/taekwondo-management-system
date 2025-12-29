import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-10">
                <img
                    src="/images/hero-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-2xl overflow-hidden sm:rounded-2xl border border-gray-100">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <div className="flex flex-col items-center gap-2">
                            <img src="/images/logo_new.jpg" alt="Logo" className="h-20 w-20 rounded-full shadow-md" />
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                TAEKWONDO A&Z
                            </span>
                        </div>
                    </Link>
                </div>

                {children}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-8 text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Taekwondo A&Z
            </div>
        </div>
    );
}
