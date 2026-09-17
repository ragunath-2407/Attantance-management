import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { AttendanceRecord, Subject, Student, NavigationTab } from '../../types';
import { api } from '../../services/api';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

interface AttendanceListPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onEditAttendance: (id: number) => void;
}

export const AttendanceListPage: React.FC<AttendanceListPageProps> = ({
  onNavigateTab,
  onEditAttendance,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete modal state
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [recData, subjData, studData] = await Promise.all([
        api.getAttendanceRecords(),
        api.getSubjects(),
        api.getStudents(),
      ]);
      setRecords(recData);
      setSubjects(subjData);
      setStudents(studData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch attendance records from SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAttendance(recordToDelete.id);
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setSuccessMessage(`Attendance record #${recordToDelete.id} was deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setRecordToDelete(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete attendance record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubjectId('All');
    setSelectedStatus('All');
    setSelectedDate('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedSubjectId !== 'All' || selectedStatus !== 'All' || selectedDate !== '';

  // Build lookups
  const studentMap = new Map<number, Student>(students.map(s => [s.id, s]));
  const subjectMap = new Map<number, Subject>(subjects.map(s => [s.id, s]));

  const filteredRecords = records.filter(rec => {
    const student = studentMap.get(rec.student);
    const subject = subjectMap.get(rec.subject);

    const studentName = rec.student_name || student?.name || '';
    const regNum = rec.student_register_number || student?.register_number || '';
    const subName = rec.subject_name || subject?.subject_name || '';
    const subCode = rec.subject_code || subject?.subject_code || '';

    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubjectId === 'All' || rec.subject.toString() === selectedSubjectId;
    const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;
    const matchesDate = !selectedDate || rec.attendance_date === selectedDate;

    return matchesSearch && matchesSubject && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Records</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {records.length} Recorded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical lecture session attendance logs with student details, course offerings, and status.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchData}
            title="Refresh from SQLite database"
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-navigate-mark-attendance"
            onClick={() => onNavigateTab('mark-attendance')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-500 font-semibold text-xs sm:text-sm transition-all shadow-md shadow-amber-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder="Search student, reg no, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div>
            <select
              id="filter-attendance-subject"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.subject_code} - {sub.subject_name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-attendance-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <input
              id="filter-attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Attendance Records ({filteredRecords.length} of {records.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Table: attendance_record
          </span>
        </div>

        {isLoading ? (
          <LoadingState message="Loading attendance session records..." colorClass="text-amber-500" />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={hasActiveFilters ? 'No matching attendance records' : 'No attendance recorded yet'}
            description={
              hasActiveFilters
                ? 'Try changing your search terms or clearing active date and status filters.'
                : 'Begin marking lecture attendance for enrolled students.'
            }
            actionText={hasActiveFilters ? 'Reset Filters' : 'Mark Attendance'}
            onAction={hasActiveFilters ? resetFilters : () => onNavigateTab('mark-attendance')}
            actionIcon={hasActiveFilters ? RotateCcw : Plus}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[750px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Register Number</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Visual Status</th>
                  <th className="p-3.5">Remarks</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRecords.map((r) => {
                  const student = studentMap.get(r.student);
                  const subject = subjectMap.get(r.subject);
                  const isPresent = r.status === 'Present';

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student */}
                      <td className="p-3.5 font-medium text-white">
                        {r.student_name || student?.name || `Student #${r.student}`}
                      </td>

                      {/* Register Number */}
                      <td className="p-3.5 font-mono text-blue-400 font-semibold">
                        {r.student_register_number || student?.register_number || '—'}
                      </td>

                      {/* Subject */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs text-indigo-400 mr-1.5 font-semibold">
                            {r.subject_code || subject?.subject_code}
                          </span>
                          <span className="text-slate-300">
                            {r.subject_name || subject?.subject_name}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 font-mono text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{r.attendance_date}</span>
                        </div>
                      </td>

                      {/* Visual Status Indicator: Present (Green) vs Absent (Red) */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs ${
                            isPresent
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="p-3.5 text-slate-400 text-xs italic">
                        {r.remarks || '—'}
                      </td>

                      {/* Actions: Edit and Delete */}
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            id={`btn-edit-attendance-${r.id}`}
                            onClick={() => onEditAttendance(r.id)}
                            title="Edit Attendance Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors border border-transparent hover:border-amber-500/20"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-attendance-${r.id}`}
                            onClick={() => setRecordToDelete(r)}
                            title="Delete Attendance Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(recordToDelete)}
        title="Delete Attendance Record"
        message={`Are you sure you want to delete this attendance record for ${
          recordToDelete?.student_name || `Student #${recordToDelete?.student}`
        } on ${recordToDelete?.attendance_date}?`}
        confirmText="Confirm Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />
    </div>
  );
};
