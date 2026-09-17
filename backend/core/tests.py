"""
Comprehensive REST API Test Suite for Django Attendance Backend.
Tests all endpoints for Students, Subjects, and Attendance:
- GET, POST, PUT, PATCH, DELETE
- Status codes (200, 201, 204, 400, 404)
- Error handling:
  - Missing required fields
  - Duplicate register number
  - Duplicate email
  - Duplicate subject code
  - Invalid student ID
  - Invalid subject ID
  - Invalid attendance ID
  - Invalid attendance status
  - Duplicate attendance on same date
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Student, Subject, Attendance


class StudentAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            register_number="717621CS001",
            name="Alice Johnson",
            email="alice@college.edu",
            phone="9876543210",
            department="Computer Science",
            year=3,
            section="A",
            admission_date="2022-08-15"
        )

    def test_get_all_students(self):
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['register_number'], "717621CS001")

    def test_get_student_by_id_success(self):
        response = self.client.get(f'/api/students/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Alice Johnson")

    def test_get_student_by_invalid_id(self):
        response = self.client.get('/api/students/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid student ID", str(response.data))

    def test_create_student_success(self):
        payload = {
            "register_number": "717621CS002",
            "name": "Bob Smith",
            "email": "bob@college.edu",
            "phone": "9876543211",
            "department": "Computer Science",
            "year": 3,
            "section": "A",
            "admission_date": "2022-08-15"
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['register_number'], "717621CS002")
        self.assertTrue(Student.objects.filter(register_number="717621CS002").exists())

    def test_create_student_missing_required_fields(self):
        payload = {"name": "Incomplete Student"}
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('register_number', response.data)
        self.assertIn('email', response.data)
        self.assertIn('department', response.data)

    def test_create_student_duplicate_register_number(self):
        payload = {
            "register_number": "717621CS001",  # duplicate
            "name": "Duplicate Student",
            "email": "diff_email@college.edu",
            "phone": "9876543212",
            "department": "Computer Science",
            "year": 3,
            "section": "B",
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('register_number', response.data)
        self.assertIn('Duplicate register number', str(response.data['register_number']))

    def test_create_student_duplicate_email(self):
        payload = {
            "register_number": "717621CS003",
            "name": "Another Student",
            "email": "alice@college.edu",  # duplicate
            "phone": "9876543213",
            "department": "Computer Science",
            "year": 3,
            "section": "B",
        }
        response = self.client.post('/api/students/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertIn('Duplicate email', str(response.data['email']))

    def test_put_student_success(self):
        payload = {
            "register_number": "717621CS001",
            "name": "Alice Johnson Updated",
            "email": "alice.updated@college.edu",
            "phone": "9876543299",
            "department": "Computer Science",
            "year": 4,
            "section": "B",
            "admission_date": "2022-08-15"
        }
        response = self.client.put(f'/api/students/{self.student.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Alice Johnson Updated")
        self.assertEqual(response.data['year'], 4)

    def test_patch_student_success(self):
        payload = {"section": "C"}
        response = self.client.patch(f'/api/students/{self.student.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['section'], "C")

    def test_delete_student_success(self):
        response = self.client.delete(f'/api/students/{self.student.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Student.objects.filter(id=self.student.id).exists())

    def test_delete_invalid_student_id(self):
        response = self.client.delete('/api/students/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid student ID", str(response.data))


class SubjectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.subject = Subject.objects.create(
            subject_code="CS8491",
            subject_name="Computer Networks",
            department="Computer Science",
            year=3,
            semester=5
        )

    def test_get_all_subjects(self):
        response = self.client.get('/api/subjects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['subject_code'], "CS8491")

    def test_get_subject_by_id_success(self):
        response = self.client.get(f'/api/subjects/{self.subject.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject_name'], "Computer Networks")

    def test_get_subject_by_invalid_id(self):
        response = self.client.get('/api/subjects/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid subject ID", str(response.data))

    def test_create_subject_success(self):
        payload = {
            "subject_code": "CS8492",
            "subject_name": "Database Management Systems",
            "department": "Computer Science",
            "year": 3,
            "semester": 5
        }
        response = self.client.post('/api/subjects/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['subject_code'], "CS8492")
        self.assertTrue(Subject.objects.filter(subject_code="CS8492").exists())

    def test_create_subject_missing_fields(self):
        payload = {"department": "Computer Science"}
        response = self.client.post('/api/subjects/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subject_code', response.data)
        self.assertIn('subject_name', response.data)

    def test_create_subject_duplicate_code(self):
        payload = {
            "subject_code": "CS8491",  # duplicate
            "subject_name": "Another Network Course",
            "department": "Computer Science",
            "year": 3,
            "semester": 5
        }
        response = self.client.post('/api/subjects/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subject_code', response.data)
        self.assertIn('Duplicate subject code', str(response.data['subject_code']))

    def test_put_subject_success(self):
        payload = {
            "subject_code": "CS8491",
            "subject_name": "Advanced Computer Networks",
            "department": "Computer Science",
            "year": 3,
            "semester": 6
        }
        response = self.client.put(f'/api/subjects/{self.subject.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject_name'], "Advanced Computer Networks")

    def test_patch_subject_success(self):
        payload = {"subject_name": "Computer Networks Lab"}
        response = self.client.patch(f'/api/subjects/{self.subject.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject_name'], "Computer Networks Lab")

    def test_delete_subject_success(self):
        response = self.client.delete(f'/api/subjects/{self.subject.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Subject.objects.filter(id=self.subject.id).exists())

    def test_delete_invalid_subject_id(self):
        response = self.client.delete('/api/subjects/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid subject ID", str(response.data))


class AttendanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = Student.objects.create(
            register_number="717621CS001",
            name="Alice Johnson",
            email="alice@college.edu",
            phone="9876543210",
            department="Computer Science",
            year=3,
            section="A"
        )
        self.subject = Subject.objects.create(
            subject_code="CS8491",
            subject_name="Computer Networks",
            department="Computer Science",
            year=3,
            semester=5
        )
        self.attendance = Attendance.objects.create(
            student=self.student,
            subject=self.subject,
            attendance_date="2025-03-10",
            status="Present",
            remarks="On time"
        )

    def test_get_all_attendance(self):
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], "Present")
        self.assertEqual(response.data[0]['student_register_number'], "717621CS001")
        self.assertEqual(response.data[0]['subject_code'], "CS8491")

    def test_get_attendance_by_id_success(self):
        response = self.client.get(f'/api/attendance/{self.attendance.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "Present")

    def test_get_attendance_by_invalid_id(self):
        response = self.client.get('/api/attendance/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid attendance ID", str(response.data))

    def test_mark_attendance_success(self):
        payload = {
            "student": self.student.id,
            "subject": self.subject.id,
            "attendance_date": "2025-03-11",
            "status": "Absent",
            "remarks": "Medical leave"
        }
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], "Absent")
        self.assertTrue(Attendance.objects.filter(attendance_date="2025-03-11", status="Absent").exists())

    def test_mark_attendance_missing_required_fields(self):
        payload = {"status": "Present"}
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student', response.data)
        self.assertIn('subject', response.data)
        self.assertIn('attendance_date', response.data)

    def test_mark_attendance_invalid_student_id(self):
        payload = {
            "student": 99999,  # invalid student id
            "subject": self.subject.id,
            "attendance_date": "2025-03-12",
            "status": "Present"
        }
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('student', response.data)
        self.assertIn('Invalid student ID', str(response.data['student']))

    def test_mark_attendance_invalid_subject_id(self):
        payload = {
            "student": self.student.id,
            "subject": 99999,  # invalid subject id
            "attendance_date": "2025-03-12",
            "status": "Present"
        }
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('subject', response.data)
        self.assertIn('Invalid subject ID', str(response.data['subject']))

    def test_mark_attendance_invalid_status(self):
        payload = {
            "student": self.student.id,
            "subject": self.subject.id,
            "attendance_date": "2025-03-12",
            "status": "Late"  # invalid status
        }
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)
        self.assertIn('Invalid attendance status', str(response.data['status']))

    def test_mark_attendance_duplicate_entry(self):
        # Already created in setUp: student + subject on 2025-03-10
        payload = {
            "student": self.student.id,
            "subject": self.subject.id,
            "attendance_date": "2025-03-10",  # duplicate date
            "status": "Present"
        }
        response = self.client.post('/api/attendance/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertIn('Duplicate attendance record', str(response.data['non_field_errors']))

    def test_put_attendance_success(self):
        payload = {
            "student": self.student.id,
            "subject": self.subject.id,
            "attendance_date": "2025-03-10",
            "status": "Absent",
            "remarks": "Updated status to absent"
        }
        response = self.client.put(f'/api/attendance/{self.attendance.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "Absent")

    def test_patch_attendance_success(self):
        payload = {"status": "Absent"}
        response = self.client.patch(f'/api/attendance/{self.attendance.id}/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "Absent")

    def test_delete_attendance_success(self):
        response = self.client.delete(f'/api/attendance/{self.attendance.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Attendance.objects.filter(id=self.attendance.id).exists())

    def test_delete_invalid_attendance_id(self):
        response = self.client.delete('/api/attendance/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Invalid attendance ID", str(response.data))


class AttendancePercentageBusinessLogicTests(TestCase):
    """
    Tests for Attendance Business Logic and Percentage Calculations:
    Formula: Attendance Percentage = (Number of Present Classes / Total Classes) * 100
    - For each student and subject:
      - Total classes
      - Present classes
      - Absent classes
      - Attendance percentage
    - Overall attendance percentage for a student
    """
    def setUp(self):
        self.client = APIClient()
        self.student1 = Student.objects.create(
            register_number="717621CS101",
            name="Aarav Sharma",
            email="aarav@college.edu",
            phone="9876543210",
            department="Computer Science and Engineering",
            year=3,
            section="A"
        )
        self.subject1 = Subject.objects.create(
            subject_code="CS8591",
            subject_name="Database Management Systems",
            department="Computer Science and Engineering",
            year=3,
            semester=5
        )
        self.subject2 = Subject.objects.create(
            subject_code="CS8592",
            subject_name="Object Oriented Analysis and Design",
            department="Computer Science and Engineering",
            year=3,
            semester=5
        )

        # In Subject 1: 4 classes (3 Present, 1 Absent) -> 75.0%
        Attendance.objects.create(student=self.student1, subject=self.subject1, attendance_date="2026-09-01", status="Present")
        Attendance.objects.create(student=self.student1, subject=self.subject1, attendance_date="2026-09-02", status="Present")
        Attendance.objects.create(student=self.student1, subject=self.subject1, attendance_date="2026-09-03", status="Present")
        Attendance.objects.create(student=self.student1, subject=self.subject1, attendance_date="2026-09-04", status="Absent")

        # In Subject 2: 2 classes (1 Present, 1 Absent) -> 50.0%
        Attendance.objects.create(student=self.student1, subject=self.subject2, attendance_date="2026-09-01", status="Present")
        Attendance.objects.create(student=self.student1, subject=self.subject2, attendance_date="2026-09-02", status="Absent")

        # Overall across both subjects:
        # Total classes: 4 + 2 = 6
        # Present classes: 3 + 1 = 4
        # Absent classes: 1 + 1 = 2
        # Attendance percentage: (4 / 6) * 100 = 66.7%

    def test_student_model_attendance_summary_calculation(self):
        # Subject 1 calculation
        sub1_stats = self.student1.calculate_attendance_summary(subject=self.subject1)
        self.assertEqual(sub1_stats['total_classes'], 4)
        self.assertEqual(sub1_stats['present_classes'], 3)
        self.assertEqual(sub1_stats['absent_classes'], 1)
        self.assertEqual(sub1_stats['attendance_percentage'], 75.0)

        # Subject 2 calculation
        sub2_stats = self.student1.calculate_attendance_summary(subject=self.subject2)
        self.assertEqual(sub2_stats['total_classes'], 2)
        self.assertEqual(sub2_stats['present_classes'], 1)
        self.assertEqual(sub2_stats['absent_classes'], 1)
        self.assertEqual(sub2_stats['attendance_percentage'], 50.0)

        # Overall calculation across all subjects
        overall_stats = self.student1.calculate_attendance_summary()
        self.assertEqual(overall_stats['total_classes'], 6)
        self.assertEqual(overall_stats['present_classes'], 4)
        self.assertEqual(overall_stats['absent_classes'], 2)
        self.assertEqual(overall_stats['attendance_percentage'], 66.7)
        self.assertTrue(overall_stats['is_shortage'])

    def test_student_attendance_percentage_api_endpoint(self):
        response = self.client.get(f'/api/students/{self.student1.id}/attendance-percentage/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertEqual(data['student_id'], self.student1.id)
        self.assertEqual(data['register_number'], "717621CS101")
        self.assertEqual(data['total_classes'], 6)
        self.assertEqual(data['present_classes'], 4)
        self.assertEqual(data['absent_classes'], 2)
        self.assertEqual(data['overall_attendance_percentage'], 66.7)

        # Verify subject breakdown in API response
        subjects = {s['subject_code']: s for s in data['subjects']}
        self.assertIn('CS8591', subjects)
        self.assertEqual(subjects['CS8591']['total_classes'], 4)
        self.assertEqual(subjects['CS8591']['present_classes'], 3)
        self.assertEqual(subjects['CS8591']['absent_classes'], 1)
        self.assertEqual(subjects['CS8591']['attendance_percentage'], 75.0)

        self.assertIn('CS8592', subjects)
        self.assertEqual(subjects['CS8592']['total_classes'], 2)
        self.assertEqual(subjects['CS8592']['present_classes'], 1)
        self.assertEqual(subjects['CS8592']['absent_classes'], 1)
        self.assertEqual(subjects['CS8592']['attendance_percentage'], 50.0)

    def test_attendance_percentage_report_api(self):
        response = self.client.get('/api/reports/attendance-percentage/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

        student_report = next(r for r in response.data if r['student_id'] == self.student1.id)
        self.assertEqual(student_report['total_classes'], 6)
        self.assertEqual(student_report['present_classes'], 4)
        self.assertEqual(student_report['absent_classes'], 2)
        self.assertEqual(student_report['overall_attendance_percentage'], 66.7)
        self.assertTrue(student_report['is_shortage'])
        self.assertIsInstance(student_report['subjects'], list)
