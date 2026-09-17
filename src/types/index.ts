export type NavigationTab = 
  | 'dashboard'
  | 'students'
  | 'add-student'
  | 'edit-student'
  | 'subjects'
  | 'add-subject'
  | 'edit-subject'
  | 'attendance'
  | 'mark-attendance'
  | 'edit-attendance'
  | 'reports'
  | 'structure'
  | 'database';

export interface Student {
  id: number;
  register_number: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: number;
  section: string;
  admission_date?: string;
}

export interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  department: string;
  year: number;
  semester: number;
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
  id: number;
  student: number;
  student_register_number?: string;
  student_name?: string;
  subject: number;
  subject_code?: string;
  subject_name?: string;
  attendance_date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface SubjectWiseAttendance {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  department: string;
  total_records: number;
  present_count: number;
  absent_count: number;
  percentage: number;
  is_shortage: boolean;
}

export interface AttendanceDailyTrend {
  date: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface PresentVsAbsentStats {
  present_count: number;
  absent_count: number;
  total_records: number;
  present_percentage: number;
  absent_percentage: number;
}

export interface DashboardStats {
  total_students: number;
  total_subjects: number;
  total_attendance_records: number;
  total_present_records?: number;
  present_count: number;
  total_absent_records?: number;
  absent_count: number;
  overall_attendance_rate: number;
  overall_attendance_percentage?: number;
  overall_percentage?: number;
  present_vs_absent?: PresentVsAbsentStats;
  subject_wise_attendance?: SubjectWiseAttendance[];
  attendance_summary_by_date?: AttendanceDailyTrend[];
  recent_records?: AttendanceRecord[];
}

export interface SubjectAttendanceBreakdown {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  total_classes: number;
  present_classes: number;
  absent_classes: number;
  attendance_percentage: number;
  is_shortage: boolean;
}

export interface StudentAttendanceReport {
  student_id: number;
  register_number: string;
  student_name: string;
  department: string;
  year: number;
  section: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  present_classes?: number;
  absent_classes?: number;
  attendance_percentage: number;
  overall_attendance_percentage?: number;
  is_shortage: boolean;
  subjects?: SubjectAttendanceBreakdown[];
}

export interface FolderFileNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  description: string;
  module?: string;
  children?: FolderFileNode[];
}
