# Attendance Management System - Backend (Django & DRF)

## 📌 Architecture
- **Framework**: Django 4.x & Django REST Framework (DRF)
- **Database**: SQLite (`db.sqlite3`)
- **API Spec**: RESTful JSON endpoints
- **Testing**: Postman test collections compatible

## 📂 Backend Structure
```
backend/
├── manage.py                          # Django execution CLI
├── requirements.txt                   # Dependencies (django, djangorestframework, etc.)
├── attendance_backend/                # Project root settings & configuration
│   ├── __init__.py
│   ├── settings.py                    # App registry, SQLite DB, DRF settings, CORS
│   ├── urls.py                        # Root URL router delegating to /api/
│   ├── wsgi.py                        # WSGI entry point for web deployment
│   └── asgi.py                        # ASGI entry point for async deployment
└── core/                              # Main app containing domain models & REST views
    ├── admin.py                       # Django admin configuration
    ├── apps.py                        # App configuration
    ├── models.py                      # Student, Subject, Attendance models
    ├── serializers.py                 # DRF serializers for JSON transformation
    ├── views.py                       # ViewSets for CRUD operations & aggregation APIs
    └── urls.py                        # Endpoint mapping for /api/*
```

## 🚀 Setup & Execution Instructions

1. **Create & activate virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations (creates SQLite database)**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Start Django Development Server**:
   ```bash
   python manage.py runserver 8000
   ```

5. **Key REST API Endpoints**:
   - `GET /api/students/` - Read student list (with search & filter)
   - `POST /api/students/` - Create student
   - `GET /api/students/<id>/` - View single student
   - `PUT /api/students/<id>/` - Update student
   - `DELETE /api/students/<id>/` - Delete student
   - `GET /api/subjects/` - Read subjects (with search)
   - `POST /api/subjects/` - Create subject
   - `GET /api/attendance/` - Read attendance records (filter by subject, date, status)
   - `POST /api/attendance/` - Mark attendance
   - `GET /api/dashboard/stats/` - Dashboard analytical counters
   - `GET /api/reports/attendance-percentage/` - Attendance percentage reports
