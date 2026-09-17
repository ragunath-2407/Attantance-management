import json

collection = {
    "info": {
        "name": "Attendance Management System - Complete API Test Suite",
        "_postman_id": "c1f728a0-2f84-482a-9e12-b1389d41d2f8",
        "description": "Comprehensive Postman API Testing Collection for Student, Subject, and Attendance REST endpoints in the College Attendance Management System. Includes positive, negative, validation, constraint, and boundary test cases.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://127.0.0.1:3000",
            "type": "string"
        }
    ],
    "item": []
}

def create_item(name, method, path, body, expected_status, description):
    item = {
        "name": name,
        "request": {
            "method": method,
            "header": [
                {
                    "key": "Content-Type",
                    "value": "application/json",
                    "type": "text"
                }
            ],
            "url": {
                "raw": "{{baseUrl}}" + path,
                "host": ["{{baseUrl}}"],
                "path": [p for p in path.split("/") if p]
            },
            "description": description
        },
        "event": [
            {
                "listen": "test",
                "script": {
                    "exec": [
                        f'pm.test("Status code is {expected_status}", function () {{',
                        f'    pm.response.to.have.status({expected_status});',
                        '});',
                        'pm.test("Response time is under 1500ms", function () {',
                        '    pm.expect(pm.response.responseTime).to.be.below(1500);',
                        '});'
                    ],
                    "type": "text/javascript"
                }
            }
        ]
    }
    if body is not None:
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2),
            "options": {
                "raw": {
                    "language": "json"
                }
            }
        }
    return item

# 1. Student Folder
student_folder = {
    "name": "1. Student API Tests",
    "item": [
        create_item("1. GET all students", "GET", "/api/students", None, 200, "Verify retrieval of all enrolled students."),
        create_item("2. GET one student", "GET", "/api/students/1", None, 200, "Verify retrieval of a single student by primary key ID."),
        create_item("3. POST valid student", "POST", "/api/students", {
            "register_number": "CS2023099",
            "name": "Jordan Mitchell",
            "email": "jordan.mitchell@univ.edu",
            "phone": "+1-555-0199",
            "department": "Computer Science",
            "year": 2,
            "semester": 4,
            "section": "B"
        }, 201, "Verify creation of a new student with valid attributes."),
        create_item("4. POST student with missing required field", "POST", "/api/students", {
            "register_number": "CS2023098",
            "email": "missing.name@univ.edu",
            "department": "Computer Science"
        }, 400, "Verify rejection when mandatory 'name' field is omitted."),
        create_item("5. POST duplicate register number", "POST", "/api/students", {
            "register_number": "CS2023001",
            "name": "Duplicate Alex",
            "email": "alex.dup@univ.edu",
            "department": "Computer Science"
        }, 409, "Verify uniqueness constraint on register_number."),
        create_item("6. POST invalid email", "POST", "/api/students", {
            "register_number": "CS2023097",
            "name": "Bad Email User",
            "email": "invalid-email-string",
            "department": "Computer Science"
        }, 400, "Verify email format validation regex."),
        create_item("7. PUT valid student", "PUT", "/api/students/1", {
            "name": "Alexander Vance Updated",
            "phone": "+1 555-9999",
            "section": "A"
        }, 200, "Verify updating existing student record."),
        create_item("8. PUT invalid student ID", "PUT", "/api/students/99999", {
            "name": "Nonexistent"
        }, 404, "Verify 404 response for invalid student ID."),
        create_item("9. DELETE valid student", "DELETE", "/api/students/1", None, 204, "Verify student deletion by valid ID."),
        create_item("10. DELETE invalid student ID", "DELETE", "/api/students/99999", None, 404, "Verify 404 when deleting invalid student ID.")
    ]
}

# 2. Subject Folder
subject_folder = {
    "name": "2. Subject API Tests",
    "item": [
        create_item("1. GET all subjects", "GET", "/api/subjects", None, 200, "Verify retrieval of all catalog subjects."),
        create_item("2. GET one subject", "GET", "/api/subjects/1", None, 200, "Verify retrieval of a single subject record."),
        create_item("3. POST valid subject", "POST", "/api/subjects", {
            "subject_code": "CS509",
            "subject_name": "Artificial Intelligence & Robotics",
            "department": "Computer Science",
            "year": 3,
            "semester": 6,
            "credits": 4,
            "faculty_name": "Dr. Alan Turing"
        }, 201, "Verify creation of a new subject course."),
        create_item("4. POST missing subject name", "POST", "/api/subjects", {
            "subject_code": "CS510",
            "department": "Computer Science"
        }, 400, "Verify validation failure when subject_name is missing."),
        create_item("5. POST duplicate subject code", "POST", "/api/subjects", {
            "subject_code": "CS501",
            "subject_name": "Duplicate DSA",
            "department": "Computer Science"
        }, 409, "Verify uniqueness constraint on subject_code."),
        create_item("6. PUT valid subject", "PUT", "/api/subjects/1", {
            "subject_name": "Data Structures & Advanced Algorithms",
            "credits": 4
        }, 200, "Verify update of subject attributes."),
        create_item("7. PUT invalid subject ID", "PUT", "/api/subjects/99999", {
            "subject_name": "Nonexistent"
        }, 404, "Verify 404 on updating invalid subject ID."),
        create_item("8. DELETE valid subject", "DELETE", "/api/subjects/1", None, 204, "Verify deletion of valid subject ID."),
        create_item("9. DELETE invalid subject ID", "DELETE", "/api/subjects/99999", None, 404, "Verify 404 on deleting invalid subject ID.")
    ]
}

# 3. Attendance Folder
attendance_folder = {
    "name": "3. Attendance API Tests",
    "item": [
        create_item("1. GET all attendance records", "GET", "/api/attendance", None, 200, "Verify retrieval of all attendance logs."),
        create_item("2. GET one attendance record", "GET", "/api/attendance/1", None, 200, "Verify retrieval of attendance record by ID."),
        create_item("3. POST valid attendance", "POST", "/api/attendance", {
            "student": 1,
            "subject": 1,
            "attendance_date": "2026-09-30",
            "status": "Present",
            "remarks": "On-time arrival"
        }, 201, "Verify marking attendance for a student."),
        create_item("4. POST missing student", "POST", "/api/attendance", {
            "subject": 1,
            "attendance_date": "2026-09-30",
            "status": "Present"
        }, 400, "Verify validation error when student ID is missing."),
        create_item("5. POST missing subject", "POST", "/api/attendance", {
            "student": 1,
            "attendance_date": "2026-09-30",
            "status": "Present"
        }, 400, "Verify validation error when subject ID is missing."),
        create_item("6. POST invalid status", "POST", "/api/attendance", {
            "student": 1,
            "subject": 1,
            "attendance_date": "2026-09-29",
            "status": "ExcusedHoliday"
        }, 400, "Verify enum status validation (Present, Absent, Late)."),
        create_item("7. POST duplicate attendance", "POST", "/api/attendance", {
            "student": 1,
            "subject": 1,
            "attendance_date": "2026-09-16",
            "status": "Present"
        }, 409, "Verify rejection of duplicate attendance for student+subject+date."),
        create_item("8. PUT valid attendance", "PUT", "/api/attendance/1", {
            "status": "Late",
            "remarks": "Medical note verified"
        }, 200, "Verify updating status and remarks."),
        create_item("9. PUT invalid attendance ID", "PUT", "/api/attendance/99999", {
            "status": "Absent"
        }, 404, "Verify 404 when updating invalid attendance ID."),
        create_item("10. DELETE valid attendance", "DELETE", "/api/attendance/1", None, 204, "Verify deletion of valid attendance record."),
        create_item("11. DELETE invalid attendance ID", "DELETE", "/api/attendance/99999", None, 404, "Verify 404 when deleting invalid attendance ID.")
    ]
}

collection["item"] = [student_folder, subject_folder, attendance_folder]

with open("Attendance_Management_System.postman_collection.json", "w") as f:
    json.dump(collection, f, indent=2)

print("Exported Postman Collection successfully!")
