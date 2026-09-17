import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { NavigationTab, Student } from '../../types';
import { api } from '../../services/api';
import { AlertBanner } from '../common/AlertBanner';

interface EditStudentPageProps {
  studentId: number;
  onNavigateTab: (tab: NavigationTab) => void;
}

interface FieldErrors {
  register_number?: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  year?: string;
  section?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EditStudentPage: React.FC<EditStudentPageProps> = ({
  studentId,
  onNavigateTab,
}) => {
  const [otherStudents, setOtherStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    register_number: '',
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science and Engineering',
    year: 1,
    section: 'A',
    admission_date: '',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  useEffect(() => {
    const loadStudentAndList = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [studentData, allStudents] = await Promise.all([
          api.getStudentById(studentId),
          api.getStudents().catch(() => []),
        ]);

        setOtherStudents(allStudents.filter(s => s.id !== studentId));
        setFormData({
          register_number: studentData.register_number || '',
          name: studentData.name || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          department: studentData.department || 'Computer Science and Engineering',
          year: studentData.year || 1,
          section: studentData.section || 'A',
          admission_date: studentData.admission_date || '',
        });
      } catch (err: any) {
        setErrorMessage(err.message || `Failed to load student #${studentId}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      loadStudentAndList();
    }
  }, [studentId]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const regNum = formData.register_number.trim();
    const nameVal = formData.name.trim();
    const emailVal = formData.email.trim();
    const phoneVal = formData.phone.trim();
    const deptVal = formData.department.trim();
    const yearVal = Number(formData.year);
    const secVal = formData.section.trim();

    // 1. Register number required & unique
    if (!regNum) {
      errors.register_number = 'Register number required.';
    } else if (otherStudents.some(s => s.register_number.toUpperCase() === regNum.toUpperCase())) {
      errors.register_number = 'Register number must be unique.';
    }

    // 2. Name required
    if (!nameVal) {
      errors.name = 'Name required.';
    }

    // 3. Email required, valid format, unique
    if (!emailVal) {
      errors.email = 'Email required.';
    } else if (!EMAIL_REGEX.test(emailVal)) {
      errors.email = 'Email must have valid format.';
    } else if (otherStudents.some(s => s.email.toLowerCase() === emailVal.toLowerCase())) {
      errors.email = 'Email must be unique.';
    }

    // 4. Phone required
    if (!phoneVal) {
      errors.phone = 'Phone required.';
    }

    // 5. Department required
    if (!deptVal) {
      errors.department = 'Department required.';
    }

    // 6. Year required
    if (!yearVal || isNaN(yearVal) || yearVal < 1 || yearVal > 5) {
      errors.year = 'Year required.';
    }

    // 7. Section required
    if (!secVal) {
      errors.section = 'Section required.';
    }

    setFieldErrors(errors);

    const firstError = Object.values(errors)[0];
    if (firstError) {
      setErrorMessage(firstError);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.updateStudent(studentId, {
        register_number: formData.register_number.trim().toUpperCase(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        year: Number(formData.year),
        section: formData.section.trim().toUpperCase(),
        admission_date: formData.admission_date || undefined,
      });

      setSuccessMessage(`Student "${updated.name}" has been updated successfully!`);
      setTimeout(() => {
        onNavigateTab('students');
      }, 1200);
    } catch (err: any) {
      const msg = err.message || 'Failed to update student profile.';
      setErrorMessage(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('register number') || lower.includes('register_number')) {
        setFieldErrors(prev => ({ ...prev, register_number: msg }));
      } else if (lower.includes('email')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (lower.includes('name')) {
        setFieldErrors(prev => ({ ...prev, name: msg }));
      } else if (lower.includes('phone')) {
        setFieldErrors(prev => ({ ...prev, phone: msg }));
      } else if (lower.includes('department')) {
        setFieldErrors(prev => ({ ...prev, department: msg }));
      } else if (lower.includes('year')) {
        setFieldErrors(prev => ({ ...prev, year: msg }));
      } else if (lower.includes('section')) {
        setFieldErrors(prev => ({ ...prev, section: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-from-edit-student"
            onClick={() => onNavigateTab('students')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit Student Profile</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Update details for student ID #{studentId} with full client and server validation.
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          PUT /api/students/{studentId}/
        </span>
      </div>

      {successMessage && (
        <AlertBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs sm:text-sm">Fetching student record from database...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Register Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Register Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-student-register-number"
                  type="text"
                  value={formData.register_number}
                  onChange={(e) => {
                    setFormData({ ...formData, register_number: e.target.value });
                    if (fieldErrors.register_number) setFieldErrors({ ...fieldErrors, register_number: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border font-mono text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.register_number ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                />
                {fieldErrors.register_number && (
                  <p id="error-edit-student-register-number" className="text-xs text-rose-400 font-medium">{fieldErrors.register_number}</p>
                )}
              </div>

              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Student Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-student-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.name ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                />
                {fieldErrors.name && (
                  <p id="error-edit-student-name" className="text-xs text-rose-400 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-student-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.email ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                />
                {fieldErrors.email && (
                  <p id="error-edit-student-email" className="text-xs text-rose-400 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-student-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.phone ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                />
                {fieldErrors.phone && (
                  <p id="error-edit-student-phone" className="text-xs text-rose-400 font-medium">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-edit-student-department"
                  value={formData.department}
                  onChange={(e) => {
                    setFormData({ ...formData, department: e.target.value });
                    if (fieldErrors.department) setFieldErrors({ ...fieldErrors, department: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm focus:outline-none transition-colors ${
                    fieldErrors.department ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {fieldErrors.department && (
                  <p id="error-edit-student-department" className="text-xs text-rose-400 font-medium">{fieldErrors.department}</p>
                )}
              </div>

              {/* Academic Year */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Academic Year <span className="text-rose-400">*</span>
                </label>
                <select
                  id="select-edit-student-year"
                  value={formData.year}
                  onChange={(e) => {
                    setFormData({ ...formData, year: Number(e.target.value) });
                    if (fieldErrors.year) setFieldErrors({ ...fieldErrors, year: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm focus:outline-none transition-colors ${
                    fieldErrors.year ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                >
                  <option value={1}>1st Year (Semester 1 &amp; 2)</option>
                  <option value={2}>2nd Year (Semester 3 &amp; 4)</option>
                  <option value={3}>3rd Year (Semester 5 &amp; 6)</option>
                  <option value={4}>4th Year (Semester 7 &amp; 8)</option>
                </select>
                {fieldErrors.year && (
                  <p id="error-edit-student-year" className="text-xs text-rose-400 font-medium">{fieldErrors.year}</p>
                )}
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Section <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-student-section"
                  type="text"
                  maxLength={5}
                  value={formData.section}
                  onChange={(e) => {
                    setFormData({ ...formData, section: e.target.value.toUpperCase() });
                    if (fieldErrors.section) setFieldErrors({ ...fieldErrors, section: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                    fieldErrors.section ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-blue-500'
                  }`}
                />
                {fieldErrors.section && (
                  <p id="error-edit-student-section" className="text-xs text-rose-400 font-medium">{fieldErrors.section}</p>
                )}
              </div>

              {/* Admission Date */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Admission Date
                </label>
                <input
                  id="input-edit-student-admission-date"
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateTab('students')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-save-edit-student"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Updating Student...' : 'Update Student'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
