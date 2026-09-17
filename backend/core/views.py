"""
Django REST Framework Views for Attendance Management System.
Implements CRUD endpoints, search, filtering, and attendance rate statistics.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.http import Http404
from django.db.models import Count, Q

from .models import Student, Subject, Attendance
from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    AttendanceSerializer,
    StudentAttendancePercentageSerializer,
)


class StudentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Student Management.
    - GET     /api/students/                       (List all students from SQLite)
    - GET     /api/students/{id}/                  (Retrieve individual student)
    - POST    /api/students/                       (Create a new student)
    - PUT     /api/students/{id}/                  (Full update)
    - PATCH   /api/students/{id}/                  (Partial update)
    - DELETE  /api/students/{id}/                  (Delete student)
    - GET     /api/students/{id}/attendance-percentage/ (Calculated attendance summary)
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    pagination_class = None  # Return clean JSON array directly
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['register_number', 'name', 'email', 'department']
    ordering_fields = ['register_number', 'name', 'year', 'section']

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            val = int(pk)
            if val <= 0:
                raise NotFound(detail="Student not found.")
        except (ValueError, TypeError):
            raise NotFound(detail="Student not found.")

        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Student not found.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Student deleted successfully."}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = super().get_queryset()
        department = self.request.query_params.get('department')
        year = self.request.query_params.get('year')
        section = self.request.query_params.get('section')

        if department:
            queryset = queryset.filter(department__iexact=department)
        if year:
            queryset = queryset.filter(year=year)
        if section:
            queryset = queryset.filter(section__iexact=section)

        return queryset

    @action(detail=True, methods=['get'], url_path='attendance-percentage')
    def attendance_percentage(self, request, pk=None):
        """
        Business Logic: Calculates attendance statistics for a student.
        Calculates:
        - Attendance Percentage = (Number of Present Classes / Total Classes) * 100
        - Per-subject breakdown: total, present, absent, and percentage
        - Overall attendance percentage across all subjects
        """
        student = self.get_object()
        subject_id = request.query_params.get('subject')

        overall = student.calculate_attendance_summary()

        subjects = Subject.objects.all()
        if subject_id:
            subjects = subjects.filter(id=subject_id)

        subject_list = []
        for sub in subjects:
            sub_stats = student.calculate_attendance_summary(subject=sub)
            subject_list.append({
                'subject_id': sub.id,
                'subject_code': sub.subject_code,
                'subject_name': sub.subject_name,
                'total_classes': sub_stats['total_classes'],
                'present_classes': sub_stats['present_classes'],
                'absent_classes': sub_stats['absent_classes'],
                'attendance_percentage': sub_stats['attendance_percentage'],
            })

        return Response({
            'student_id': student.id,
            'register_number': student.register_number,
            'student_name': student.name,
            'department': student.department,
            'year': student.year,
            'section': student.section,
            'total_classes': overall['total_classes'],
            'present_classes': overall['present_classes'],
            'absent_classes': overall['absent_classes'],
            'overall_attendance_percentage': overall['attendance_percentage'],
            'attendance_percentage': overall['attendance_percentage'],
            'is_shortage': overall['is_shortage'],
            'subjects': subject_list,
        })


class SubjectViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Subject Management.
    - GET     /api/subjects/       (List all subjects from SQLite)
    - GET     /api/subjects/{id}/  (Retrieve individual subject)
    - POST    /api/subjects/       (Create a new subject)
    - PUT     /api/subjects/{id}/  (Full update)
    - PATCH   /api/subjects/{id}/  (Partial update)
    - DELETE  /api/subjects/{id}/  (Delete subject)
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = None  # Return clean JSON array directly
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject_code', 'subject_name', 'department']
    ordering_fields = ['subject_code', 'year', 'semester']

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            val = int(pk)
            if val <= 0:
                raise NotFound(detail="Subject not found.")
        except (ValueError, TypeError):
            raise NotFound(detail="Subject not found.")

        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Subject not found.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Subject deleted successfully."}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = super().get_queryset()
        department = self.request.query_params.get('department')
        year = self.request.query_params.get('year')
        semester = self.request.query_params.get('semester')

        if department:
            queryset = queryset.filter(department__iexact=department)
        if year:
            queryset = queryset.filter(year=year)
        if semester:
            queryset = queryset.filter(semester=semester)

        return queryset


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Attendance Records.
    - GET     /api/attendance/       (List attendance records from SQLite)
    - GET     /api/attendance/{id}/  (Retrieve individual record)
    - POST    /api/attendance/       (Mark attendance)
    - PUT     /api/attendance/{id}/  (Full update)
    - PATCH   /api/attendance/{id}/  (Partial update)
    - DELETE  /api/attendance/{id}/  (Delete record)
    """
    queryset = Attendance.objects.select_related('student', 'subject').all()
    serializer_class = AttendanceSerializer
    pagination_class = None  # Return clean JSON array directly
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'student__register_number', 
        'student__name', 
        'subject__subject_code', 
        'subject__subject_name'
    ]
    ordering_fields = ['attendance_date', 'student__register_number']

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            val = int(pk)
            if val <= 0:
                raise NotFound(detail="Attendance record not found.")
        except (ValueError, TypeError):
            raise NotFound(detail="Attendance record not found.")

        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Attendance record not found.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"success": True, "message": "Attendance record deleted successfully."}, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = super().get_queryset()
        subject_id = self.request.query_params.get('subject')
        student_id = self.request.query_params.get('student')
        date = self.request.query_params.get('attendance_date') or self.request.query_params.get('date')
        status_filter = self.request.query_params.get('status')

        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if date:
            queryset = queryset.filter(attendance_date=date)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class DashboardStatsView(APIView):
    """
    High-level dashboard statistics:
    - Total students
    - Total subjects
    - Total attendance records
    - Total present records
    - Total absent records
    - Overall college attendance percentage
    - Present vs Absent breakdown
    - Subject-wise attendance breakdown
    - Attendance summary by date (timeline/trend)
    - Recent attendance records
    """
    def get(self, request):
        total_students = Student.objects.count()
        total_subjects = Subject.objects.count()
        total_records = Attendance.objects.count()

        present_records = Attendance.objects.filter(status=Attendance.STATUS_PRESENT).count()
        absent_records = Attendance.objects.filter(status=Attendance.STATUS_ABSENT).count()
        avg_percentage = (present_records / total_records * 100) if total_records > 0 else 0.0

        # Subject-wise attendance calculation directly from database
        subject_wise = []
        for sub in Subject.objects.all().order_by('subject_code'):
            sub_total = Attendance.objects.filter(subject=sub).count()
            sub_present = Attendance.objects.filter(subject=sub, status=Attendance.STATUS_PRESENT).count()
            sub_absent = Attendance.objects.filter(subject=sub, status=Attendance.STATUS_ABSENT).count()
            sub_pct = round((sub_present / sub_total * 100), 1) if sub_total > 0 else 0.0
            subject_wise.append({
                'subject_id': sub.id,
                'subject_code': sub.subject_code,
                'subject_name': sub.subject_name,
                'department': sub.department,
                'total_records': sub_total,
                'present_count': sub_present,
                'absent_count': sub_absent,
                'percentage': sub_pct,
                'is_shortage': sub_total > 0 and sub_pct < 75.0,
            })

        # Attendance trend/summary by date directly from database
        daily_records = (
            Attendance.objects.values('attendance_date')
            .annotate(
                total=models.Count('id'),
                present=models.Count('id', filter=models.Q(status=Attendance.STATUS_PRESENT)),
                absent=models.Count('id', filter=models.Q(status=Attendance.STATUS_ABSENT)),
            )
            .order_by('attendance_date')
        )
        attendance_by_date = [
            {
                'date': str(r['attendance_date']),
                'total': r['total'],
                'present': r['present'],
                'absent': r['absent'],
                'percentage': round((r['present'] / r['total'] * 100), 1) if r['total'] > 0 else 0.0
            }
            for r in daily_records
        ]

        # Recent attendance records
        recent_records = []
        for a in Attendance.objects.select_related('student', 'subject').order_by('-attendance_date', '-id')[:8]:
            recent_records.append({
                'id': a.id,
                'student': a.student.id,
                'student_name': a.student.name,
                'student_register_number': a.student.register_number,
                'department': a.student.department,
                'subject': a.subject.id,
                'subject_code': a.subject.subject_code,
                'subject_name': a.subject.subject_name,
                'attendance_date': str(a.attendance_date),
                'status': a.status,
                'remarks': a.remarks or ''
            })

        return Response({
            'total_students': total_students,
            'total_subjects': total_subjects,
            'total_attendance_records': total_records,
            'total_present_records': present_records,
            'present_count': present_records,
            'total_absent_records': absent_records,
            'absent_count': absent_records,
            'overall_attendance_rate': round(avg_percentage, 1),
            'overall_attendance_percentage': round(avg_percentage, 1),
            'overall_percentage': round(avg_percentage, 1),
            'present_vs_absent': {
                'present_count': present_records,
                'absent_count': absent_records,
                'total_records': total_records,
                'present_percentage': round((present_records / total_records * 100), 1) if total_records > 0 else 0.0,
                'absent_percentage': round((absent_records / total_records * 100), 1) if total_records > 0 else 0.0,
            },
            'subject_wise_attendance': subject_wise,
            'attendance_summary_by_date': attendance_by_date,
            'recent_records': recent_records,
        })


class AttendanceReportView(APIView):
    """
    Attendance Reports and Analytics API:
    Calculates attendance percentage dynamically using Django ORM and attendance records.
    Formula:
        Attendance Percentage = (Number of Present Classes / Total Classes) * 100

    For each student and subject, calculates:
    - Total classes
    - Present classes
    - Absent classes
    - Attendance percentage

    Also provides overall attendance percentage for each student.
    Flags students below the 75% college mandatory threshold.
    """
    def get(self, request):
        subject_id = request.query_params.get('subject')
        student_id = request.query_params.get('student')
        department = request.query_params.get('department')
        year = request.query_params.get('year')

        students = Student.objects.all()
        if student_id:
            students = students.filter(id=student_id)
        if department:
            students = students.filter(department__iexact=department)
        if year:
            students = students.filter(year=year)

        all_subjects = Subject.objects.all()
        target_subject = None
        if subject_id:
            all_subjects = all_subjects.filter(id=subject_id)
            target_subject = all_subjects.first()

        report_data = []
        for s in students:
            # Overall attendance summary for this student
            # (or for target subject if specific subject is queried)
            overall_summary = s.calculate_attendance_summary(subject=target_subject)

            # Per-subject breakdown
            subject_breakdowns = []
            for sub in all_subjects:
                sub_summary = s.calculate_attendance_summary(subject=sub)
                subject_breakdowns.append({
                    'subject_id': sub.id,
                    'subject_code': sub.subject_code,
                    'subject_name': sub.subject_name,
                    'total_classes': sub_summary['total_classes'],
                    'present_classes': sub_summary['present_classes'],
                    'absent_classes': sub_summary['absent_classes'],
                    'attendance_percentage': sub_summary['attendance_percentage'],
                    'is_shortage': sub_summary['is_shortage'],
                })

            report_data.append({
                'student_id': s.id,
                'register_number': s.register_number,
                'student_name': s.name,
                'department': s.department,
                'year': s.year,
                'section': s.section,
                # Overall calculations
                'total_classes': overall_summary['total_classes'],
                'present_classes': overall_summary['present_classes'],
                'absent_classes': overall_summary['absent_classes'],
                'present_count': overall_summary['present_classes'],
                'absent_count': overall_summary['absent_classes'],
                'attendance_percentage': overall_summary['attendance_percentage'],
                'overall_attendance_percentage': overall_summary['attendance_percentage'],
                'is_shortage': overall_summary['is_shortage'],
                # Per-subject breakdown
                'subjects': subject_breakdowns,
            })

        return Response(report_data)
