/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ProjectStructureViewer } from './components/structure/ProjectStructureViewer';
import { DatabaseDesignViewer } from './components/database/DatabaseDesignViewer';

// 11 Core Pages
import { DashboardPage } from './components/dashboard/DashboardPage';
import { StudentListPage } from './components/students/StudentListPage';
import { AddStudentPage } from './components/students/AddStudentPage';
import { EditStudentPage } from './components/students/EditStudentPage';
import { SubjectListPage } from './components/subjects/SubjectListPage';
import { AddSubjectPage } from './components/subjects/AddSubjectPage';
import { EditSubjectPage } from './components/subjects/EditSubjectPage';
import { AttendanceListPage } from './components/attendance/AttendanceListPage';
import { MarkAttendancePage } from './components/attendance/MarkAttendancePage';
import { EditAttendancePage } from './components/attendance/EditAttendancePage';
import { AttendanceReportsPage } from './components/reports/AttendanceReportsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Editing state targets
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(null);

  const handleEditStudent = (id: number) => {
    setEditingStudentId(id);
    setCurrentTab('edit-student');
  };

  const handleEditSubject = (id: number) => {
    setEditingSubjectId(id);
    setCurrentTab('edit-subject');
  };

  const handleEditAttendance = (id: number) => {
    setEditingAttendanceId(id);
    setCurrentTab('edit-attendance');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {/* 1. Dashboard */}
            {currentTab === 'dashboard' && (
              <DashboardPage onNavigateTab={setCurrentTab} />
            )}

            {/* 2. Students List */}
            {currentTab === 'students' && (
              <StudentListPage
                onNavigateTab={setCurrentTab}
                onEditStudent={handleEditStudent}
              />
            )}

            {/* 3. Add Student */}
            {currentTab === 'add-student' && (
              <AddStudentPage onNavigateTab={setCurrentTab} />
            )}

            {/* 4. Edit Student */}
            {currentTab === 'edit-student' && (
              <EditStudentPage
                studentId={editingStudentId || 1}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* 5. Subjects List */}
            {currentTab === 'subjects' && (
              <SubjectListPage
                onNavigateTab={setCurrentTab}
                onEditSubject={handleEditSubject}
              />
            )}

            {/* 6. Add Subject */}
            {currentTab === 'add-subject' && (
              <AddSubjectPage onNavigateTab={setCurrentTab} />
            )}

            {/* 7. Edit Subject */}
            {currentTab === 'edit-subject' && (
              <EditSubjectPage
                subjectId={editingSubjectId || 1}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* 8. Attendance List */}
            {currentTab === 'attendance' && (
              <AttendanceListPage
                onNavigateTab={setCurrentTab}
                onEditAttendance={handleEditAttendance}
              />
            )}

            {/* 9. Mark Attendance */}
            {currentTab === 'mark-attendance' && (
              <MarkAttendancePage onNavigateTab={setCurrentTab} />
            )}

            {/* 10. Edit Attendance */}
            {currentTab === 'edit-attendance' && (
              <EditAttendancePage
                attendanceId={editingAttendanceId || 1}
                onNavigateTab={setCurrentTab}
              />
            )}

            {/* 11. Attendance Reports */}
            {currentTab === 'reports' && (
              <AttendanceReportsPage />
            )}

            {/* Architecture References */}
            {currentTab === 'structure' && (
              <ProjectStructureViewer onNavigateModule={(moduleId) => setCurrentTab(moduleId as NavigationTab)} />
            )}
            {currentTab === 'database' && (
              <DatabaseDesignViewer />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
