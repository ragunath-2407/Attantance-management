# Project Planning & Architecture Specification
## College Attendance Management System

### 1. Project Lifecycle & Methodology
The project follows an **Agile / Iterative SDLC** structured over 4 distinct milestones:

```
[Phase 1: Inception] ---> [Phase 2: Database & Backend] ---> [Phase 3: Frontend & Integration] ---> [Phase 4: QA & Auditing]
- Domain modeling          - SQLite schema design             - React SPA development           - Automated 30-case tests
- Requirement specs        - Django ORM & REST API            - Component hierarchy              - Postman collection
- Tech stack selection     - Validation & exception handling  - Interactive analytics charts     - SOP audit & report
```

### 2. Work Breakdown Structure (WBS)
1. **Module 1: Database & Data Modeling**
   - 1.1 Design normalized relational schema (3NF) for Students, Subjects, Attendance, and Users.
   - 1.2 Define primary keys, foreign key constraints (`ON DELETE CASCADE`), and unique indexes.
   - 1.3 Implement migration scripts and deterministic seed dataset.
2. **Module 2: Backend Architecture & REST API**
   - 2.1 Set up Django and Django REST Framework environment (`manage.py`, `core`, `attendance_backend`).
   - 2.2 Implement ModelSerializers with input validators (email regex, duplicate keys, positive year).
   - 2.3 Create ViewSets and API endpoints for Students, Subjects, Attendance, Stats, and Reports.
   - 2.4 Implement CORS middleware and HTTP exception handlers (400, 404, 409, 500).
3. **Module 3: Frontend Development & UI Engineering**
   - 3.1 Initialize React 18 SPA with Vite, TypeScript, and Tailwind CSS.
   - 3.2 Build modular component tree (Dashboard, Students, Subjects, Attendance, Reports, Database Explorer).
   - 3.3 Implement client-side validation in dialog modals with responsive form controls.
   - 3.4 Integrate Recharts visual data charts for Present vs Absent ratios and daily attendance trends.
4. **Module 4: Quality Assurance & SOP Compliance**
   - 4.1 Write and execute 30-case automated test suite across all CRUD paths.
   - 4.2 Export Postman Collection v2.1.0 with validation assertions.
   - 4.3 Verify 34 SOP requirements and generate college project documentation.

### 3. Architecture Overview & Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                       React 18 SPA                          │
│   (Vite + TypeScript + Tailwind CSS + Lucide + Recharts)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON over HTTP (REST)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Vite Reverse Proxy / API Gateway             │
│                     (Port 3000 -> Port 8001)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │    Python REST Service    │ │    Django + DRF Backend   │
   │  (server.py zero-dep)     │ │  (manage.py runserver)    │
   └─────────────┬─────────────┘ └─────────────┬─────────────┘
                 │                             │
                 └──────────────┬──────────────┘
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                   SQLite 3 Database                     │
   │           (attendance.db / db.sqlite3)                  │
   │   - students (id, register_number, name, email...)      │
   │   - subjects (id, subject_code, subject_name...)        │
   │   - attendance (id, student_id, subject_id, date...)    │
   └─────────────────────────────────────────────────────────┘
```

### 4. Risk Analysis & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|:---|:---|:---|:---|
| Duplicate attendance records | High | Medium | Composite unique constraint `UNIQUE(student_id, subject_id, date)` + backend 409 Conflict handler. |
| Inaccurate attendance calculations | High | Low | Dynamic SQL calculation using sum of present records divided by total records; zero cached totals. |
| Malformed input submission | Medium | High | Two-layer validation: client-side HTML5/state checks + server-side regex and unique queries. |
| Network disconnect or server down | High | Low | Frontend error boundary and Toast notifications displaying exact HTTP status codes. |
