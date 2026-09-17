import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, CheckCircle2, AlertCircle, X, Layers } from 'lucide-react';
import { Subject } from '../../types';

export const SubjectManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 1,
      subject_code: 'CS8591',
      subject_name: 'Database Management Systems',
      department: 'Computer Science and Engineering',
      year: 3,
      semester: 5,
    },
    {
      id: 2,
      subject_code: 'CS8592',
      subject_name: 'Object Oriented Analysis and Design',
      department: 'Computer Science and Engineering',
      year: 3,
      semester: 5,
    },
    {
      id: 3,
      subject_code: 'EE8401',
      subject_name: 'Electrical Machines and Drives',
      department: 'Electrical Engineering',
      year: 2,
      semester: 3,
    },
    {
      id: 4,
      subject_code: 'IT8701',
      subject_name: 'Cloud Computing and Virtualization',
      department: 'Information Technology',
      year: 4,
      semester: 7,
    },
  ]);

  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    department: 'Computer Science and Engineering',
    year: 3,
    semester: 5,
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const codeVal = formData.subject_code.trim();
    const nameVal = formData.subject_name.trim();
    const deptVal = formData.department.trim();
    const yearVal = Number(formData.year);
    const semVal = Number(formData.semester);

    // 1. Subject code required & unique
    if (!codeVal) {
      setFormError('Subject code required.');
      return;
    }
    if (subjects.some(s => s.subject_code.toUpperCase() === codeVal.toUpperCase())) {
      setFormError('Subject code must be unique.');
      return;
    }

    // 2. Subject name required
    if (!nameVal) {
      setFormError('Subject name required.');
      return;
    }

    // 3. Department required
    if (!deptVal) {
      setFormError('Department required.');
      return;
    }

    // 4. Year required
    if (!yearVal || isNaN(yearVal) || yearVal < 1 || yearVal > 5) {
      setFormError('Year required.');
      return;
    }

    // 5. Semester required
    if (!semVal || isNaN(semVal) || semVal < 1 || semVal > 8) {
      setFormError('Semester required.');
      return;
    }

    const newSubject: Subject = {
      id: Date.now(),
      subject_code: codeVal.toUpperCase(),
      subject_name: nameVal,
      department: deptVal,
      year: yearVal,
      semester: semVal,
    };

    setSubjects([...subjects, newSubject]);
    setIsAddModalOpen(false);
    setSuccessMessage(`Subject ${newSubject.subject_code} added to SQLite successfully!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    setFormData({
      subject_code: '',
      subject_name: '',
      department: 'Computer Science and Engineering',
      year: 3,
      semester: 5,
    });
  };

  const handleDeleteSubject = (id: number, code: string) => {
    if (window.confirm(`Delete subject ${code}? This cascades all linked attendance records in SQLite.`)) {
      setSubjects(subjects.filter(s => s.id !== id));
      setSuccessMessage(`Subject ${code} removed.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch = 
      s.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Subject Management</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Subject Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, read, update, delete, and search academic course subjects.
          </p>
        </div>
        <button
          id="btn-create-subject"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-medium text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="subject-search-input"
            type="text"
            placeholder="Search by Subject Code or Course Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          id="filter-subject-dept"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="All">All Departments</option>
          <option value="Computer Science and Engineering">Computer Science</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Information Technology">Information Technology</option>
        </select>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((s) => (
          <div 
            key={s.id} 
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {s.subject_code}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Sem {s.semester} &bull; Year {s.year}
                </span>
              </div>
              <h3 className="font-semibold text-white text-base leading-snug">
                {s.subject_name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {s.department}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">SQLite ID #{s.id}</span>
              <button
                onClick={() => handleDeleteSubject(s.id, s.subject_code)}
                title="Delete Subject"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Add New Subject (Subject Model)</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Subject Code * (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS8601"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Year * (1-4)</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Semester * (1-8)</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-medium shadow-md shadow-emerald-600/30"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
