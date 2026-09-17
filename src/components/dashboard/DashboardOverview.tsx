import React, { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, CalendarCheck, TrendingUp, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { NavigationTab, DashboardStats } from '../../types';
import { api } from '../../services/api';

interface DashboardOverviewProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStatsData(data);
    } catch {
      // Fallback if network issue
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const handleAttendanceChanged = () => {
      fetchStats();
    };
    window.addEventListener('attendanceChanged', handleAttendanceChanged);
    window.addEventListener('focus', handleAttendanceChanged);

    const interval = setInterval(fetchStats, 12000);
    return () => {
      window.removeEventListener('attendanceChanged', handleAttendanceChanged);
      window.removeEventListener('focus', handleAttendanceChanged);
      clearInterval(interval);
    };
  }, [fetchStats]);

  const totalStudents = statsData?.total_students ?? 0;
  const totalSubjects = statsData?.total_subjects ?? 0;
  const totalAttendance = statsData?.total_attendance_records ?? 0;
  const presentCount = statsData?.total_present_records ?? statsData?.present_count ?? 0;
  const absentCount = statsData?.total_absent_records ?? statsData?.absent_count ?? 0;
  const avgAttendance = statsData?.overall_attendance_percentage ?? statsData?.overall_attendance_rate ?? 0;

  const stats = [
    {
      title: 'Total Students',
      value: isLoading ? '...' : totalStudents.toString(),
      change: 'Enrolled in database',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      linkTab: 'students' as NavigationTab,
    },
    {
      title: 'Total Subjects',
      value: isLoading ? '...' : totalSubjects.toString(),
      change: 'Course catalog',
      icon: BookOpen,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      linkTab: 'subjects' as NavigationTab,
    },
    {
      title: 'Total Attendance Records',
      value: isLoading ? '...' : totalAttendance.toString(),
      change: 'Logged sessions',
      icon: CalendarCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      linkTab: 'attendance' as NavigationTab,
    },
    {
      title: 'Total Present Records',
      value: isLoading ? '...' : presentCount.toString(),
      change: 'Attended sessions',
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      linkTab: 'attendance' as NavigationTab,
    },
    {
      title: 'Total Absent Records',
      value: isLoading ? '...' : absentCount.toString(),
      change: 'Missed sessions',
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      linkTab: 'attendance' as NavigationTab,
    },
    {
      title: 'Overall Attendance',
      value: isLoading ? '...' : `${avgAttendance}%`,
      change: '(Present / Total) × 100',
      icon: TrendingUp,
      color: avgAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400',
      bg: avgAttendance >= 75 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      border: avgAttendance >= 75 ? 'border-emerald-500/20' : 'border-rose-500/20',
      linkTab: 'reports' as NavigationTab,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time student enrollment, active course catalogs, and calculated attendance rates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStats}
            title="Refresh database metrics"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>REST API: /api/dashboard/stats/</span>
          </span>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(s.linkTab)}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">{s.title}</span>
                <div className={`p-2 rounded-xl ${s.bg} ${s.border} border`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight font-mono">{s.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{s.change}</span>
                  <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                    &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
