/**
 * College Attendance Management System - Frontend Application Logic
 * Pure Vanilla JavaScript (Beginner-Friendly, Robust, Modular)
 */

// Global Application State
const AppState = {
  currentUser: null,
  activeRoute: 'dashboard',
  students: [],
  subjects: [],
  attendanceRecords: [],
  settings: {},
  currentStudentDetailId: null,
  currentEditStudentId: null,
  currentEditSubjectId: null,
  markAttendanceRoster: []
};

// ============================================================================
// INITIALIZATION & LIFECYCLE
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Set current date display in topbar
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  const dateEl = document.getElementById('current-date-display');
  if (dateEl) dateEl.textContent = dateStr;

  // Set today's date in date pickers
  const todayISO = now.toISOString().split('T')[0];
  const markDateInput = document.getElementById('mark-att-date');
  if (markDateInput) markDateInput.value = todayISO;

  // Check saved authentication
  const savedUser = localStorage.getItem('ams_user');
  if (savedUser) {
    try {
      AppState.currentUser = JSON.parse(savedUser);
      showAppPortal();
    } catch (e) {
      showLoginView();
    }
  } else {
    // Auto-login default demo user for seamless first impression
    const defaultUser = { username: 'admin', full_name: 'Dr. Robert Jenkins', role: 'Administrator' };
    AppState.currentUser = defaultUser;
    localStorage.setItem('ams_user', JSON.stringify(defaultUser));
    showAppPortal();
  }

  // Load initial settings
  loadSettings();
});

// ============================================================================
// ROUTING & NAVIGATION (ALL 14 PAGES)
// ============================================================================
function navigateTo(route, param = null) {
  // Hide all view containers
  const views = document.querySelectorAll('.view-container');
  views.forEach(v => v.classList.remove('active'));

  // Update active sidebar link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  AppState.activeRoute = route;

  // Close mobile sidebar if open
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  const headingTitle = document.getElementById('page-heading-title');
  const headingSub = document.getElementById('page-heading-sub');

  switch (route) {
    case 'dashboard':
      document.getElementById('view-dashboard').classList.add('active');
      document.getElementById('nav-dashboard').classList.add('active');
      headingTitle.textContent = 'Dashboard';
      headingSub.textContent = 'Overview & Academic Attendance Metrics';
      loadDashboardStats();
      break;

    case 'students':
      document.getElementById('view-students').classList.add('active');
      document.getElementById('nav-students').classList.add('active');
      headingTitle.textContent = 'Students Directory';
      headingSub.textContent = 'Manage Enrolled College Students & Profiles';
      loadStudents();
      break;

    case 'add-student':
      document.getElementById('view-add-student').classList.add('active');
      document.getElementById('nav-students').classList.add('active');
      headingTitle.textContent = 'Add Student';
      headingSub.textContent = 'Enroll New Student into College Database';
      document.getElementById('form-add-student').reset();
      break;

    case 'edit-student':
      document.getElementById('view-edit-student').classList.add('active');
      document.getElementById('nav-students').classList.add('active');
      headingTitle.textContent = 'Edit Student';
      headingSub.textContent = 'Update Student Information & Registration Details';
      if (param) loadStudentForEdit(param);
      break;

    case 'student-details':
      document.getElementById('view-student-details').classList.add('active');
      document.getElementById('nav-students').classList.add('active');
      headingTitle.textContent = 'Student Profile & Attendance Record';
      headingSub.textContent = 'Comprehensive Academic History & Breakdown';
      if (param) loadStudentDetails(param);
      break;

    case 'subjects':
      document.getElementById('view-subjects').classList.add('active');
      document.getElementById('nav-subjects').classList.add('active');
      headingTitle.textContent = 'Subjects & Curriculum';
      headingSub.textContent = 'Course Catalogue & Faculty Allocations';
      loadSubjects();
      break;

    case 'add-subject':
      document.getElementById('view-add-subject').classList.add('active');
      document.getElementById('nav-subjects').classList.add('active');
      headingTitle.textContent = 'Add Subject Course';
      headingSub.textContent = 'Define New Subject in the Academic Curriculum';
      document.getElementById('form-add-subject').reset();
      break;

    case 'edit-subject':
      document.getElementById('view-edit-subject').classList.add('active');
      document.getElementById('nav-subjects').classList.add('active');
      headingTitle.textContent = 'Edit Subject';
      headingSub.textContent = 'Modify Course Information & Faculty In-Charge';
      if (param) loadSubjectForEdit(param);
      break;

    case 'attendance':
      document.getElementById('view-attendance').classList.add('active');
      document.getElementById('nav-attendance').classList.add('active');
      headingTitle.textContent = 'Attendance Hub';
      headingSub.textContent = 'Daily Attendance Summary & Live Records';
      loadAttendanceHub();
      break;

    case 'mark-attendance':
      document.getElementById('view-mark-attendance').classList.add('active');
      document.getElementById('nav-attendance').classList.add('active');
      headingTitle.textContent = 'Mark Class Attendance';
      headingSub.textContent = 'Record Attendance for a Subject Class Session';
      prepareMarkAttendancePage();
      break;

    case 'attendance-history':
      document.getElementById('view-attendance-history').classList.add('active');
      document.getElementById('nav-attendance').classList.add('active');
      headingTitle.textContent = 'Attendance Session History';
      headingSub.textContent = 'Searchable & Filterable Attendance Archive';
      loadAttendanceHistory();
      break;

    case 'reports':
      document.getElementById('view-reports').classList.add('active');
      document.getElementById('nav-reports').classList.add('active');
      headingTitle.textContent = 'Attendance Reports & Exam Eligibility';
      headingSub.textContent = 'Calculated Percentages & 75% Shortage Defaulters';
      loadReports();
      break;

    case 'settings':
      document.getElementById('view-settings').classList.add('active');
      document.getElementById('nav-settings').classList.add('active');
      headingTitle.textContent = 'System & Institution Settings';
      headingSub.textContent = 'College Configuration & Database Maintenance';
      loadSettings();
      break;

    default:
      navigateTo('dashboard');
  }

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.toggle('mobile-open');
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      AppState.currentUser = data.user;
      localStorage.setItem('ams_user', JSON.stringify(data.user));
      showToast('Welcome back, ' + data.user.full_name, 'success');
      showAppPortal();
    } else {
      showToast(data.message || 'Login failed', 'danger');
    }
  } catch (err) {
    showToast('Failed to connect to backend server.', 'danger');
  }
}

function handleLogout() {
  localStorage.removeItem('ams_user');
  AppState.currentUser = null;
  showToast('You have been logged out.', 'info');
  showLoginView();
}

function showLoginView() {
  document.getElementById('view-login').style.display = 'flex';
  document.getElementById('app-portal-layout').style.display = 'none';
}

function showAppPortal() {
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('app-portal-layout').style.display = 'flex';

  if (AppState.currentUser) {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');

    if (nameEl) nameEl.textContent = AppState.currentUser.full_name || 'Faculty Member';
    if (roleEl) roleEl.textContent = AppState.currentUser.role || 'Faculty';
    if (avatarEl) {
      const parts = (AppState.currentUser.full_name || 'AD').split(' ');
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }
  }
  navigateTo('dashboard');
}

// ============================================================================
// DASHBOARD VIEW (PAGE 2)
// ============================================================================
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();

    document.getElementById('dash-total-students').textContent = data.total_students || 0;
    document.getElementById('dash-total-subjects').textContent = data.total_subjects || 0;
    document.getElementById('dash-overall-pct').textContent = (data.overall_percentage || 0) + '%';
    document.getElementById('dash-attendance-breakdown').textContent = `${data.present_count || 0} Present • ${data.absent_count || 0} Absent`;
    document.getElementById('dash-shortage-count').textContent = data.shortage_count || 0;

    // Render Recent Attendance Table
    const tbodyRecent = document.getElementById('dash-recent-table-body');
    if (!data.recent_records || data.recent_records.length === 0) {
      tbodyRecent.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No attendance sessions marked yet. Click "Mark Attendance" above to record one.</td></tr>`;
    } else {
      tbodyRecent.innerHTML = data.recent_records.map(r => `
        <tr>
          <td><strong>${escapeHtml(r.date)}</strong></td>
          <td>
            <div class="student-cell">
              <div class="student-avatar">${getInitials(r.student_name)}</div>
              <div>
                <div class="student-info-name">${escapeHtml(r.student_name)}</div>
                <div class="student-info-sub">${escapeHtml(r.register_number)} • ${escapeHtml(r.department)}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${escapeHtml(r.subject_code)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(r.subject_name)}</div>
          </td>
          <td>${getStatusBadge(r.status)}</td>
          <td style="color: var(--text-muted); font-size: 13px;">${escapeHtml(r.remarks || '—')}</td>
        </tr>
      `).join('');
    }

    // Render Shortage Defaulters Table
    const tbodyShortage = document.getElementById('dash-shortage-table-body');
    if (!data.shortage_students || data.shortage_students.length === 0) {
      tbodyShortage.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 24px;">Great news! All students maintain ≥75% attendance.</td></tr>`;
    } else {
      tbodyShortage.innerHTML = data.shortage_students.map(s => `
        <tr>
          <td>
            <div style="font-weight: 600;">${escapeHtml(s.name)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(s.register_number)}</div>
          </td>
          <td><span class="badge badge-department">${escapeHtml(s.department)}</span></td>
          <td>
            <span class="badge badge-warning-shortage" style="font-weight: 700;">${s.percentage}%</span>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
    showToast('Failed to load dashboard metrics.', 'danger');
  }
}

// ============================================================================
// STUDENTS (PAGES 3, 4, 5, 6)
// ============================================================================
async function loadStudents() {
  const search = document.getElementById('students-search')?.value || '';
  const dept = document.getElementById('students-filter-dept')?.value || 'All';
  const year = document.getElementById('students-filter-year')?.value || 'All';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (dept && dept !== 'All') params.append('department', dept);
  if (year && year !== 'All') params.append('year', year);

  const tbody = document.getElementById('students-table-body');
  try {
    const res = await fetch('/api/students?' + params.toString());
    const students = await res.json();
    AppState.students = students;

    if (!students || students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No students match the criteria. Click "Add New Student" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = students.map(s => {
      const pct = s.attendance_percentage || 0;
      let barColor = 'high';
      if (pct < 75) barColor = 'low';
      else if (pct < 85) barColor = 'medium';

      return `
        <tr>
          <td>
            <div class="student-cell" style="cursor: pointer;" onclick="navigateTo('student-details', ${s.id})">
              <div class="student-avatar">${getInitials(s.name)}</div>
              <div>
                <div class="student-info-name" style="color: var(--primary);">${escapeHtml(s.name)}</div>
                <div class="student-info-sub">${escapeHtml(s.register_number)}</div>
              </div>
            </div>
          </td>
          <td><span class="badge badge-department">${escapeHtml(s.department)}</span></td>
          <td>Year ${s.year} • Sem ${s.semester}</td>
          <td>Sec ${escapeHtml(s.section || 'A')}</td>
          <td>
            <div style="font-size: 13px;">${escapeHtml(s.email)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(s.phone || '—')}</div>
          </td>
          <td style="min-width: 140px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; font-weight: 600;">
              <span>${pct}%</span>
              <span style="color: ${s.is_shortage ? 'var(--danger)' : 'var(--success)'};">${s.is_shortage ? 'Shortage' : 'OK'}</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill ${barColor}" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('student-details', ${s.id})" title="View Details">
              👁️ View
            </button>
            <button class="btn-icon-only" onclick="navigateTo('edit-student', ${s.id})" title="Edit Student">
              ✏️
            </button>
            <button class="btn-icon-only delete" onclick="confirmDeleteStudent(${s.id}, '${escapeQuote(s.name)}')" title="Delete Student">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading students:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load students.</td></tr>`;
  }
}

// Add Student
async function handleCreateStudent(event) {
  event.preventDefault();
  const payload = {
    register_number: document.getElementById('add-student-regno').value.trim(),
    name: document.getElementById('add-student-name').value.trim(),
    email: document.getElementById('add-student-email').value.trim(),
    phone: document.getElementById('add-student-phone').value.trim(),
    department: document.getElementById('add-student-dept').value,
    year: parseInt(document.getElementById('add-student-year').value, 10),
    semester: parseInt(document.getElementById('add-student-sem').value, 10),
    section: document.getElementById('add-student-section').value.trim() || 'A',
    gender: document.getElementById('add-student-gender').value,
    dob: document.getElementById('add-student-dob').value,
    address: document.getElementById('add-student-address').value.trim()
  };

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Student enrolled successfully!', 'success');
      navigateTo('students');
    } else {
      showToast(data.message || 'Failed to add student', 'danger');
    }
  } catch (err) {
    showToast('Failed to connect to server', 'danger');
  }
}

// Load Student for Edit
async function loadStudentForEdit(studentId) {
  AppState.currentEditStudentId = studentId;
  try {
    const res = await fetch(`/api/students/${studentId}`);
    const s = await res.json();

    document.getElementById('edit-student-id').value = s.id;
    document.getElementById('edit-student-regno').value = s.register_number;
    document.getElementById('edit-student-name').value = s.name;
    document.getElementById('edit-student-email').value = s.email;
    document.getElementById('edit-student-phone').value = s.phone || '';
    document.getElementById('edit-student-dept').value = s.department;
    document.getElementById('edit-student-year').value = s.year;
    document.getElementById('edit-student-sem').value = s.semester;
    document.getElementById('edit-student-section').value = s.section || 'A';
    document.getElementById('edit-student-gender').value = s.gender || 'Other';
    document.getElementById('edit-student-dob').value = s.dob || '';
    document.getElementById('edit-student-address').value = s.address || '';
  } catch (err) {
    showToast('Error loading student details for editing', 'danger');
  }
}

// Update Student
async function handleUpdateStudent(event) {
  event.preventDefault();
  const id = document.getElementById('edit-student-id').value;
  const payload = {
    register_number: document.getElementById('edit-student-regno').value.trim(),
    name: document.getElementById('edit-student-name').value.trim(),
    email: document.getElementById('edit-student-email').value.trim(),
    phone: document.getElementById('edit-student-phone').value.trim(),
    department: document.getElementById('edit-student-dept').value,
    year: parseInt(document.getElementById('edit-student-year').value, 10),
    semester: parseInt(document.getElementById('edit-student-sem').value, 10),
    section: document.getElementById('edit-student-section').value.trim() || 'A',
    gender: document.getElementById('edit-student-gender').value,
    dob: document.getElementById('edit-student-dob').value,
    address: document.getElementById('edit-student-address').value.trim()
  };

  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Student updated successfully!', 'success');
      navigateTo('students');
    } else {
      showToast(data.message || 'Failed to update student', 'danger');
    }
  } catch (err) {
    showToast('Server error while updating student', 'danger');
  }
}

// View Student Details (Page 6)
async function loadStudentDetails(studentId) {
  AppState.currentStudentDetailId = studentId;
  try {
    const res = await fetch(`/api/students/${studentId}`);
    const s = await res.json();

    document.getElementById('detail-student-avatar').textContent = getInitials(s.name);
    document.getElementById('detail-student-name').textContent = s.name;
    document.getElementById('detail-student-reg').textContent = `REG NO: ${s.register_number}`;
    document.getElementById('detail-student-dept').textContent = s.department;
    document.getElementById('detail-student-year-sem').textContent = `Year ${s.year} • Semester ${s.semester}`;
    document.getElementById('detail-student-sec').textContent = `Section ${s.section || 'A'}`;
    document.getElementById('detail-student-contact').textContent = `✉️ ${s.email} • 📞 ${s.phone || 'No phone'}`;

    const badge = document.getElementById('detail-student-eligibility-badge');
    if (s.is_shortage) {
      badge.className = 'badge badge-warning-shortage';
      badge.textContent = '⚠️ Shortage Defaulter (<75%)';
    } else {
      badge.className = 'badge badge-eligible';
      badge.textContent = '✅ Exam Eligible (≥75%)';
    }

    document.getElementById('detail-stat-pct').textContent = (s.attendance_percentage || 0) + '%';
    document.getElementById('detail-stat-present').textContent = s.present_classes || 0;
    document.getElementById('detail-stat-absent').textContent = s.absent_classes || 0;
    document.getElementById('detail-stat-total').textContent = s.total_classes || 0;

    // Render Subjects Table
    const tbodySubs = document.getElementById('detail-subjects-table-body');
    if (!s.subjects_attendance || s.subjects_attendance.length === 0) {
      tbodySubs.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No subjects registered for this year & department.</td></tr>`;
    } else {
      tbodySubs.innerHTML = s.subjects_attendance.map(sub => `
        <tr>
          <td>
            <div style="font-weight: 700;">${escapeHtml(sub.subject_code)}</div>
            <div style="font-size: 13px; color: var(--text-muted);">${escapeHtml(sub.subject_name)}</div>
          </td>
          <td>${escapeHtml(sub.faculty_name || 'Unassigned')}</td>
          <td><strong>${sub.total_classes}</strong></td>
          <td style="color: var(--success); font-weight: 600;">${sub.present_classes}</td>
          <td style="color: var(--danger); font-weight: 600;">${sub.absent_classes}</td>
          <td style="min-width: 120px;">
            <div style="font-weight: 700; margin-bottom: 3px;">${sub.percentage}%</div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill ${sub.percentage < 75 ? 'low' : 'high'}" style="width: ${sub.percentage}%;"></div>
            </div>
          </td>
          <td>
            <span class="badge ${sub.is_shortage ? 'badge-warning-shortage' : 'badge-eligible'}">
              ${sub.is_shortage ? 'Shortage' : 'Eligible'}
            </span>
          </td>
        </tr>
      `).join('');
    }

    // Render Recent Attendance History
    const tbodyHist = document.getElementById('detail-history-table-body');
    if (!s.history || s.history.length === 0) {
      tbodyHist.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">No session logs found for this student.</td></tr>`;
    } else {
      tbodyHist.innerHTML = s.history.map(h => `
        <tr>
          <td><strong>${escapeHtml(h.date)}</strong></td>
          <td>${escapeHtml(h.subject_code)} - ${escapeHtml(h.subject_name)}</td>
          <td>${getStatusBadge(h.status)}</td>
          <td style="color: var(--text-muted); font-size: 13px;">${escapeHtml(h.remarks || '—')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    showToast('Failed to load student details', 'danger');
  }
}

// Delete Student Confirmation
function confirmDeleteStudent(studentId, studentName) {
  openDeleteModal(
    'Delete Student Record',
    `Are you sure you want to permanently delete student "${studentName}"? All linked attendance records will also be erased.`,
    async () => {
      try {
        const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Student deleted successfully', 'success');
          loadStudents();
        } else {
          showToast(data.message || 'Delete failed', 'danger');
        }
      } catch (err) {
        showToast('Error deleting student', 'danger');
      }
    }
  );
}

// ============================================================================
// SUBJECTS (PAGES 7, 8, 9)
// ============================================================================
async function loadSubjects() {
  const search = document.getElementById('subjects-search')?.value || '';
  const dept = document.getElementById('subjects-filter-dept')?.value || 'All';
  const year = document.getElementById('subjects-filter-year')?.value || 'All';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (dept && dept !== 'All') params.append('department', dept);
  if (year && year !== 'All') params.append('year', year);

  const tbody = document.getElementById('subjects-table-body');
  try {
    const res = await fetch('/api/subjects?' + params.toString());
    const subjects = await res.json();
    AppState.subjects = subjects;

    if (!subjects || subjects.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">No subjects found. Click "Add New Subject" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = subjects.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.subject_code)}</strong></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(s.subject_name)}</div>
        </td>
        <td><span class="badge badge-department">${escapeHtml(s.department)}</span></td>
        <td>Year ${s.year} • Sem ${s.semester}</td>
        <td>${s.credits} Credits</td>
        <td>${escapeHtml(s.faculty_name || 'Unassigned')}</td>
        <td><strong>${s.total_sessions || 0}</strong> sessions</td>
        <td>
          <span class="badge ${s.attendance_rate < 75 ? 'badge-warning-shortage' : 'badge-eligible'}">
            ${s.attendance_rate || 0}%
          </span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-icon-only" onclick="navigateTo('edit-subject', ${s.id})" title="Edit Subject">
            ✏️
          </button>
          <button class="btn-icon-only delete" onclick="confirmDeleteSubject(${s.id}, '${escapeQuote(s.subject_name)}')" title="Delete Subject">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load subjects.</td></tr>`;
  }
}

// Add Subject
async function handleCreateSubject(event) {
  event.preventDefault();
  const payload = {
    subject_code: document.getElementById('add-subject-code').value.trim(),
    subject_name: document.getElementById('add-subject-name').value.trim(),
    department: document.getElementById('add-subject-dept').value,
    year: parseInt(document.getElementById('add-subject-year').value, 10),
    semester: parseInt(document.getElementById('add-subject-sem').value, 10),
    credits: parseInt(document.getElementById('add-subject-credits').value, 10) || 3,
    faculty_name: document.getElementById('add-subject-faculty').value.trim()
  };

  try {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Subject created successfully!', 'success');
      navigateTo('subjects');
    } else {
      showToast(data.message || 'Failed to create subject', 'danger');
    }
  } catch (err) {
    showToast('Failed to connect to server', 'danger');
  }
}

// Load Subject for Edit
async function loadSubjectForEdit(subjectId) {
  AppState.currentEditSubjectId = subjectId;
  try {
    const res = await fetch(`/api/subjects/${subjectId}`);
    const s = await res.json();

    document.getElementById('edit-subject-id').value = s.id;
    document.getElementById('edit-subject-code').value = s.subject_code;
    document.getElementById('edit-subject-name').value = s.subject_name;
    document.getElementById('edit-subject-dept').value = s.department;
    document.getElementById('edit-subject-year').value = s.year;
    document.getElementById('edit-subject-sem').value = s.semester;
    document.getElementById('edit-subject-credits').value = s.credits || 3;
    document.getElementById('edit-subject-faculty').value = s.faculty_name || '';
  } catch (err) {
    showToast('Failed to load subject for editing', 'danger');
  }
}

// Update Subject
async function handleUpdateSubject(event) {
  event.preventDefault();
  const id = document.getElementById('edit-subject-id').value;
  const payload = {
    subject_code: document.getElementById('edit-subject-code').value.trim(),
    subject_name: document.getElementById('edit-subject-name').value.trim(),
    department: document.getElementById('edit-subject-dept').value,
    year: parseInt(document.getElementById('edit-subject-year').value, 10),
    semester: parseInt(document.getElementById('edit-subject-sem').value, 10),
    credits: parseInt(document.getElementById('edit-subject-credits').value, 10) || 3,
    faculty_name: document.getElementById('edit-subject-faculty').value.trim()
  };

  try {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Subject updated successfully!', 'success');
      navigateTo('subjects');
    } else {
      showToast(data.message || 'Failed to update subject', 'danger');
    }
  } catch (err) {
    showToast('Server error while updating subject', 'danger');
  }
}

// Delete Subject Confirmation
function confirmDeleteSubject(subjectId, subjectName) {
  openDeleteModal(
    'Delete Subject Course',
    `Are you sure you want to permanently delete subject "${subjectName}"? Attendance logs for this subject will also be deleted.`,
    async () => {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Subject deleted successfully', 'success');
          loadSubjects();
        } else {
          showToast(data.message || 'Delete failed', 'danger');
        }
      } catch (err) {
        showToast('Error deleting subject', 'danger');
      }
    }
  );
}

// ============================================================================
// ATTENDANCE HUB (PAGE 10)
// ============================================================================
async function loadAttendanceHub() {
  const date = document.getElementById('att-hub-filter-date')?.value || '';
  const status = document.getElementById('att-hub-filter-status')?.value || 'All';

  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (status && status !== 'All') params.append('status', status);

  const tbody = document.getElementById('att-hub-table-body');
  try {
    const res = await fetch('/api/attendance?' + params.toString());
    const records = await res.json();

    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No attendance sessions found for the chosen filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.date)}</strong></td>
        <td>
          <div class="student-cell">
            <div class="student-avatar">${getInitials(r.student_name)}</div>
            <div>
              <div class="student-info-name">${escapeHtml(r.student_name)}</div>
              <div class="student-info-sub">${escapeHtml(r.register_number)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-department">${escapeHtml(r.department)}</span></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(r.subject_code)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(r.subject_name)}</div>
        </td>
        <td>${getStatusBadge(r.status)}</td>
        <td style="color: var(--text-muted); font-size: 13px;">${escapeHtml(r.remarks || '—')}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-icon-only" onclick="openEditAttendanceModal(${JSON.stringify(r).replace(/"/g, '&quot;')})" title="Edit Status">
            ✏️
          </button>
          <button class="btn-icon-only delete" onclick="confirmDeleteAttendance(${r.id})" title="Delete Record">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load attendance records.</td></tr>`;
  }
}

// ============================================================================
// MARK ATTENDANCE (PAGE 11 - INTERACTIVE CLASS ROSTER)
// ============================================================================
async function prepareMarkAttendancePage() {
  const select = document.getElementById('mark-att-subject');
  select.innerHTML = '<option value="">-- Choose Subject Course --</option>';

  try {
    const res = await fetch('/api/subjects');
    const subjects = await res.json();
    AppState.subjects = subjects;

    subjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.subject_code} - ${s.subject_name} (${s.department}, Year ${s.year})`;
      select.appendChild(opt);
    });

    document.getElementById('mark-sheet-panel').style.display = 'none';
  } catch (err) {
    showToast('Failed to load subjects list', 'danger');
  }
}

function handleSubjectSelectionChange() {
  const subId = document.getElementById('mark-att-subject').value;
  const infoEl = document.getElementById('mark-att-sub-info');

  if (!subId) {
    infoEl.textContent = 'Select a subject to load students';
    document.getElementById('mark-sheet-panel').style.display = 'none';
    return;
  }

  const sub = AppState.subjects.find(s => s.id == subId);
  if (sub) {
    infoEl.innerHTML = `<strong>${escapeHtml(sub.subject_code)}</strong> • Dept: ${escapeHtml(sub.department)} • Year ${sub.year} • Faculty: ${escapeHtml(sub.faculty_name || 'N/A')}`;
  }
}

async function loadClassStudentsForMarking() {
  const subId = document.getElementById('mark-att-subject').value;
  const date = document.getElementById('mark-att-date').value;

  if (!date) {
    showToast('Please select the attendance session date', 'warning');
    return;
  }
  if (!subId) {
    showToast('Please select a subject course', 'warning');
    return;
  }

  const sub = AppState.subjects.find(s => s.id == subId);
  if (!sub) return;

  try {
    // 1. Fetch enrolled students matching department & year
    const resStudents = await fetch(`/api/students?department=${encodeURIComponent(sub.department)}&year=${sub.year}`);
    const students = await resStudents.json();

    if (!students || students.length === 0) {
      showToast(`No students enrolled in ${sub.department} Year ${sub.year}.`, 'warning');
      document.getElementById('mark-sheet-panel').style.display = 'none';
      return;
    }

    // 2. Fetch any already marked records for this date and subject
    const resAtt = await fetch(`/api/attendance?date=${encodeURIComponent(date)}&subject_id=${subId}`);
    const existingRecords = await resAtt.json();
    const existingMap = {};
    existingRecords.forEach(r => {
      existingMap[r.student_id] = { status: r.status, remarks: r.remarks };
    });

    // 3. Populate AppState.markAttendanceRoster
    AppState.markAttendanceRoster = students.map(st => {
      const existing = existingMap[st.id];
      return {
        student_id: st.id,
        register_number: st.register_number,
        name: st.name,
        department: st.department,
        year: st.year,
        section: st.section || 'A',
        status: existing ? existing.status : 'Present', // default to Present
        remarks: existing ? existing.remarks || '' : ''
      };
    });

    renderMarkAttendanceSheet(sub, date);
    document.getElementById('mark-sheet-panel').style.display = 'block';
  } catch (err) {
    showToast('Failed to load class roster', 'danger');
  }
}

function renderMarkAttendanceSheet(subject, date) {
  const titleEl = document.getElementById('mark-sheet-title');
  const subEl = document.getElementById('mark-sheet-subtitle');
  titleEl.textContent = `Roster for ${subject.subject_code} - ${subject.subject_name}`;
  subEl.textContent = `Date: ${date} • Total Enrolled: ${AppState.markAttendanceRoster.length} students. Click buttons to toggle status.`;

  const tbody = document.getElementById('mark-sheet-table-body');
  tbody.innerHTML = AppState.markAttendanceRoster.map((item, idx) => `
    <tr id="roster-row-${item.student_id}">
      <td>${idx + 1}</td>
      <td>
        <div class="student-cell">
          <div class="student-avatar">${getInitials(item.name)}</div>
          <div>
            <div class="student-info-name">${escapeHtml(item.name)}</div>
            <div class="student-info-sub">${escapeHtml(item.register_number)}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(item.department)} • Year ${item.year} (Sec ${escapeHtml(item.section)})</td>
      <td>
        <div class="status-toggle-group">
          <button type="button" class="status-btn ${item.status === 'Present' ? 'selected-present' : ''}" 
                  onclick="setItemAttendanceStatus(${item.student_id}, 'Present')">
            Present
          </button>
          <button type="button" class="status-btn ${item.status === 'Absent' ? 'selected-absent' : ''}" 
                  onclick="setItemAttendanceStatus(${item.student_id}, 'Absent')">
            Absent
          </button>
          <button type="button" class="status-btn ${item.status === 'Late' ? 'selected-late' : ''}" 
                  onclick="setItemAttendanceStatus(${item.student_id}, 'Late')">
            Late
          </button>
        </div>
      </td>
      <td>
        <input type="text" class="form-input" style="padding: 6px 10px; font-size: 13px;" 
               placeholder="Optional note" value="${escapeHtml(item.remarks)}"
               oninput="setItemAttendanceRemarks(${item.student_id}, this.value)">
      </td>
    </tr>
  `).join('');
}

function setItemAttendanceStatus(studentId, status) {
  const item = AppState.markAttendanceRoster.find(i => i.student_id === studentId);
  if (item) {
    item.status = status;
    const row = document.getElementById(`roster-row-${studentId}`);
    if (row) {
      const btns = row.querySelectorAll('.status-btn');
      btns[0].className = `status-btn ${status === 'Present' ? 'selected-present' : ''}`;
      btns[1].className = `status-btn ${status === 'Absent' ? 'selected-absent' : ''}`;
      btns[2].className = `status-btn ${status === 'Late' ? 'selected-late' : ''}`;
    }
  }
}

function setItemAttendanceRemarks(studentId, remarks) {
  const item = AppState.markAttendanceRoster.find(i => i.student_id === studentId);
  if (item) item.remarks = remarks;
}

function bulkMarkAll(status) {
  AppState.markAttendanceRoster.forEach(item => {
    item.status = status;
    const row = document.getElementById(`roster-row-${item.student_id}`);
    if (row) {
      const btns = row.querySelectorAll('.status-btn');
      btns[0].className = `status-btn ${status === 'Present' ? 'selected-present' : ''}`;
      btns[1].className = `status-btn ${status === 'Absent' ? 'selected-absent' : ''}`;
      btns[2].className = `status-btn ${status === 'Late' ? 'selected-late' : ''}`;
    }
  });
  showToast(`All ${AppState.markAttendanceRoster.length} students marked as ${status}.`, 'info');
}

async function submitClassAttendance() {
  const date = document.getElementById('mark-att-date').value;
  const subId = document.getElementById('mark-att-subject').value;

  if (!AppState.markAttendanceRoster || AppState.markAttendanceRoster.length === 0) {
    showToast('No students loaded to submit.', 'warning');
    return;
  }

  const payload = {
    date: date,
    subject_id: parseInt(subId, 10),
    records: AppState.markAttendanceRoster.map(r => ({
      student_id: r.student_id,
      status: r.status,
      remarks: r.remarks
    }))
  };

  try {
    const res = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast(data.message || 'Attendance saved successfully!', 'success');
      navigateTo('attendance');
    } else {
      showToast(data.message || 'Failed to submit attendance', 'danger');
    }
  } catch (err) {
    showToast('Server error while saving attendance', 'danger');
  }
}

// ============================================================================
// ATTENDANCE HISTORY (PAGE 12)
// ============================================================================
async function loadAttendanceHistory() {
  // Populate subjects dropdown in filter if empty
  const subFilter = document.getElementById('history-filter-subject');
  if (subFilter && subFilter.children.length <= 1) {
    try {
      const res = await fetch('/api/subjects');
      const subs = await res.json();
      subs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.subject_code} - ${s.subject_name}`;
        subFilter.appendChild(opt);
      });
    } catch (e) {}
  }

  const search = document.getElementById('history-search')?.value || '';
  const date = document.getElementById('history-filter-date')?.value || '';
  const subId = document.getElementById('history-filter-subject')?.value || 'All';
  const status = document.getElementById('history-filter-status')?.value || 'All';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (date) params.append('date', date);
  if (subId && subId !== 'All') params.append('subject_id', subId);
  if (status && status !== 'All') params.append('status', status);

  const tbody = document.getElementById('history-table-body');
  try {
    const res = await fetch('/api/attendance?' + params.toString());
    const records = await res.json();

    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No historical session records match your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.date)}</strong></td>
        <td>
          <div class="student-cell">
            <div class="student-avatar">${getInitials(r.student_name)}</div>
            <div>
              <div class="student-info-name">${escapeHtml(r.student_name)}</div>
              <div class="student-info-sub">${escapeHtml(r.register_number)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-department">${escapeHtml(r.department)}</span></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(r.subject_code)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(r.subject_name)}</div>
        </td>
        <td>${getStatusBadge(r.status)}</td>
        <td style="color: var(--text-muted); font-size: 13px;">${escapeHtml(r.remarks || '—')}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-icon-only" onclick="openEditAttendanceModal(${JSON.stringify(r).replace(/"/g, '&quot;')})" title="Edit Status">
            ✏️
          </button>
          <button class="btn-icon-only delete" onclick="confirmDeleteAttendance(${r.id})" title="Delete Record">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load attendance history.</td></tr>`;
  }
}

function clearHistoryFilters() {
  document.getElementById('history-search').value = '';
  document.getElementById('history-filter-date').value = '';
  document.getElementById('history-filter-subject').value = 'All';
  document.getElementById('history-filter-status').value = 'All';
  loadAttendanceHistory();
}

// Edit single attendance record in modal
function openEditAttendanceModal(record) {
  document.getElementById('edit-att-id').value = record.id;
  document.getElementById('edit-att-student-name').value = `${record.student_name} (${record.register_number})`;
  document.getElementById('edit-att-sub-name').value = `${record.subject_code} - ${record.subject_name}`;
  document.getElementById('edit-att-date').value = record.date;
  document.getElementById('edit-att-status').value = record.status;
  document.getElementById('edit-att-remarks').value = record.remarks || '';

  document.getElementById('modal-edit-att').classList.add('active');
}

function closeEditAttModal() {
  document.getElementById('modal-edit-att').classList.remove('active');
}

async function handleSaveEditAttendance(event) {
  event.preventDefault();
  const id = document.getElementById('edit-att-id').value;
  const status = document.getElementById('edit-att-status').value;
  const remarks = document.getElementById('edit-att-remarks').value.trim();

  try {
    const res = await fetch(`/api/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Attendance record updated!', 'success');
      closeEditAttModal();
      if (AppState.activeRoute === 'attendance') loadAttendanceHub();
      if (AppState.activeRoute === 'attendance-history') loadAttendanceHistory();
    } else {
      showToast(data.message || 'Update failed', 'danger');
    }
  } catch (err) {
    showToast('Failed to update record', 'danger');
  }
}

function confirmDeleteAttendance(recordId) {
  openDeleteModal(
    'Delete Attendance Record',
    'Are you sure you want to delete this attendance record from the database?',
    async () => {
      try {
        const res = await fetch(`/api/attendance/${recordId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          showToast('Attendance entry deleted', 'success');
          if (AppState.activeRoute === 'attendance') loadAttendanceHub();
          if (AppState.activeRoute === 'attendance-history') loadAttendanceHistory();
        } else {
          showToast(data.message || 'Delete failed', 'danger');
        }
      } catch (err) {
        showToast('Error deleting attendance record', 'danger');
      }
    }
  );
}

// ============================================================================
// REPORTS & ANALYTICS (PAGE 13)
// ============================================================================
async function loadReports() {
  const search = document.getElementById('reports-search')?.value || '';
  const dept = document.getElementById('reports-filter-dept')?.value || 'All';
  const year = document.getElementById('reports-filter-year')?.value || 'All';
  const elig = document.getElementById('reports-filter-eligibility')?.value || 'All';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (dept && dept !== 'All') params.append('department', dept);
  if (year && year !== 'All') params.append('year', year);

  const tbody = document.getElementById('reports-table-body');
  try {
    const res = await fetch('/api/reports/detailed?' + params.toString());
    let list = await res.json();

    if (elig === 'Shortage') {
      list = list.filter(item => item.is_shortage);
    } else if (elig === 'Eligible') {
      list = list.filter(item => item.is_eligible);
    }

    const uniqueStudents = new Set(list.map(i => i.student_id)).size;
    const eligibleCount = list.filter(i => i.is_eligible).length;
    const shortageCount = list.filter(i => i.is_shortage).length;

    document.getElementById('rep-stat-total').textContent = uniqueStudents;
    document.getElementById('rep-stat-eligible').textContent = eligibleCount;
    document.getElementById('rep-stat-shortage').textContent = shortageCount;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px;">No student records match the report criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(r => `
      <tr>
        <td>
          <div class="student-cell" style="cursor: pointer;" onclick="navigateTo('student-details', ${r.student_id})">
            <div class="student-avatar">${getInitials(r.name)}</div>
            <div>
              <div class="student-info-name" style="color: var(--primary);">${escapeHtml(r.name)}</div>
              <div class="student-info-sub">${escapeHtml(r.register_number)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-department">${escapeHtml(r.department)} (Yr ${r.year})</span></td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(r.subject_code)}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(r.subject_name)}</div>
        </td>
        <td><strong>${r.total_classes}</strong></td>
        <td style="color: var(--success); font-weight: 600;">${r.present_classes}</td>
        <td style="color: var(--danger); font-weight: 600;">${r.absent_classes}</td>
        <td style="min-width: 130px;">
          <div style="font-weight: 700; margin-bottom: 3px;">${r.attendance_percentage}%</div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill ${r.attendance_percentage < 75 ? 'low' : 'high'}" style="width: ${r.attendance_percentage}%;"></div>
          </div>
        </td>
        <td>
          <span class="badge ${r.is_shortage ? 'badge-warning-shortage' : 'badge-eligible'}">
            ${r.is_shortage ? '⚠️ Shortage (<75%)' : '✅ Eligible'}
          </span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load report data.</td></tr>`;
  }
}

// ============================================================================
// SETTINGS (PAGE 14)
// ============================================================================
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();
    AppState.settings = settings;

    if (settings.college_name) {
      const topName = document.getElementById('sidebar-college-name');
      const loginName = document.getElementById('login-college-name');
      if (topName) topName.textContent = settings.college_name;
      if (loginName) loginName.textContent = settings.college_name;

      const inputName = document.getElementById('setting-college-name');
      if (inputName) inputName.value = settings.college_name;
    }

    if (document.getElementById('setting-college-code')) {
      document.getElementById('setting-college-code').value = settings.college_code || '';
    }
    if (document.getElementById('setting-academic-year')) {
      document.getElementById('setting-academic-year').value = settings.academic_year || '2025 - 2026';
    }
    if (document.getElementById('setting-current-sem')) {
      document.getElementById('setting-current-sem').value = settings.current_semester || 'Semester 5';
    }
    if (document.getElementById('setting-min-att')) {
      document.getElementById('setting-min-att').value = settings.min_attendance_percentage || '75';
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

async function handleSaveSettings(event) {
  event.preventDefault();
  const payload = {
    college_name: document.getElementById('setting-college-name').value.trim(),
    college_code: document.getElementById('setting-college-code').value.trim(),
    academic_year: document.getElementById('setting-academic-year').value.trim(),
    current_semester: document.getElementById('setting-current-sem').value.trim(),
    min_attendance_percentage: document.getElementById('setting-min-att').value.trim()
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('College settings saved successfully!', 'success');
      loadSettings();
    } else {
      showToast('Failed to save settings', 'danger');
    }
  } catch (err) {
    showToast('Failed to save settings', 'danger');
  }
}

function confirmResetDatabase() {
  openDeleteModal(
    'Restore Default College Seed Data',
    'Are you sure you want to reset the SQLite database? This will restore 10 sample students, 7 academic subjects, and authentic past attendance records.',
    async () => {
      try {
        const res = await fetch('/api/settings/reset-database', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          loadSettings();
          navigateTo('dashboard');
        } else {
          showToast('Reset failed', 'danger');
        }
      } catch (err) {
        showToast('Error resetting database', 'danger');
      }
    }
  );
}

// ============================================================================
// MODAL & TOAST UTILITIES
// ============================================================================
let deleteConfirmCallback = null;

function openDeleteModal(title, message, onConfirm) {
  document.getElementById('modal-delete-title').textContent = title;
  document.getElementById('modal-delete-message').textContent = message;
  deleteConfirmCallback = onConfirm;

  const btn = document.getElementById('modal-delete-confirm-btn');
  btn.onclick = () => {
    if (deleteConfirmCallback) deleteConfirmCallback();
    closeDeleteModal();
  };

  document.getElementById('modal-delete').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('modal-delete').classList.remove('active');
  deleteConfirmCallback = null;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-msg">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Helper utilities
function getStatusBadge(status) {
  if (status === 'Present') return '<span class="badge badge-present">✅ Present</span>';
  if (status === 'Absent') return '<span class="badge badge-absent">❌ Absent</span>';
  if (status === 'Late') return '<span class="badge badge-late">⏰ Late</span>';
  return `<span class="badge">${escapeHtml(status)}</span>`;
}

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuote(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'");
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
