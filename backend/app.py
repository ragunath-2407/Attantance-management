import os
import sys
import argparse
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from database import get_db_connection, init_db, hash_password

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
app.url_map.strict_slashes = False
CORS(app)

# Ensure database is initialized
init_db(force_reseed=False)

# -------------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------------
def row_to_dict(row):
    """Converts a sqlite3.Row object into a standard Python dictionary."""
    if row is None:
        return None
    return dict(row)

def rows_to_list(rows):
    """Converts a list of sqlite3.Row objects into a list of dictionaries."""
    return [dict(r) for r in rows]

# -------------------------------------------------------------
# FRONTEND ENTRY POINT & STATIC ASSETS
# -------------------------------------------------------------
@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "College Attendance Management System"})

# -------------------------------------------------------------
# AUTHENTICATION API
# -------------------------------------------------------------
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and user['password_hash'] == hash_password(password):
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "username": user['username'],
                "full_name": user['full_name'],
                "email": user['email'],
                "role": user['role']
            },
            "token": f"token-{user['id']}-auth-valid"
        })
    else:
        return jsonify({"success": False, "message": "Invalid username or password. (Hint: admin / admin123)"}), 401

@app.route('/api/auth/me', methods=['GET'])
def api_me():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, full_name, email, role FROM users LIMIT 1")
    user = cursor.fetchone()
    conn.close()
    if user:
        return jsonify(dict(user))
    return jsonify({"username": "admin", "full_name": "Administrator", "role": "Administrator"})

# -------------------------------------------------------------
# DASHBOARD STATS API
# -------------------------------------------------------------
@app.route('/api/dashboard/stats', methods=['GET'])
def api_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total counts
    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM subjects")
    total_subjects = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM attendance")
    total_records = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Present'")
    present_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Absent'")
    absent_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Late'")
    late_count = cursor.fetchone()[0]

    overall_percentage = round((present_count / total_records * 100), 1) if total_records > 0 else 0.0

    # Recent attendance records
    cursor.execute('''
        SELECT a.id, a.date, a.status, a.remarks,
               s.name AS student_name, s.register_number, s.department,
               sub.subject_code, sub.subject_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN subjects sub ON a.subject_id = sub.id
        ORDER BY a.date DESC, a.id DESC
        LIMIT 8
    ''')
    recent_records = rows_to_list(cursor.fetchall())

    # Calculate student shortage count (< 75%)
    cursor.execute('''
        SELECT s.id, s.name, s.register_number, s.department,
               COUNT(a.id) as total_classes,
               SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_classes
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id
    ''')
    student_stats = cursor.fetchall()
    
    shortage_list = []
    for st in student_stats:
        tot = st['total_classes']
        pres = st['present_classes'] or 0
        pct = round((pres / tot * 100), 1) if tot > 0 else 0.0
        if tot > 0 and pct < 75.0:
            shortage_list.append({
                "student_id": st['id'],
                "name": st['name'],
                "register_number": st['register_number'],
                "department": st['department'],
                "total_classes": tot,
                "present_classes": pres,
                "absent_classes": tot - pres,
                "percentage": pct
            })

    # Subject-wise attendance breakdown
    cursor.execute('''
        SELECT sub.id as subject_id, sub.subject_code, sub.subject_name, sub.department,
               COUNT(a.id) as total_records,
               SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
               SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count
        FROM subjects sub
        LEFT JOIN attendance a ON sub.id = a.subject_id
        GROUP BY sub.id
        ORDER BY sub.subject_code ASC
    ''')
    subject_wise = []
    for row in cursor.fetchall():
        tot = row['total_records'] or 0
        pres = row['present_count'] or 0
        ab = row['absent_count'] or 0
        pct = round((pres / tot * 100), 1) if tot > 0 else 0.0
        subject_wise.append({
            "subject_id": row['subject_id'],
            "subject_code": row['subject_code'],
            "subject_name": row['subject_name'],
            "department": row['department'],
            "total_records": tot,
            "present_count": pres,
            "absent_count": ab,
            "percentage": pct,
            "is_shortage": tot > 0 and pct < 75.0
        })

    # Attendance summary grouped by date
    cursor.execute('''
        SELECT date,
               COUNT(id) as total,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
               SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
        FROM attendance
        GROUP BY date
        ORDER BY date ASC
    ''')
    attendance_by_date = []
    for row in cursor.fetchall():
        tot = row['total'] or 0
        pres = row['present'] or 0
        ab = row['absent'] or 0
        pct = round((pres / tot * 100), 1) if tot > 0 else 0.0
        attendance_by_date.append({
            "date": row['date'],
            "total": tot,
            "present": pres,
            "absent": ab,
            "percentage": pct
        })

    # Department breakdown
    cursor.execute('''
        SELECT department, COUNT(*) as count
        FROM students
        GROUP BY department
    ''')
    dept_distribution = rows_to_list(cursor.fetchall())

    conn.close()

    return jsonify({
        "total_students": total_students,
        "total_subjects": total_subjects,
        "total_attendance_records": total_records,
        "total_present_records": present_count,
        "present_count": present_count,
        "total_absent_records": absent_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "overall_percentage": overall_percentage,
        "overall_attendance_percentage": overall_percentage,
        "overall_attendance_rate": overall_percentage,
        "present_vs_absent": {
            "present_count": present_count,
            "absent_count": absent_count,
            "total_records": total_records,
            "present_percentage": round((present_count / total_records * 100), 1) if total_records > 0 else 0.0,
            "absent_percentage": round((absent_count / total_records * 100), 1) if total_records > 0 else 0.0,
        },
        "subject_wise_attendance": subject_wise,
        "attendance_summary_by_date": attendance_by_date,
        "shortage_count": len(shortage_list),
        "recent_records": recent_records,
        "shortage_students": shortage_list,
        "dept_distribution": dept_distribution
    })

# -------------------------------------------------------------
# STUDENTS CRUD API
# -------------------------------------------------------------
@app.route('/api/students', methods=['GET'])
def api_get_students():
    search = request.args.get('search', '').strip().lower()
    department = request.args.get('department', '').strip()
    year = request.args.get('year', '').strip()
    semester = request.args.get('semester', '').strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM students WHERE 1=1"
    params = []

    if search:
        query += " AND (LOWER(name) LIKE ? OR LOWER(register_number) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    if department and department != 'All':
        query += " AND department = ?"
        params.append(department)

    if year and year != 'All':
        query += " AND year = ?"
        params.append(int(year))

    if semester and semester != 'All':
        query += " AND semester = ?"
        params.append(int(semester))

    query += " ORDER BY register_number ASC"
    cursor.execute(query, params)
    students = rows_to_list(cursor.fetchall())

    # Attach summary attendance rate to each student
    for s in students:
        cursor.execute('''
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
            FROM attendance
            WHERE student_id = ?
        ''', (s['id'],))
        row = cursor.fetchone()
        tot = row['total'] or 0
        pres = row['present'] or 0
        s['total_classes'] = tot
        s['present_classes'] = pres
        s['absent_classes'] = tot - pres
        s['attendance_percentage'] = round((pres / tot * 100), 1) if tot > 0 else 0.0
        s['is_shortage'] = tot > 0 and s['attendance_percentage'] < 75.0

    conn.close()
    return jsonify(students)

import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@app.route('/api/students', methods=['POST'])
def api_create_student():
    data = request.get_json() or {}
    reg_no = data.get('register_number', '').strip().upper()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    department = data.get('department', '').strip()
    year = data.get('year')
    semester = data.get('semester', 1)
    section = data.get('section', '').strip().upper()
    gender = data.get('gender', 'Other').strip()
    dob = data.get('dob', '').strip()
    address = data.get('address', '').strip()

    # Validation
    if not reg_no:
        return jsonify({"success": False, "message": "Register number required."}), 400
    if not name:
        return jsonify({"success": False, "message": "Name required."}), 400
    if not email:
        return jsonify({"success": False, "message": "Email required."}), 400
    if not EMAIL_REGEX.match(email):
        return jsonify({"success": False, "message": "Email must have valid format."}), 400
    if not phone:
        return jsonify({"success": False, "message": "Phone required."}), 400
    if not department:
        return jsonify({"success": False, "message": "Department required."}), 400
    if year is None or str(year).strip() == '':
        return jsonify({"success": False, "message": "Year required."}), 400
    try:
        year_int = int(year)
        if year_int < 1 or year_int > 5:
            return jsonify({"success": False, "message": "Year required."}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Year required."}), 400
    if not section:
        return jsonify({"success": False, "message": "Section required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check unique register number
    cursor.execute("SELECT id FROM students WHERE register_number = ?", (reg_no,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Register number must be unique."}), 409

    # Check unique email
    cursor.execute("SELECT id FROM students WHERE LOWER(email) = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Email must be unique."}), 409

    cursor.execute('''
        INSERT INTO students (register_number, name, email, phone, department, year, semester, section, gender, dob, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (reg_no, name, email, phone, department, year_int, int(semester), section, gender, dob, address))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Student created successfully.", "id": new_id}), 201

@app.route('/api/students/<int:student_id>', methods=['GET'])
def api_get_student_detail(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = row_to_dict(cursor.fetchone())

    if not student:
        conn.close()
        return jsonify({"success": False, "message": "Student not found."}), 404

    # Calculate overall attendance
    cursor.execute('''
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
               SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
               SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late
        FROM attendance
        WHERE student_id = ?
    ''', (student_id,))
    att_summary = cursor.fetchone()
    total_classes = att_summary['total'] or 0
    present_classes = att_summary['present'] or 0
    absent_classes = att_summary['absent'] or 0
    late_classes = att_summary['late'] or 0
    percentage = round((present_classes / total_classes * 100), 1) if total_classes > 0 else 0.0

    student['total_classes'] = total_classes
    student['present_classes'] = present_classes
    student['absent_classes'] = absent_classes
    student['late_classes'] = late_classes
    student['attendance_percentage'] = percentage
    student['is_shortage'] = total_classes > 0 and percentage < 75.0

    # Calculate subject-wise attendance breakdown
    cursor.execute('''
        SELECT sub.id as subject_id, sub.subject_code, sub.subject_name, sub.faculty_name,
               COUNT(a.id) as total,
               SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
               SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent,
               SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late
        FROM subjects sub
        LEFT JOIN attendance a ON sub.id = a.subject_id AND a.student_id = ?
        WHERE sub.department = ? AND sub.year = ?
        GROUP BY sub.id
    ''', (student_id, student['department'], student['year']))
    
    subject_stats = []
    for r in cursor.fetchall():
        tot = r['total'] or 0
        pres = r['present'] or 0
        pct = round((pres / tot * 100), 1) if tot > 0 else 0.0
        subject_stats.append({
            "subject_id": r['subject_id'],
            "subject_code": r['subject_code'],
            "subject_name": r['subject_name'],
            "faculty_name": r['faculty_name'],
            "total_classes": tot,
            "present_classes": pres,
            "absent_classes": r['absent'] or 0,
            "late_classes": r['late'] or 0,
            "percentage": pct,
            "is_shortage": tot > 0 and pct < 75.0
        })
    student['subjects_attendance'] = subject_stats

    # Fetch recent attendance history for this student
    cursor.execute('''
        SELECT a.id, a.date, a.status, a.remarks,
               sub.subject_code, sub.subject_name
        FROM attendance a
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.student_id = ?
        ORDER BY a.date DESC, a.id DESC
        LIMIT 20
    ''', (student_id,))
    student['history'] = rows_to_list(cursor.fetchall())

    conn.close()
    return jsonify(student)

@app.route('/api/students/<int:student_id>', methods=['PUT'])
def api_update_student(student_id):
    if student_id <= 0:
        return jsonify({"success": False, "message": "Student not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Student not found."}), 404

    data = request.get_json() or {}
    reg_no = data.get('register_number', '').strip().upper()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    department = data.get('department', '').strip()
    year = data.get('year')
    semester = data.get('semester', 1)
    section = data.get('section', '').strip().upper()
    gender = data.get('gender', 'Other').strip()
    dob = data.get('dob', '').strip()
    address = data.get('address', '').strip()

    # Validation
    if not reg_no:
        conn.close()
        return jsonify({"success": False, "message": "Register number required."}), 400
    if not name:
        conn.close()
        return jsonify({"success": False, "message": "Name required."}), 400
    if not email:
        conn.close()
        return jsonify({"success": False, "message": "Email required."}), 400
    if not EMAIL_REGEX.match(email):
        conn.close()
        return jsonify({"success": False, "message": "Email must have valid format."}), 400
    if not phone:
        conn.close()
        return jsonify({"success": False, "message": "Phone required."}), 400
    if not department:
        conn.close()
        return jsonify({"success": False, "message": "Department required."}), 400
    if year is None or str(year).strip() == '':
        conn.close()
        return jsonify({"success": False, "message": "Year required."}), 400
    try:
        year_int = int(year)
        if year_int < 1 or year_int > 5:
            conn.close()
            return jsonify({"success": False, "message": "Year required."}), 400
    except ValueError:
        conn.close()
        return jsonify({"success": False, "message": "Year required."}), 400
    if not section:
        conn.close()
        return jsonify({"success": False, "message": "Section required."}), 400

    # Check duplicate register number for other students
    cursor.execute("SELECT id FROM students WHERE register_number = ? AND id != ?", (reg_no, student_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Register number must be unique."}), 409

    # Check duplicate email for other students
    cursor.execute("SELECT id FROM students WHERE LOWER(email) = ? AND id != ?", (email, student_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Email must be unique."}), 409

    cursor.execute('''
        UPDATE students
        SET register_number = ?, name = ?, email = ?, phone = ?, department = ?,
            year = ?, semester = ?, section = ?, gender = ?, dob = ?, address = ?
        WHERE id = ?
    ''', (reg_no, name, email, phone, department, year_int, int(semester), section, gender, dob, address, student_id))

    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Student updated successfully."})

@app.route('/api/students/<int:student_id>', methods=['DELETE'])
def api_delete_student(student_id):
    if student_id <= 0:
        return jsonify({"success": False, "message": "Student not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Student not found."}), 404

    cursor.execute("DELETE FROM attendance WHERE student_id = ?", (student_id,))
    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Student and linked attendance records deleted."})

# -------------------------------------------------------------
# SUBJECTS CRUD API
# -------------------------------------------------------------
@app.route('/api/subjects', methods=['GET'])
def api_get_subjects():
    search = request.args.get('search', '').strip().lower()
    department = request.args.get('department', '').strip()
    year = request.args.get('year', '').strip()
    semester = request.args.get('semester', '').strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM subjects WHERE 1=1"
    params = []

    if search:
        query += " AND (LOWER(subject_code) LIKE ? OR LOWER(subject_name) LIKE ? OR LOWER(faculty_name) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    if department and department != 'All':
        query += " AND department = ?"
        params.append(department)

    if year and year != 'All':
        query += " AND year = ?"
        params.append(int(year))

    if semester and semester != 'All':
        query += " AND semester = ?"
        params.append(int(semester))

    query += " ORDER BY subject_code ASC"
    cursor.execute(query, params)
    subjects = rows_to_list(cursor.fetchall())

    # Attach stats for each subject
    for s in subjects:
        cursor.execute('''
            SELECT COUNT(*) as total_records,
                   COUNT(DISTINCT date) as total_sessions,
                   SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count
            FROM attendance
            WHERE subject_id = ?
        ''', (s['id'],))
        row = cursor.fetchone()
        tot = row['total_records'] or 0
        pres = row['present_count'] or 0
        s['total_records'] = tot
        s['total_sessions'] = row['total_sessions'] or 0
        s['attendance_rate'] = round((pres / tot * 100), 1) if tot > 0 else 0.0

    conn.close()
    return jsonify(subjects)

@app.route('/api/subjects', methods=['POST'])
def api_create_subject():
    data = request.get_json() or {}
    code = data.get('subject_code', '').strip().upper()
    name = data.get('subject_name', '').strip()
    department = data.get('department', '').strip()
    year = data.get('year')
    semester = data.get('semester')
    credits = data.get('credits', 3)
    faculty = data.get('faculty_name', '').strip()

    # Validation
    if not code:
        return jsonify({"success": False, "message": "Subject code required."}), 400
    if not name:
        return jsonify({"success": False, "message": "Subject name required."}), 400
    if not department:
        return jsonify({"success": False, "message": "Department required."}), 400
    if year is None or str(year).strip() == '':
        return jsonify({"success": False, "message": "Year required."}), 400
    try:
        year_int = int(year)
        if year_int < 1 or year_int > 5:
            return jsonify({"success": False, "message": "Year required."}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Year required."}), 400

    if semester is None or str(semester).strip() == '':
        return jsonify({"success": False, "message": "Semester required."}), 400
    try:
        sem_int = int(semester)
        if sem_int < 1 or sem_int > 8:
            return jsonify({"success": False, "message": "Semester required."}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Semester required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM subjects WHERE subject_code = ?", (code,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Subject code must be unique."}), 409

    cursor.execute('''
        INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits, faculty_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (code, name, department, year_int, sem_int, int(credits), faculty))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Subject created successfully.", "id": new_id}), 201

@app.route('/api/subjects/<int:subject_id>', methods=['GET'])
def api_get_subject_detail(subject_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM subjects WHERE id = ?", (subject_id,))
    subject = row_to_dict(cursor.fetchone())

    if not subject:
        conn.close()
        return jsonify({"success": False, "message": "Subject not found."}), 404

    # Subject metrics
    cursor.execute('''
        SELECT COUNT(*) as total_records,
               COUNT(DISTINCT date) as total_sessions,
               SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
               SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_count
        FROM attendance
        WHERE subject_id = ?
    ''', (subject_id,))
    stats = cursor.fetchone()
    subject['total_records'] = stats['total_records'] or 0
    subject['total_sessions'] = stats['total_sessions'] or 0
    subject['present_count'] = stats['present_count'] or 0
    subject['absent_count'] = stats['absent_count'] or 0
    tot = subject['total_records']
    subject['attendance_rate'] = round((subject['present_count'] / tot * 100), 1) if tot > 0 else 0.0

    conn.close()
    return jsonify(subject)

@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def api_update_subject(subject_id):
    if subject_id <= 0:
        return jsonify({"success": False, "message": "Subject not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Subject not found."}), 404

    data = request.get_json() or {}
    code = data.get('subject_code', '').strip().upper()
    name = data.get('subject_name', '').strip()
    department = data.get('department', '').strip()
    year = data.get('year')
    semester = data.get('semester')
    credits = data.get('credits', 3)
    faculty = data.get('faculty_name', '').strip()

    # Validation
    if not code:
        conn.close()
        return jsonify({"success": False, "message": "Subject code required."}), 400
    if not name:
        conn.close()
        return jsonify({"success": False, "message": "Subject name required."}), 400
    if not department:
        conn.close()
        return jsonify({"success": False, "message": "Department required."}), 400
    if year is None or str(year).strip() == '':
        conn.close()
        return jsonify({"success": False, "message": "Year required."}), 400
    try:
        year_int = int(year)
        if year_int < 1 or year_int > 5:
            conn.close()
            return jsonify({"success": False, "message": "Year required."}), 400
    except ValueError:
        conn.close()
        return jsonify({"success": False, "message": "Year required."}), 400

    if semester is None or str(semester).strip() == '':
        conn.close()
        return jsonify({"success": False, "message": "Semester required."}), 400
    try:
        sem_int = int(semester)
        if sem_int < 1 or sem_int > 8:
            conn.close()
            return jsonify({"success": False, "message": "Semester required."}), 400
    except ValueError:
        conn.close()
        return jsonify({"success": False, "message": "Semester required."}), 400

    cursor.execute("SELECT id FROM subjects WHERE subject_code = ? AND id != ?", (code, subject_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Subject code must be unique."}), 409

    cursor.execute('''
        UPDATE subjects
        SET subject_code = ?, subject_name = ?, department = ?, year = ?, semester = ?, credits = ?, faculty_name = ?
        WHERE id = ?
    ''', (code, name, department, year_int, sem_int, int(credits), faculty, subject_id))

    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Subject updated successfully."})

@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def api_delete_subject(subject_id):
    if subject_id <= 0:
        return jsonify({"success": False, "message": "Subject not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Subject not found."}), 404

    cursor.execute("DELETE FROM attendance WHERE subject_id = ?", (subject_id,))
    cursor.execute("DELETE FROM subjects WHERE id = ?", (subject_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Subject deleted successfully."})

# -------------------------------------------------------------
# ATTENDANCE API (Single & Batch Marking & History)
# -------------------------------------------------------------
@app.route('/api/attendance', methods=['GET'])
def api_get_attendance():
    date = request.args.get('date', '').strip()
    subject_id = request.args.get('subject_id', '').strip()
    student_id = request.args.get('student_id', '').strip()
    status = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = '''
        SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
               s.name as student_name, s.register_number, s.department, s.year, s.section,
               sub.subject_code, sub.subject_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE 1=1
    '''
    params = []

    if date:
        query += " AND a.date = ?"
        params.append(date)

    if subject_id and subject_id != 'All':
        query += " AND a.subject_id = ?"
        params.append(int(subject_id))

    if student_id and student_id != 'All':
        query += " AND a.student_id = ?"
        params.append(int(student_id))

    if status and status != 'All':
        query += " AND a.status = ?"
        params.append(status)

    if search:
        query += " AND (LOWER(s.name) LIKE ? OR LOWER(s.register_number) LIKE ? OR LOWER(sub.subject_code) LIKE ? OR LOWER(sub.subject_name) LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term, term])

    query += " ORDER BY a.date DESC, a.id DESC"
    cursor.execute(query, params)
    records = rows_to_list(cursor.fetchall())
    conn.close()
    return jsonify(records)

@app.route('/api/attendance', methods=['POST'])
def api_create_attendance():
    """Create single attendance record with strict validation and duplicate prevention."""
    data = request.get_json() or {}
    student_id = data.get('student_id') or data.get('student')
    subject_id = data.get('subject_id') or data.get('subject')
    date_val = str(data.get('attendance_date') or data.get('date') or '').strip()
    status_val = str(data.get('status') or '').strip()
    remarks = str(data.get('remarks') or '').strip()

    if not student_id:
        return jsonify({"success": False, "message": "Student required."}), 400
    if not subject_id:
        return jsonify({"success": False, "message": "Subject required."}), 400
    if not date_val:
        return jsonify({"success": False, "message": "Date required."}), 400
    if not status_val:
        return jsonify({"success": False, "message": "Status required."}), 400
    if status_val not in ['Present', 'Absent']:
        return jsonify({"success": False, "message": "Status must be Present or Absent."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify student exists
    try:
        st_id_int = int(student_id)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid foreign key: Student ID must be a valid number."}), 400

    cursor.execute("SELECT id, register_number FROM students WHERE id = ?", (st_id_int,))
    st = cursor.fetchone()
    if not st:
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Student not found."}), 400

    # Verify subject exists
    try:
        sub_id_int = int(subject_id)
    except (ValueError, TypeError):
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Subject ID must be a valid number."}), 400

    cursor.execute("SELECT id, subject_code FROM subjects WHERE id = ?", (sub_id_int,))
    sub = cursor.fetchone()
    if not sub:
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Subject not found."}), 400

    # Duplicate prevention
    cursor.execute('''
        SELECT id FROM attendance
        WHERE student_id = ? AND subject_id = ? AND date = ?
    ''', (st_id_int, sub_id_int, date_val))
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "success": False,
            "message": "Duplicate attendance: Duplicate attendance for the same student, subject and date must be prevented."
        }), 409

    cursor.execute('''
        INSERT INTO attendance (student_id, subject_id, date, status, remarks)
        VALUES (?, ?, ?, ?, ?)
    ''', (st_id_int, sub_id_int, date_val, status_val, remarks))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Attendance marked successfully.",
        "id": new_id,
        "student": int(student_id),
        "subject": int(subject_id),
        "attendance_date": date_val,
        "date": date_val,
        "status": status_val,
        "remarks": remarks
    }), 201

@app.route('/api/attendance/mark', methods=['POST'])
def api_mark_attendance_batch():
    """Batch attendance marking for an entire class session."""
    data = request.get_json() or {}
    session_date = data.get('date', '').strip()
    subject_id = data.get('subject_id')
    records = data.get('records', [])

    if not session_date or not subject_id or not records:
        return jsonify({"success": False, "message": "Date, subject, and student records are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    marked_count = 0
    for r in records:
        st_id = r.get('student_id')
        status = r.get('status', 'Present')
        remarks = r.get('remarks', '')

        if not st_id:
            continue

        # Upsert: Insert or replace existing attendance on same date and subject
        cursor.execute('''
            INSERT INTO attendance (student_id, subject_id, date, status, remarks)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(student_id, subject_id, date)
            DO UPDATE SET status = excluded.status, remarks = excluded.remarks, created_at = CURRENT_TIMESTAMP
        ''', (st_id, int(subject_id), session_date, status, remarks))
        marked_count += 1

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Successfully recorded attendance for {marked_count} students on {session_date}."
    })

@app.route('/api/attendance/<int:record_id>', methods=['PUT', 'PATCH'])
def api_update_single_attendance(record_id):
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM attendance WHERE id = ?", (record_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"success": False, "message": "Attendance record not found."}), 404

    student_id = data.get('student_id') or data.get('student') or existing['student_id']
    subject_id = data.get('subject_id') or data.get('subject') or existing['subject_id']
    date_val = str(data.get('attendance_date') or data.get('date') or existing['date']).strip()
    status_val = data.get('status') or existing['status']
    remarks = data.get('remarks') if 'remarks' in data else existing['remarks']

    if not student_id:
        conn.close()
        return jsonify({"success": False, "message": "Student required."}), 400
    if not subject_id:
        conn.close()
        return jsonify({"success": False, "message": "Subject required."}), 400
    if not date_val:
        conn.close()
        return jsonify({"success": False, "message": "Date required."}), 400
    if not status_val:
        conn.close()
        return jsonify({"success": False, "message": "Status required."}), 400
    if status_val not in ['Present', 'Absent']:
        conn.close()
        return jsonify({"success": False, "message": "Status must be Present or Absent."}), 400

    # Verify student exists
    try:
        st_id_int = int(student_id)
    except (ValueError, TypeError):
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Student ID must be a valid number."}), 400

    cursor.execute("SELECT id FROM students WHERE id = ?", (st_id_int,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Student not found."}), 400

    # Verify subject exists
    try:
        sub_id_int = int(subject_id)
    except (ValueError, TypeError):
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Subject ID must be a valid number."}), 400

    cursor.execute("SELECT id FROM subjects WHERE id = ?", (sub_id_int,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Invalid foreign key: Subject not found."}), 400

    # Duplicate check for same student, subject and date on other records
    cursor.execute('''
        SELECT id FROM attendance
        WHERE student_id = ? AND subject_id = ? AND date = ? AND id != ?
    ''', (st_id_int, sub_id_int, date_val, record_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "success": False,
            "message": "Duplicate attendance: Duplicate attendance for the same student, subject and date must be prevented."
        }), 409

    cursor.execute('''
        UPDATE attendance
        SET student_id = ?, subject_id = ?, date = ?, status = ?, remarks = ?
        WHERE id = ?
    ''', (st_id_int, sub_id_int, date_val, status_val, remarks, record_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Attendance record updated successfully."})

@app.route('/api/attendance/<int:record_id>', methods=['GET'])
def api_get_single_attendance(record_id):
    if record_id <= 0:
        return jsonify({"success": False, "message": "Attendance record not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks,
               s.name as student_name, s.register_number, s.department as student_department,
               sub.subject_code, sub.subject_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.id = ?
    """, (record_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"success": False, "message": "Attendance record not found."}), 404
    d = dict(row)
    d['student'] = d['student_id']
    d['subject'] = d['subject_id']
    d['attendance_date'] = d['date']
    return jsonify(d), 200

@app.route('/api/attendance/<int:record_id>', methods=['DELETE'])
def api_delete_attendance(record_id):
    if record_id <= 0:
        return jsonify({"success": False, "message": "Attendance record not found."}), 404

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM attendance WHERE id = ?", (record_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "message": "Attendance record not found."}), 404

    cursor.execute("DELETE FROM attendance WHERE id = ?", (record_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Attendance record deleted successfully."})

# -------------------------------------------------------------
# REPORTS & ANALYTICS API
# -------------------------------------------------------------
@app.route('/api/reports/detailed', methods=['GET'])
def api_get_reports_detailed():
    department = request.args.get('department', '').strip()
    year = request.args.get('year', '').strip()
    subject_id = request.args.get('subject_id', '').strip()
    search = request.args.get('search', '').strip().lower()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Query all students with matching filters
    s_query = "SELECT * FROM students WHERE 1=1"
    s_params = []
    if department and department != 'All':
        s_query += " AND department = ?"
        s_params.append(department)
    if year and year != 'All':
        s_query += " AND year = ?"
        s_params.append(int(year))
    if search:
        s_query += " AND (LOWER(name) LIKE ? OR LOWER(register_number) LIKE ?)"
        s_params.extend([f"%{search}%", f"%{search}%"])

    s_query += " ORDER BY register_number ASC"
    cursor.execute(s_query, s_params)
    students = rows_to_list(cursor.fetchall())

    report_list = []
    for st in students:
        # Determine subjects
        sub_query = "SELECT id, subject_code, subject_name FROM subjects WHERE department = ? AND year = ?"
        sub_params = [st['department'], st['year']]
        if subject_id and subject_id != 'All':
            sub_query += " AND id = ?"
            sub_params.append(int(subject_id))

        cursor.execute(sub_query, sub_params)
        subs = rows_to_list(cursor.fetchall())

        for sub in subs:
            cursor.execute('''
                SELECT COUNT(*) as total_classes,
                       SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_classes,
                       SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_classes,
                       SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_classes
                FROM attendance
                WHERE student_id = ? AND subject_id = ?
            ''', (st['id'], sub['id']))
            att = cursor.fetchone()
            tot = att['total_classes'] or 0
            pres = att['present_classes'] or 0
            absent = att['absent_classes'] or 0
            late = att['late_classes'] or 0
            pct = round((pres / tot * 100), 1) if tot > 0 else 0.0

            report_list.append({
                "student_id": st['id'],
                "name": st['name'],
                "register_number": st['register_number'],
                "department": st['department'],
                "year": st['year'],
                "section": st['section'],
                "subject_id": sub['id'],
                "subject_code": sub['subject_code'],
                "subject_name": sub['subject_name'],
                "total_classes": tot,
                "present_classes": pres,
                "absent_classes": absent,
                "late_classes": late,
                "attendance_percentage": pct,
                "is_eligible": pct >= 75.0 if tot > 0 else True,
                "is_shortage": pct < 75.0 and tot > 0
            })

    conn.close()
    return jsonify(report_list)

# -------------------------------------------------------------
# SETTINGS & DATABASE MANAGEMENT API
# -------------------------------------------------------------
@app.route('/api/settings', methods=['GET'])
def api_get_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    settings = {row['key']: row['value'] for row in cursor.fetchall()}
    conn.close()
    return jsonify(settings)

@app.route('/api/settings', methods=['POST'])
def api_update_settings():
    data = request.get_json() or {}
    conn = get_db_connection()
    cursor = conn.cursor()

    for k, v in data.items():
        cursor.execute('''
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        ''', (str(k), str(v)))

    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Settings updated successfully."})

@app.route('/api/settings/reset-database', methods=['POST'])
def api_reset_database():
    """Resets and re-seeds database with initial college records."""
    init_db(force_reseed=True)
    return jsonify({"success": True, "message": "Database has been reset and reseeded with default college data."})

# -------------------------------------------------------------
# GLOBAL ERROR HANDLERS (User-Friendly JSON Payloads)
# -------------------------------------------------------------
@app.errorhandler(400)
def handle_bad_request(e):
    msg = getattr(e, 'description', "Invalid input: Please verify all required fields and try again.")
    return jsonify({"success": False, "message": msg, "error_type": "invalid_input"}), 400

@app.errorhandler(404)
def handle_not_found(e):
    msg = getattr(e, 'description', "Resource not found or invalid ID.")
    return jsonify({"success": False, "message": msg, "error_type": "not_found"}), 404

@app.errorhandler(409)
def handle_conflict(e):
    msg = getattr(e, 'description', "Conflict: Resource already exists.")
    return jsonify({"success": False, "message": msg, "error_type": "conflict"}), 409

@app.errorhandler(500)
def handle_server_error(e):
    # Log internal error without leaking technical tracebacks to normal users
    logging.error(f"Internal Server Error: {e}")
    return jsonify({
        "success": False,
        "message": "Failed API request: The server encountered an error while processing your request. Please try again later.",
        "error_type": "server_error"
    }), 500

# -------------------------------------------------------------
# APPLICATION ENTRYPOINT
# -------------------------------------------------------------
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="College Attendance Management System")
    parser.add_argument("--port", type=int, default=3000, help="Server port (default: 3000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host IP (default: 0.0.0.0)")
    args, unknown = parser.parse_known_args()

    port = int(os.environ.get('PORT', args.port or 3000))
    host = args.host or '0.0.0.0'
    print(f"============================================================")
    print(f" College Attendance Management System")
    print(f" Running Flask Backend on: http://{host}:{port}")
    print(f" Database: {os.path.join(BASE_DIR, 'database', 'attendance.db')}")
    print(f"============================================================")
    app.run(host=host, port=port, debug=False)
