import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8001"

def make_request(method, endpoint, body=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(body).encode('utf-8') if body is not None else None
    headers = {'Content-Type': 'application/json'} if body is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            res_text = response.read().decode('utf-8')
            try:
                res_json = json.loads(res_text)
            except:
                res_json = res_text
            return status, res_json
    except urllib.error.HTTPError as e:
        status = e.code
        res_text = e.read().decode('utf-8')
        try:
            res_json = json.loads(res_text)
        except:
            res_json = res_text
        return status, res_json
    except Exception as e:
        return 0, str(e)

tests = []

def record_test(suite, test_id, name, method, endpoint, body, exp_status, exp_resp_summary, purpose):
    act_status, act_resp = make_request(method, endpoint, body)
    passed = (act_status == exp_status)
    tests.append({
        "suite": suite,
        "test_id": test_id,
        "name": name,
        "method": method,
        "endpoint": endpoint,
        "body": body,
        "expected_status": exp_status,
        "expected_response": exp_resp_summary,
        "actual_status": act_status,
        "actual_response": act_resp,
        "purpose": purpose,
        "result": "PASS" if passed else "FAIL"
    })
    return act_status, act_resp

# ==================== STUDENT API TESTS ====================
print("--- Running Student Tests ---")
# 1. GET all students
record_test(
    "Student API", "STU-01", "GET all students", "GET", "/api/students", None,
    200, "JSON array of student records with fields (id, register_number, name, email, department, ...)",
    "Verify retrieval of all registered students in the system."
)

# 2. GET one student
record_test(
    "Student API", "STU-02", "GET one student", "GET", "/api/students/1", None,
    200, "JSON object of student with id=1 (register_number='CS2023001', name='Alexander Vance', ...)",
    "Verify retrieval of a single student by primary key ID."
)

# 3. POST valid student
new_student_data = {
    "register_number": "CS2023099",
    "name": "Jordan Mitchell",
    "email": "jordan.mitchell@univ.edu",
    "phone": "+1-555-0199",
    "department": "Computer Science",
    "year": 2,
    "semester": 4,
    "section": "B"
}
_, created_stu = record_test(
    "Student API", "STU-03", "POST valid student", "POST", "/api/students", new_student_data,
    201, "Created student object with assigned id (e.g., id=11, register_number='CS2023099')",
    "Verify successful registration of a new student with valid attributes."
)
created_stu_id = created_stu.get("id") if isinstance(created_stu, dict) else 11

# 4. POST student with missing required field
record_test(
    "Student API", "STU-04", "POST student with missing required field", "POST", "/api/students",
    {"register_number": "CS2023098", "email": "missing.name@univ.edu", "department": "Computer Science"},
    400, '{"error": "Missing required field: register_number, name, email, and department are required"}',
    "Verify system rejects student creation when a mandatory field (name) is missing."
)

# 5. POST duplicate register number
record_test(
    "Student API", "STU-05", "POST duplicate register number", "POST", "/api/students",
    {"register_number": "CS2023001", "name": "Duplicate Alex", "email": "alex.dup@univ.edu", "department": "Computer Science"},
    409, '{"error": "Student with register number CS2023001 already exists"}',
    "Verify system enforces unique constraint on student register_number."
)

# 6. POST invalid email
record_test(
    "Student API", "STU-06", "POST invalid email", "POST", "/api/students",
    {"register_number": "CS2023097", "name": "Bad Email User", "email": "not-an-email", "department": "Computer Science"},
    400, '{"error": "Invalid email address format"}',
    "Verify email format validation prevents malformed emails."
)

# 7. PUT valid student
record_test(
    "Student API", "STU-07", "PUT valid student", "PUT", f"/api/students/{created_stu_id}",
    {"name": "Jordan Mitchell-Updated", "phone": "+1-555-9999", "section": "A"},
    200, f'Updated student object with id={created_stu_id}, name="Jordan Mitchell-Updated", section="A"',
    "Verify modification of existing student details by ID."
)

# 8. PUT invalid student ID
record_test(
    "Student API", "STU-08", "PUT invalid student ID", "PUT", "/api/students/99999",
    {"name": "Ghost Student"},
    404, '{"error": "Student not found"}',
    "Verify update fails gracefully with 404 for a non-existent student ID."
)

# 9. DELETE valid student
record_test(
    "Student API", "STU-09", "DELETE valid student", "DELETE", f"/api/students/{created_stu_id}", None,
    204, "Empty response body with HTTP 204 No Content",
    "Verify successful deletion of an existing student record."
)

# 10. DELETE invalid student ID
record_test(
    "Student API", "STU-10", "DELETE invalid student ID", "DELETE", "/api/students/99999", None,
    404, '{"error": "Student not found"}',
    "Verify deletion fails with 404 when attempting to delete a non-existent student ID."
)

# ==================== SUBJECT API TESTS ====================
print("--- Running Subject Tests ---")
# 1. GET all subjects
record_test(
    "Subject API", "SUB-01", "GET all subjects", "GET", "/api/subjects", None,
    200, "JSON array of subject objects with fields (id, subject_code, subject_name, department, credits, faculty_name)",
    "Verify retrieval of all curriculum subjects."
)

# 2. GET one subject
record_test(
    "Subject API", "SUB-02", "GET one subject", "GET", "/api/subjects/1", None,
    200, 'JSON object of subject with id=1 (subject_code="CS501", subject_name="Data Structures & Algorithms")',
    "Verify retrieval of a single subject record by ID."
)

# 3. POST valid subject
new_subject_data = {
    "subject_code": "CS509",
    "subject_name": "Artificial Intelligence & Robotics",
    "department": "Computer Science",
    "year": 3,
    "semester": 6,
    "credits": 4,
    "faculty_name": "Dr. Alan Turing"
}
_, created_sub = record_test(
    "Subject API", "SUB-03", "POST valid subject", "POST", "/api/subjects", new_subject_data,
    201, 'Created subject object with assigned id (e.g., id=8, subject_code="CS509")',
    "Verify creation of a new subject course with valid attributes."
)
created_sub_id = created_sub.get("id") if isinstance(created_sub, dict) else 8

# 4. POST missing subject name
record_test(
    "Subject API", "SUB-04", "POST missing subject name", "POST", "/api/subjects",
    {"subject_code": "CS510", "department": "Computer Science"},
    400, '{"error": "subject_name is required"}',
    "Verify validation rejects subject creation without a subject name."
)

# 5. POST duplicate subject code
record_test(
    "Subject API", "SUB-05", "POST duplicate subject code", "POST", "/api/subjects",
    {"subject_code": "CS501", "subject_name": "Duplicate DSA", "department": "Computer Science"},
    409, '{"error": "Subject with code CS501 already exists"}',
    "Verify uniqueness constraint enforcement on subject_code."
)

# 6. PUT valid subject
record_test(
    "Subject API", "SUB-06", "PUT valid subject", "PUT", f"/api/subjects/{created_sub_id}",
    {"subject_name": "AI & Autonomous Systems", "credits": 4, "faculty_name": "Dr. Cynthia Breazeal"},
    200, f'Updated subject object with id={created_sub_id}, subject_name="AI & Autonomous Systems"',
    "Verify modification of existing subject course attributes."
)

# 7. PUT invalid subject ID
record_test(
    "Subject API", "SUB-07", "PUT invalid subject ID", "PUT", "/api/subjects/99999",
    {"subject_name": "Nonexistent Subject"},
    404, '{"error": "Subject not found"}',
    "Verify update fails gracefully with 404 for a non-existent subject ID."
)

# 8. DELETE valid subject
record_test(
    "Subject API", "SUB-08", "DELETE valid subject", "DELETE", f"/api/subjects/{created_sub_id}", None,
    204, "Empty response body with HTTP 204 No Content",
    "Verify deletion of an existing subject by ID."
)

# 9. DELETE invalid subject ID
record_test(
    "Subject API", "SUB-09", "DELETE invalid subject ID", "DELETE", "/api/subjects/99999", None,
    404, '{"error": "Subject not found"}',
    "Verify deletion returns 404 for a non-existent subject ID."
)

# ==================== ATTENDANCE API TESTS ====================
print("--- Running Attendance Tests ---")
# 1. GET all attendance records
record_test(
    "Attendance API", "ATT-01", "GET all attendance records", "GET", "/api/attendance", None,
    200, "JSON array of attendance records with joined student and subject details",
    "Verify retrieval of all attendance logs."
)

# 2. GET one attendance record
record_test(
    "Attendance API", "ATT-02", "GET one attendance record", "GET", "/api/attendance/1", None,
    200, "JSON object of attendance record with id=1",
    "Verify retrieval of an individual attendance record by ID."
)

# 3. POST valid attendance
valid_att_data = {
    "student": 1,
    "subject": 1,
    "attendance_date": "2026-09-30",
    "status": "Present",
    "remarks": "On-time arrival"
}
_, created_att = record_test(
    "Attendance API", "ATT-03", "POST valid attendance", "POST", "/api/attendance", valid_att_data,
    201, 'Created attendance record with id, student details, subject details, status="Present"',
    "Verify marking valid attendance for a student in a subject on a date."
)
created_att_id = created_att.get("id") if isinstance(created_att, dict) else 103

# 4. POST missing student
record_test(
    "Attendance API", "ATT-04", "POST missing student", "POST", "/api/attendance",
    {"subject": 1, "attendance_date": "2026-09-30", "status": "Present"},
    400, '{"error": "student is required"}',
    "Verify rejection when student ID is omitted."
)

# 5. POST missing subject
record_test(
    "Attendance API", "ATT-05", "POST missing subject", "POST", "/api/attendance",
    {"student": 1, "attendance_date": "2026-09-30", "status": "Present"},
    400, '{"error": "subject is required"}',
    "Verify rejection when subject ID is omitted."
)

# 6. POST invalid status
record_test(
    "Attendance API", "ATT-06", "POST invalid status", "POST", "/api/attendance",
    {"student": 1, "subject": 1, "attendance_date": "2026-09-29", "status": "ExcusedHoliday"},
    400, '{"error": "Invalid status. Allowed values: Present, Absent, Late"}',
    "Verify validation constraint on status values (only Present, Absent, Late allowed)."
)

# 7. POST duplicate attendance
record_test(
    "Attendance API", "ATT-07", "POST duplicate attendance", "POST", "/api/attendance",
    {"student": 1, "subject": 1, "attendance_date": "2026-09-30", "status": "Present"},
    409, '{"error": "Attendance record already exists for this student, subject, and date", "existing_id": ...}',
    "Verify rejection of duplicate attendance marking for same student, subject, and date."
)

# 8. PUT valid attendance
record_test(
    "Attendance API", "ATT-08", "PUT valid attendance", "PUT", f"/api/attendance/{created_att_id}",
    {"status": "Late", "remarks": "Traffic delay approved by HOD"},
    200, f'Updated attendance record with id={created_att_id}, status="Late", remarks="Traffic delay approved by HOD"',
    "Verify updating attendance status and remarks for an existing record."
)

# 9. PUT invalid attendance ID
record_test(
    "Attendance API", "ATT-09", "PUT invalid attendance ID", "PUT", "/api/attendance/99999",
    {"status": "Absent"},
    404, '{"error": "Attendance record not found"}',
    "Verify update returns 404 for a non-existent attendance ID."
)

# 10. DELETE valid attendance
record_test(
    "Attendance API", "ATT-10", "DELETE valid attendance", "DELETE", f"/api/attendance/{created_att_id}", None,
    204, "Empty response body with HTTP 204 No Content",
    "Verify successful deletion of an attendance record."
)

# 11. DELETE invalid attendance ID
record_test(
    "Attendance API", "ATT-11", "DELETE invalid attendance ID", "DELETE", "/api/attendance/99999", None,
    404, '{"error": "Attendance record not found"}',
    "Verify deletion returns 404 for a non-existent attendance record ID."
)

with open("test_results.json", "w") as f:
    json.dump(tests, f, indent=2)

print("\n================== SUMMARY ==================")
passed = sum(1 for t in tests if t['result'] == 'PASS')
print(f"Total Tests: {len(tests)} | Passed: {passed} | Failed: {len(tests) - passed}")
for t in tests:
    print(f"[{t['result']}] {t['test_id']} {t['method']} {t['endpoint']} -> Expected: {t['expected_status']}, Actual: {t['actual_status']}")
