import sqlite3
import os
import hashlib
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DIR = os.path.join(BASE_DIR, 'database')
DB_PATH = os.path.join(DB_DIR, 'attendance.db')

def get_db_connection():
    """Returns a SQLite connection with row factory enabled."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_password(password):
    """Simple SHA-256 password hashing for beginner-friendly implementation."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def init_db(force_reseed=False):
    """Initializes tables and seeds initial sample college data if database is empty."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table (Admin / Faculty)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'Faculty',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 2. Students Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        register_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        section TEXT DEFAULT 'A',
        gender TEXT DEFAULT 'Other',
        dob TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 3. Subjects Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_code TEXT UNIQUE NOT NULL,
        subject_name TEXT NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        credits INTEGER DEFAULT 3,
        faculty_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # 4. Attendance Records Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late')),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE,
        UNIQUE (student_id, subject_id, date)
    )
    ''')

    # 5. System Settings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    ''')

    conn.commit()

    # Check if seed data is needed
    cursor.execute("SELECT COUNT(*) FROM students")
    student_count = cursor.fetchone()[0]

    if student_count == 0 or force_reseed:
        if force_reseed:
            cursor.execute("DELETE FROM attendance")
            cursor.execute("DELETE FROM subjects")
            cursor.execute("DELETE FROM students")
            cursor.execute("DELETE FROM users")
            cursor.execute("DELETE FROM settings")
            conn.commit()

        # Seed Users (Passwords loaded from environment variables with secure fallbacks)
        admin_password = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'admin123')
        faculty_password = os.environ.get('DEFAULT_FACULTY_PASSWORD', 'faculty123')
        users = [
            ('admin', hash_password(admin_password), 'Dr. Robert Jenkins', 'admin@apexcollege.edu', 'Administrator'),
            ('faculty', hash_password(faculty_password), 'Prof. Sarah Davis', 'sarah.davis@apexcollege.edu', 'Faculty In-Charge')
        ]
        cursor.executemany('''
            INSERT OR IGNORE INTO users (username, password_hash, full_name, email, role)
            VALUES (?, ?, ?, ?, ?)
        ''', users)

        # Seed Settings
        default_settings = [
            ('college_name', 'Apex Institute of Technology & Sciences'),
            ('college_code', 'AITS-1042'),
            ('min_attendance_percentage', '75'),
            ('academic_year', '2025 - 2026'),
            ('current_semester', 'Semester 5 (Odd Term)'),
            ('contact_email', 'academic@apexcollege.edu'),
            ('contact_phone', '+1 (555) 321-7890'),
            ('address', '100 University Boulevard, Tech City Campus')
        ]
        cursor.executemany('''
            INSERT OR REPLACE INTO settings (key, value)
            VALUES (?, ?)
        ''', default_settings)

        # Seed Students
        students = [
            ('CS2023001', 'Alexander Vance', 'alex.vance@student.edu', '+1 555-0101', 'Computer Science', 3, 5, 'A', 'Male', '2004-03-15', '42 Willow Creek Rd, Techville'),
            ('CS2023002', 'Elena Rostova', 'elena.rostova@student.edu', '+1 555-0102', 'Computer Science', 3, 5, 'A', 'Female', '2004-07-22', '18 Beacon Hill Ave, Techville'),
            ('CS2023003', 'Marcus Thorne', 'marcus.t@student.edu', '+1 555-0103', 'Computer Science', 3, 5, 'A', 'Male', '2003-11-09', '77 Pine Crest Lane, Techville'),
            ('CS2023004', 'Priya Sharma', 'priya.sharma@student.edu', '+1 555-0104', 'Computer Science', 3, 5, 'B', 'Female', '2004-01-30', '90 River Valley Rd, Techville'),
            ('IT2023005', 'Daniel Kim', 'daniel.kim@student.edu', '+1 555-0105', 'Information Technology', 3, 5, 'A', 'Male', '2003-09-14', '12 Oak Ridge Blvd, Techville'),
            ('IT2023006', 'Sophia Martinez', 'sophia.m@student.edu', '+1 555-0106', 'Information Technology', 3, 5, 'A', 'Female', '2004-05-18', '55 Maple Leaf Way, Techville'),
            ('EC2023007', 'Liam Gallagher', 'liam.g@student.edu', '+1 555-0107', 'Electronics & Comm.', 2, 3, 'A', 'Male', '2005-02-11', '33 Sunset Blvd, Techville'),
            ('EC2023008', 'Aaliyah Khan', 'aaliyah.k@student.edu', '+1 555-0108', 'Electronics & Comm.', 2, 3, 'A', 'Female', '2005-08-04', '88 Highpoint Ct, Techville'),
            ('ME2023009', 'David Chen', 'david.chen@student.edu', '+1 555-0109', 'Mechanical Eng.', 4, 7, 'A', 'Male', '2002-12-05', '21 Ironwood Dr, Techville'),
            ('ME2023010', 'Chloe Bennett', 'chloe.b@student.edu', '+1 555-0110', 'Mechanical Eng.', 4, 7, 'B', 'Female', '2003-04-19', '64 Harbor View, Techville')
        ]
        cursor.executemany('''
            INSERT INTO students (register_number, name, email, phone, department, year, semester, section, gender, dob, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', students)

        # Seed Subjects
        subjects = [
            ('CS501', 'Data Structures & Algorithms', 'Computer Science', 3, 5, 4, 'Prof. Alan Turing'),
            ('CS502', 'Database Management Systems', 'Computer Science', 3, 5, 4, 'Dr. Edgar Codd'),
            ('CS503', 'Computer Networks & Security', 'Computer Science', 3, 5, 3, 'Prof. Radia Perlman'),
            ('IT501', 'Web Application Development', 'Information Technology', 3, 5, 3, 'Prof. Tim Berners-Lee'),
            ('IT502', 'Cloud Computing Architecture', 'Information Technology', 3, 5, 4, 'Dr. Sarah Davis'),
            ('EC301', 'Digital Signal Processing', 'Electronics & Comm.', 2, 3, 4, 'Prof. Claude Shannon'),
            ('ME701', 'Thermodynamics & Heat Transfer', 'Mechanical Eng.', 4, 7, 4, 'Dr. Rudolf Diesel')
        ]
        cursor.executemany('''
            INSERT INTO subjects (subject_code, subject_name, department, year, semester, credits, faculty_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', subjects)

        conn.commit()

        # Generate realistic attendance sessions for the past 6 school days
        cursor.execute("SELECT id, department, year FROM students")
        student_rows = cursor.fetchall()

        cursor.execute("SELECT id, department, year FROM subjects")
        subject_rows = cursor.fetchall()

        # Subject id map by dept & year
        sub_map = {}
        for s in subject_rows:
            key = (s['department'], s['year'])
            if key not in sub_map:
                sub_map[key] = []
            sub_map[key].append(s['id'])

        base_date = datetime.now()
        dates = [(base_date - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(1, 8) if (base_date - timedelta(days=i)).weekday() < 5]

        # Preset attendance patterns to ensure good diversity and a couple of students below 75% threshold
        attendance_records = []
        for d_idx, session_date in enumerate(dates):
            for s_idx, st in enumerate(student_rows):
                s_id = st['id']
                dept = st['department']
                year = st['year']
                sub_ids = sub_map.get((dept, year), [subject_rows[0]['id']])

                for sub_id in sub_ids:
                    # Give student 3 (Marcus Thorne) a lower attendance rate (<75%)
                    if s_id == 3:
                        status = 'Absent' if d_idx in [0, 2, 4] else 'Present'
                        remarks = 'Medical leave' if status == 'Absent' else 'On time'
                    # Give student 7 a moderate rate
                    elif s_id == 7 and d_idx in [1, 3]:
                        status = 'Absent'
                        remarks = 'Unexcused absence'
                    # Occasional Late
                    elif (s_id + d_idx) % 7 == 0:
                        status = 'Late'
                        remarks = 'Arrived 10 mins late'
                    else:
                        status = 'Present'
                        remarks = 'Regular session'

                    attendance_records.append((s_id, sub_id, session_date, status, remarks))

        cursor.executemany('''
            INSERT OR IGNORE INTO attendance (student_id, subject_id, date, status, remarks)
            VALUES (?, ?, ?, ?, ?)
        ''', attendance_records)

        conn.commit()

    conn.close()

if __name__ == '__main__':
    print(f"Initializing database at: {DB_PATH}")
    init_db(force_reseed=True)
    print("Database initialized and sample data seeded successfully.")
