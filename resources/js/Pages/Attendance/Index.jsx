import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Toast from '@/Components/Toast';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// Shadcn-like Badge Component
const Badge = ({ status }) => {
    const styles = {
        hadir: 'bg-green-100 text-green-700 border-green-200',
        tidak_hadir: 'bg-red-100 text-red-700 border-red-200',
        cuti: 'bg-blue-100 text-blue-700 border-blue-200',
        sakit: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    const labels = {
        hadir: 'Hadir',
        tidak_hadir: 'Tidak Hadir',
        cuti: 'Cuti',
        sakit: 'Sakit',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    );
};

export default function AttendanceIndex({ auth, isParent, children, students, selectedDate, flash }) {
    const [toast, setToast] = useState(null);

    // Show toast when flash messages are present
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-zinc-900">
                        Kehadiran
                    </h2>
                    {isParent && <span className="text-sm text-zinc-500">Rekod Kehadiran Anak</span>}
                </div>
            }
        >
            <Head title="Kehadiran" />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="py-6 sm:py-12 bg-zinc-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {isParent ? (
                        <ParentView childrenData={children} />
                    ) : (
                        <CoachView students={students} selectedDate={selectedDate} setToast={setToast} />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ----------------------------------------------------------------------
// PARENT VIEW: View Only
// ----------------------------------------------------------------------
function ParentView({ childrenData }) {
    if (!childrenData || childrenData.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-zinc-300">
                <p className="text-zinc-500">Tiada rekod anak dijumpai.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {childrenData.map((child) => (
                <div key={child.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    {/* Child Header */}
                    <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {child.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">{child.name}</h3>
                                <p className="text-xs text-zinc-500 font-mono">{child.no_keahlian}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-3 py-1 bg-green-50 rounded-lg border border-green-100">
                                <span className="block text-xs text-green-600 font-medium">Hadir</span>
                                <span className="block text-lg font-bold text-green-700 leading-none">{child.stats.present}</span>
                            </div>
                            <div className="px-3 py-1 bg-zinc-50 rounded-lg border border-zinc-100">
                                <span className="block text-xs text-zinc-500 font-medium">Total</span>
                                <span className="block text-lg font-bold text-zinc-700 leading-none">{child.stats.total_classes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance History Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-3">Tarikh</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {child.attendances && child.attendances.length > 0 ? (
                                    child.attendances.map((record) => (
                                        <tr key={record.id} className="hover:bg-zinc-50/50">
                                            <td className="px-6 py-3 text-zinc-900 font-medium whitespace-nowrap">
                                                {new Date(record.attendance_date).toLocaleDateString('ms-MY', {
                                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Badge status={record.status} />
                                            </td>
                                            <td className="px-6 py-3 text-zinc-500 italic">
                                                {record.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-zinc-400">
                                            Tiada rekod kehadiran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ----------------------------------------------------------------------
// COACH VIEW: Input & Mark
// ----------------------------------------------------------------------
function CoachView({ students, selectedDate, setToast }) {
    const [date, setDate] = useState(selectedDate);
    const [attendanceData, setAttendanceData] = useState({});

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

    const handleDateChange = (newDate) => {
        setDate(newDate);
        router.get(route('attendance.index'), { date: newDate }, { preserveState: true, preserveScroll: true });
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    };

    const handleNotesChange = (studentId, notes) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: { ...prev[studentId], notes } }));
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
            setToast({ message: 'Sila tandakan data dahulu.', type: 'error' });
            return;
        }

        router.post(route('attendance.bulk-mark'), { attendance_date: date, attendances });
    };

    const stats = {
        total: students.length,
        hadir: Object.values(attendanceData).filter(d => d.status === 'hadir').length,
        tidak_hadir: Object.values(attendanceData).filter(d => d.status === 'tidak_hadir').length,
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-medium text-zinc-600">Tarikh:</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Hadir: {stats.hadir}
                        </span>
                        <span className="flex items-center gap-1 text-red-700 font-medium">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Absent: {stats.tidak_hadir}
                        </span>
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        Simpan
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-24">No.</th>
                                <th className="px-6 py-3">Peserta</th>
                                <th className="px-6 py-3 w-48">Status</th>
                                <th className="px-6 py-3">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-zinc-50/50">
                                    <td className="px-6 py-3 text-zinc-500 font-mono text-xs">{student.no_siri}</td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium text-zinc-900">{student.nama_pelajar}</div>
                                        <div className="text-xs text-zinc-500 capitalize">{student.kategori}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <select
                                            value={attendanceData[student.id]?.status || ''}
                                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">- Pilih -</option>
                                            <option value="hadir">Hadir</option>
                                            <option value="tidak_hadir">Tidak Hadir</option>
                                            <option value="cuti">Cuti</option>
                                            <option value="sakit">Sakit</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            type="text"
                                            value={attendanceData[student.id]?.notes || ''}
                                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                            placeholder="..."
                                            className="w-full px-2 py-1.5 text-sm border-zinc-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {students.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">Tiada peserta.</div>
                )}
            </div>
        </div>
    );
}
