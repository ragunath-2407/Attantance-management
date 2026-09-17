"""
Database Models for Attendance Management System using Django ORM and SQLite.

Models:
1. Student: Represents a college student enrolled in a department, year, and section.
2. Subject: Represents an academic course offered in a department, year, and semester.
3. Attendance: Represents daily attendance status (Present / Absent) for a student in a subject on a date.
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Student(models.Model):
    """
    Student Model:
    Stores biographical and academic enrollment information for each student.
    """
    # id: primary key is automatically provisioned by Django as BigAutoField
    register_number = models.CharField(
        max_length=50, 
        unique=True, 
        null=False, 
        blank=False,
        help_text="Unique Registration Number of the student (e.g. 717621CS001)"
    )
    name = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        help_text="Full Name of the student"
    )
    email = models.EmailField(
        unique=True, 
        null=False, 
        blank=False,
        help_text="Unique official or personal email address"
    )
    phone = models.CharField(
        max_length=20, 
        null=False, 
        blank=False,
        help_text="Contact telephone number"
    )
    department = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        help_text="Academic Department (e.g. Computer Science and Engineering)"
    )
    year = models.PositiveSmallIntegerField(
        null=False, 
        blank=False,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Current Year of study (1 to 4/5)"
    )
    section = models.CharField(
        max_length=10, 
        null=False, 
        blank=False,
        help_text="Section (e.g. A, B, C)"
    )
    admission_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Date of admission into the college (optional)"
    )

    class Meta:
        db_table = 'attendance_student'
        ordering = ['register_number']
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    def __str__(self):
        return f"{self.register_number} - {self.name} ({self.department} Year {self.year}-{self.section})"

    def calculate_attendance_summary(self, subject=None):
        """
        Business Logic: Calculates attendance statistics using Django ORM.
        Formula:
            Attendance Percentage = (Number of Present Classes / Total Classes) * 100

        Returns:
            - total_classes
            - present_classes
            - absent_classes
            - attendance_percentage
            - is_shortage (True if attendance < 75%)
        """
        records = self.attendances.all()
        if subject is not None:
            records = records.filter(subject=subject)

        total = records.count()
        present = records.filter(status='Present').count()
        absent = records.filter(status='Absent').count()
        percentage = round((present / total * 100), 1) if total > 0 else 0.0

        return {
            'total_classes': total,
            'present_classes': present,
            'absent_classes': absent,
            'attendance_percentage': percentage,
            'is_shortage': percentage < 75.0,
        }


class Subject(models.Model):
    """
    Subject Model:
    Stores academic courses/subjects assigned to departments, years, and semesters.
    """
    # id: primary key automatically provisioned
    subject_code = models.CharField(
        max_length=20, 
        unique=True, 
        null=False, 
        blank=False,
        help_text="Unique Subject Code (e.g. CS8491)"
    )
    subject_name = models.CharField(
        max_length=150, 
        null=False, 
        blank=False,
        help_text="Name of the course/subject"
    )
    department = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        help_text="Department offering this subject"
    )
    year = models.PositiveSmallIntegerField(
        null=False, 
        blank=False,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Academic Year (1-4)"
    )
    semester = models.PositiveSmallIntegerField(
        null=False, 
        blank=False,
        validators=[MinValueValidator(1), MaxValueValidator(8)],
        help_text="Academic Semester (1-8)"
    )

    class Meta:
        db_table = 'attendance_subject'
        ordering = ['subject_code']
        verbose_name = 'Subject'
        verbose_name_plural = 'Subjects'

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name} (Sem {self.semester})"

    def calculate_attendance_summary(self, student=None):
        """
        Business Logic: Calculates subject-level attendance statistics using Django ORM.
        Formula:
            Attendance Percentage = (Number of Present Classes / Total Classes) * 100

        Returns:
            - total_classes
            - present_classes
            - absent_classes
            - attendance_percentage
            - is_shortage (True if attendance < 75%)
        """
        records = self.attendances.all()
        if student is not None:
            records = records.filter(student=student)

        total = records.count()
        present = records.filter(status='Present').count()
        absent = records.filter(status='Absent').count()
        percentage = round((present / total * 100), 1) if total > 0 else 0.0

        return {
            'total_classes': total,
            'present_classes': present,
            'absent_classes': absent,
            'attendance_percentage': percentage,
            'is_shortage': percentage < 75.0,
        }


class Attendance(models.Model):
    """
    Attendance Model:
    Junction record linking a Student, a Subject, a Date, and their Attendance Status.
    Enforces referential integrity and prevents duplicate attendance entries.
    """
    STATUS_PRESENT = 'Present'
    STATUS_ABSENT = 'Absent'

    STATUS_CHOICES = [
        (STATUS_PRESENT, 'Present'),
        (STATUS_ABSENT, 'Absent'),
    ]

    # id: primary key automatically provisioned
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        null=False,
        blank=False,
        help_text="Foreign Key referencing Student table"
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='attendances',
        null=False,
        blank=False,
        help_text="Foreign Key referencing Subject table"
    )
    attendance_date = models.DateField(
        null=False, 
        blank=False,
        help_text="Date when attendance was taken"
    )
    status = models.CharField(
        max_length=10, 
        choices=STATUS_CHOICES, 
        default=STATUS_PRESENT,
        null=False,
        blank=False,
        help_text="Attendance status: Present or Absent"
    )
    remarks = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Optional remarks or notes regarding attendance"
    )

    class Meta:
        db_table = 'attendance_record'
        ordering = ['-attendance_date', 'student__register_number']
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
        constraints = [
            # Constraint 1: Prevent duplicate attendance for the same student in the same subject on the same day
            models.UniqueConstraint(
                fields=['student', 'subject', 'attendance_date'],
                name='unique_student_subject_attendance_date'
            ),
            # Constraint 2: Ensure status is strictly 'Present' or 'Absent' at database level
            models.CheckConstraint(
                check=models.Q(status__in=['Present', 'Absent']),
                name='valid_attendance_status'
            )
        ]

    def __str__(self):
        return f"{self.attendance_date} | {self.student.register_number} | {self.subject.subject_code} | {self.status}"
