import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Mail, 
  Phone as PhoneIcon,
  X,
  RotateCcw
} from 'lucide-react';
import { Student, NavigationTab } from '../../types';
import { api } from '../../services/api';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

interface StudentListPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onEditStudent: (id: number) => void;
}

export const StudentListPage: React.FC<StudentListPageProps> = ({
  onNavigateTab,
  onEditStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  
  // Alert messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load students from SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setSuccessMessage(`Student "${studentToDelete.name}" (${studentToDelete.register_number}) was deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setStudentToDelete(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedYear('All');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDept !== 'All' || selectedYear !== 'All';

  // Distinct departments for filter
  const departments = Array.from(new Set(students.map(s => s.department))).filter(Boolean);

  // Filter students based on search and filters
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.register_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesYear = selectedYear === 'All' || s.year.toString() === selectedYear;

    return matchesSearch && matchesDept && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {students.length} Enrolled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student roster directory with register numbers, academic departments, and contact information.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStudents}
            title="Refresh from SQLite database"
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-navigate-add-student"
            onClick={() => onNavigateTab('add-student')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}
      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Search by register no, name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

          {/* Department Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              id="filter-student-dept"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center space-x-2">
            <select
              id="filter-student-year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Academic Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
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

      {/* Responsive Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Records ({filteredStudents.length} of {students.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Table: student_record
          </span>
        </div>

        {isLoading ? (
          <LoadingState message="Loading student records..." colorClass="text-blue-500" />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasActiveFilters ? 'No matching students found' : 'No students enrolled yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search criteria or clearing active department and year filters.'
                : 'Get started by adding your first student to the attendance database.'
            }
            actionText={hasActiveFilters ? 'Clear Filters' : 'Enroll Student'}
            onAction={hasActiveFilters ? resetFilters : () => onNavigateTab('add-student')}
            actionIcon={hasActiveFilters ? RotateCcw : Plus}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Register Number</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Year</th>
                  <th className="p-3.5 text-center">Section</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Register Number */}
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">
                      {s.register_number}
                    </td>

                    {/* Name */}
                    <td className="p-3.5 font-medium text-white">
                      {s.name}
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-slate-400">
                      <div className="flex items-center space-x-1.5 truncate max-w-[200px]" title={s.email}>
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{s.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-3.5 text-slate-400 font-mono text-xs">
                      <div className="flex items-center space-x-1.5">
                        <PhoneIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{s.phone || '—'}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-3.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700/60">
                        {s.department}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="p-3.5 text-center font-mono">
                      Y{s.year}
                    </td>

                    {/* Section */}
                    <td className="p-3.5 text-center font-mono">
                      Sec {s.section}
                    </td>

                    {/* Actions: Edit and Delete */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          id={`btn-edit-student-${s.id}`}
                          onClick={() => onEditStudent(s.id)}
                          title="Edit Student Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors border border-transparent hover:border-blue-500/20"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-student-${s.id}`}
                          onClick={() => setStudentToDelete(s)}
                          title="Delete Student Record"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.name}" (${studentToDelete?.register_number})? All linked attendance records for this student will also be removed from SQLite.`}
        confirmText="Confirm Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
