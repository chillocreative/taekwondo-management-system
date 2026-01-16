import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PaymentVerification({ students, stats }) {
    const [filter, setFilter] = useState('all'); // all, discrepancy, correct
    const [expandedStudent, setExpandedStudent] = useState(null);

    const filteredStudents = students.filter(s => {
        if (filter === 'discrepancy') return s.discrepancy === 'PAID_BUT_MARKED_UNPAID';
        if (filter === 'correct') return s.discrepancy === 'CORRECTLY_UNPAID';
        return true;
    });

    const handleMarkAsPaid = async (childId, studentName) => {
        if (!confirm(`Tandakan ${studentName} sebagai SUDAH BAYAR untuk tahun 2026?`)) {
            return;
        }

        try {
            const response = await fetch(route('admin.payment-verification.mark-paid'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ child_id: childId }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                router.reload();
            } else {
                alert('Gagal: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const viewReceipt = (receiptNumber) => {
        window.open(`/receipts/${receiptNumber}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Verification" />

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* Header */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900">🔍 Payment Verification Tool</h1>
                                <p className="text-zinc-500 mt-1">Semak dan sahkan status pembayaran pelajar</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100"
                                onClick={() => setFilter('all')}
                            >
                                <p className="text-blue-800 font-medium text-sm">Jumlah Belum Bayar</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.total_unpaid}</p>
                            </div>
                            <div
                                className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100"
                                onClick={() => setFilter('discrepancy')}
                            >
                                <p className="text-red-800 font-medium text-sm">⚠️ Ada Discrepancy</p>
                                <p className="text-2xl font-bold text-red-900">{stats.has_discrepancy}</p>
                            </div>
                            <div
                                className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100"
                                onClick={() => setFilter('correct')}
                            >
                                <p className="text-green-800 font-medium text-sm">✅ Betul Belum Bayar</p>
                                <p className="text-2xl font-bold text-green-900">{stats.correctly_unpaid}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Info */}
                    {filter !== 'all' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4 flex justify-between items-center">
                            <span className="text-blue-800">
                                Menapis: <strong className="capitalize">{filter === 'discrepancy' ? 'Ada Discrepancy' : 'Betul Belum Bayar'}</strong> ({filteredStudents.length} rekod)
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
                                        <th className="text-left p-4 font-bold text-zinc-600">Nama Pelajar</th>
                                        <th className="text-left p-4 font-bold text-zinc-600">Penjaga</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Bayaran 2026</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Status</th>
                                        <th className="text-center p-4 font-bold text-zinc-600">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-zinc-500">
                                                Tiada rekod ditemui
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <>
                                                <tr
                                                    key={student.child_id}
                                                    className={`hover:bg-zinc-50 ${student.discrepancy === 'PAID_BUT_MARKED_UNPAID' ? 'bg-red-50/50' : ''}`}
                                                >
                                                    <td className="p-4 font-medium">{student.no_siri}</td>
                                                    <td className="p-4">
                                                        <div className="font-medium">{student.name}</div>
                                                        <div className="text-xs text-zinc-500">{student.training_center}</div>
                                                    </td>
                                                    <td className="p-4 text-zinc-600">{student.parent_name}</td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <span className="text-xs text-zinc-500">
                                                                {student.total_payments_2026} transaksi
                                                            </span>
                                                            {student.latest_receipt && (
                                                                <code className="bg-zinc-100 px-2 py-1 rounded text-xs">
                                                                    #{student.latest_receipt}
                                                                </code>
                                                            )}
                                                            {student.latest_amount && (
                                                                <span className="text-xs font-bold">
                                                                    RM {student.latest_amount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {student.discrepancy === 'PAID_BUT_MARKED_UNPAID' ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                                ⚠️ Sudah Bayar (Perlu Update)
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                                                ⏳ Belum Bayar
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => setExpandedStudent(expandedStudent === student.child_id ? null : student.child_id)}
                                                                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-medium"
                                                            >
                                                                {expandedStudent === student.child_id ? '▲ Tutup' : '▼ Details'}
                                                            </button>
                                                            {student.discrepancy === 'PAID_BUT_MARKED_UNPAID' && (
                                                                <button
                                                                    onClick={() => handleMarkAsPaid(student.child_id, student.name)}
                                                                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                                                                >
                                                                    ✅ Tandakan Sudah Bayar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedStudent === student.child_id && (
                                                    <tr>
                                                        <td colSpan="6" className="p-4 bg-zinc-50">
                                                            <div className="space-y-3">
                                                                <h4 className="font-bold text-sm">📋 Payment History 2026</h4>
                                                                {student.all_payments.length === 0 ? (
                                                                    <p className="text-xs text-zinc-500">Tiada rekod pembayaran 2026</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {student.all_payments.map((payment, idx) => (
                                                                            <div key={idx} className="bg-white border border-zinc-200 rounded p-3 text-xs">
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <div>
                                                                                        <div className="font-bold">Receipt #{payment.receipt_number}</div>
                                                                                        <div className="text-zinc-500">{payment.month}</div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <div className="font-bold text-green-600">RM {payment.total}</div>
                                                                                        <div className="text-zinc-400 text-[10px]">{payment.payment_date}</div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex gap-2 text-[10px] text-zinc-500">
                                                                                    <span>Base: RM{payment.amount}</span>
                                                                                    <span>•</span>
                                                                                    <span>Total: RM{payment.total}</span>
                                                                                </div>
                                                                                {payment.receipt_number && (
                                                                                    <button
                                                                                        onClick={() => viewReceipt(payment.receipt_number)}
                                                                                        className="mt-2 w-full px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium hover:bg-blue-100"
                                                                                    >
                                                                                        📄 Lihat Resit
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <div className="pt-2 border-t border-zinc-200">
                                                                    <h5 className="font-bold text-xs mb-1">Database Info:</h5>
                                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                                        <div>
                                                                            <span className="text-zinc-500">Payment Completed:</span>
                                                                            <span className={`ml-2 font-medium ${student.payment_completed ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {student.payment_completed ? 'TRUE' : 'FALSE'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-zinc-500">Payment Date:</span>
                                                                            <span className="ml-2 font-medium">{student.payment_date || 'NULL'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-zinc-500">Last Updated Year:</span>
                                                                            <span className="ml-2 font-medium">{student.last_updated_year || 'NULL'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-zinc-500">Registration Type:</span>
                                                                            <span className="ml-2 font-medium">{student.registration_type || 'NULL'}</span>
                                                                        </div>
                                                                    </div>
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
