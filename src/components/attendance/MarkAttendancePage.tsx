import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Student, Subject, AttendanceStatus, NavigationTab, AttendanceRecord } from '../../types';
import { api } from '../../services/api';
import { AlertBanner } from '../common/AlertBanner';

interface MarkAttendancePageProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

interface FieldErrors {
  student?: string;
  subject?: string;
  date?: string;
  status?: string;
}

export const MarkAttendancePage: React.FC<MarkAttendancePageProps> = ({ onNavigateTab }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState<boolean>(true);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [remarks, setRemarks] = useState<string>('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingDropdowns(true);
      try {
        const [studData, subjData, attendanceData] = await Promise.all([
          api.getStudents(),
          api.getSubjects(),
          api.getAttendanceRecords().catch(() => []),
        ]);
        setStudents(studData);
        setSubjects(subjData);
        setExistingRecords(attendanceData);

        if (studData.length > 0) setSelectedStudentId(studData[0].id);
        if (subjData.length > 0) setSelectedSubjectId(subjData[0].id);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load students and subjects from database.');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadData();
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    // 1. Student required
    if (!selectedStudentId) {
      errors.student = 'Student required.';
    }

    // 2. Subject required
    if (!selectedSubjectId) {
      errors.subject = 'Subject required.';
    }

    // 3. Date required
    if (!attendanceDate || !attendanceDate.trim()) {
      errors.date = 'Date required.';
    }

    // 4. Status required and must be Present or Absent
    if (!status) {
      errors.status = 'Status required.';
    } else if (status !== 'Present' && status !== 'Absent') {
      errors.status = 'Status must be Present or Absent.';
    }

    // 5. Duplicate attendance prevention: duplicate attendance for the same student, subject and date must be prevented
    if (selectedStudentId && selectedSubjectId && attendanceDate) {
      const isDuplicate = existingRecords.some(
        r => r.student === Number(selectedStudentId) &&
             r.subject === Number(selectedSubjectId) &&
             (r.attendance_date === attendanceDate || (r as any).date === attendanceDate)
      );

      if (isDuplicate) {
        setFieldErrors(errors);
        setErrorMessage('Duplicate attendance for the same student, subject and date must be prevented.');
        return false;
      }
    }

    setFieldErrors(errors);

    const firstError = Object.values(errors)[0];
    if (firstError) {
      setErrorMessage(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Complete client-side validation
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await api.markAttendance({
        student: Number(selectedStudentId),
        subject: Number(selectedSubjectId),
        attendance_date: attendanceDate,
        status,
        remarks: remarks.trim() || undefined,
      });

      const selectedStudent = students.find(s => s.id === Number(selectedStudentId));
      setSuccessMessage(
        `Attendance marked as ${status} for ${selectedStudent?.name || `Student #${saved.student}`} on ${attendanceDate}!`
      );

      setTimeout(() => {
        onNavigateTab('attendance');
      }, 1300);
    } catch (err: any) {
      const msg = err.message || 'Failed to save attendance record.';
      setErrorMessage(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('student')) {
        setFieldErrors(prev => ({ ...prev, student: msg }));
      } else if (lower.includes('subject')) {
        setFieldErrors(prev => ({ ...prev, subject: msg }));
      } else if (lower.includes('date')) {
        setFieldErrors(prev => ({ ...prev, date: msg }));
      } else if (lower.includes('status')) {
        setFieldErrors(prev => ({ ...prev, status: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-to-attendance"
            onClick={() => onNavigateTab('attendance')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mark Attendance</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Record individual daily lecture session attendance with full client and server duplicate validation.
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
          POST /api/attendance/
        </span>
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        {isLoadingDropdowns ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs sm:text-sm">Loading students and subjects from database...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. Student Selection */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Student <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-attendance-student"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value ? Number(e.target.value) : '');
                    if (fieldErrors.student) setFieldErrors({ ...fieldErrors, student: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none transition-colors ${
                    fieldErrors.student ? 'border-rose-500 text-rose-300' : 'border-slate-800 focus:border-amber-500'
                  }`}
                >
                  <option value="">-- Choose Enrolled Student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.register_number} — {student.name} ({student.department}, Y{student.year} Sec {student.section})
                    </option>
                  ))}
                </select>
                {fieldErrors.student && (
                  <p id="error-attendance-student" className="text-xs text-rose-400 font-medium">{fieldErrors.student}</p>
                )}
              </div>

              {/* 2. Subject Selection */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Subject Course <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-attendance-subject"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value ? Number(e.target.value) : '');
                    if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none transition-colors ${
                    fieldErrors.subject ? 'border-rose-500 text-rose-300' : 'border-slate-800 focus:border-amber-500'
                  }`}
                >
                  <option value="">-- Choose Course Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      [{sub.subject_code}] {sub.subject_name} ({sub.department}, Sem {sub.semester})
                    </option>
                  ))}
                </select>
                {fieldErrors.subject && (
                  <p id="error-attendance-subject" className="text-xs text-rose-400 font-medium">{fieldErrors.subject}</p>
                )}
              </div>

              {/* 3. Attendance Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Attendance Date <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-attendance-date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => {
                    setAttendanceDate(e.target.value);
                    if (fieldErrors.date) setFieldErrors({ ...fieldErrors, date: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-white text-sm focus:outline-none transition-colors ${
                    fieldErrors.date ? 'border-rose-500 text-rose-300' : 'border-slate-800 focus:border-amber-500'
                  }`}
                />
                {fieldErrors.date && (
                  <p id="error-attendance-date" className="text-xs text-rose-400 font-medium">{fieldErrors.date}</p>
                )}
              </div>

              {/* 4. Present / Absent Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Attendance Status <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="btn-status-present"
                    onClick={() => {
                      setStatus('Present');
                      if (fieldErrors.status) setFieldErrors({ ...fieldErrors, status: undefined });
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                      status === 'Present'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    id="btn-status-absent"
                    onClick={() => {
                      setStatus('Absent');
                      if (fieldErrors.status) setFieldErrors({ ...fieldErrors, status: undefined });
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                      status === 'Absent'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Absent</span>
                  </button>
                </div>
                {fieldErrors.status && (
                  <p id="error-attendance-status" className="text-xs text-rose-400 font-medium">{fieldErrors.status}</p>
                )}
              </div>

              {/* 5. Remarks */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Remarks (Optional)
                </label>
                <input
                  id="input-attendance-remarks"
                  type="text"
                  placeholder="e.g. Regular class session, On-duty approval, Medical leave"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Validation Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
              <span className="text-amber-400 font-semibold">Strict Rule:</span> Student required, Subject required, Date required, Status must be Present or Absent. Duplicate attendance for the same student, subject and date is strictly prevented.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-submit-attendance"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-md shadow-amber-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Recording...' : 'Submit Attendance'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
