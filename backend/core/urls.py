"""
Core App API URL Route Definitions.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet,
    SubjectViewSet,
    AttendanceViewSet,
    DashboardStatsView,
    AttendanceReportView,
)

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    # Custom API endpoints placed before router
    path('attendance/report/', AttendanceReportView.as_view(), name='attendance-report'),
    path('attendance/percentage/', AttendanceReportView.as_view(), name='attendance-percentage'),
    path('attendance/summary/', AttendanceReportView.as_view(), name='attendance-summary'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('reports/attendance-percentage/', AttendanceReportView.as_view(), name='attendance-percentage-report'),
    # REST API viewsets
    path('', include(router.urls)),
]
