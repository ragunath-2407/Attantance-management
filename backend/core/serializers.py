"""
Django REST Framework Serializers for Attendance Management System.
Converts Student, Subject, and Attendance model instances to JSON with
comprehensive server-side validation.
"""
import re
from rest_framework import serializers
from rest_framework.validators import UniqueValidator, UniqueTogetherValidator
from .models import Student, Subject, Attendance

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Student model.
    Validates required fields, unique register number, unique and formatted email,
    phone, department, year, and section.
    """
    register_number = serializers.CharField(
        max_length=50,
        validators=[
            UniqueValidator(
                queryset=Student.objects.all(),
                message="Register number must be unique."
            )
        ],
        error_messages={
            'required': 'Register number required.',
            'blank': 'Register number required.',
        }
    )
    name = serializers.CharField(
        max_length=100,
        error_messages={
            'required': 'Name required.',
            'blank': 'Name required.',
        }
    )
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=Student.objects.all(),
                message="Email must be unique."
            )
        ],
        error_messages={
            'required': 'Email required.',
            'blank': 'Email required.',
            'invalid': 'Email must have valid format.',
        }
    )
    phone = serializers.CharField(
        max_length=20,
        error_messages={
            'required': 'Phone required.',
            'blank': 'Phone required.',
        }
    )
    department = serializers.CharField(
        max_length=100,
        error_messages={
            'required': 'Department required.',
            'blank': 'Department required.',
        }
    )
    year = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            'required': 'Year required.',
            'invalid': 'Year required.',
            'min_value': 'Year required.',
            'max_value': 'Year required.',
        }
    )
    section = serializers.CharField(
        max_length=10,
        error_messages={
            'required': 'Section required.',
            'blank': 'Section required.',
        }
    )

    class Meta:
        model = Student
        fields = [
            'id',
            'register_number',
            'name',
            'email',
            'phone',
            'department',
            'year',
            'section',
            'admission_date',
        ]

    def validate_register_number(self, value):
        cleaned = value.strip().upper()
        if not cleaned:
            raise serializers.ValidationError("Register number required.")
        return cleaned

    def validate_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Name required.")
        return cleaned

    def validate_email(self, value):
        cleaned = value.strip().lower()
        if not cleaned:
            raise serializers.ValidationError("Email required.")
        if not EMAIL_REGEX.match(cleaned):
            raise serializers.ValidationError("Email must have valid format.")
        return cleaned

    def validate_phone(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Phone required.")
        return cleaned

    def validate_department(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Department required.")
        return cleaned

    def validate_section(self, value):
        cleaned = value.strip().upper()
        if not cleaned:
            raise serializers.ValidationError("Section required.")
        return cleaned

    def validate_year(self, value):
        if value is None:
            raise serializers.ValidationError("Year required.")
        if value < 1 or value > 5:
            raise serializers.ValidationError("Year required.")
        return value


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for the Subject model.
    Validates required fields, unique subject code, subject name,
    department, year, and semester.
    """
    subject_code = serializers.CharField(
        max_length=20,
        validators=[
            UniqueValidator(
                queryset=Subject.objects.all(),
                message="Subject code must be unique."
            )
        ],
        error_messages={
            'required': 'Subject code required.',
            'blank': 'Subject code required.',
        }
    )
    subject_name = serializers.CharField(
        max_length=150,
        error_messages={
            'required': 'Subject name required.',
            'blank': 'Subject name required.',
        }
    )
    department = serializers.CharField(
        max_length=100,
        error_messages={
            'required': 'Department required.',
            'blank': 'Department required.',
        }
    )
    year = serializers.IntegerField(
        min_value=1,
        max_value=5,
        error_messages={
            'required': 'Year required.',
            'invalid': 'Year required.',
            'min_value': 'Year required.',
            'max_value': 'Year required.',
        }
    )
    semester = serializers.IntegerField(
        min_value=1,
        max_value=8,
        error_messages={
            'required': 'Semester required.',
            'invalid': 'Semester required.',
            'min_value': 'Semester required.',
            'max_value': 'Semester required.',
        }
    )

    class Meta:
        model = Subject
        fields = [
            'id',
            'subject_code',
            'subject_name',
            'department',
            'year',
            'semester',
        ]

    def validate_subject_code(self, value):
        cleaned = value.strip().upper()
        if not cleaned:
            raise serializers.ValidationError("Subject code required.")
        return cleaned

    def validate_subject_name(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Subject name required.")
        return cleaned

    def validate_department(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Department required.")
        return cleaned

    def validate_year(self, value):
        if value is None:
            raise serializers.ValidationError("Year required.")
        if value < 1 or value > 5:
            raise serializers.ValidationError("Year required.")
        return value

    def validate_semester(self, value):
        if value is None:
            raise serializers.ValidationError("Semester required.")
        if value < 1 or value > 8:
            raise serializers.ValidationError("Semester required.")
        return value


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for the Attendance model.
    Enforces student FK validation, subject FK validation, date, valid status ('Present' | 'Absent'),
    and uniqueness constraint on (student, subject, attendance_date).
    """
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        error_messages={
            'required': 'Student required.',
            'null': 'Student required.',
            'does_not_exist': 'Student required.',
            'incorrect_type': 'Student required.',
        }
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        error_messages={
            'required': 'Subject required.',
            'null': 'Subject required.',
            'does_not_exist': 'Subject required.',
            'incorrect_type': 'Subject required.',
        }
    )
    status = serializers.ChoiceField(
        choices=Attendance.STATUS_CHOICES,
        error_messages={
            'required': 'Status required.',
            'null': 'Status required.',
            'invalid_choice': "Status must be Present or Absent.",
        }
    )
    attendance_date = serializers.DateField(
        error_messages={
            'required': 'Date required.',
            'null': 'Date required.',
            'invalid': 'Date required.',
        }
    )

    # Read-only enriched fields for convenient UI consumption
    student_register_number = serializers.CharField(source='student.register_number', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    subject_code = serializers.CharField(source='subject.subject_code', read_only=True)
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id',
            'student',
            'student_register_number',
            'student_name',
            'subject',
            'subject_code',
            'subject_name',
            'attendance_date',
            'status',
            'remarks',
        ]
        validators = [
            UniqueTogetherValidator(
                queryset=Attendance.objects.all(),
                fields=['student', 'subject', 'attendance_date'],
                message="Duplicate attendance for the same student, subject and date must be prevented."
            )
        ]

    def validate_status(self, value):
        if not value:
            raise serializers.ValidationError("Status required.")
        cleaned = value.strip()
        if cleaned not in ['Present', 'Absent']:
            raise serializers.ValidationError("Status must be Present or Absent.")
        return cleaned

    def validate(self, attrs):
        """
        Enforces:
        - Student required
        - Subject required
        - Date required
        - Status required (Present or Absent)
        - Duplicate attendance for the same student, subject and date must be prevented.
        """
        student = attrs.get('student', getattr(self.instance, 'student', None))
        subject = attrs.get('subject', getattr(self.instance, 'subject', None))
        date = attrs.get('attendance_date', getattr(self.instance, 'attendance_date', None))
        status_val = attrs.get('status', getattr(self.instance, 'status', None))

        if not student:
            raise serializers.ValidationError({"student": "Student required."})
        if not subject:
            raise serializers.ValidationError({"subject": "Subject required."})
        if not date:
            raise serializers.ValidationError({"attendance_date": "Date required."})
        if status_val not in ['Present', 'Absent']:
            raise serializers.ValidationError({"status": "Status must be Present or Absent."})

        # Duplicate attendance prevention: (student, subject, attendance_date)
        query = Attendance.objects.filter(student=student, subject=subject, attendance_date=date)
        if self.instance:
            query = query.exclude(id=self.instance.id)

        if query.exists():
            raise serializers.ValidationError({
                "non_field_errors": [
                    "Duplicate attendance for the same student, subject and date must be prevented."
                ],
                "duplicate": "Duplicate attendance for the same student, subject and date must be prevented."
            })

        return attrs


class StudentAttendancePercentageSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    register_number = serializers.CharField()
    student_name = serializers.CharField()
    department = serializers.CharField()
    year = serializers.IntegerField()
    section = serializers.CharField()
    total_classes = serializers.IntegerField()
    present_count = serializers.IntegerField()
    absent_count = serializers.IntegerField()
    attendance_percentage = serializers.FloatField()
    is_shortage = serializers.BooleanField()
