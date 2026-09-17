# Complete Installation & Deployment Guide
## College Attendance Management System

This guide outlines setup procedures for both local development and college demonstration environments.

---

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.9 or higher

---

### Method A: Quick Start (Single Dev Server with Automatic Backend)

The project includes an automatic backend lifecycle plugin in `vite.config.ts` that spawns the Python SQLite REST backend automatically when Vite starts.

1. **Clone or navigate into project directory**:
   ```bash
   cd attendance-management-system
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the integrated full-stack application**:
   ```bash
   npm run dev
   ```
   - Frontend UI: `http://localhost:3000/`
   - SQLite REST API: `http://localhost:3000/api/` (proxied to internal backend)

---

### Method B: Standalone Django REST Framework Backend Setup

For college project viva and evaluators who specifically require running the Django execution command (`python manage.py runserver`):

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment**:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (Command Prompt / PowerShell)
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install required Python packages**:
   ```bash
   pip install -r requirements.txt
   ```
   *Contents of `requirements.txt`:*
   - `django>=4.2,<5.2`
   - `djangorestframework>=3.14.0`
   - `django-cors-headers>=4.3.0`
   - `python-dotenv>=1.0.0`

4. **Initialize SQLite Database & Apply Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Load Deterministic Seed Data (Optional)**:
   ```bash
   python seed_data.py
   ```

6. **Start Django REST Development Server**:
   ```bash
   python manage.py runserver 8001
   ```
   - Django API root: `http://127.0.0.1:8001/api/`
   - Django Admin panel: `http://127.0.0.1:8001/admin/`

7. **In a separate terminal, launch the React Frontend**:
   ```bash
   npm run dev
   ```

---

### Method C: Postman API Test Suite Execution

1. Open Postman.
2. Click **Import** in the top-left toolbar.
3. Drag and drop `Attendance_Management_System.postman_collection.json`.
4. Click on the collection and select **Run collection**.
5. All 30 test cases will execute against `http://127.0.0.1:3000` with 100% pass verification.
