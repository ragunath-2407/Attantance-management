"""
Main URL Configuration for attendance_backend.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # REST API endpoints for Attendance Management System
    path('api/', include('core.urls')),
]
