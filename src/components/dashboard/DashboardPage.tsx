import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCw, 
  PlusCircle, 
  ArrowRight,
  UserPlus,
  BookPlus,
  Calendar,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';
import { NavigationTab, DashboardStats, AttendanceRecord, SubjectWiseAttendance, AttendanceDailyTrend } from '../../types';
import { api } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { AlertBanner } from '../common/AlertBanner';

interface DashboardPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardStats = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setErrorMessage(null);
    try {
      const [statsData, recordsData] = await Promise.all([
        api.getDashboardStats(),
        api.getAttendanceRecords().catch(() => []),
      ]);
      setStats(statsData);
      
      // Use recent records from backend or fallback to first 6 records from attendance
      if (statsData.recent_records && statsData.recent_records.length > 0) {
        setRecentRecords(statsData.recent_records.slice(0, 6));
      } else {
        setRecentRecords(recordsData.slice(0, 6));
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch dashboard metrics from the database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount
    fetchDashboardStats();

    // 1. Listen for global attendance changes (when user marks, updates, or deletes attendance)
    const handleAttendanceChange = () => {
      fetchDashboardStats();
    };
    window.addEventListener('attendanceChanged', handleAttendanceChange);

    // 2. Refresh when browser window/tab gains focus
    const handleWindowFocus = () => {
      fetchDashboardStats();
    };
    window.addEventListener('focus', handleWindowFocus);

    // 3. Periodic polling interval (every 12 seconds)
    const pollInterval = setInterval(() => {
      fetchDashboardStats();
    }, 12000);

    return () => {
      window.removeEventListener('attendanceChanged', handleAttendanceChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(pollInterval);
    };
  }, [fetchDashboardStats]);

  // Calculated metrics directly from backend database
  const totalStudents = stats?.total_students ?? 0;
  const totalSubjects = stats?.total_subjects ?? 0;
  const totalAttendance = stats?.total_attendance_records ?? 0;
  const totalPresent = stats?.total_present_records ?? stats?.present_count ?? 0;
  const totalAbsent = stats?.total_absent_records ?? stats?.absent_count ?? 0;
  const overallPercentage = stats?.overall_attendance_percentage ?? stats?.overall_percentage ?? stats?.overall_attendance_rate ?? 0;

  // Chart datasets from actual database records
  const subjectWiseList: SubjectWiseAttendance[] = stats?.subject_wise_attendance ?? [];
  const dateWiseTrend: AttendanceDailyTrend[] = stats?.attendance_summary_by_date ?? [];

  // Present vs Absent percentages
  const presentPct = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 1000) / 10 : 0;
  const absentPct = totalAttendance > 0 ? Math.round((totalAbsent / totalAttendance) * 1000) / 10 : 0;

  // SVG Circular progress math for Donut chart
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const presentStrokeDashoffset = circumference - (presentPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Academic Dashboard</h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Database API</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time enrollment, curriculum offerings, and attendance metrics computed directly from the database.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500 hidden md:inline-flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </span>
          )}
          <button
            id="btn-refresh-dashboard"
            onClick={() => fetchDashboardStats(true)}
            disabled={isRefreshing}
            title="Refresh metrics from database"
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || (isLoading && !stats) ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            id="btn-quick-mark"
            onClick={() => onNavigateTab('mark-attendance')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* 6 Core Required Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Students */}
        <StatCard
          id="card-total-students"
          title="Total Students"
          value={isLoading && !stats ? '...' : totalStudents}
          subtitle="Enrolled students"
          icon={Users}
          colorClass="text-blue-400"
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/20"
          badgeText="Students"
          badgeColorClass="bg-blue-500/10 text-blue-300 border-blue-500/30"
          onClick={() => onNavigateTab('students')}
        />

        {/* 2. Total Subjects */}
        <StatCard
          id="card-total-subjects"
          title="Total Subjects"
          value={isLoading && !stats ? '...' : totalSubjects}
          subtitle="Course catalog"
          icon={BookOpen}
          colorClass="text-indigo-400"
          bgClass="bg-indigo-500/10"
          borderClass="border-indigo-500/20"
          badgeText="Curriculum"
          badgeColorClass="bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
          onClick={() => onNavigateTab('subjects')}
        />

        {/* 3. Total Attendance Records */}
        <StatCard
          id="card-total-records"
          title="Total Attendance Records"
          value={isLoading && !stats ? '...' : totalAttendance}
          subtitle="Logged sessions"
          icon={CalendarCheck}
          colorClass="text-amber-400"
          bgClass="bg-amber-500/10"
          borderClass="border-amber-500/20"
          badgeText="All Records"
          badgeColorClass="bg-amber-500/10 text-amber-300 border-amber-500/30"
          onClick={() => onNavigateTab('attendance')}
        />

        {/* 4. Total Present Records */}
        <StatCard
          id="card-present-records"
          title="Total Present Records"
          value={isLoading && !stats ? '...' : totalPresent}
          subtitle={`${presentPct}% of logged records`}
          icon={CheckCircle}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/20"
          badgeText="Present"
          badgeColorClass="bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
          onClick={() => onNavigateTab('attendance')}
        />

        {/* 5. Total Absent Records */}
        <StatCard
          id="card-absent-records"
          title="Total Absent Records"
          value={isLoading && !stats ? '...' : totalAbsent}
          subtitle={`${absentPct}% of logged records`}
          icon={XCircle}
          colorClass="text-rose-400"
          bgClass="bg-rose-500/10"
          borderClass="border-rose-500/20"
          badgeText="Absent"
          badgeColorClass="bg-rose-500/10 text-rose-300 border-rose-500/30"
          onClick={() => onNavigateTab('attendance')}
        />

        {/* 6. Overall Attendance Percentage */}
        <StatCard
          id="card-overall-percentage"
          title="Overall Attendance"
          value={isLoading && !stats ? '...' : `${overallPercentage}%`}
          subtitle="(Present / Total) × 100"
          icon={TrendingUp}
          colorClass={overallPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}
          bgClass={overallPercentage >= 75 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
          borderClass={overallPercentage >= 75 ? 'border-emerald-500/20' : 'border-rose-500/20'}
          badgeText={overallPercentage >= 75 ? 'Healthy (≥75%)' : 'Shortage (<75%)'}
          badgeColorClass={
            overallPercentage >= 75
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }
          progressPercentage={overallPercentage}
          onClick={() => onNavigateTab('reports')}
        />
      </div>

      {/* Visualizations Section: Present vs Absent & Subject-wise Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualization 1: Present vs Absent Breakdown Chart (Doughnut) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Present vs Absent Chart</h2>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Breakdown
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Proportion of present vs absent attendances across all recorded sessions.
            </p>
          </div>

          {totalAttendance === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No attendance records recorded yet to render chart.
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center my-auto py-2">
              {/* Circular SVG Donut Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background track (Absent by default) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="text-rose-500/20"
                    strokeWidth="18"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Present arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="18"
                    strokeDasharray={circumference}
                    strokeDashoffset={presentStrokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                    {overallPercentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Present Rate
                  </span>
                </div>
              </div>

              {/* Legend with exact numbers */}
              <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="text-xs font-semibold text-emerald-300">Present</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-white font-mono">{totalPresent}</span>
                    <span className="text-xs font-mono text-emerald-400">{presentPct}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span className="text-xs font-semibold text-rose-300">Absent</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-white font-mono">{totalAbsent}</span>
                    <span className="text-xs font-mono text-rose-400">{absentPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total Attendance Pool: <strong className="text-white font-mono">{totalAttendance}</strong> entries</span>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
            >
              <span>View logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Visualization 2: Subject-wise Attendance Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">Subject-wise Attendance</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <span className="w-2 h-0.5 bg-rose-500 inline-block"></span>
                  <span>75% Minimum Threshold</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {subjectWiseList.length} Subjects
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic attendance rates calculated per subject from database logs. Highlights compliance with 75% college requirement.
            </p>
          </div>

          {subjectWiseList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No subjects or attendance data found in database.
            </div>
          ) : (
            <div className="space-y-4 my-2">
              {subjectWiseList.map((sub) => {
                const isHealthy = sub.percentage >= 75.0;
                const hasData = sub.total_records > 0;
                return (
                  <div key={sub.subject_id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {sub.subject_code}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                          {sub.subject_name}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          ({sub.department})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {sub.present_count}/{sub.total_records} attended
                        </span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            !hasData
                              ? 'bg-slate-800 text-slate-400'
                              : isHealthy
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {hasData ? `${sub.percentage}%` : 'No logs'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container with 75% indicator line */}
                    <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      {/* 75% threshold line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
                        style={{ left: '75%' }}
                        title="75% minimum threshold"
                      />
                      {/* Actual attendance bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          !hasData
                            ? 'bg-slate-700'
                            : isHealthy
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, sub.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>Formula: <code className="text-indigo-300 font-mono text-[11px]">(Subject Present Classes / Subject Total Classes) × 100</code></span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 shrink-0"
            >
              <span>Inspect Detailed Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visualization 3: Attendance Summary Chart (Daily / Session Timeline) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Attendance Summary Chart (Daily Trends)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Timeline of attendance sessions logged per date, comparing present vs absent volume and attendance percentages.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span className="text-slate-300">Present</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              <span className="text-slate-300">Absent</span>
            </div>
          </div>
        </div>

        {dateWiseTrend.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs">
            No chronological attendance trend data available yet.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {dateWiseTrend.map((item) => {
                const dayPresentPct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
                const isHealthy = dayPresentPct >= 75;
                return (
                  <div
                    key={item.date}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.date}</span>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                          isHealthy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {dayPresentPct}%
                      </span>
                    </div>

                    {/* Stacked Visual Bar */}
                    <div className="w-full h-3.5 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(item.present / Math.max(1, item.total)) * 100}%` }}
                        title={`Present: ${item.present}`}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${(item.absent / Math.max(1, item.total)) * 100}%` }}
                        title={`Absent: ${item.absent}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Total: <strong className="text-white">{item.total}</strong></span>
                      <span className="text-emerald-400">P: {item.present}</span>
                      <span className="text-rose-400">A: {item.absent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Middle Layout: Quick Action Hub & Calculation Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Hub */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</h2>
            <span className="text-[10px] text-slate-500 font-mono">Shortcuts</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              id="dash-quick-mark"
              onClick={() => onNavigateTab('mark-attendance')}
              className="w-full p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-300 transition-all text-xs font-medium text-left flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <CalendarCheck className="w-4 h-4 text-indigo-400" />
                <span>Mark New Attendance</span>
              </div>
              <span className="text-[11px] text-indigo-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>

            <button
              id="dash-quick-add-student"
              onClick={() => onNavigateTab('add-student')}
              className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-300 transition-all text-xs font-medium text-left flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Enroll New Student</span>
              </div>
              <span className="text-[11px] text-blue-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>

            <button
              id="dash-quick-add-subject"
              onClick={() => onNavigateTab('add-subject')}
              className="w-full p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 transition-all text-xs font-medium text-left flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <BookPlus className="w-4 h-4 text-purple-400" />
                <span>Add Curriculum Subject</span>
              </div>
              <span className="text-[11px] text-purple-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Calculation Logic & Rules */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attendance Calculation Engine
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Database Computed
              </span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <p className="font-mono text-xs sm:text-sm text-indigo-300 font-semibold">
                Attendance Percentage = (Total Present Classes / Total Recorded Classes) × 100
              </p>
              <p className="text-slate-400 leading-relaxed text-xs">
                Dynamically computed across all logged student and subject attendance entries directly within the backend database.
                Any student or subject falling below the 75% mandatory threshold is flagged for exam ineligibility.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Current Database State: <strong className="text-white font-mono">{totalStudents}</strong> students, <strong className="text-white font-mono">{totalSubjects}</strong> subjects, <strong className="text-white font-mono">{totalAttendance}</strong> logs</span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 shrink-0"
            >
              <span>View Full Analytics Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Attendance Session Records */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Attendance Logs</h2>
            <p className="text-xs text-slate-400">Latest recorded session entries retrieved from the database</p>
          </div>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
          >
            <span>View All Records ({totalAttendance})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No attendance records logged yet. Use "Mark Attendance" to record a session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Course Subject</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="p-3">
                      <div className="font-medium text-white">{r.student_name || `Student #${r.student}`}</div>
                      {r.student_register_number && (
                        <div className="text-[11px] font-mono text-slate-400">{r.student_register_number}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="text-indigo-400 font-mono font-semibold">{r.subject_code || `Subject #${r.subject}`}</div>
                      {r.subject_name && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{r.subject_name}</div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{r.attendance_date}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          r.status === 'Present'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {r.status === 'Present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 italic text-[11px]">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
