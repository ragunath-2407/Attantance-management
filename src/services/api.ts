/**
 * REST API client layer connecting React Frontend to Backend.
 * Standard endpoint mapping for CRUD operations with comprehensive error and exception handling.
 */
import { Student, Subject, AttendanceRecord, DashboardStats, StudentAttendanceReport } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export type ErrorType =
  | 'network_error'
  | 'backend_unavailable'
  | 'invalid_input'
  | 'failed_request'
  | 'invalid_id'
  | 'failed_delete'
  | 'failed_update'
  | 'failed_create'
  | 'not_found'
  | 'conflict'
  | 'empty_database'
  | 'general';

export class AppApiError extends Error {
  statusCode: number;
  errorType: ErrorType;
  details?: any;

  constructor(message: string, statusCode: number = 0, errorType: ErrorType = 'general', details?: any) {
    super(message);
    this.name = 'AppApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

/**
 * Validates entity ID format before making API calls.
 * Throws a clean user-friendly error on non-positive or non-numeric IDs.
 */
export function validateId(id: number | string | undefined | null, resourceName: string = 'Resource'): number {
  if (id === undefined || id === null || id === '') {
    throw new AppApiError(`Invalid ID: ${resourceName} ID is required.`, 400, 'invalid_id');
  }
  const numericId = Number(id);
  if (isNaN(numericId) || !Number.isFinite(numericId) || numericId <= 0) {
    throw new AppApiError(`Invalid ID: "${id}" is not a valid positive ID for ${resourceName}.`, 400, 'invalid_id');
  }
  return Math.floor(numericId);
}

/**
 * Parses structured backend error responses (DRF, Flask, or generic JSON).
 */
export function parseApiError(errorData: any, fallback: string): string {
  if (!errorData) return fallback;
  if (typeof errorData === 'string') return errorData;
  if (errorData.error) return typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
  if (errorData.message) return errorData.message;
  if (errorData.detail) return errorData.detail;
  if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
    return errorData.non_field_errors.join(' ');
  }
  if (errorData.duplicate) return errorData.duplicate;

  // Check specific field arrays
  const fieldOrder = [
    'register_number',
    'email',
    'name',
    'phone',
    'department',
    'year',
    'section',
    'subject_code',
    'subject_name',
    'semester',
    'student',
    'subject',
    'attendance_date',
    'date',
    'status',
    'remarks'
  ];

  for (const key of fieldOrder) {
    if (errorData[key]) {
      const val = errorData[key];
      if (Array.isArray(val) && val.length > 0) {
        return `${val.join(' ')}`;
      }
      if (typeof val === 'string') {
        return val;
      }
    }
  }

  // Any other keys
  const keys = Object.keys(errorData);
  if (keys.length > 0) {
    const firstKey = keys[0];
    const val = errorData[firstKey];
    if (Array.isArray(val) && val.length > 0) {
      return `${val.join(' ')}`;
    }
    if (typeof val === 'string') {
      return val;
    }
    return JSON.stringify(errorData);
  }

  return fallback;
}

interface FetchOptions extends RequestInit {
  action?: 'create' | 'update' | 'delete' | 'fetch';
  resource?: string;
}

/**
 * Robust central fetch wrapper with exhaustive frontend error handling.
 */
async function apiFetch<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const resource = options?.resource || 'record';
  const action = options?.action || 'fetch';

  // 1. Client offline detection
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new AppApiError(
      'Network error: You are currently offline. Please check your internet connection.',
      0,
      'network_error'
    );
  }

  let res: Response;
  try {
    res = await fetch(endpoint, options);
  } catch (err: any) {
    // Network disconnection or backend not running
    if (err instanceof TypeError || err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
      throw new AppApiError(
        'Backend unavailable: Unable to connect to the backend server. Please verify the service is running and try again.',
        0,
        'backend_unavailable'
      );
    }
    throw new AppApiError(
      `Network error: ${err.message || 'An unexpected network error occurred.'}`,
      0,
      'network_error'
    );
  }

  // 2. Handle HTTP Errors
  if (!res.ok) {
    let errorData: any = null;
    try {
      errorData = await res.json();
    } catch {
      errorData = null;
    }

    const rawMessage = parseApiError(errorData, '');

    // Backend Unavailable (502, 503, 504)
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new AppApiError(
        `Backend unavailable: The server is temporarily unreachable (HTTP ${res.status}). Please verify the backend service is running and try again.`,
        res.status,
        'backend_unavailable',
        errorData
      );
    }

    // 404 Not Found / Invalid ID
    if (res.status === 404) {
      const msg = rawMessage || `Invalid ID: The requested ${resource} does not exist in the database.`;
      throw new AppApiError(msg, 404, 'not_found', errorData);
    }

    // 400 Bad Request / Invalid Input
    if (res.status === 400) {
      const msg = rawMessage || 'Invalid input: Please verify all required fields and try again.';
      throw new AppApiError(msg, 400, 'invalid_input', errorData);
    }

    // 409 Conflict / Duplicates
    if (res.status === 409) {
      const msg = rawMessage || `Conflict: A ${resource} with these unique details already exists.`;
      throw new AppApiError(msg, 409, 'conflict', errorData);
    }

    // 500 Internal Server Error / Failed API Request
    if (res.status >= 500) {
      throw new AppApiError(
        'Failed API request: The server encountered an error while processing your request. Please try again later.',
        res.status,
        'failed_request',
        errorData
      );
    }

    // Operation-specific error wrapping
    if (action === 'delete') {
      throw new AppApiError(
        `Failed delete: ${rawMessage || `Unable to delete ${resource}.`}`,
        res.status,
        'failed_delete',
        errorData
      );
    }
    if (action === 'update') {
      throw new AppApiError(
        `Failed update: ${rawMessage || `Unable to update ${resource}.`}`,
        res.status,
        'failed_update',
        errorData
      );
    }
    if (action === 'create') {
      throw new AppApiError(
        `Failed create: ${rawMessage || `Unable to create ${resource}.`}`,
        res.status,
        'failed_create',
        errorData
      );
    }

    throw new AppApiError(
      rawMessage || `Failed API request with status code ${res.status}.`,
      res.status,
      'failed_request',
      errorData
    );
  }

  // 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // --- Dashboard ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiFetch<DashboardStats>(`${API_BASE_URL}/dashboard/stats/`, {
      action: 'fetch',
      resource: 'Dashboard Statistics'
    });
  },

  // --- Student Management ---
  getStudents: async (params?: { search?: string; department?: string; semester?: number }): Promise<Student[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);
    if (params?.semester) query.append('semester', params.semester.toString());

    const qs = query.toString();
    const endpoint = qs ? `${API_BASE_URL}/students/?${qs}` : `${API_BASE_URL}/students/`;
    return apiFetch<Student[]>(endpoint, {
      action: 'fetch',
      resource: 'Students'
    });
  },

  getStudentById: async (id: number): Promise<Student> => {
    const validId = validateId(id, 'Student');
    return apiFetch<Student>(`${API_BASE_URL}/students/${validId}/`, {
      action: 'fetch',
      resource: 'Student'
    });
  },

  createStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    try {
      return await apiFetch<Student>(`${API_BASE_URL}/students/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
        action: 'create',
        resource: 'Student'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed create: ${err.message || 'Unable to add student.'}`, 400, 'failed_create');
    }
  },

  updateStudent: async (id: number, student: Partial<Student>): Promise<Student> => {
    const validId = validateId(id, 'Student');
    try {
      return await apiFetch<Student>(`${API_BASE_URL}/students/${validId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
        action: 'update',
        resource: 'Student'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed update: ${err.message || 'Unable to update student.'}`, 400, 'failed_update');
    }
  },

  deleteStudent: async (id: number): Promise<void> => {
    const validId = validateId(id, 'Student');
    try {
      await apiFetch<void>(`${API_BASE_URL}/students/${validId}/`, {
        method: 'DELETE',
        action: 'delete',
        resource: 'Student'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed delete: ${err.message || 'Unable to delete student.'}`, 400, 'failed_delete');
    }
  },

  // --- Subject Management ---
  getSubjects: async (params?: { search?: string; department?: string }): Promise<Subject[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.department) query.append('department', params.department);

    const qs = query.toString();
    const endpoint = qs ? `${API_BASE_URL}/subjects/?${qs}` : `${API_BASE_URL}/subjects/`;
    return apiFetch<Subject[]>(endpoint, {
      action: 'fetch',
      resource: 'Subjects'
    });
  },

  getSubjectById: async (id: number): Promise<Subject> => {
    const validId = validateId(id, 'Subject');
    return apiFetch<Subject>(`${API_BASE_URL}/subjects/${validId}/`, {
      action: 'fetch',
      resource: 'Subject'
    });
  },

  createSubject: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
    try {
      return await apiFetch<Subject>(`${API_BASE_URL}/subjects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject),
        action: 'create',
        resource: 'Subject'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed create: ${err.message || 'Unable to add subject.'}`, 400, 'failed_create');
    }
  },

  updateSubject: async (id: number, subject: Partial<Subject>): Promise<Subject> => {
    const validId = validateId(id, 'Subject');
    try {
      return await apiFetch<Subject>(`${API_BASE_URL}/subjects/${validId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subject),
        action: 'update',
        resource: 'Subject'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed update: ${err.message || 'Unable to update subject.'}`, 400, 'failed_update');
    }
  },

  deleteSubject: async (id: number): Promise<void> => {
    const validId = validateId(id, 'Subject');
    try {
      await apiFetch<void>(`${API_BASE_URL}/subjects/${validId}/`, {
        method: 'DELETE',
        action: 'delete',
        resource: 'Subject'
      });
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed delete: ${err.message || 'Unable to delete subject.'}`, 400, 'failed_delete');
    }
  },

  // --- Attendance Management ---
  getAttendanceRecords: async (params?: { subject?: number; student?: number; date?: string; status?: string }): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.subject) query.append('subject', params.subject.toString());
    if (params?.student) query.append('student', params.student.toString());
    if (params?.date) query.append('date', params.date);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString();
    const endpoint = qs ? `${API_BASE_URL}/attendance/?${qs}` : `${API_BASE_URL}/attendance/`;
    return apiFetch<AttendanceRecord[]>(endpoint, {
      action: 'fetch',
      resource: 'Attendance Records'
    });
  },

  getAttendanceRecordById: async (id: number): Promise<AttendanceRecord> => {
    const validId = validateId(id, 'Attendance Record');
    return apiFetch<AttendanceRecord>(`${API_BASE_URL}/attendance/${validId}/`, {
      action: 'fetch',
      resource: 'Attendance Record'
    });
  },

  markAttendance: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    try {
      const res = await apiFetch<AttendanceRecord>(`${API_BASE_URL}/attendance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        action: 'create',
        resource: 'Attendance Record'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      }
      return res;
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed create: ${err.message || 'Unable to record attendance.'}`, 400, 'failed_create');
    }
  },

  getStudentAttendancePercentage: async (studentId: number, subjectId?: number): Promise<any> => {
    const validStudentId = validateId(studentId, 'Student');
    const query = new URLSearchParams();
    if (subjectId) {
      const validSubId = validateId(subjectId, 'Subject');
      query.append('subject', validSubId.toString());
    }
    const qs = query.toString();
    const endpoint = qs
      ? `${API_BASE_URL}/students/${validStudentId}/attendance-percentage/?${qs}`
      : `${API_BASE_URL}/students/${validStudentId}/attendance-percentage/`;

    return apiFetch<any>(endpoint, {
      action: 'fetch',
      resource: 'Student Attendance Summary'
    });
  },

  updateAttendance: async (id: number, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const validId = validateId(id, 'Attendance Record');
    try {
      const res = await apiFetch<AttendanceRecord>(`${API_BASE_URL}/attendance/${validId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        action: 'update',
        resource: 'Attendance Record'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      }
      return res;
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed update: ${err.message || 'Unable to update attendance record.'}`, 400, 'failed_update');
    }
  },

  deleteAttendance: async (id: number): Promise<void> => {
    const validId = validateId(id, 'Attendance Record');
    try {
      await apiFetch<void>(`${API_BASE_URL}/attendance/${validId}/`, {
        method: 'DELETE',
        action: 'delete',
        resource: 'Attendance Record'
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendanceChanged'));
      }
    } catch (err: any) {
      if (err instanceof AppApiError) throw err;
      throw new AppApiError(`Failed delete: ${err.message || 'Unable to delete attendance record.'}`, 400, 'failed_delete');
    }
  },

  // --- Attendance Reports ---
  getAttendanceReports: async (subjectId?: number): Promise<StudentAttendanceReport[]> => {
    const query = new URLSearchParams();
    if (subjectId) {
      const validSubId = validateId(subjectId, 'Subject');
      query.append('subject', validSubId.toString());
    }

    const qs = query.toString();
    const endpoint = qs
      ? `${API_BASE_URL}/reports/attendance-percentage/?${qs}`
      : `${API_BASE_URL}/reports/attendance-percentage/`;

    return apiFetch<StudentAttendanceReport[]>(endpoint, {
      action: 'fetch',
      resource: 'Attendance Reports'
    });
  },
};
