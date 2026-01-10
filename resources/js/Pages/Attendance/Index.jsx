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
// ----------------------------------------------------------------------
// PARENT VIEW: Dashboard & Heatmap
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// PARENT VIEW: Analytics Dashboard
// ----------------------------------------------------------------------
function ParentView({ childrenData }) {
    if (!childrenData || childrenData.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-zinc-300">
                <p className="text-zinc-500">Tiada rekod peserta dijumpai. Sila tambah peserta terlebih dahulu di menu "Nama Peserta".</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {childrenData.map((child) => {
                // Calculate Stats
                const stats = child.stats || { present: 0, total_classes: 0 };
                const percentage = stats.total_classes > 0 ? Math.round((stats.present / stats.total_classes) * 100) : 0;

                return (
                    <div key={child.id} className="bg-white rounded-2xl border border-zinc-200 shadow-lg shadow-zinc-100/50 p-4 sm:p-5 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3"></div>

                        {/* Top Section: Child Info & Main KPIs */}
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xl font-bold shadow-md">
                                    {child.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{child.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 font-medium">
                                        <span className="text-blue-600">Pelajar Aktif</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Big Stat */}
                            <div className="flex items-center gap-4 bg-zinc-50 px-4 py-3 rounded-xl border border-zinc-100">
                                <div className="relative w-14 h-14">
                                    <CircularProgress percentage={percentage} color="text-blue-600" />
                                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-zinc-700">
                                        {percentage}%
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-zinc-900">{stats.present}</span>
                                        <span className="text-sm text-zinc-400 font-medium">/ {stats.total_classes}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Jumlah Kehadiran</div>
                                </div>
                            </div>
                        </div>

                        {/* Graph Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Monthly Trend Graph */}
                            <div className="lg:col-span-2 bg-gradient-to-b from-white to-zinc-50 rounded-xl border border-zinc-200 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                                        <span className="w-0.5 h-4 bg-blue-500 rounded-full"></span>
                                        Prestasi Bulanan {new Date().getFullYear()}
                                    </h4>
                                    <div className="flex gap-3 text-[10px] font-medium">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Hadir
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Tidak Hadir
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Sakit
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Cuti
                                        </div>
                                    </div>
                                </div>

                                <MonthlyChart attendances={child.attendances} />
                            </div>

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                                <InfoCard
                                    label="Kelas Dihadiri"
                                    value={stats.present + " Kelas"}
                                    desc="Sangat Bagus!"
                                    icon="🔥"
                                    bg="bg-orange-50"
                                    text="text-orange-700"
                                />
                                <InfoCard
                                    label="Tidak Hadir"
                                    value={(stats.absent || 0) + " Kelas"}
                                    desc="Sila beri tumpuan"
                                    icon="⚠️"
                                    bg="bg-rose-50"
                                    text="text-rose-700"
                                />
                                <InfoCard
                                    label="Kadar Kehadiran"
                                    value={percentage + "%"}
                                    desc="Purata tahunan"
                                    icon="📈"
                                    bg="bg-blue-50"
                                    text="text-blue-700"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// --- VISUALIZATION COMPONENTS ---

const InfoCard = ({ label, value, desc, icon, bg, text }) => (
    <div className={`p-3 rounded-lg border border-zinc-100 ${bg} flex items-start gap-3 transition-transform hover:scale-[1.02]`}>
        <div className="text-xl pt-0.5">{icon}</div>
        <div>
            <div className={`text-base font-black ${text}`}>{value}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{label}</div>
            <div className="text-[10px] text-zinc-400 font-medium">{desc}</div>
        </div>
    </div>
);

const CircularProgress = ({ percentage, color }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 80 80">
            <circle
                className="text-zinc-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
            />
            <circle
                className={`${color} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
            />
        </svg>
    );
};

const MonthlyChart = ({ attendances }) => {
    // 1. Group Data by Month (0-11)
    const monthlyData = Array(12).fill(0).map(() => ({ present: 0, absent: 0, sick: 0, leave: 0 }));

    if (attendances) {
        attendances.forEach(rec => {
            const date = new Date(rec.attendance_date);
            const month = date.getMonth(); // 0-11
            if (rec.status === 'hadir') monthlyData[month].present++;
            else if (rec.status === 'tidak_hadir') monthlyData[month].absent++;
            else if (rec.status === 'sakit') monthlyData[month].sick++;
            else if (rec.status === 'cuti') monthlyData[month].leave++;
        });
    }

    // 2. Determine Max for Scaling
    const maxVal = Math.max(...monthlyData.map(d => d.present + d.absent + d.sick + d.leave), 5);

    // 3. Render
    const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    return (
        <div className="h-40 sm:h-48 flex items-end justify-between gap-2 sm:gap-3">
            {monthlyData.map((data, idx) => {
                const heightPresent = (data.present / maxVal) * 100;
                const heightAbsent = (data.absent / maxVal) * 100;
                const heightSick = (data.sick / maxVal) * 100;
                const heightLeave = (data.leave / maxVal) * 100;

                return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none z-20 whitespace-nowrap">
                            {months[idx]}: {data.present} Hadir, {data.sick} Sakit, {data.leave} Cuti, {data.absent} Tidak Hadir
                        </div>

                        {/* Bars Container - Stacked */}
                        <div className="w-full max-w-[24px] bg-zinc-100 rounded-t-sm flex flex-col justify-end overflow-hidden relative" style={{ height: '100%' }}>
                            {/* Empty space at top */}
                            <div className="bg-transparent flex-grow"></div>

                            {/* Absent Bar */}
                            {heightAbsent > 0 && (
                                <div style={{ height: `${heightAbsent}%` }} className="w-full bg-rose-400 transition-all duration-700"></div>
                            )}
                            {(heightAbsent > 0 && (heightLeave > 0 || heightSick > 0 || heightPresent > 0)) && <div className="h-[1px] bg-white w-full"></div>}

                            {/* Leave Bar */}
                            {heightLeave > 0 && (
                                <div style={{ height: `${heightLeave}%` }} className="w-full bg-purple-400 transition-all duration-700"></div>
                            )}
                            {(heightLeave > 0 && (heightSick > 0 || heightPresent > 0)) && <div className="h-[1px] bg-white w-full"></div>}

                            {/* Sick Bar */}
                            {heightSick > 0 && (
                                <div style={{ height: `${heightSick}%` }} className="w-full bg-amber-400 transition-all duration-700"></div>
                            )}
                            {(heightSick > 0 && heightPresent > 0) && <div className="h-[1px] bg-white w-full"></div>}

                            {/* Present Bar */}
                            {heightPresent > 0 && (
                                <div style={{ height: `${heightPresent}%` }} className="w-full bg-blue-500 transition-all duration-700 rounded-t-xs"></div>
                            )}

                            {/* If all zero, showing a tiny placeholder line */}
                            {heightPresent === 0 && heightAbsent === 0 && heightSick === 0 && heightLeave === 0 && (
                                <div className="h-[2px] w-full bg-zinc-200"></div>
                            )}
                        </div>

                        {/* X-Axis Label */}
                        <span className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-tight">{months[idx]}</span>
                    </div>
                );
            })}
        </div>
    );
};

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
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Tidak Hadir: {stats.tidak_hadir}
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
                                <th className="px-6 py-3">Peserta</th>
                                <th className="px-6 py-3 w-48">Status</th>
                                <th className="px-6 py-3">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-zinc-50/50">
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
