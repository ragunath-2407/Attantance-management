"""
Database Seed Script for Attendance Management System.
Populates SQLite with sample Students, Subjects, and Attendance records for college project demo.
"""
import os
import sys
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import django
django.setup()

from core.models import Student, Subject, Attendance

def run_seed():
    print("Seeding database...")
    # Clear existing demo records
    Attendance.objects.all().delete()
    Student.objects.all().delete()
    Subject.objects.all().delete()

    # 1. Seed Students
    students_data = [
        {
            "register_number": "717621CS101",
            "name": "Aarav Sharma",
            "email": "aarav.sharma@college.edu",
            "phone": "+91 9876543210",
            "department": "Computer Science and Engineering",
            "year": 3,
            "section": "A",
            "admission_date": date(2023, 8, 1)
        },
        {
            "register_number": "717621CS102",
            "name": "Sneha Patel",
            "email": "sneha.patel@college.edu",
            "phone": "+91 9876543211",
            "department": "Computer Science and Engineering",
            "year": 3,
            "section": "A",
            "admission_date": date(2023, 8, 1)
        },
        {
            "register_number": "717621CS103",
            "name": "Rohan Verma",
            "email": "rohan.verma@college.edu",
            "phone": "+91 9876543212",
            "department": "Computer Science and Engineering",
            "year": 3,
            "section": "B",
            "admission_date": date(2023, 8, 1)
        },
        {
            "register_number": "717621EE201",
            "name": "Pooja Iyer",
            "email": "pooja.iyer@college.edu",
            "phone": "+91 9876543213",
            "department": "Electrical Engineering",
            "year": 2,
            "section": "A",
            "admission_date": date(2024, 8, 5)
        },
        {
            "register_number": "717621IT301",
            "name": "Aditya Nair",
            "email": "aditya.nair@college.edu",
            "phone": "+91 9876543214",
            "department": "Information Technology",
            "year": 4,
            "section": "A",
            "admission_date": date(2022, 8, 10)
        },
    ]

    students = []
    for s_data in students_data:
        s = Student.objects.create(**s_data)
        students.append(s)
    print(f"Created {len(students)} students.")

    # 2. Seed Subjects
    subjects_data = [
        {
            "subject_code": "CS8591",
            "subject_name": "Database Management Systems",
            "department": "Computer Science and Engineering",
            "year": 3,
            "semester": 5
        },
        {
            "subject_code": "CS8592",
            "subject_name": "Object Oriented Analysis and Design",
            "department": "Computer Science and Engineering",
            "year": 3,
            "semester": 5
        },
        {
            "subject_code": "EE8401",
            "subject_name": "Electrical Machines and Drives",
            "department": "Electrical Engineering",
            "year": 2,
            "semester": 3
        },
        {
            "subject_code": "IT8701",
            "subject_name": "Cloud Computing and Virtualization",
            "department": "Information Technology",
            "year": 4,
            "semester": 7
        },
    ]

    subjects = []
    for sub_data in subjects_data:
        sub = Subject.objects.create(**sub_data)
        subjects.append(sub)
    print(f"Created {len(subjects)} subjects.")

    # 3. Seed Attendance Records for the past 5 days
    cs_students = students[:3]
    cs_subject = subjects[0]
    today = date(2026, 9, 14)

    attendance_count = 0
    for day_offset in range(5):
        current_date = today - timedelta(days=day_offset)
        # Skip weekends (Saturday=5, Sunday=6)
        if current_date.weekday() >= 5:
            continue

        for idx, student in enumerate(cs_students):
            # Rohan Verma (idx 2) has some absences for demoing defaulter reports
            if idx == 2 and day_offset in [0, 2]:
                status = Attendance.STATUS_ABSENT
                remarks = "Uninformed Absence"
            else:
                status = Attendance.STATUS_PRESENT
                remarks = "Present on time"

            Attendance.objects.create(
                student=student,
                subject=cs_subject,
                attendance_date=current_date,
                status=status,
                remarks=remarks
            )
            attendance_count += 1

    print(f"Created {attendance_count} attendance records.")
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
