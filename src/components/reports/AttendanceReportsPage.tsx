import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  RotateCcw,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { StudentAttendanceReport, Subject } from '../../types';
import { api } from '../../services/api';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

interface FlattenedAttendanceRow {
  studentId: number;
  studentName: string;
  registerNumber: string;
  department: string;
  year: number;
  section: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
  isShortage: boolean;
}

export const AttendanceReportsPage: React.FC = () => {
  const [reports, setReports] = useState<StudentAttendanceReport[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'All' | 'eligible' | 'shortage'>('All');

  const fetchReportsData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [reportData, subjectList] = await Promise.all([
        api.getAttendanceReports(),
        api.getSubjects(),
      ]);
      setReports(reportData);
      setSubjects(subjectList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch attendance reports from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Flatten reports into per-subject rows for clean table view
  const flattenedRows: FlattenedAttendanceRow[] = [];
  reports.forEach((rep) => {
    if (rep.subjects && rep.subjects.length > 0) {
      rep.subjects.forEach((sub) => {
        flattenedRows.push({
          studentId: rep.student_id,
          studentName: rep.student_name,
          registerNumber: rep.register_number,
          department: rep.department,
          year: rep.year,
          section: rep.section,
          subjectId: sub.subject_id,
          subjectCode: sub.subject_code,
          subjectName: sub.subject_name,
          totalClasses: sub.total_classes,
          presentClasses: sub.present_classes,
          absentClasses: sub.absent_classes,
          attendancePercentage: sub.attendance_percentage,
          isShortage: sub.total_classes > 0 ? sub.attendance_percentage < 75 : false,
        });
      });
    } else {
      flattenedRows.push({
        studentId: rep.student_id,
        studentName: rep.student_name,
        registerNumber: rep.register_number,
        department: rep.department,
        year: rep.year,
        section: rep.section,
        subjectId: 0,
        subjectCode: 'ALL',
        subjectName: 'All Subjects Combined',
        totalClasses: rep.total_classes,
        presentClasses: rep.present_classes ?? rep.present_count ?? 0,
        absentClasses: rep.absent_classes ?? rep.absent_count ?? 0,
        attendancePercentage: rep.attendance_percentage ?? rep.overall_attendance_percentage ?? 0,
        isShortage: rep.is_shortage ?? false,
      });
    }
  });

  // Filter flattened rows
  const filteredRows = flattenedRows.filter((row) => {
    const matchesSearch =
      row.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'All' || row.subjectId.toString() === selectedSubjectFilter;

    const matchesEligibility =
      eligibilityFilter === 'All'
        ? true
        : eligibilityFilter === 'shortage'
        ? row.isShortage
        : !row.isShortage;

    return matchesSearch && matchesSubject && matchesEligibility;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubjectFilter('All');
    setEligibilityFilter('All');
  };

  const hasActiveFilters = searchTerm !== '' || selectedSubjectFilter !== 'All' || eligibilityFilter !== 'All';

  // Summary Metrics
  const eligibleCount = flattenedRows.filter(r => r.totalClasses > 0 && !r.isShortage).length;
  const shortageCount = flattenedRows.filter(r => r.totalClasses > 0 && r.isShortage).length;
  const totalConducted = flattenedRows.reduce((acc, r) => acc + r.totalClasses, 0);
  const totalAttended = flattenedRows.reduce((acc, r) => acc + r.presentClasses, 0);
  const aggregateRate = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0.0';

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Register Number',
      'Department',
      'Year',
      'Section',
      'Subject Code',
      'Subject Name',
      'Total Classes',
      'Present Classes',
      'Absent Classes',
      'Attendance Percentage',
      'Exam Status',
    ];

    const rows = filteredRows.map((r) => [
      `"${r.studentName}"`,
      `"${r.registerNumber}"`,
      `"${r.department}"`,
      r.year,
      `"${r.section}"`,
      `"${r.subjectCode}"`,
      `"${r.subjectName}"`,
      r.totalClasses,
      r.presentClasses,
      r.absentClasses,
      `${r.attendancePercentage}%`,
      r.isShortage ? 'Shortage (<75%)' : 'Eligible (>=75%)',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Reports &amp; Analytics</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Computed Percentages
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Calculated attendance metrics per student and per course: Total Classes, Present, Absent, and Attendance %.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchReportsData}
            title="Refresh calculations from SQLite database"
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-export-attendance-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-purple-600/30"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* 3 Summary Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Aggregate Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Overall Rate
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {aggregateRate}%
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Across all logged sessions
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Eligible Students */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Exam Eligible (≥75%)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {eligibleCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Course enrollments meeting requirement
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Shortage Students */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Attendance Shortage (&lt;75%)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
              {shortageCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Course enrollments below requirement
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Formula & Rule Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <span className="font-semibold text-purple-400 uppercase tracking-wider text-[11px]">
            Percentage Calculation Formula
          </span>
          <p className="font-mono text-slate-200">
            Attendance Percentage = (Number of Present Classes / Total Classes) × 100
          </p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <span>Red badge indicates shortage below mandatory 75% college exam requirement</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="report-search-input"
              type="text"
              placeholder="Search student, reg no, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              id="filter-report-subject"
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>

          {/* Eligibility Filter */}
          <div className="flex items-center space-x-2">
            <select
              id="filter-report-eligibility"
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses (Eligible &amp; Shortage)</option>
              <option value="eligible">Eligible Only (≥ 75%)</option>
              <option value="shortage">Attendance Shortage Only (&lt; 75%)</option>
            </select>

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

      {/* Main Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Attendance Calculation Table ({filteredRows.length} rows)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            GET /api/reports/attendance-percentage/
          </span>
        </div>

        {isLoading ? (
          <LoadingState message="Calculating attendance summaries with Django ORM..." colorClass="text-purple-500" />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={hasActiveFilters ? 'No matching attendance calculations' : 'No report entries available'}
            description={
              hasActiveFilters
                ? 'Try resetting your search query or subject filters.'
                : 'Attendance reports will appear once sessions are marked in the system.'
            }
            actionText={hasActiveFilters ? 'Reset Filters' : undefined}
            onAction={hasActiveFilters ? resetFilters : undefined}
            actionIcon={RotateCcw}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[800px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5 text-center">Total</th>
                  <th className="p-3.5 text-center">Present</th>
                  <th className="p-3.5 text-center">Absent</th>
                  <th className="p-3.5 text-center">Attendance % &amp; Progress</th>
                  <th className="p-3.5 text-center">Exam Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRows.map((row, idx) => {
                  const isEligible = row.attendancePercentage >= 75;
                  const hasClasses = row.totalClasses > 0;

                  return (
                    <tr key={`${row.studentId}-${row.subjectId}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student */}
                      <td className="p-3.5">
                        <div>
                          <div className="font-semibold text-white">{row.studentName}</div>
                          <div className="font-mono text-xs text-blue-400 font-medium">
                            {row.registerNumber} • Y{row.year} Sec {row.section}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="p-3.5">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-400 mr-1.5">
                            {row.subjectCode}
                          </span>
                          <span className="text-slate-300 text-xs">
                            {row.subjectName}
                          </span>
                        </div>
                      </td>

                      {/* Total Classes */}
                      <td className="p-3.5 text-center font-mono font-semibold text-slate-200">
                        {row.totalClasses}
                      </td>

                      {/* Present */}
                      <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">
                        {row.presentClasses}
                      </td>

                      {/* Absent */}
                      <td className="p-3.5 text-center font-mono text-rose-400 font-bold">
                        {row.absentClasses}
                      </td>

                      {/* Attendance Percentage with Clear Visual Meter and Fraction */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center space-y-1.5 max-w-[140px] mx-auto">
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono font-extrabold text-sm ${
                              !hasClasses 
                                ? 'text-slate-500' 
                                : isEligible 
                                ? 'text-emerald-400' 
                                : 'text-rose-400'
                            }`}>
                              {hasClasses ? `${row.attendancePercentage}%` : 'N/A'}
                            </span>
                            {hasClasses && (
                              <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                                ({row.presentClasses}/{row.totalClasses})
                              </span>
                            )}
                          </div>

                          {hasClasses && (
                            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(row.attendancePercentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Eligibility Badge */}
                      <td className="p-3.5 text-center">
                        {!hasClasses ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            No Classes Logged
                          </span>
                        ) : isEligible ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Shortage (&lt;75%)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
