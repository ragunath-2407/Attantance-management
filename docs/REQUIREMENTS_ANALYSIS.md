# Software Requirements Specification (SRS) & Requirement Analysis
## College Attendance Management System

### 1. Introduction & Objectives
The **College Attendance Management System** is a software solution designed for higher education institutions (engineering colleges, universities, departments) to streamline daily attendance recording, track student eligibility thresholds, and eliminate manual paper register errors.

### 2. Stakeholders & User Personas
- **Faculty / Professor**: Enters classroom attendance by session or subject, updates remarks for medical leaves or late arrivals, and views real-time attendance reports.
- **Head of Department (HOD) / Academic Dean**: Analyzes department-wide attendance metrics, monitors attendance shortage alerts (< 75%), and exports compliance reports.
- **System Administrator**: Registers students, manages subject courses and faculty allocations, maintains database integrity, and inspects API health.

### 3. Functional Requirements (FR)

| Req ID | Module | Description | Priority |
|:---|:---|:---|:---|
| **FR-01** | Student Management | System shall allow administrators to enroll new students with register number, name, email, phone, department, year, semester, and section. | High |
| **FR-02** | Student Unique Validation | System shall enforce unique constraints on Student Register Number and Student Email. | High |
| **FR-03** | Subject Catalog | System shall store and manage courses with unique course code, title, department, credits, semester, and assigned faculty. | High |
| **FR-04** | Attendance Recording | System shall record daily student session attendance with status (`Present`, `Absent`, `Late`), session date, and optional remarks. | High |
| **FR-05** | Composite Uniqueness | System shall prevent duplicate attendance entries for the same `(student_id, subject_id, date)` combination. | High |
| **FR-06** | Real-Time Statistical Calculation | System shall calculate attendance percentage using formula: $\text{Attendance \%} = \left(\frac{\text{Present Records}}{\text{Total Records}}\right) \times 100$. | High |
| **FR-07** | Shortage Threshold Alert | System shall identify and flag students whose aggregate attendance in any subject is below 75.0%. | High |
| **FR-08** | Search & Filter | System shall provide instant search (by student name or register number) and multi-factor filtering (department, subject, date range, status). | Medium |
| **FR-09** | CRUD Operations | System shall provide full Create, Read, Update, and Delete capabilities for Students, Subjects, and Attendance records. | High |
| **FR-10** | REST API Layer | System shall expose JSON-based REST endpoints complying with HTTP semantics. | High |

### 4. Non-Functional Requirements (NFR)

| Req ID | Category | Specification |
|:---|:---|:---|
| **NFR-01** | **Performance** | API response latency shall not exceed 500ms for standard CRUD and 1500ms for aggregated reports. |
| **NFR-02** | **Data Integrity** | Foreign key referential integrity must be strictly enforced via database cascades (`ON DELETE CASCADE`). |
| **NFR-03** | **Reliability** | The SQLite database must maintain ACID properties, write ahead logging, and zero data corruption during unexpected disconnects. |
| **NFR-04** | **Usability & Responsiveness** | UI must render seamlessly across mobile devices (min width 320px), tablets (768px), laptops (1024px), and desktops (1440px+). |
| **NFR-05** | **Security & Validation** | All inputs must be sanitized and validated on both client-side and server-side against injection, overflow, and invalid format errors. |
| **NFR-06** | **Interoperability** | Standard JSON format and CORS headers shall enable external integrations (Postman, LMS systems, mobile clients). |
