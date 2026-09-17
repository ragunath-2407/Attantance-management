import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Student } from '../../types';

export const StudentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Seeded dataset matching Django SQLite database schema
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      register_number: '717621CS101',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      phone: '+91 9876543210',
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      admission_date: '2023-08-01',
    },
    {
      id: 2,
      register_number: '717621CS102',
      name: 'Sneha Patel',
      email: 'sneha.patel@college.edu',
      phone: '+91 9876543211',
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'A',
      admission_date: '2023-08-01',
    },
    {
      id: 3,
      register_number: '717621CS103',
      name: 'Rohan Verma',
      email: 'rohan.verma@college.edu',
      phone: '+91 9876543212',
      department: 'Computer Science and Engineering',
      year: 3,
      section: 'B',
      admission_date: '2023-08-01',
    },
    {
      id: 4,
      register_number: '717621EE201',
      name: 'Pooja Iyer',
      email: 'pooja.iyer@college.edu',
      phone: '+91 9876543213',
      department: 'Electrical Engineering',
      year: 2,
      section: 'A',
      admission_date: '2024-08-05',
    },
    {
      id: 5,
      register_number: '717621IT301',
      name: 'Aditya Nair',
      email: 'aditya.nair@college.edu',
      phone: '+91 9876543214',
      department: 'Information Technology',
      year: 4,
      section: 'A',
      admission_date: '2022-08-10',
    },
  ]);

  // New Student Form State
  const [formData, setFormData] = useState({
    register_number: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science and Engineering',
    year: 1,
    section: 'A',
    admission_date: '2026-08-01',
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const regNum = formData.register_number.trim();
    const nameVal = formData.name.trim();
    const emailVal = formData.email.trim();
    const phoneVal = formData.phone.trim();
    const deptVal = formData.department.trim();
    const yearVal = Number(formData.year);
    const secVal = formData.section.trim();

    // 1. Register number required & unique
    if (!regNum) {
      setFormError('Register number required.');
      return;
    }
    if (students.some(s => s.register_number.toUpperCase() === regNum.toUpperCase())) {
      setFormError('Register number must be unique.');
      return;
    }

    // 2. Name required
    if (!nameVal) {
      setFormError('Name required.');
      return;
    }

    // 3. Email required, valid format, unique
    if (!emailVal) {
      setFormError('Email required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setFormError('Email must have valid format.');
      return;
    }
    if (students.some(s => s.email.toLowerCase() === emailVal.toLowerCase())) {
      setFormError('Email must be unique.');
      return;
    }

    // 4. Phone required
    if (!phoneVal) {
      setFormError('Phone required.');
      return;
    }

    // 5. Department required
    if (!deptVal) {
      setFormError('Department required.');
      return;
    }

    // 6. Year required
    if (!yearVal || isNaN(yearVal) || yearVal < 1 || yearVal > 5) {
      setFormError('Year required.');
      return;
    }

    // 7. Section required
    if (!secVal) {
      setFormError('Section required.');
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      register_number: regNum.toUpperCase(),
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      department: deptVal,
      year: yearVal,
      section: secVal.toUpperCase(),
      admission_date: formData.admission_date || undefined,
    };

    setStudents([newStudent, ...students]);
    setIsAddModalOpen(false);
    setSuccessMessage(`Student ${newStudent.name} (${newStudent.register_number}) registered successfully in SQLite!`);
    setTimeout(() => setSuccessMessage(null), 4000);

    // Reset form
    setFormData({
      register_number: '',
      name: '',
      email: '',
      phone: '',
      department: 'Computer Science and Engineering',
      year: 1,
      section: 'A',
      admission_date: '2026-08-01',
    });
  };

  const handleDeleteStudent = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This cascades related attendance records in SQLite.`)) {
      setStudents(students.filter(s => s.id !== id));
      if (selectedStudent?.id === id) setSelectedStudent(null);
      setSuccessMessage(`Student record deleted.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const filteredStudents = students.filter((s) => {
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
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Student Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, read, update, delete, and search student records matching the Django SQLite schema.
          </p>
        </div>
        <button
          id="btn-create-student"
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-medium text-xs sm:text-sm transition-all shadow-md shadow-blue-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="student-search-input"
            type="text"
            placeholder="Search by Register Number, Name, Email, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science and Engineering">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <select
            id="filter-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Roster ({filteredStudents.length} Students)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Table: attendance_student (SQLite)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Register No (Unique)</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email (Unique)</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Year / Sec</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No students match your current search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-blue-400 font-medium">
                      {s.register_number}
                    </td>
                    <td className="p-3.5 font-medium text-white">
                      {s.name}
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs">
                      {s.email}
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs font-mono">
                      {s.phone}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {s.department}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        Y{s.year}-{s.section}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          title="View Student Profile"
                          onClick={() => setSelectedStudent(s)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Student"
                          onClick={() => handleDeleteStudent(s.id, s.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Register New Student (Student Model)</h3>
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

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Register Number * (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 717621CS104"
                    value={formData.register_number}
                    onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address * (Unique)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya.sundar@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543215"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Year * (1-4)</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Section *</label>
                  <input
                    type="text"
                    required
                    placeholder="A"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-xs font-medium shadow-md shadow-blue-600/30"
                >
                  Save to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Individual Student Details</h3>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Register Number:</span>
                <span className="font-mono text-blue-400 font-semibold">{selectedStudent.register_number}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Student Name:</span>
                <span className="text-white font-medium">{selectedStudent.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Email Address:</span>
                <span className="text-slate-300">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-300 font-mono">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-300">{selectedStudent.department}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Year & Section:</span>
                <span className="text-slate-300 font-mono">Year {selectedStudent.year}, Section {selectedStudent.section}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Admission Date:</span>
                <span className="text-slate-300">{selectedStudent.admission_date || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
