import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function ToyyibPayVerification({ students, stats }) {
    const [filter, setFilter] = useState('all');
    const [expandedStudent, setExpandedStudent] = useState(null);

    const filteredStudents = students.filter(s => {
        if (filter === 'verified_paid') return s.verification_status === 'VERIFIED_PAID';
        if (filter === 'toyyibpay_paid_no_local') return s.verification_status === 'TOYYIBPAY_PAID_BUT_NO_LOCAL_RECORD';
        if (filter === 'local_but_toyyibpay_unpaid') return s.verification_status === 'LOCAL_RECORD_BUT_TOYYIBPAY_UNPAID';
        if (filter === 'correctly_unpaid') return s.verification_status === 'CORRECTLY_UNPAID';
        if (filter === 'api_errors') return s.verification_status === 'API_ERROR';
        return true;
    });

    const getStatusBadge = (status) => {
        const badges = {
            'VERIFIED_PAID': { bg: 'bg-green-100', text: 'text-green-700', label: '✅ Verified Paid' },
            'TOYYIBPAY_PAID_BUT_NO_LOCAL_RECORD': { bg: 'bg-red-100', text: 'text-red-700', label: '⚠️ ToyyibPay Paid, No Local' },
            'LOCAL_RECORD_BUT_TOYYIBPAY_UNPAID': { bg: 'bg-amber-100', text: 'text-amber-700', label: '⚠️ Local Record, ToyyibPay Unpaid' },
            'CORRECTLY_UNPAID': { bg: 'bg-zinc-100', text: 'text-zinc-700', label: '⏳ Correctly Unpaid' },
            'API_ERROR': { bg: 'bg-red-100', text: 'text-red-700', label: '❌ API Error' },
        };
        const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
        return <span className={`px-2 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-medium`}>{badge.label}</span>;
    };

    return (
        <AuthenticatedLayout>
            <Head title="ToyyibPay Verification" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">🔐 ToyyibPay Payment Verification</h1>
                                <p className="text-zinc-500 mt-1">Cross-check payment status with ToyyibPay API</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                            <div
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100"
                                onClick={() => setFilter('all')}
                            >
                                <p className="text-blue-800 font-medium text-sm">Total Checked</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total_checked}</p>
                            </div>
                            <div
                                className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100"
                                onClick={() => setFilter('verified_paid')}
                            >
                                <p className="text-green-800 font-medium text-sm">✅ Verified Paid</p>
                                <p className="text-2xl font-bold text-green-900">{stats.verified_paid}</p>
                            </div>
                            <div
                                className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100"
                                onClick={() => setFilter('toyyibpay_paid_no_local')}
                            >
                                <p className="text-red-800 font-medium text-sm text-xs">⚠️ TP Paid, No Local</p>
                                <p className="text-2xl font-bold text-red-900">{stats.toyyibpay_paid_no_local}</p>
                            </div>
                            <div
                                className="bg-amber-50 border border-amber-200 rounded-lg p-4 cursor-pointer hover:bg-amber-100"
                                onClick={() => setFilter('local_but_toyyibpay_unpaid')}
                            >
                                <p className="text-amber-800 font-medium text-sm text-xs">⚠️ Local, TP Unpaid</p>
                                <p className="text-2xl font-bold text-amber-900">{stats.local_but_toyyibpay_unpaid}</p>
                            </div>
                            <div
                                className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-100"
                                onClick={() => setFilter('correctly_unpaid')}
                            >
                                <p className="text-zinc-700 font-medium text-sm">⏳ Correctly Unpaid</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.correctly_unpaid}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Info */}
                    {filter !== 'all' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex justify-between items-center">
                            <span className="text-blue-800">
                                Menapis: <strong className="capitalize">{filter.replace(/_/g, ' ')}</strong> ({filteredStudents.length} rekod)
                            </span>
                            <button
                                onClick={() => setFilter('all')}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Padam Filter ✕
                            </button>
                        </div>
                    )}

                    {/* Students Table */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="text-left p-4 font-bold text-zinc-600">No. Siri</th>
                                        <th className="text-left p-4 font-bold text-zinc-600">Nama</th>
                                        <th className="text-left p-4 font-bold text-zinc-600">Bill Code</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">ToyyibPay Status</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Local Records</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Verification</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-zinc-500">
                                                Tiada rekod ditemui
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <>
                                                <tr
                                                    key={student.child_id}
                                                    className={`hover:bg-zinc-50 ${student.verification_status === 'TOYYIBPAY_PAID_BUT_NO_LOCAL_RECORD' ? 'bg-red-50/50' :
                                                            student.verification_status === 'LOCAL_RECORD_BUT_TOYYIBPAY_UNPAID' ? 'bg-amber-50/50' : ''
                                                        }`}
                                                >
                                                    <td className="p-4 font-medium">{student.no_siri}</td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{student.name}</div>
                                                        <div className="text-xs text-zinc-500">{student.parent_name}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <code className="bg-zinc-100 px-2 py-1 rounded text-xs">
                                                            {student.bill_code}
                                                        </code>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {student.api_error ? (
                                                            <span className="text-xs text-red-600">❌ {student.api_error}</span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 items-center">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.toyyibpay_paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {student.toyyibpay_paid ? '✅ PAID' : '❌ UNPAID'}
                                                                </span>
                                                                {student.toyyibpay_amount && (
                                                                    <span className="text-xs font-bold">RM {student.toyyibpay_amount}</span>
                                                                )}
                                                                {student.toyyibpay_date && (
                                                                    <span className="text-xs text-zinc-500">{student.toyyibpay_date}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.has_local_receipt ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                                                                }`}>
                                                                {student.has_local_receipt ? '✅ Has Receipt' : '❌ No Receipt'}
                                                            </span>
                                                            <span className="text-xs text-zinc-500">
                                                                {student.local_payment_count} payment(s)
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {getStatusBadge(student.verification_status)}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => setExpandedStudent(expandedStudent === student.child_id ? null : student.child_id)}
                                                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium"
                                                        >
                                                            {expandedStudent === student.child_id ? '▲ Tutup' : '▼ Details'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedStudent === student.child_id && (
                                                    <tr>
                                                        <td colSpan="7" className="p-4 bg-zinc-50">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="bg-white border border-zinc-200 rounded p-3">
                                                                    <h5 className="font-bold text-sm mb-2">🔐 ToyyibPay Data</h5>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div><span className="text-zinc-500">Bill Code:</span> <code className="ml-2">{student.bill_code}</code></div>
                                                                        <div><span className="text-zinc-500">Status:</span> <span className="ml-2 font-medium">{student.toyyibpay_status || 'N/A'}</span></div>
                                                                        <div><span className="text-zinc-500">Paid:</span> <span className="ml-2 font-medium">{student.toyyibpay_paid ? 'YES' : 'NO'}</span></div>
                                                                        <div><span className="text-zinc-500">Amount:</span> <span className="ml-2 font-medium">RM {student.toyyibpay_amount || '0.00'}</span></div>
                                                                        <div><span className="text-zinc-500">Date:</span> <span className="ml-2 font-medium">{student.toyyibpay_date || 'N/A'}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white border border-zinc-200 rounded p-3">
                                                                    <h5 className="font-bold text-sm mb-2">💾 Local Payment Records</h5>
                                                                    {student.local_payments.length === 0 ? (
                                                                        <p className="text-xs text-zinc-500">No local payment records</p>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            {student.local_payments.map((payment, idx) => (
                                                                                <div key={idx} className="bg-zinc-50 p-2 rounded text-xs">
                                                                                    <div className="flex justify-between">
                                                                                        <span className="font-medium">#{payment.receipt_number}</span>
                                                                                        <span className="font-bold text-green-600">RM {payment.total}</span>
                                                                                    </div>
                                                                                    <div className="text-zinc-500 text-[10px]">{payment.payment_date}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
