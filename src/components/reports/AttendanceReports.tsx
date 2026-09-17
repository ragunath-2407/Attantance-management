import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Calculator, 
  Loader2 
} from 'lucide-react';
import { StudentAttendanceReport, Subject } from '../../types';
import { api } from '../../services/api';

export const AttendanceReports: React.FC = () => {
  const [reports, setReports] = useState<StudentAttendanceReport[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterThreshold, setFilterThreshold] = useState<'all' | 'defaulters' | 'good'>('all');
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchReports = async (subjectId?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const subIdNum = subjectId && subjectId !== 'All' ? Number(subjectId) : undefined;
      const [reportsData, subjectsData] = await Promise.all([
        api.getAttendanceReports(subIdNum),
        api.getSubjects(),
      ]);
      setReports(reportsData);
      setSubjects(subjectsData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch attendance reports from SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedSubject);
  }, [selectedSubject]);

  const toggleStudentExpand = (id: number) => {
    setExpandedStudentId(prev => (prev === id ? null : id));
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.register_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesThreshold = 
      filterThreshold === 'all' || 
      (filterThreshold === 'defaulters' && r.is_shortage) ||
      (filterThreshold === 'good' && !r.is_shortage);

    return matchesSearch && matchesThreshold;
  });

  const defaultersCount = reports.filter(r => r.is_shortage).length;

  const handleExportCSV = () => {
    const headers = [
      "Register Number",
      "Student Name",
      "Department",
      "Year-Sec",
      "Total Classes",
      "Present Classes",
      "Absent Classes",
      "Attendance Percentage",
      "Shortage (<75%)"
    ];
    const rows = filteredReports.map(r => [
      r.register_number,
      `"${r.student_name}"`,
      `"${r.department}"`,
      `Y${r.year}-${r.section}`,
      r.total_classes,
      r.present_count,
      r.absent_count,
      `${r.attendance_percentage}%`,
      r.is_shortage ? "YES (<75%)" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Django ORM Calculations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Attendance percentages dynamically calculated from SQLite database attendance records.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchReports(selectedSubject)}
            title="Refresh calculations from SQLite database"
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-medium transition-all"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Formula Explanation & College Criteria Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm space-y-1.5">
          <div className="flex items-center space-x-2 font-semibold text-indigo-300">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Attendance Percentage Calculation Formula:</span>
          </div>
          <p className="font-mono text-xs sm:text-sm bg-slate-950/60 p-2 rounded-lg border border-indigo-500/30 text-indigo-200">
            Attendance Percentage = (Number of Present Classes / Total Classes) × 100
          </p>
          <p className="text-[11px] text-indigo-300/80">
            Computed strictly on the backend using Django ORM aggregation. No manually entered percentages are stored.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between text-amber-200 text-xs">
          <div className="flex items-center space-x-2 text-amber-300 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Mandatory Exam Rule</span>
          </div>
          <p className="text-amber-200/90 text-xs leading-relaxed">
            Minimum <strong>75%</strong> attendance required to qualify for semester examinations.
          </p>
          <div className="mt-2 font-mono text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
            {defaultersCount} Student(s) with Shortage (&lt;75%)
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by register no, name, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Subjects (Overall Attendance)</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id.toString()}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          {/* Eligibility Threshold Filter */}
          <div className="flex items-center space-x-1 sm:justify-end">
            <button
              onClick={() => setFilterThreshold('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterThreshold === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Students
            </button>
            <button
              onClick={() => setFilterThreshold('defaulters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterThreshold === 'defaulters'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-rose-400 hover:text-white'
              }`}
            >
              Shortage (&lt;75%)
            </button>
            <button
              onClick={() => setFilterThreshold('good')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterThreshold === 'good'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-emerald-400 hover:text-white'
              }`}
            >
              Eligible (&ge;75%)
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table with Expandable Subject-level Breakdowns */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Attendance Calculations ({filteredReports.length} Students)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Source: SQLite /api/reports/attendance-percentage/
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-xs sm:text-sm">Calculating attendance statistics via Django ORM...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">No attendance reports available</p>
            <p className="text-xs text-slate-500">
              Attendance records must first be marked for students in the database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Register No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Total Classes</th>
                  <th className="p-3.5 text-center">Present Classes</th>
                  <th className="p-3.5 text-center">Absent Classes</th>
                  <th className="p-3.5">Attendance %</th>
                  <th className="p-3.5 text-center">Eligibility</th>
                  <th className="p-3.5 text-right">Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredReports.map((r) => {
                  const isShortage = r.is_shortage;
                  const isExpanded = expandedStudentId === r.student_id;
                  return (
                    <React.Fragment key={r.student_id}>
                      <tr className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-blue-400 font-medium">
                          {r.register_number}
                        </td>
                        <td className="p-3.5 font-medium text-white">
                          <div>{r.student_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Year {r.year}, Sec {r.section}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400 text-xs">
                          {r.department}
                        </td>
                        <td className="p-3.5 text-center font-mono font-medium">
                          {r.total_classes}
                        </td>
                        <td className="p-3.5 text-center font-mono text-emerald-400 font-semibold">
                          {r.present_count}
                        </td>
                        <td className="p-3.5 text-center font-mono text-rose-400 font-semibold">
                          {r.absent_count}
                        </td>
                        <td className="p-3.5 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-mono">
                              <span className={isShortage ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                {r.attendance_percentage}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {r.present_count}/{r.total_classes}
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isShortage ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(r.attendance_percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          {isShortage ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Shortage (&lt;75%)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>Eligible</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleStudentExpand(r.student_id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                          >
                            <span>Breakdown</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Per-Subject Attendance Breakdown */}
                      {isExpanded && r.subjects && r.subjects.length > 0 && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={9} className="p-4 pl-8">
                            <div className="space-y-3">
                              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                <span>Subject-Wise Attendance Breakdown for {r.student_name}:</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {r.subjects.map(sub => (
                                  <div
                                    key={sub.subject_id}
                                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono text-xs font-bold text-indigo-400">
                                        {sub.subject_code}
                                      </span>
                                      <span className={`text-xs font-mono font-bold ${
                                        sub.is_shortage ? 'text-rose-400' : 'text-emerald-400'
                                      }`}>
                                        {sub.attendance_percentage}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium truncate" title={sub.subject_name}>
                                      {sub.subject_name}
                                    </p>
                                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                                      <div>Total: <span className="text-white">{sub.total_classes}</span></div>
                                      <div>Pres: <span className="text-emerald-400">{sub.present_classes}</span></div>
                                      <div>Abs: <span className="text-rose-400">{sub.absent_classes}</span></div>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          sub.is_shortage ? 'bg-rose-500' : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min(sub.attendance_percentage, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
