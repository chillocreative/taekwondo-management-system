import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toast from '@/Components/Toast';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AttendanceIndex({ auth, students, selectedDate, flash }) {
    const [date, setDate] = useState(selectedDate);
    const [attendanceData, setAttendanceData] = useState({});
    const [toast, setToast] = useState(null);

    // Initialize attendance data from students
    useEffect(() => {
        const initialData = {};
        students.forEach(student => {
            if (student.attendance_status) {
                initialData[student.id] = {
                    status: student.attendance_status,
                    notes: student.notes || '',
                };
            }
        });
        setAttendanceData(initialData);
    }, [students]);

    // Show toast when flash messages are present
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        router.get(route('attendance.index'), { date: newDate }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status: status,
            }
        }));
    };

    const handleNotesChange = (studentId, notes) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes: notes,
            }
        }));
    };

    const handleSave = () => {
        const attendances = Object.entries(attendanceData)
            .filter(([_, data]) => data.status)
            .map(([studentId, data]) => ({
                student_id: parseInt(studentId),
                status: data.status,
                notes: data.notes || null,
            }));

        if (attendances.length === 0) {
            setToast({ message: 'Sila tandakan kehadiran sekurang-kurangnya seorang peserta.', type: 'error' });
            return;
        }

        router.post(route('attendance.bulk-mark'), {
            attendance_date: date,
            attendances: attendances,
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            hadir: 'bg-green-100 text-green-800',
            tidak_hadir: 'bg-red-100 text-red-800',
            cuti: 'bg-blue-100 text-blue-800',
            sakit: 'bg-yellow-100 text-yellow-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            hadir: 'Hadir',
            tidak_hadir: 'Tidak Hadir',
            cuti: 'Cuti',
            sakit: 'Sakit',
        };
        return labels[status] || '-';
    };

    const stats = {
        total: students.length,
        hadir: Object.values(attendanceData).filter(d => d.status === 'hadir').length,
        tidak_hadir: Object.values(attendanceData).filter(d => d.status === 'tidak_hadir').length,
        cuti: Object.values(attendanceData).filter(d => d.status === 'cuti').length,
        sakit: Object.values(attendanceData).filter(d => d.status === 'sakit').length,
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900">
                    Kehadiran Peserta
                </h2>
            }
        >
            <Head title="Kehadiran" />

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">

                    {/* Date Selector & Stats */}
                    <div className="mb-6 bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Tarikh
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                            >
                                Simpan Kehadiran
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="bg-zinc-50 rounded-lg p-4">
                                <p className="text-xs text-zinc-600 mb-1">Jumlah</p>
                                <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-xs text-green-600 mb-1">Hadir</p>
                                <p className="text-2xl font-bold text-green-700">{stats.hadir}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4">
                                <p className="text-xs text-red-600 mb-1">Tidak Hadir</p>
                                <p className="text-2xl font-bold text-red-700">{stats.tidak_hadir}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-xs text-blue-600 mb-1">Cuti</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.cuti}</p>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <p className="text-xs text-yellow-600 mb-1">Sakit</p>
                                <p className="text-2xl font-bold text-yellow-700">{stats.sakit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            No. Keahlian
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Nama Peserta
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                            Catatan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-200">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-zinc-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                {student.no_siri}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                                                {student.nama_pelajar}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                                                <span className="capitalize">{student.kategori}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={attendanceData[student.id]?.status || ''}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                                    className="text-sm border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Pilih Status</option>
                                                    <option value="hadir">Hadir</option>
                                                    <option value="tidak_hadir">Tidak Hadir</option>
                                                    <option value="cuti">Cuti</option>
                                                    <option value="sakit">Sakit</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={attendanceData[student.id]?.notes || ''}
                                                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                    placeholder="Catatan (opsional)"
                                                    className="w-full text-sm border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {students.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-zinc-500">Tiada peserta dijumpai.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
