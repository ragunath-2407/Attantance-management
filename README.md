# College Attendance Management System

A full-stack, enterprise-grade **College Attendance Management System** built with **React 18**, **TypeScript**, **Tailwind CSS**, and a **Django / Python SQLite REST API**. Designed to automate student attendance tracking, prevent duplicate logs, compute real-time attendance percentages, and flag shortage risks (< 75%) according to university academic regulations.

---

## 🌟 Key Features

1. **Academic Analytics Dashboard**:
   - Live metrics: Total Students, Total Subjects, Total Attendance Records, Total Present, Total Absent, and Overall Attendance Percentage.
   - Dynamic Recharts visualizations: Present vs Absent distribution doughnut and daily session attendance trends.
   - Subject-wise attendance breakdown with shortage warnings (< 75%).
2. **Student Management**:
   - Complete CRUD operations for student records.
   - Multi-field search (by student name or registration number).
   - Department filtering.
   - Form validation ensuring unique registration numbers and valid email formats.
3. **Subject & Course Catalog**:
   - Course registration with unique subject code, title, credits, department, semester, and assigned faculty.
   - Complete CRUD and search operations.
4. **Attendance Recording & Management**:
   - Daily attendance logging with status options: **Present**, **Absent**, or **Late**.
   - Foreign-key referential integrity linking student and subject records.
   - Strict composite uniqueness validation: prevents duplicate attendance for the same `(student_id, subject_id, date)`.
   - Filter attendance by department, subject, date, and status.
5. **Shortage & Compliance Reports**:
   - Student-level attendance percentage computation.
   - Instant filtering for students falling below the mandatory 75% threshold.
6. **Built-in Database Explorer**:
   - Interactive SQL viewer to inspect underlying SQLite database tables (`students`, `subjects`, `attendance`, `users`).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
|:---|:---|
| **Frontend UI** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion |
| **Backend REST API** | Python 3, Django 4.x, Django REST Framework (DRF), HTTP Server REST API |
| **Database** | SQLite 3 (`attendance.db` / `db.sqlite3`) with Foreign Keys enabled |
| **API Testing** | Postman Collection v2.1.0 (30 automated test cases) |
| **Architecture** | Client-Server Single Page Application (SPA) over RESTful JSON |

---

## 🚀 Quick Start Guide

### Running with Node.js & Vite (Auto-Spawns Backend)
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Running with Django REST Framework CLI
```bash
# 1. Navigate to backend
cd backend

# 2. Set up virtual environment
python3 -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

# 3. Install packages
pip install -r requirements.txt

# 4. Migrate database
python manage.py migrate

# 5. Start Django REST server
python manage.py runserver 8001
```

---

## 🧪 Postman API Testing Suite

The project includes an exported Postman Collection:
- **File**: `Attendance_Management_System.postman_collection.json`
- **Total Test Cases**: 30
- **Pass Rate**: 100% (30 Passed, 0 Failed)

### Test Scope:
- **Student API (10 tests)**: All records, single record, valid POST, missing name (400), duplicate register number (409), invalid email (400), valid PUT, invalid PUT ID (404), valid DELETE (204), invalid DELETE ID (404).
- **Subject API (9 tests)**: All subjects, single subject, valid POST, missing subject name (400), duplicate code (409), valid PUT, invalid PUT ID (404), valid DELETE (204), invalid DELETE ID (404).
- **Attendance API (11 tests)**: All records, single record, valid POST, missing student (400), missing subject (400), invalid status (400), duplicate attendance (409), valid PUT, invalid PUT ID (404), valid DELETE (204), invalid DELETE ID (404).

---

## 📂 Project Structure

```
├── Attendance_Management_System.postman_collection.json  # Postman test collection
├── README.md                                             # Master project documentation
├── docs/                                                 # College report specifications
│   ├── REQUIREMENTS_ANALYSIS.md                         # Software requirements specification
│   ├── PROJECT_PLANNING.md                              # SDLC, architecture, WBS, risk analysis
│   ├── INSTALLATION.md                                  # Setup & deployment walkthrough
│   └── SOP_AUDIT_REPORT.md                              # 34-point SOP compliance matrix
├── backend/                                              # Backend source directory
│   ├── manage.py                                        # Django CLI entry point
│   ├── requirements.txt                                 # Python dependencies
│   ├── server.py                                        # Zero-dep Python SQLite REST server
│   ├── database.py                                      # SQLite connection & seed provider
│   ├── attendance_backend/                              # Django project settings & URLs
│   └── core/                                            # Django app: models, serializers, views
├── src/                                                  # React frontend source
│   ├── App.tsx                                          # Main application shell
│   ├── components/                                      # Modular UI components
│   │   ├── dashboard/                                   # Metric cards & Recharts graphs
│   │   ├── students/                                    # Student directory & modal forms
│   │   ├── subjects/                                    # Subject catalog & modal forms
│   │   ├── attendance/                                  # Daily attendance logging & filters
│   │   ├── reports/                                     # Shortage analysis & compliance tables
│   │   └── database/                                    # Interactive SQLite inspector
│   └── services/api.ts                                  # REST client with error parsing
└── vite.config.ts                                       # Vite bundler & backend process manager
```
