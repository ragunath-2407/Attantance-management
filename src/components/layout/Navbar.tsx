import React from 'react';
import { 
  School, 
  Menu, 
  X, 
  CheckCircle2, 
  Plus, 
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const tabLabels: Record<NavigationTab, string> = {
  'dashboard': 'Dashboard Overview',
  'students': 'Students Directory',
  'add-student': 'Enroll New Student',
  'edit-student': 'Edit Student Profile',
  'subjects': 'Subjects Catalog',
  'add-subject': 'Add New Subject',
  'edit-subject': 'Edit Subject Course',
  'attendance': 'Attendance Records Log',
  'mark-attendance': 'Mark Daily Attendance',
  'edit-attendance': 'Edit Attendance Record',
  'reports': 'Attendance Reports & Analytics',
  'structure': 'Project Architecture',
  'database': 'Database Schema & Models',
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button 
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
                <School className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                    Attendance Management System
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    College Portal
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <span>Department of Academic Affairs</span>
                  <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
                  <span className="text-indigo-400 hidden sm:inline font-medium">
                    {tabLabels[currentTab] || 'Portal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status & Quick Action Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live API indicator */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Django REST API Connected</span>
            </div>

            {/* Quick action button: Mark Attendance */}
            <button
              id="top-btn-mark-attendance"
              onClick={() => onTabChange('mark-attendance')}
              className="inline-flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-md shadow-amber-600/20"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Mark Attendance</span>
              <span className="xs:hidden">Mark</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
