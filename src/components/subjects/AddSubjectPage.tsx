import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { NavigationTab, Subject } from '../../types';
import { api } from '../../services/api';
import { AlertBanner } from '../common/AlertBanner';

interface AddSubjectPageProps {
  onNavigateTab: (tab: NavigationTab) => void;
}

interface FieldErrors {
  subject_code?: string;
  subject_name?: string;
  department?: string;
  year?: string;
  semester?: string;
}

export const AddSubjectPage: React.FC<AddSubjectPageProps> = ({ onNavigateTab }) => {
  const [existingSubjects, setExistingSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    department: 'Computer Science and Engineering',
    year: 1,
    semester: 1,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    api.getSubjects()
      .then(data => setExistingSubjects(data))
      .catch(() => {});
  }, []);

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    const codeVal = formData.subject_code.trim();
    const nameVal = formData.subject_name.trim();
    const deptVal = formData.department.trim();
    const yearVal = Number(formData.year);
    const semVal = Number(formData.semester);

    // 1. Subject code required & unique
    if (!codeVal) {
      errors.subject_code = 'Subject code required.';
    } else if (existingSubjects.some(s => s.subject_code.toUpperCase() === codeVal.toUpperCase())) {
      errors.subject_code = 'Subject code must be unique.';
    }

    // 2. Subject name required
    if (!nameVal) {
      errors.subject_name = 'Subject name required.';
    }

    // 3. Department required
    if (!deptVal) {
      errors.department = 'Department required.';
    }

    // 4. Year required
    if (!yearVal || isNaN(yearVal) || yearVal < 1 || yearVal > 5) {
      errors.year = 'Year required.';
    }

    // 5. Semester required
    if (!semVal || isNaN(semVal) || semVal < 1 || semVal > 8) {
      errors.semester = 'Semester required.';
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
      const created = await api.createSubject({
        subject_code: formData.subject_code.trim().toUpperCase(),
        subject_name: formData.subject_name.trim(),
        department: formData.department.trim(),
        year: Number(formData.year),
        semester: Number(formData.semester),
      });

      setSuccessMessage(`Subject "${created.subject_name}" (${created.subject_code}) created successfully!`);
      setTimeout(() => {
        onNavigateTab('subjects');
      }, 1200);
    } catch (err: any) {
      const msg = err.message || 'Failed to create subject.';
      setErrorMessage(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('subject code') || lower.includes('subject_code')) {
        setFieldErrors(prev => ({ ...prev, subject_code: msg }));
      } else if (lower.includes('subject name') || lower.includes('subject_name')) {
        setFieldErrors(prev => ({ ...prev, subject_name: msg }));
      } else if (lower.includes('department')) {
        setFieldErrors(prev => ({ ...prev, department: msg }));
      } else if (lower.includes('year')) {
        setFieldErrors(prev => ({ ...prev, year: msg }));
      } else if (lower.includes('semester')) {
        setFieldErrors(prev => ({ ...prev, semester: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-to-subjects"
            onClick={() => onNavigateTab('subjects')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Add New Subject</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Create a new course offering with full client and server validation.
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
          POST /api/subjects/
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Subject Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Subject Code <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-subject-code"
                type="text"
                placeholder="e.g. CS8691"
                value={formData.subject_code}
                onChange={(e) => {
                  setFormData({ ...formData, subject_code: e.target.value.toUpperCase() });
                  if (fieldErrors.subject_code) setFieldErrors({ ...fieldErrors, subject_code: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border font-mono text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.subject_code ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-indigo-500'
                }`}
              />
              {fieldErrors.subject_code && (
                <p id="error-subject-code" className="text-xs text-rose-400 font-medium">{fieldErrors.subject_code}</p>
              )}
            </div>

            {/* Subject Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Subject Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-subject-name"
                type="text"
                placeholder="e.g. Artificial Intelligence"
                value={formData.subject_name}
                onChange={(e) => {
                  setFormData({ ...formData, subject_name: e.target.value });
                  if (fieldErrors.subject_name) setFieldErrors({ ...fieldErrors, subject_name: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.subject_name ? 'border-rose-500 text-rose-300 focus:border-rose-400' : 'border-slate-800 text-white focus:border-indigo-500'
                }`}
              />
              {fieldErrors.subject_name && (
                <p id="error-subject-name" className="text-xs text-rose-400 font-medium">{fieldErrors.subject_name}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Department <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-subject-department"
                value={formData.department}
                onChange={(e) => {
                  setFormData({ ...formData, department: e.target.value });
                  if (fieldErrors.department) setFieldErrors({ ...fieldErrors, department: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm focus:outline-none transition-colors ${
                  fieldErrors.department ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {fieldErrors.department && (
                <p id="error-subject-department" className="text-xs text-rose-400 font-medium">{fieldErrors.department}</p>
              )}
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Academic Year <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-subject-year"
                value={formData.year}
                onChange={(e) => {
                  setFormData({ ...formData, year: Number(e.target.value) });
                  if (fieldErrors.year) setFieldErrors({ ...fieldErrors, year: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm focus:outline-none transition-colors ${
                  fieldErrors.year ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
              {fieldErrors.year && (
                <p id="error-subject-year" className="text-xs text-rose-400 font-medium">{fieldErrors.year}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Semester <span className="text-rose-400">*</span>
              </label>
              <select
                id="select-subject-semester"
                value={formData.semester}
                onChange={(e) => {
                  setFormData({ ...formData, semester: Number(e.target.value) });
                  if (fieldErrors.semester) setFieldErrors({ ...fieldErrors, semester: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm focus:outline-none transition-colors ${
                  fieldErrors.semester ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              {fieldErrors.semester && (
                <p id="error-subject-semester" className="text-xs text-rose-400 font-medium">{fieldErrors.semester}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab('subjects')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-subject"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Saving Subject...' : 'Save Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
