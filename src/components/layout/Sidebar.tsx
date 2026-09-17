import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus,
  BookOpen, 
  BookPlus,
  CalendarCheck, 
  PlusCircle,
  BarChart3, 
  FolderTree,
  Database,
  Layers,
  CheckSquare
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  mobileOpen,
  setMobileOpen,
}) => {
  const handleSelect = (tab: NavigationTab) => {
    onTabChange(tab);
    setMobileOpen(false);
  };

  const isStudentActive = currentTab === 'students' || currentTab === 'add-student' || currentTab === 'edit-student';
  const isSubjectActive = currentTab === 'subjects' || currentTab === 'add-subject' || currentTab === 'edit-subject';
  const isAttendanceActive = currentTab === 'attendance' || currentTab === 'mark-attendance' || currentTab === 'edit-attendance';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-20 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-20 w-72 bg-slate-900/95 md:bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Attendance Navigation</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {/* 1. Dashboard */}
          <button
            id="nav-dashboard"
            onClick={() => handleSelect('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600/15 text-white border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span className="text-xs sm:text-sm font-medium">1. Dashboard</span>
          </button>

          {/* 2. Students Group */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Students
            </div>
            <button
              id="nav-students"
              onClick={() => handleSelect('students')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                currentTab === 'students'
                  ? 'bg-blue-600/15 text-white border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className={`w-4 h-4 shrink-0 ${currentTab === 'students' ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">2. Students List</span>
              </div>
            </button>
            <button
              id="nav-add-student"
              onClick={() => handleSelect('add-student')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all pl-7 text-xs ${
                currentTab === 'add-student'
                  ? 'bg-blue-600/20 text-blue-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span>3. Add Student</span>
            </button>
          </div>

          {/* 3. Subjects Group */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Subjects
            </div>
            <button
              id="nav-subjects"
              onClick={() => handleSelect('subjects')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                currentTab === 'subjects'
                  ? 'bg-indigo-600/15 text-white border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className={`w-4 h-4 shrink-0 ${currentTab === 'subjects' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">5. Subjects Catalog</span>
              </div>
            </button>
            <button
              id="nav-add-subject"
              onClick={() => handleSelect('add-subject')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all pl-7 text-xs ${
                currentTab === 'add-subject'
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <BookPlus className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>6. Add Subject</span>
            </button>
          </div>

          {/* 4. Attendance Group */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Attendance
            </div>
            <button
              id="nav-attendance"
              onClick={() => handleSelect('attendance')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                currentTab === 'attendance'
                  ? 'bg-amber-600/15 text-white border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarCheck className={`w-4 h-4 shrink-0 ${currentTab === 'attendance' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">8. Attendance Log</span>
              </div>
            </button>
            <button
              id="nav-mark-attendance"
              onClick={() => handleSelect('mark-attendance')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all pl-7 text-xs ${
                currentTab === 'mark-attendance'
                  ? 'bg-amber-600/20 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>9. Mark Attendance</span>
            </button>
          </div>

          {/* 5. Reports */}
          <div className="pt-2">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Analytics
            </div>
            <button
              id="nav-reports"
              onClick={() => handleSelect('reports')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                currentTab === 'reports'
                  ? 'bg-purple-600/15 text-white border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${currentTab === 'reports' ? 'text-purple-400' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm font-medium">11. Attendance Reports</span>
            </button>
          </div>

          {/* System References */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="px-3 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              System References
            </div>
            <button
              id="nav-structure"
              onClick={() => handleSelect('structure')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all text-xs ${
                currentTab === 'structure'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>Project Structure</span>
            </button>
            <button
              id="nav-database"
              onClick={() => handleSelect('database')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-left transition-all text-xs ${
                currentTab === 'database'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Database Schema</span>
            </button>
          </div>
        </nav>

        {/* Bottom Architecture Summary */}
        <div className="p-4 m-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span>Tech Stack</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/60">Full-Stack</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            React 19 &bull; Django REST Framework &bull; SQLite ORM
          </p>
        </div>
      </aside>
    </>
  );
};
