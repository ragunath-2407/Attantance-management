#!/usr/bin/env python3
"""
Lightweight, zero-dependency Python HTTP Server for Attendance Management System.
Uses standard library (http.server, sqlite3, json, urllib) to run directly on port 8001.
"""

import sys
import os
import json
import sqlite3
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Add current directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)

import database

database.init_db(force_reseed=False)

def row_to_dict(row):
    if row is None:
        return None
    return dict(row)

def rows_to_list(rows):
    return [dict(r) for r in rows]

class RequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        # Allow requests from frontend dev servers (Vite/React) or configured origins
        req_origin = self.headers.get('Origin', '*')
        self.send_header('Access-Control-Allow-Origin', req_origin)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Access-Control-Allow-Credentials', 'true')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data, status_code=200):
        try:
            payload = json.dumps(data).encode('utf-8')
            self.send_response(status_code)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as e:
            print(f"Error sending response: {e}")

    def _read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}

    def log_message(self, format, *args):
        # Override to keep logs clean
        sys.stderr.write(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]} {args[1]} {args[2]}\n")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        if not path:
            path = '/'
        query = parse_qs(parsed.query)

        conn = database.get_db_connection()
        cursor = conn.cursor()

        try:
            # 1. Health check
            if path in ('', '/', '/health', '/api/health'):
                self._send_json({"status": "healthy", "service": "College Attendance API"})
                return

            # 2. Dashboard Statistics
            if path == '/api/dashboard/stats':
                cursor.execute('SELECT COUNT(*) FROM students')
                total_students = cursor.fetchone()[0]

                cursor.execute('SELECT COUNT(*) FROM subjects')
                total_subjects = cursor.fetchone()[0]

                cursor.execute('SELECT COUNT(*) FROM attendance')
                total_records = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Present'")
                present_count = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Absent'")
                absent_count = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM attendance WHERE status = 'Late'")
                late_count = cursor.fetchone()[0]

                overall_pct = round((present_count / total_records * 100), 1) if total_records > 0 else 0.0
                present_pct = round((present_count / total_records * 100), 1) if total_records > 0 else 0.0
                absent_pct = round((absent_count / total_records * 100), 1) if total_records > 0 else 0.0

                # Subject-wise attendance calculation
                cursor.execute('''
                    SELECT s.id as subject_id, s.subject_code, s.subject_name, s.department,
                           COUNT(a.id) as total_records,
                           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                           SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count
                    FROM subjects s
                    LEFT JOIN attendance a ON s.id = a.subject_id
                    GROUP BY s.id
                    ORDER BY s.subject_code ASC
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

                # Date-wise attendance summary
                cursor.execute('''
                    SELECT date,
                           COUNT(id) as total,
                           SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
                           SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
                    FROM attendance
                    GROUP BY date
                    ORDER BY date DESC
                    LIMIT 14
                ''')
                date_summary = []
                for row in cursor.fetchall():
                    tot = row['total'] or 0
                    pres = row['present'] or 0
                    ab = row['absent'] or 0
                    pct = round((pres / tot * 100), 1) if tot > 0 else 0.0
                    date_summary.append({
                        "date": row['date'],
                        "total": tot,
                        "present": pres,
                        "absent": ab,
                        "percentage": pct
                    })
                # Reverse to chronological order
                date_summary.reverse()

                # Recent attendance records
                cursor.execute('''
                    SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
                           st.name as student_name, st.register_number as student_register_number,
                           sub.subject_code, sub.subject_name
                    FROM attendance a
                    JOIN students st ON a.student_id = st.id
                    JOIN subjects sub ON a.subject_id = sub.id
                    ORDER BY a.id DESC
                    LIMIT 10
                ''')
                recent_records = []
                for row in cursor.fetchall():
                    recent_records.append({
                        "id": row['id'],
                        "student": row['student_id'],
                        "student_name": row['student_name'],
                        "student_register_number": row['student_register_number'],
                        "subject": row['subject_id'],
                        "subject_code": row['subject_code'],
                        "subject_name": row['subject_name'],
                        "attendance_date": row['date'],
                        "status": row['status'],
                        "remarks": row['remarks'] or "",
                        "created_at": row['created_at']
                    })

                self._send_json({
                    "total_students": total_students,
                    "total_subjects": total_subjects,
                    "total_attendance_records": total_records,
                    "total_present_records": present_count,
                    "present_count": present_count,
                    "total_absent_records": absent_count,
                    "absent_count": absent_count,
                    "late_count": late_count,
                    "overall_percentage": overall_pct,
                    "overall_attendance_percentage": overall_pct,
                    "overall_attendance_rate": overall_pct,
                    "present_vs_absent": {
                        "present_count": present_count,
                        "absent_count": absent_count,
                        "total_records": total_records,
                        "present_percentage": present_pct,
                        "absent_percentage": absent_pct
                    },
                    "subject_wise_attendance": subject_wise,
                    "attendance_summary_by_date": date_summary,
                    "recent_records": recent_records
                })
                return

            # 3. Students API (List or Single)
            student_match = re.match(r'^/api/students/(\d+)$', path)
            if student_match:
                student_id = int(student_match.group(1))
                cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
                student = cursor.fetchone()
                if student:
                    self._send_json(row_to_dict(student))
                else:
                    self._send_json({"error": "Student not found"}, 404)
                return

            if re.match(r'^/api/students/(\d+)/attendance-percentage$', path):
                student_id = int(re.match(r'^/api/students/(\d+)/attendance-percentage$', path).group(1))
                cursor.execute('SELECT * FROM students WHERE id = ?', (student_id,))
                student = cursor.fetchone()
                if not student:
                    self._send_json({"error": "Student not found"}, 404)
                    return

                cursor.execute('''
                    SELECT sub.id as subject_id, sub.subject_code, sub.subject_name,
                           COUNT(a.id) as total_classes,
                           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_classes,
                           SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_classes
                    FROM subjects sub
                    LEFT JOIN attendance a ON sub.id = a.subject_id AND a.student_id = ?
                    GROUP BY sub.id
                ''', (student_id,))
                breakdown = []
                total_classes = 0
                total_present = 0
                for row in cursor.fetchall():
                    tc = row['total_classes'] or 0
                    pc = row['present_classes'] or 0
                    ac = row['absent_classes'] or 0
                    pct = round((pc / tc * 100), 1) if tc > 0 else 0.0
                    total_classes += tc
                    total_present += pc
                    breakdown.append({
                        "subject_id": row['subject_id'],
                        "subject_code": row['subject_code'],
                        "subject_name": row['subject_name'],
                        "total_classes": tc,
                        "present_classes": pc,
                        "absent_classes": ac,
                        "attendance_percentage": pct,
                        "is_shortage": tc > 0 and pct < 75.0
                    })
                overall_pct = round((total_present / total_classes * 100), 1) if total_classes > 0 else 0.0
                self._send_json({
                    "student_id": student['id'],
                    "register_number": student['register_number'],
                    "student_name": student['name'],
                    "department": student['department'],
                    "total_classes": total_classes,
                    "present_classes": total_present,
                    "overall_percentage": overall_pct,
                    "is_overall_shortage": total_classes > 0 and overall_pct < 75.0,
                    "breakdown": breakdown
                })
                return

            if path == '/api/students':
                sql = 'SELECT * FROM students WHERE 1=1'
                params = []
                if 'department' in query and query['department'][0]:
                    sql += ' AND department = ?'
                    params.append(query['department'][0])
                if 'year' in query and query['year'][0]:
                    try:
                        y_val = int(query['year'][0])
                        sql += ' AND year = ?'
                        params.append(y_val)
                    except ValueError:
                        self._send_json({"error": "year parameter must be a valid integer"}, 400)
                        return
                if 'semester' in query and query['semester'][0]:
                    try:
                        s_val = int(query['semester'][0])
                        sql += ' AND semester = ?'
                        params.append(s_val)
                    except ValueError:
                        self._send_json({"error": "semester parameter must be a valid integer"}, 400)
                        return
                if 'search' in query and query['search'][0]:
                    s = f"%{query['search'][0]}%"
                    sql += ' AND (name LIKE ? OR register_number LIKE ? OR email LIKE ?)'
                    params.extend([s, s, s])
                sql += ' ORDER BY register_number ASC'
                cursor.execute(sql, params)
                self._send_json(rows_to_list(cursor.fetchall()))
                return

            # 4. Subjects API
            subject_match = re.match(r'^/api/subjects/(\d+)$', path)
            if subject_match:
                subject_id = int(subject_match.group(1))
                cursor.execute('SELECT * FROM subjects WHERE id = ?', (subject_id,))
                subject = cursor.fetchone()
                if subject:
                    self._send_json(row_to_dict(subject))
                else:
                    self._send_json({"error": "Subject not found"}, 404)
                return

            if path == '/api/subjects':
                sql = 'SELECT * FROM subjects WHERE 1=1'
                params = []
                if 'department' in query and query['department'][0]:
                    sql += ' AND department = ?'
                    params.append(query['department'][0])
                if 'search' in query and query['search'][0]:
                    s = f"%{query['search'][0]}%"
                    sql += ' AND (subject_code LIKE ? OR subject_name LIKE ?)'
                    params.extend([s, s])
                sql += ' ORDER BY subject_code ASC'
                cursor.execute(sql, params)
                self._send_json(rows_to_list(cursor.fetchall()))
                return

            # 5. Attendance API
            attendance_match = re.match(r'^/api/attendance/(\d+)$', path)
            if attendance_match:
                att_id = int(attendance_match.group(1))
                cursor.execute('''
                    SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
                           st.name as student_name, st.register_number as student_register_number,
                           sub.subject_code, sub.subject_name
                    FROM attendance a
                    JOIN students st ON a.student_id = st.id
                    JOIN subjects sub ON a.subject_id = sub.id
                    WHERE a.id = ?
                ''', (att_id,))
                att = cursor.fetchone()
                if att:
                    self._send_json({
                        "id": att['id'],
                        "student": att['student_id'],
                        "student_name": att['student_name'],
                        "student_register_number": att['student_register_number'],
                        "subject": att['subject_id'],
                        "subject_code": att['subject_code'],
                        "subject_name": att['subject_name'],
                        "attendance_date": att['date'],
                        "status": att['status'],
                        "remarks": att['remarks'] or "",
                        "created_at": att['created_at']
                    })
                else:
                    self._send_json({"error": "Attendance record not found"}, 404)
                return

            if path == '/api/attendance':
                sql = '''
                    SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
                           st.name as student_name, st.register_number as student_register_number,
                           sub.subject_code, sub.subject_name
                    FROM attendance a
                    JOIN students st ON a.student_id = st.id
                    JOIN subjects sub ON a.subject_id = sub.id
                    WHERE 1=1
                '''
                params = []
                if 'subject' in query and query['subject'][0]:
                    try:
                        sub_param = int(query['subject'][0])
                        sql += ' AND a.subject_id = ?'
                        params.append(sub_param)
                    except ValueError:
                        self._send_json({"error": "subject parameter must be a valid integer ID"}, 400)
                        return
                if 'student' in query and query['student'][0]:
                    try:
                        st_param = int(query['student'][0])
                        sql += ' AND a.student_id = ?'
                        params.append(st_param)
                    except ValueError:
                        self._send_json({"error": "student parameter must be a valid integer ID"}, 400)
                        return
                if 'date' in query and query['date'][0]:
                    sql += ' AND a.date = ?'
                    params.append(query['date'][0])
                if 'status' in query and query['status'][0]:
                    sql += ' AND a.status = ?'
                    params.append(query['status'][0])
                sql += ' ORDER BY a.date DESC, a.id DESC'

                cursor.execute(sql, params)
                results = []
                for row in cursor.fetchall():
                    results.append({
                        "id": row['id'],
                        "student": row['student_id'],
                        "student_name": row['student_name'],
                        "student_register_number": row['student_register_number'],
                        "subject": row['subject_id'],
                        "subject_code": row['subject_code'],
                        "subject_name": row['subject_name'],
                        "attendance_date": row['date'],
                        "status": row['status'],
                        "remarks": row['remarks'] or "",
                        "created_at": row['created_at']
                    })
                self._send_json(results)
                return

            # 6. Reports API
            if path == '/api/reports/attendance-percentage':
                sql = '''
                    SELECT st.id as student_id, st.register_number, st.name as student_name, st.department,
                           COUNT(a.id) as total_classes,
                           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_classes,
                           SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_classes
                    FROM students st
                    LEFT JOIN attendance a ON st.id = a.student_id
                '''
                params = []
                if 'subject' in query and query['subject'][0]:
                    try:
                        rep_sub = int(query['subject'][0])
                        sql += ' AND a.subject_id = ?'
                        params.append(rep_sub)
                    except ValueError:
                        self._send_json({"error": "subject parameter must be a valid integer ID"}, 400)
                        return
                sql += ' GROUP BY st.id ORDER BY st.register_number ASC'

                cursor.execute(sql, params)
                reports = []
                for row in cursor.fetchall():
                    tc = row['total_classes'] or 0
                    pc = row['present_classes'] or 0
                    ac = row['absent_classes'] or 0
                    pct = round((pc / tc * 100), 1) if tc > 0 else 0.0
                    reports.append({
                        "student_id": row['student_id'],
                        "register_number": row['register_number'],
                        "student_name": row['student_name'],
                        "department": row['department'],
                        "total_classes": tc,
                        "present_classes": pc,
                        "absent_classes": ac,
                        "attendance_percentage": pct,
                        "is_shortage": tc > 0 and pct < 75.0
                    })
                self._send_json(reports)
                return

            self._send_json({"error": "Endpoint not found", "path": path}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        data = self._read_json_body()

        conn = database.get_db_connection()
        cursor = conn.cursor()

        try:
            # Login
            if path == '/api/auth/login':
                username = data.get('username', '').strip()
                password = data.get('password', '').strip()
                cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
                user = cursor.fetchone()
                if user and user['password_hash'] == database.hash_password(password):
                    self._send_json({
                        "success": True,
                        "user": {
                            "id": user['id'],
                            "username": user['username'],
                            "full_name": user['full_name'],
                            "role": user['role']
                        }
                    })
                else:
                    self._send_json({"error": "Invalid username or password"}, 401)
                return

            # Create Student
            if path == '/api/students':
                reg_no = data.get('register_number', '').strip().upper()
                name = data.get('name', '').strip()
                email = data.get('email', '').strip()
                department = data.get('department', '').strip()
                section = data.get('section', 'A')
                phone = data.get('phone', '').strip()

                if not reg_no or not name or not email or not department:
                    self._send_json({"error": "Missing required field: register_number, name, email, and department are required"}, 400)
                    return

                # Validate email format
                if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
                    self._send_json({"error": "Invalid email address format"}, 400)
                    return

                # Validate year and semester integers
                try:
                    year = int(data.get('year', 1))
                    semester = int(data.get('semester', 1))
                    if year < 1 or year > 8:
                        self._send_json({"error": "year must be between 1 and 8"}, 400)
                        return
                    if semester < 1 or semester > 16:
                        self._send_json({"error": "semester must be between 1 and 16"}, 400)
                        return
                except (ValueError, TypeError):
                    self._send_json({"error": "year and semester must be valid integers"}, 400)
                    return

                # Check duplicate register number
                cursor.execute('SELECT id FROM students WHERE register_number = ?', (reg_no,))
                if cursor.fetchone():
                    self._send_json({"error": f"Student with register number {reg_no} already exists"}, 409)
                    return

                # Check duplicate email
                cursor.execute('SELECT id FROM students WHERE email = ?', (email,))
                if cursor.fetchone():
                    self._send_json({"error": f"Student with email {email} already exists"}, 409)
                    return

                cursor.execute('''
                    INSERT INTO students (register_number, name, email, phone, department, year, semester, section)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (reg_no, name, email, phone, department, year, semester, section))
                conn.commit()
                new_id = cursor.lastrowid
                cursor.execute('SELECT * FROM students WHERE id = ?', (new_id,))
                self._send_json(row_to_dict(cursor.fetchone()), 201)
                return

            # Create Subject
            if path == '/api/subjects':
                code = data.get('subject_code', '').strip().upper()
                name = data.get('subject_name', '').strip()
                department = data.get('department', '').strip()
                faculty = data.get('faculty_name', '').strip()

                if not code or not department:
                    self._send_json({"error": "Missing required field: subject_code and department are required"}, 400)
                    return

                if not name:
                    self._send_json({"error": "subject_name is required"}, 400)
                    return

                # Validate year, semester, credits
                try:
                    year = int(data.get('year', 1))
                    semester = int(data.get('semester', 1))
                    credits = int(data.get('credits', 3))
                    if credits < 0 or credits > 30:
                        self._send_json({"error": "credits must be between 0 and 30"}, 400)
                        return
                except (ValueError, TypeError):
                    self._send_json({"error": "year, semester, and credits must be valid integers"}, 400)
                    return

                # Check duplicate subject code
                cursor.execute('SELECT id FROM subjects WHERE subject_code = ?', (code,))
                if cursor.fetchone():
                    self._send_json({"error": f"Subject with code {code} already exists"}, 409)
                    return

                cursor.execute('''
                    INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits, faculty_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (code, name, department, year, semester, credits, faculty))
                conn.commit()
                new_id = cursor.lastrowid
                cursor.execute('SELECT * FROM subjects WHERE id = ?', (new_id,))
                self._send_json(row_to_dict(cursor.fetchone()), 201)
                return

            # Record Attendance
            if path == '/api/attendance':
                raw_student = data.get('student') or data.get('student_id')
                raw_subject = data.get('subject') or data.get('subject_id')

                if raw_student is None or str(raw_student).strip() == '':
                    self._send_json({"error": "student is required"}, 400)
                    return

                if raw_subject is None or str(raw_subject).strip() == '':
                    self._send_json({"error": "subject is required"}, 400)
                    return

                try:
                    student_id = int(raw_student)
                    subject_id = int(raw_subject)
                except (ValueError, TypeError):
                    self._send_json({"error": "student and subject must be valid integer IDs"}, 400)
                    return

                # Verify student exists
                cursor.execute('SELECT id FROM students WHERE id = ?', (student_id,))
                if not cursor.fetchone():
                    self._send_json({"error": f"Student with ID {student_id} does not exist"}, 404)
                    return

                # Verify subject exists
                cursor.execute('SELECT id FROM subjects WHERE id = ?', (subject_id,))
                if not cursor.fetchone():
                    self._send_json({"error": f"Subject with ID {subject_id} does not exist"}, 404)
                    return

                status = data.get('status', 'Present').strip()
                if status not in ['Present', 'Absent', 'Late']:
                    self._send_json({"error": "Invalid status. Allowed values: Present, Absent, Late"}, 400)
                    return

                att_date = data.get('attendance_date') or data.get('date') or datetime.now().strftime('%Y-%m-%d')
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(att_date)):
                    self._send_json({"error": "Invalid date format. Expected YYYY-MM-DD"}, 400)
                    return
                remarks = data.get('remarks', '')

                # Check duplicate attendance for student, subject, date
                cursor.execute('SELECT id FROM attendance WHERE student_id = ? AND subject_id = ? AND date = ?',
                               (student_id, subject_id, att_date))
                existing = cursor.fetchone()
                if existing:
                    self._send_json({
                        "error": "Attendance record already exists for this student, subject, and date",
                        "existing_id": existing['id']
                    }, 409)
                    return

                cursor.execute('''
                    INSERT INTO attendance (student_id, subject_id, date, status, remarks)
                    VALUES (?, ?, ?, ?, ?)
                ''', (student_id, subject_id, att_date, status, remarks))
                conn.commit()
                record_id = cursor.lastrowid

                cursor.execute('''
                    SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
                           st.name as student_name, st.register_number as student_register_number,
                           sub.subject_code, sub.subject_name
                    FROM attendance a
                    JOIN students st ON a.student_id = st.id
                    JOIN subjects sub ON a.subject_id = sub.id
                    WHERE a.id = ?
                ''', (record_id,))
                row = cursor.fetchone()
                self._send_json({
                    "id": row['id'],
                    "student": row['student_id'],
                    "student_name": row['student_name'],
                    "student_register_number": row['student_register_number'],
                    "subject": row['subject_id'],
                    "subject_code": row['subject_code'],
                    "subject_name": row['subject_name'],
                    "attendance_date": row['date'],
                    "status": row['status'],
                    "remarks": row['remarks'] or "",
                    "created_at": row['created_at']
                }, 201)
                return

            self._send_json({"error": "Endpoint not found", "path": path}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')
        data = self._read_json_body()

        conn = database.get_db_connection()
        cursor = conn.cursor()

        try:
            # Update Student
            student_match = re.match(r'^/api/students/(\d+)$', path)
            if student_match:
                s_id = int(student_match.group(1))
                cursor.execute('SELECT id FROM students WHERE id = ?', (s_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Student not found"}, 404)
                    return

                # Validate email if provided
                if 'email' in data:
                    email_val = str(data['email']).strip()
                    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email_val):
                        self._send_json({"error": "Invalid email address format"}, 400)
                        return
                    cursor.execute('SELECT id FROM students WHERE email = ? AND id != ?', (email_val, s_id))
                    if cursor.fetchone():
                        self._send_json({"error": f"Student with email {email_val} already exists"}, 409)
                        return
                    data['email'] = email_val

                # Validate register number if provided
                if 'register_number' in data:
                    reg_val = str(data['register_number']).strip().upper()
                    cursor.execute('SELECT id FROM students WHERE register_number = ? AND id != ?', (reg_val, s_id))
                    if cursor.fetchone():
                        self._send_json({"error": f"Student with register number {reg_val} already exists"}, 409)
                        return
                    data['register_number'] = reg_val

                # Validate year and semester if provided
                if 'year' in data:
                    try:
                        y_val = int(data['year'])
                        if y_val < 1 or y_val > 8:
                            self._send_json({"error": "year must be between 1 and 8"}, 400)
                            return
                        data['year'] = y_val
                    except (ValueError, TypeError):
                        self._send_json({"error": "year must be a valid integer"}, 400)
                        return

                if 'semester' in data:
                    try:
                        sem_val = int(data['semester'])
                        if sem_val < 1 or sem_val > 16:
                            self._send_json({"error": "semester must be between 1 and 16"}, 400)
                            return
                        data['semester'] = sem_val
                    except (ValueError, TypeError):
                        self._send_json({"error": "semester must be a valid integer"}, 400)
                        return

                updates = []
                values = []
                for k in ['register_number', 'name', 'email', 'phone', 'department', 'year', 'semester', 'section']:
                    if k in data:
                        updates.append(f"{k} = ?")
                        values.append(data[k])
                if updates:
                    values.append(s_id)
                    cursor.execute(f"UPDATE students SET {', '.join(updates)} WHERE id = ?", values)
                    conn.commit()
                cursor.execute('SELECT * FROM students WHERE id = ?', (s_id,))
                self._send_json(row_to_dict(cursor.fetchone()))
                return

            # Update Subject
            subject_match = re.match(r'^/api/subjects/(\d+)$', path)
            if subject_match:
                sub_id = int(subject_match.group(1))
                cursor.execute('SELECT id FROM subjects WHERE id = ?', (sub_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Subject not found"}, 404)
                    return

                # Validate duplicate subject code if provided
                if 'subject_code' in data:
                    c_val = str(data['subject_code']).strip().upper()
                    cursor.execute('SELECT id FROM subjects WHERE subject_code = ? AND id != ?', (c_val, sub_id))
                    if cursor.fetchone():
                        self._send_json({"error": f"Subject with code {c_val} already exists"}, 409)
                        return
                    data['subject_code'] = c_val

                # Validate credits if provided
                if 'credits' in data:
                    try:
                        cred_val = int(data['credits'])
                        if cred_val < 0 or cred_val > 30:
                            self._send_json({"error": "credits must be between 0 and 30"}, 400)
                            return
                        data['credits'] = cred_val
                    except (ValueError, TypeError):
                        self._send_json({"error": "credits must be a valid integer"}, 400)
                        return

                updates = []
                values = []
                for k in ['subject_code', 'subject_name', 'department', 'year', 'semester', 'credits', 'faculty_name']:
                    if k in data:
                        updates.append(f"{k} = ?")
                        values.append(data[k])
                if updates:
                    values.append(sub_id)
                    cursor.execute(f"UPDATE subjects SET {', '.join(updates)} WHERE id = ?", values)
                    conn.commit()
                cursor.execute('SELECT * FROM subjects WHERE id = ?', (sub_id,))
                self._send_json(row_to_dict(cursor.fetchone()))
                return

            # Update Attendance
            att_match = re.match(r'^/api/attendance/(\d+)$', path)
            if att_match:
                att_id = int(att_match.group(1))
                cursor.execute('SELECT id FROM attendance WHERE id = ?', (att_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Attendance record not found"}, 404)
                    return

                if 'status' in data and data['status'] not in ['Present', 'Absent', 'Late']:
                    self._send_json({"error": "Invalid status. Allowed values: Present, Absent, Late"}, 400)
                    return

                date_val = data.get('attendance_date') or data.get('date')
                if date_val and not re.match(r'^\d{4}-\d{2}-\d{2}$', str(date_val)):
                    self._send_json({"error": "Invalid date format. Expected YYYY-MM-DD"}, 400)
                    return

                updates = []
                values = []
                if 'status' in data:
                    updates.append("status = ?")
                    values.append(data['status'])
                if 'remarks' in data:
                    updates.append("remarks = ?")
                    values.append(data['remarks'])
                if date_val:
                    updates.append("date = ?")
                    values.append(date_val)
                if updates:
                    values.append(att_id)
                    cursor.execute(f"UPDATE attendance SET {', '.join(updates)} WHERE id = ?", values)
                    conn.commit()

                cursor.execute('''
                    SELECT a.id, a.student_id, a.subject_id, a.date, a.status, a.remarks, a.created_at,
                           st.name as student_name, st.register_number as student_register_number,
                           sub.subject_code, sub.subject_name
                    FROM attendance a
                    JOIN students st ON a.student_id = st.id
                    JOIN subjects sub ON a.subject_id = sub.id
                    WHERE a.id = ?
                ''', (att_id,))
                row = cursor.fetchone()
                self._send_json({
                    "id": row['id'],
                    "student": row['student_id'],
                    "student_name": row['student_name'],
                    "student_register_number": row['student_register_number'],
                    "subject": row['subject_id'],
                    "subject_code": row['subject_code'],
                    "subject_name": row['subject_name'],
                    "attendance_date": row['date'],
                    "status": row['status'],
                    "remarks": row['remarks'] or "",
                    "created_at": row['created_at']
                })
                return

            self._send_json({"error": "Endpoint not found", "path": path}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip('/')

        conn = database.get_db_connection()
        cursor = conn.cursor()

        try:
            # Delete Student
            s_match = re.match(r'^/api/students/(\d+)$', path)
            if s_match:
                s_id = int(s_match.group(1))
                cursor.execute('SELECT id FROM students WHERE id = ?', (s_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Student not found"}, 404)
                    return
                cursor.execute('DELETE FROM students WHERE id = ?', (s_id,))
                conn.commit()
                self.send_response(204)
                self._send_cors_headers()
                self.end_headers()
                return

            # Delete Subject
            sub_match = re.match(r'^/api/subjects/(\d+)$', path)
            if sub_match:
                sub_id = int(sub_match.group(1))
                cursor.execute('SELECT id FROM subjects WHERE id = ?', (sub_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Subject not found"}, 404)
                    return
                cursor.execute('DELETE FROM subjects WHERE id = ?', (sub_id,))
                conn.commit()
                self.send_response(204)
                self._send_cors_headers()
                self.end_headers()
                return

            # Delete Attendance
            att_match = re.match(r'^/api/attendance/(\d+)$', path)
            if att_match:
                att_id = int(att_match.group(1))
                cursor.execute('SELECT id FROM attendance WHERE id = ?', (att_id,))
                if not cursor.fetchone():
                    self._send_json({"error": "Attendance record not found"}, 404)
                    return
                cursor.execute('DELETE FROM attendance WHERE id = ?', (att_id,))
                conn.commit()
                self.send_response(204)
                self._send_cors_headers()
                self.end_headers()
                return

            self._send_json({"error": "Endpoint not found", "path": path}, 404)

        except Exception as e:
            self._send_json({"error": str(e)}, 500)
        finally:
            conn.close()

def run_server(port=8001):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"[backend] Python SQLite REST API running on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
    run_server(port)
