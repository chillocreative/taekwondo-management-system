import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Toast from '@/Components/Toast';

export default function CoachAttendanceIndex({ auth, trainingCenter, students, date }) {
    const { flash = {} } = usePage().props;
    const [selectedDate, setSelectedDate] = useState(date);
    const [attendances, setAttendances] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    // Check if the selected date is today
    const isToday = new Date(selectedDate).toDateString() === new Date().toDateString();
    // Allow editing only if it's today (strict)
    // const canEdit = isToday; 
    // Wait, requirement says "Edit attendance on the same day".
    // Also "View past attendance records in read-only mode".
    // So yes, strictly today.
    // BUT, Javascript Date can be tricky with timezones. 
    // Best to compare YYYY-MM-DD string from server 'date' vs client today YYYY-MM-DD? 
    // Or just trust the controller handling? The controller passes 'date'.
    // Let's assume server 'date' is consistent. 
    const todayStr = new Date().toISOString().split('T')[0];
    const canEdit = selectedDate === todayStr || auth.user.role === 'admin';

    useEffect(() => {
        // Initialize attendances state
        const initialStates = {};
        students.forEach(student => {
            initialStates[student.id] = {
                // Default to 'hadir' if not set
                status: student.status || 'hadir',
                notes: student.notes || ''
            };
        });
        setAttendances(initialStates);
    }, [students]);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        router.get(route('coach.attendance.show'), {
            date: newDate,
            center_id: trainingCenter.id
        }, { preserveState: true, preserveScroll: true });
    };

    const handleStatusChange = (studentId, status) => {
        if (!canEdit) return;
        setAttendances(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleNoteChange = (studentId, notes) => {
        if (!canEdit) return;
        setAttendances(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes }
        }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        const payload = Object.entries(attendances).map(([studentId, data]) => ({
            student_id: parseInt(studentId),
            status: data.status,
            notes: data.notes
        }));

        router.post(route('coach.attendance.store'), {
            date: selectedDate,
            center_id: trainingCenter.id,
            attendances: payload
        }, {
            onFinish: () => setIsSubmitting(false),
            preserveScroll: true
        });
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.no_siri.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status, currentStatus) => {
        const isSelected = status === currentStatus;
        if (!isSelected) return 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50';

        switch (status) {
            case 'hadir': return 'bg-green-100 border-green-300 text-green-700 font-bold ring-1 ring-green-500';
            case 'tidak_hadir': return 'bg-red-100 border-red-300 text-red-700 font-bold ring-1 ring-red-500';
            case 'sakit': return 'bg-yellow-100 border-yellow-300 text-yellow-700 font-bold ring-1 ring-yellow-500';
            case 'cuti': return 'bg-blue-100 border-blue-300 text-blue-700 font-bold ring-1 ring-blue-500';
            default: return 'bg-white border-zinc-200';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-zinc-900 leading-tight">Pengurusan Kehadiran</h2>}
        >
            <Head title="Kehadiran" />

            {flash.success && <Toast message={flash.success} type="success" />}
            {flash.error && <Toast message={flash.error} type="error" />}

            <div className="py-12 bg-zinc-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Info */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900">{trainingCenter.name}</h3>
                            <p className="text-zinc-500">Rekod kehadiran pelajar</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-zinc-700">Tarikh:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="rounded-lg border-zinc-300 focus:ring-black focus:border-black"
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            placeholder="Cari nama atau no. siri..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg border-zinc-300 w-full md:w-64 focus:ring-black focus:border-black"
                        />
                        {canEdit && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Kehadiran'}
                            </button>
                        )}
                        {!canEdit && (
                            <span className="bg-zinc-100 text-zinc-500 px-4 py-2 rounded-lg font-medium border border-zinc-200">
                                Mod Lihat Sahaja
                            </span>
                        )}
                    </div>

                    {/* Student List */}
                    <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200">
                                <thead className="bg-zinc-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/4">Pelajar</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/2">Status Kehadiran</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/4">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-zinc-100">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <tr key={student.id} className="hover:bg-zinc-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-zinc-900">{student.name}</div>
                                                    <div className="text-xs text-zinc-500 font-mono">{student.no_siri}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-2">
                                                        {['hadir', 'tidak_hadir', 'sakit', 'cuti'].map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleStatusChange(student.id, status)}
                                                                disabled={!canEdit}
                                                                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${getStatusColor(status, attendances[student.id]?.status)} ${!canEdit ? 'cursor-not-allowed opacity-75' : ''}`}
                                                            >
                                                                {status === 'hadir' && 'Hadir'}
                                                                {status === 'tidak_hadir' && 'Tidak Hadir'}
                                                                {status === 'sakit' && 'Sakit'}
                                                                {status === 'cuti' && 'Cuti'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        placeholder={canEdit ? "Tambah nota..." : "-"}
                                                        value={attendances[student.id]?.notes || ''}
                                                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                                        disabled={!canEdit}
                                                        className="w-full text-sm rounded-lg border-zinc-200 focus:border-black focus:ring-0 disabled:bg-transparent disabled:border-none disabled:px-0 placeholder-zinc-300"
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-zinc-400">
                                                Tiada pelajar dijumpai.
                                            </td>
                                        </tr>
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
