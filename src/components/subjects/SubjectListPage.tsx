import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  X,
  RotateCcw
} from 'lucide-react';
import { Subject, NavigationTab } from '../../types';
import { api } from '../../services/api';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { AlertBanner } from '../common/AlertBanner';
import { EmptyState } from '../common/EmptyState';
import { LoadingState } from '../common/LoadingState';

interface SubjectListPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
  onEditSubject: (id: number) => void;
}

export const SubjectListPage: React.FC<SubjectListPageProps> = ({
  onNavigateTab,
  onEditSubject,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Notification states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete modal state
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load course subjects from SQLite database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteSubject(subjectToDelete.id);
      setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
      setSuccessMessage(`Subject "${subjectToDelete.subject_name}" (${subjectToDelete.subject_code}) was deleted.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setSubjectToDelete(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete subject.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('All');
    setSelectedSemester('All');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDept !== 'All' || selectedSemester !== 'All';

  const departments = Array.from(new Set(subjects.map(s => s.department))).filter(Boolean);

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = 
      s.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesSemester = selectedSemester === 'All' || s.semester.toString() === selectedSemester;

    return matchesSearch && matchesDept && matchesSemester;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Subject Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {subjects.length} Courses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Course curriculum directory with subject codes, department assignments, and semester terms.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSubjects}
            title="Refresh from SQLite database"
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-navigate-add-subject"
            onClick={() => onNavigateTab('add-subject')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
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
              id="subject-search-input"
              type="text"
              placeholder="Search by code, title, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              id="filter-subject-dept"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center space-x-2">
            <select
              id="filter-subject-semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
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
            Course Offerings ({filteredSubjects.length} of {subjects.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Table: subject_course
          </span>
        </div>

        {isLoading ? (
          <LoadingState message="Loading subject catalog..." colorClass="text-indigo-500" />
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={hasActiveFilters ? 'No matching courses found' : 'No subjects added yet'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search query or reset active filters.'
                : 'Add curriculum course offerings to enable attendance marking.'
            }
            actionText={hasActiveFilters ? 'Clear Filters' : 'Add Subject'}
            onAction={hasActiveFilters ? resetFilters : () => onNavigateTab('add-subject')}
            actionIcon={hasActiveFilters ? RotateCcw : Plus}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[650px]">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Subject Code</th>
                  <th className="p-3.5">Subject Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Year</th>
                  <th className="p-3.5 text-center">Semester</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredSubjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Subject Code */}
                    <td className="p-3.5 font-mono text-indigo-400 font-semibold">
                      {s.subject_code}
                    </td>

                    {/* Subject Name */}
                    <td className="p-3.5 font-medium text-white">
                      {s.subject_name}
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

                    {/* Semester */}
                    <td className="p-3.5 text-center font-mono">
                      Sem {s.semester}
                    </td>

                    {/* Actions: Edit and Delete */}
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          id={`btn-edit-subject-${s.id}`}
                          onClick={() => onEditSubject(s.id)}
                          title="Edit Subject Course"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors border border-transparent hover:border-indigo-500/20"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-delete-subject-${s.id}`}
                          onClick={() => setSubjectToDelete(s)}
                          title="Delete Subject Course"
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
        isOpen={Boolean(subjectToDelete)}
        title="Delete Subject Course"
        message={`Are you sure you want to delete course "${subjectToDelete?.subject_name}" (${subjectToDelete?.subject_code})? Any attendance records recorded under this course will also be removed from SQLite.`}
        confirmText="Confirm Delete"
        isConfirming={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setSubjectToDelete(null)}
      />
    </div>
  );
};
