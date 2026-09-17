"""
Django Admin Registration for Student, Subject, and Attendance models.
"""
from django.contrib import admin
from .models import Student, Subject, Attendance


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('register_number', 'name', 'email', 'phone', 'department', 'year', 'section')
    search_fields = ('register_number', 'name', 'email', 'department')
    list_filter = ('department', 'year', 'section')
    ordering = ('register_number',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('subject_code', 'subject_name', 'department', 'year', 'semester')
    search_fields = ('subject_code', 'subject_name', 'department')
    list_filter = ('department', 'year', 'semester')
    ordering = ('subject_code',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'attendance_date', 'status', 'remarks')
    search_fields = ('student__register_number', 'student__name', 'subject__subject_code')
    list_filter = ('status', 'attendance_date', 'subject__department')
    date_hierarchy = 'attendance_date'
