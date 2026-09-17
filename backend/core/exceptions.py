"""
Custom Exception Handler for Django REST Framework.
Standardizes error formats, maps status codes (400, 404, 409, 500),
and presents user-friendly error messages without exposing technical internals.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import (
    ValidationError,
    NotFound,
    ParseError,
    MethodNotAllowed,
    NotAuthenticated,
    PermissionDenied,
)
from django.http import Http404
from django.db import IntegrityError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides uniform, user-friendly error payloads.
    Translates:
    - 404 Not Found: Student not found, Subject not found, Attendance not found, Invalid ID.
    - 409 Conflict: Duplicate register number, Duplicate email, Duplicate subject code, Duplicate attendance.
    - 400 Bad Request: Invalid input, Invalid foreign key, Invalid attendance status.
    - 500 Internal Server Error: Handled securely without exposing internal database details or tracebacks.
    """
    # Call DRF's default exception handler first to get the standard response
    response = exception_handler(exc, context)

    view_name = context.get('view').__class__.__name__ if context.get('view') else 'API'

    # Handle Django's Http404
    if isinstance(exc, Http404):
        if 'Student' in view_name:
            msg = "Student not found."
        elif 'Subject' in view_name:
            msg = "Subject not found."
        elif 'Attendance' in view_name:
            msg = "Attendance record not found."
        else:
            msg = "Resource not found or invalid ID."
        return Response({
            "success": False,
            "error_type": "not_found",
            "message": msg,
            "detail": msg,
        }, status=status.HTTP_404_NOT_FOUND)

    # Handle DRF NotFound
    if isinstance(exc, NotFound):
        detail = str(exc.detail) if hasattr(exc, 'detail') else "Resource not found."
        if 'student' in detail.lower():
            msg = "Student not found."
        elif 'subject' in detail.lower():
            msg = "Subject not found."
        elif 'attendance' in detail.lower():
            msg = "Attendance record not found."
        else:
            msg = detail
        return Response({
            "success": False,
            "error_type": "not_found",
            "message": msg,
            "detail": msg,
        }, status=status.HTTP_404_NOT_FOUND)

    # Handle Database Integrity Errors (e.g. Unique Constraints, Foreign Key Failures)
    if isinstance(exc, IntegrityError):
        err_str = str(exc).lower()
        if 'register_number' in err_str or 'unique constraint' in err_str and 'register' in err_str:
            msg = "Duplicate register number: A student with this register number already exists in the database."
            return Response({
                "success": False,
                "error_type": "conflict",
                "message": msg,
                "detail": msg,
                "register_number": [msg],
            }, status=status.HTTP_409_CONFLICT)
        elif 'email' in err_str:
            msg = "Duplicate email: A student with this email address already exists in the database."
            return Response({
                "success": False,
                "error_type": "conflict",
                "message": msg,
                "detail": msg,
                "email": [msg],
            }, status=status.HTTP_409_CONFLICT)
        elif 'subject_code' in err_str:
            msg = "Duplicate subject code: A subject with this subject code already exists in the database."
            return Response({
                "success": False,
                "error_type": "conflict",
                "message": msg,
                "detail": msg,
                "subject_code": [msg],
            }, status=status.HTTP_409_CONFLICT)
        elif 'unique_student_subject_attendance_date' in err_str or 'attendance' in err_str:
            msg = "Duplicate attendance: Duplicate attendance for the same student, subject and date must be prevented."
            return Response({
                "success": False,
                "error_type": "conflict",
                "message": msg,
                "detail": msg,
                "duplicate": msg,
            }, status=status.HTTP_409_CONFLICT)
        elif 'foreign key' in err_str:
            msg = "Invalid foreign key: Referenced student or subject does not exist."
            return Response({
                "success": False,
                "error_type": "invalid_foreign_key",
                "message": msg,
                "detail": msg,
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            msg = "Database conflict: Operation violates data integrity constraints."
            return Response({
                "success": False,
                "error_type": "conflict",
                "message": msg,
                "detail": msg,
            }, status=status.HTTP_409_CONFLICT)

    # Handle DRF Validation Errors
    if isinstance(exc, ValidationError):
        data = response.data if response else exc.detail
        err_msg = None
        http_status = status.HTTP_400_BAD_REQUEST

        # Inspect if validation error is a conflict / duplicate
        data_str = str(data).lower()
        if 'duplicate register number' in data_str or 'register number must be unique' in data_str:
            http_status = status.HTTP_409_CONFLICT
            err_msg = "Duplicate register number: A student with this register number already exists in the database."
        elif 'duplicate email' in data_str or 'email must be unique' in data_str:
            http_status = status.HTTP_409_CONFLICT
            err_msg = "Duplicate email: A student with this email address already exists in the database."
        elif 'duplicate subject code' in data_str or 'subject code must be unique' in data_str:
            http_status = status.HTTP_409_CONFLICT
            err_msg = "Duplicate subject code: A subject with this subject code already exists in the database."
        elif 'duplicate attendance' in data_str:
            http_status = status.HTTP_409_CONFLICT
            err_msg = "Duplicate attendance: Duplicate attendance for the same student, subject and date must be prevented."
        elif 'status must be present or absent' in data_str or 'invalid attendance status' in data_str:
            http_status = status.HTTP_400_BAD_REQUEST
            err_msg = "Invalid attendance status: Status must be Present or Absent."
        elif 'does not exist' in data_str and ('student' in data_str or 'subject' in data_str):
            http_status = status.HTTP_400_BAD_REQUEST
            err_msg = "Invalid foreign key: Referenced Student or Subject does not exist."
        else:
            # General user-friendly extraction
            if isinstance(data, dict):
                first_val = next(iter(data.values()))
                if isinstance(first_val, list) and len(first_val) > 0:
                    err_msg = str(first_val[0])
                elif isinstance(first_val, str):
                    err_msg = first_val
                else:
                    err_msg = "Invalid input: Please verify all required fields."
            elif isinstance(data, list) and len(data) > 0:
                err_msg = str(data[0])
            else:
                err_msg = "Invalid input: Please verify all required fields."

        payload = {
            "success": False,
            "message": err_msg,
            "detail": err_msg,
            "errors": data if isinstance(data, dict) else {"non_field_errors": [err_msg]},
        }
        return Response(payload, status=http_status)

    # If response is None, it means an unhandled 500 error occurred
    if response is None:
        logger.error(f"Unhandled Exception in {view_name}: {str(exc)}", exc_info=True)
        return Response({
            "success": False,
            "error_type": "server_error",
            "message": "Failed API request: An unexpected server error occurred. Please try again later.",
            "detail": "Failed API request: An unexpected server error occurred. Please try again later.",
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Format any other standard DRF responses to include clean user-facing message
    if isinstance(response.data, dict):
        if 'detail' in response.data and 'message' not in response.data:
            response.data['message'] = response.data['detail']
        response.data['success'] = False

    return response
