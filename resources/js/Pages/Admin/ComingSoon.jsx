import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ComingSoon({ auth, title }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-gray-800 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-12 text-center text-gray-900">
                            <h3 className="text-3xl font-extrabold text-blue-600 mb-4">{title}</h3>
                            <p className="text-xl text-gray-600">
                                Harap maaf, modul ini masih dalam pembangunan.
                                <br />
                                <span className="text-sm text-gray-400 mt-2 block">Akan Datang</span>
                            </p>
                            <div className="mt-8">
                                <span className="inline-block p-4 rounded-full bg-blue-100 text-blue-600">
                                    🚧 Development in Progress
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
