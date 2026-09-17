import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Trash2,
  BookOpen,
  CheckCircle2, 
  X, 
  ShieldAlert,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Student, Subject } from '../../types';
import { api } from '../../services/api';

export const AttendanceManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Live database data loaded from SQLite via Django REST Framework
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal and notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Mark Attendance Form State (Steps 1 to 5)
  const [modalForm, setModalForm] = useState<{
    student_id: number | '';
    subject_id: number | '';
    attendance_date: string;
    status: AttendanceStatus;
    remarks: string;
  }>({
    student_id: '',
    subject_id: '',
    attendance_date: new Date().toISOString().slice(0, 10),
    status: 'Present',
    remarks: '',
  });

  // Load live data from SQLite backend
  const loadDatabaseData = async () => {
    setIsLoading(true);
    try {
      const [students, subjects, attendanceRecords] = await Promise.all([
        api.getStudents(),
        api.getSubjects(),
        api.getAttendanceRecords(),
      ]);
      setStudentsList(students);
      setSubjectsList(subjects);
      setRecords(attendanceRecords);

      // Set default selections for modal form if empty
      if (students.length > 0 && modalForm.student_id === '') {
        setModalForm(prev => ({ ...prev, student_id: students[0].id }));
      }
      if (subjects.length > 0 && modalForm.subject_id === '') {
        setModalForm(prev => ({ ...prev, subject_id: subjects[0].id }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Mark Attendance with full client and server validation
  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!modalForm.student_id) {
      setErrorMessage('Student required.');
      return;
    }
    if (!modalForm.subject_id) {
      setErrorMessage('Subject required.');
      return;
    }
    if (!modalForm.attendance_date || !modalForm.attendance_date.trim()) {
      setErrorMessage('Date required.');
      return;
    }
    if (!modalForm.status) {
      setErrorMessage('Status required.');
      return;
    }
    if (modalForm.status !== 'Present' && modalForm.status !== 'Absent') {
      setErrorMessage('Status must be Present or Absent.');
      return;
    }

    // Client-side duplicate check
    const isDuplicate = records.some(
      r => r.student === Number(modalForm.student_id) &&
           r.subject === Number(modalForm.subject_id) &&
           (r.attendance_date === modalForm.attendance_date || (r as any).date === modalForm.attendance_date)
    );
    if (isDuplicate) {
      setErrorMessage('Duplicate attendance for the same student, subject and date must be prevented.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save attendance record to database via REST API
      await api.markAttendance({
        student: Number(modalForm.student_id),
        subject: Number(modalForm.subject_id),
        attendance_date: modalForm.attendance_date,
        status: modalForm.status,
        remarks: modalForm.remarks || undefined,
      });

      // Refresh records from SQLite database
      const updatedRecords = await api.getAttendanceRecords();
      setRecords(updatedRecords);

      const stObj = studentsList.find(s => s.id === Number(modalForm.student_id));
      const subObj = subjectsList.find(s => s.id === Number(modalForm.subject_id));

      setIsAddModalOpen(false);
      setSuccessMessage(
        `Attendance recorded successfully: ${stObj?.name || 'Student'} marked ${modalForm.status} for ${subObj?.subject_code || 'Subject'} on ${modalForm.attendance_date}.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record attendance in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status directly in table (calls PUT / PATCH /api/attendance/{id}/)
  const handleStatusToggle = async (id: number, nextStatus: AttendanceStatus) => {
    try {
      await api.updateAttendance(id, { status: nextStatus });
      setRecords(records.map(r => r.id === id ? { ...r, status: nextStatus } : r));
      setSuccessMessage(`Updated record #${id} to ${nextStatus} in SQLite.`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update record in database.');
    }
  };

  // Delete attendance record
  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete attendance record #${id}?`)) return;
    try {
      await api.deleteAttendance(id);
      setRecords(records.filter(r => r.id !== id));
      setSuccessMessage(`Attendance record #${id} deleted from SQLite.`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete record.');
    }
  };

  // Filter records based on UI controls
  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      (r.student_register_number && r.student_register_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.student_name && r.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.subject_code && r.subject_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.subject_name && r.subject_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSubject = selectedSubjectId === 'All' || r.subject === Number(selectedSubjectId);
    const matchesDate = !selectedDate || r.attendance_date === selectedDate;

    return matchesSearch && matchesStatus && matchesSubject && matchesDate;
  });

  const presentCount = filteredRecords.filter(r => r.status === 'Present').length;
  const absentCount = filteredRecords.filter(r => r.status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Management</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Live SQLite Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Mark daily attendance, enforce unique student-subject-date records, and prevent duplicates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-refresh-attendance"
            onClick={loadDatabaseData}
            title="Refresh from SQLite database"
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-mark-attendance"
            onClick={() => {
              setErrorMessage(null);
              if (studentsList.length > 0 && !modalForm.student_id) {
                setModalForm(prev => ({ ...prev, student_id: studentsList[0].id }));
              }
              if (subjectsList.length > 0 && !modalForm.subject_id) {
                setModalForm(prev => ({ ...prev, subject_id: subjectsList[0].id }));
              }
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Selection Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Attendance Date</span>
            </label>
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Filter Subject</span>
            </label>
            <select
              id="attendance-subject-select"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Subjects ({subjectsList.length})</option>
              {subjectsList.map(sub => (
                <option key={sub.id} value={sub.id.toString()}>
                  {sub.subject_code} - {sub.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Status Filter</span>
            </label>
            <select
              id="attendance-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses (Present & Absent)</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center space-x-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quick Search</span>
            </label>
            <input
              type="text"
              placeholder="Search student or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quick Summary Pill Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Class Session Summary:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Present: {presentCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
            Absent: {absentCount}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            Showing: {filteredRecords.length} of {records.length} records in SQLite
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Attendance Records ({filteredRecords.length} Entries)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Table: attendance_record (SQLite)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs sm:text-sm">Loading attendance records from SQLite database...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No attendance records found</p>
            <p className="text-xs text-slate-500">
              Click &quot;Mark Attendance&quot; above to select a student, subject, date, and status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Record ID</th>
                  <th className="p-3.5">Register No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Remarks</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-slate-500 text-xs">
                      #{r.id}
                    </td>
                    <td className="p-3.5 font-mono text-blue-400 font-medium">
                      {r.student_register_number || `Student #${r.student}`}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {r.student_name || `Student #${r.student}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-indigo-300 text-xs font-semibold">
                        {r.subject_code || `Subject #${r.subject}`}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {r.subject_name}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 text-xs">
                      {r.attendance_date}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleStatusToggle(r.id, r.status === 'Present' ? 'Absent' : 'Present')}
                        title="Click to toggle status"
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          r.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {r.status === 'Present' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{r.status}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-xs text-slate-400 italic">
                      {r.remarks || '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        title="Delete record from SQLite"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MARK ATTENDANCE MODAL (Steps 1 to 5) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Mark Attendance</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddAttendance} className="space-y-4 text-xs sm:text-sm">
              {/* Step 1: Select Student */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  1. Select a Student *
                </label>
                <select
                  id="select-student-fk"
                  required
                  value={modalForm.student_id}
                  onChange={(e) => setModalForm({ ...modalForm, student_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>-- Select a student from database --</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.register_number} - {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Subject */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  2. Select a Subject *
                </label>
                <select
                  id="select-subject-fk"
                  required
                  value={modalForm.subject_id}
                  onChange={(e) => setModalForm({ ...modalForm, subject_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="" disabled>-- Select a subject from database --</option>
                  {subjectsList.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Select Attendance Date */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  3. Select an Attendance Date *
                </label>
                <input
                  id="select-attendance-date"
                  type="date"
                  required
                  value={modalForm.attendance_date}
                  onChange={(e) => setModalForm({ ...modalForm, attendance_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Step 4: Select Present or Absent */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  4. Select Status * (Present or Absent)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="btn-status-present"
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, status: 'Present' })}
                    className={`py-2 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-all ${
                      modalForm.status === 'Present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>
                  <button
                    id="btn-status-absent"
                    type="button"
                    onClick={() => setModalForm({ ...modalForm, status: 'Absent' })}
                    className={`py-2 rounded-xl font-medium text-xs flex items-center justify-center space-x-1.5 transition-all ${
                      modalForm.status === 'Absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>

              {/* Optional Remarks */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. On-duty, medical exemption, on-time"
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm({ ...modalForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Step 5: Save Record */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-attendance-record"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>5. Save Record to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
