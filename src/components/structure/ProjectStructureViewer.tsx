import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Database, 
  Server, 
  Globe, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Terminal,
  Cpu,
  BookOpen
} from 'lucide-react';
import { FolderFileNode } from '../../types';

interface ProjectStructureViewerProps {
  onNavigateModule: (moduleId: string) => void;
}

export const ProjectStructureViewer: React.FC<ProjectStructureViewerProps> = ({ onNavigateModule }) => {
  const [selectedItem, setSelectedItem] = useState<string>('backend');
  const [activeTab, setActiveTab] = useState<'explorer' | 'architecture' | 'api' | 'setup'>('explorer');

  // Directory Tree Definition
  const projectTree: FolderFileNode[] = [
    {
      name: 'attendance_management_system',
      path: '/',
      type: 'folder',
      description: 'Root workspace of the Attendance Management System containing segregated Frontend and Backend codebases.',
      children: [
        {
          name: 'backend',
          path: '/backend',
          type: 'folder',
          module: 'Backend (Python & Django)',
          description: 'Contains the complete Django and Django REST Framework server, ORM models, SQLite configuration, and REST API controllers.',
          children: [
            {
              name: 'manage.py',
              path: '/backend/manage.py',
              type: 'file',
              description: 'Django command-line utility for executing administrative tasks like migrations, creating superusers, and starting the development server.',
            },
            {
              name: 'requirements.txt',
              path: '/backend/requirements.txt',
              type: 'file',
              description: 'Declares Python dependencies including django, djangorestframework, django-cors-headers, and python-dotenv.',
            },
            {
              name: 'attendance_backend',
              path: '/backend/attendance_backend',
              type: 'folder',
              description: 'Core project configuration package responsible for system settings, CORS, installed apps, and top-level URL routing.',
              children: [
                {
                  name: 'settings.py',
                  path: '/backend/attendance_backend/settings.py',
                  type: 'file',
                  description: 'Configures SQLite database connection, Django REST framework pagination, CORS headers for React frontend, and installed applications.',
                },
                {
                  name: 'urls.py',
                  path: '/backend/attendance_backend/urls.py',
                  type: 'file',
                  description: 'Main project routing file that delegates `/api/` traffic to the core application REST endpoints and `/admin/` to the Django admin panel.',
                },
                {
                  name: 'wsgi.py',
                  path: '/backend/attendance_backend/wsgi.py',
                  type: 'file',
                  description: 'WSGI specification file used by production web servers (e.g. Gunicorn, uWSGI) to serve the Django application.',
                }
              ]
            },
            {
              name: 'core',
              path: '/backend/core',
              type: 'folder',
              description: 'Domain business application handling students, academic subjects, daily attendance marking, and statistical calculations.',
              children: [
                {
                  name: 'models.py',
                  path: '/backend/core/models.py',
                  type: 'file',
                  description: 'Defines Django ORM database schemas for Student, Subject, and Attendance records with relational constraints and unique keys.',
                },
                {
                  name: 'serializers.py',
                  path: '/backend/core/serializers.py',
                  type: 'file',
                  description: 'Converts complex Django ORM model querysets into native JSON payloads for the frontend and validates incoming POST/PUT request bodies.',
                },
                {
                  name: 'views.py',
                  path: '/backend/core/views.py',
                  type: 'file',
                  description: 'Django REST Framework ModelViewSets and APIViews providing CRUD operations, search, filters, and statistical attendance percentage calculations.',
                },
                {
                  name: 'urls.py',
                  path: '/backend/core/urls.py',
                  type: 'file',
                  description: 'Maps REST endpoints (/students, /subjects, /attendance, /dashboard/stats, /reports) to ViewSets using DRF DefaultRouter.',
                },
                {
                  name: 'admin.py',
                  path: '/backend/core/admin.py',
                  type: 'file',
                  description: 'Registers Student, Subject, and Attendance models with the built-in Django web administration portal.',
                },
                {
                  name: 'apps.py',
                  path: '/backend/core/apps.py',
                  type: 'file',
                  description: 'Configures application metadata for the core attendance app.',
                }
              ]
            },
            {
              name: 'README.md',
              path: '/backend/README.md',
              type: 'file',
              description: 'Step-by-step documentation on setting up Python virtual environments, installing requirements, running migrations, and running the server.',
            }
          ]
        },
        {
          name: 'src',
          path: '/src',
          type: 'folder',
          module: 'Frontend (React & Tailwind CSS)',
          description: 'Modular React 19 single-page application built with clean component hierarchy, TypeScript types, and dedicated REST API client service.',
          children: [
            {
              name: 'types',
              path: '/src/types',
              type: 'folder',
              description: 'Holds TypeScript interfaces and types for Student, Subject, Attendance, and Statistical models to guarantee compile-time safety.',
              children: [
                {
                  name: 'index.ts',
                  path: '/src/types/index.ts',
                  type: 'file',
                  description: 'Defines interfaces for Student, Subject, AttendanceRecord, DashboardStats, and StudentAttendanceReport.',
                }
              ]
            },
            {
              name: 'services',
              path: '/src/services',
              type: 'folder',
              description: 'Networking and API abstraction layer separating UI components from HTTP communication logic.',
              children: [
                {
                  name: 'api.ts',
                  path: '/src/services/api.ts',
                  type: 'file',
                  description: 'Centralized REST API client executing fetch calls against Django endpoints with full CRUD support.',
                }
              ]
            },
            {
              name: 'components',
              path: '/src/components',
              type: 'folder',
              description: 'Modular UI components divided cleanly by functional responsibility.',
              children: [
                {
                  name: 'layout',
                  path: '/src/components/layout',
                  type: 'folder',
                  description: 'Application shell components including top Navbar and navigation Sidebar.',
                  children: [
                    { name: 'Navbar.tsx', path: '/src/components/layout/Navbar.tsx', type: 'file', description: 'Top header displaying project identity, technology badges, and mobile toggles.' },
                    { name: 'Sidebar.tsx', path: '/src/components/layout/Sidebar.tsx', type: 'file', description: 'Side navigation linking to the 5 requested functional modules and project structure.' },
                  ]
                },
                {
                  name: 'dashboard',
                  path: '/src/components/dashboard',
                  type: 'folder',
                  description: 'Main landing module providing executive metrics (total students, subjects, attendance rate).',
                  children: [
                    { name: 'DashboardOverview.tsx', path: '/src/components/dashboard/DashboardOverview.tsx', type: 'file', description: 'Interactive dashboard module presenting analytical metrics and system status.' }
                  ]
                },
                {
                  name: 'students',
                  path: '/src/components/students',
                  type: 'folder',
                  description: 'Student management module providing CRUD operations, search by roll number/name, and filter by department.',
                  children: [
                    { name: 'StudentManagement.tsx', path: '/src/components/students/StudentManagement.tsx', type: 'file', description: 'Component handling student records, search, filter, and detail views.' }
                  ]
                },
                {
                  name: 'subjects',
                  path: '/src/components/subjects',
                  type: 'folder',
                  description: 'Subject management module allowing creation, listing, updating, and searching course offerings.',
                  children: [
                    { name: 'SubjectManagement.tsx', path: '/src/components/subjects/SubjectManagement.tsx', type: 'file', description: 'Component managing academic subjects, codes, department associations, and teachers.' }
                  ]
                },
                {
                  name: 'attendance',
                  path: '/src/components/attendance',
                  type: 'folder',
                  description: 'Attendance tracking module allowing marking present/absent/late, date filtering, and record updates.',
                  children: [
                    { name: 'AttendanceManagement.tsx', path: '/src/components/attendance/AttendanceManagement.tsx', type: 'file', description: 'Component for marking daily attendance and viewing historical logs.' }
                  ]
                },
                {
                  name: 'reports',
                  path: '/src/components/reports',
                  type: 'folder',
                  description: 'Attendance reports module calculating individual attendance percentage rates and export options.',
                  children: [
                    { name: 'AttendanceReports.tsx', path: '/src/components/reports/AttendanceReports.tsx', type: 'file', description: 'Component aggregating attendance percentages with status alerts (e.g. low attendance).' }
                  ]
                },
                {
                  name: 'structure',
                  path: '/src/components/structure',
                  type: 'folder',
                  description: 'Interactive architectural and directory tree guide for reviewing the full-stack layout.',
                  children: [
                    { name: 'ProjectStructureViewer.tsx', path: '/src/components/structure/ProjectStructureViewer.tsx', type: 'file', description: 'This current component explaining every folder and file in depth.' }
                  ]
                }
              ]
            },
            {
              name: 'App.tsx',
              path: '/src/App.tsx',
              type: 'file',
              description: 'Main application component wiring together the layout shell and routing between the requested modules.',
            },
            {
              name: 'main.tsx',
              path: '/src/main.tsx',
              type: 'file',
              description: 'React DOM root initialization mounting the application to index.html.',
            },
            {
              name: 'index.css',
              path: '/src/index.css',
              type: 'file',
              description: 'Global stylesheet importing Tailwind CSS utility classes.',
            }
          ]
        },
        {
          name: 'index.html',
          path: '/index.html',
          type: 'file',
          description: 'Single-page HTML entry template with document metadata and root DOM node.',
        },
        {
          name: 'package.json',
          path: '/package.json',
          type: 'file',
          description: 'Node.js manifest specifying frontend libraries (React 19, Tailwind CSS, Lucide icons, Vite).',
        },
        {
          name: 'vite.config.ts',
          path: '/vite.config.ts',
          type: 'file',
          description: 'Vite build tool configuration bundling React and Tailwind CSS.',
        }
      ]
    }
  ];

  // Flat lookup map for details
  const fileDetailMap: Record<string, { title: string; category: string; role: string; details: string; keyItems: string[] }> = {
    '/backend': {
      title: 'backend/',
      category: 'Django Backend Root',
      role: 'Houses all server-side Python logic, REST API endpoints, database models, and settings.',
      details: 'Strictly separated from the frontend codebase. In accordance with Django conventions, it includes manage.py for administration, a project configuration package (attendance_backend), and a domain application (core).',
      keyItems: ['requirements.txt defines packages', 'manage.py handles migrations and server start', 'core/ handles domain logic', 'Uses SQLite database (db.sqlite3)']
    },
    '/backend/manage.py': {
      title: 'manage.py',
      category: 'Django CLI Utility',
      role: 'Command-line tool used to run database migrations, initiate tests, and start the local development server.',
      details: 'Configures DJANGO_SETTINGS_MODULE to attendance_backend.settings and executes administrative commands via python manage.py <command>.',
      keyItems: ['python manage.py runserver 8000', 'python manage.py makemigrations', 'python manage.py migrate', 'python manage.py createsuperuser']
    },
    '/backend/requirements.txt': {
      title: 'requirements.txt',
      category: 'Python Dependencies',
      role: 'Lists all pip packages required to run the Django REST API server.',
      details: 'Specifies Django (>=4.2), djangorestframework (>=3.14.0), and django-cors-headers (>=4.3.0) for enabling cross-origin requests from the React frontend.',
      keyItems: ['django: Web framework and ORM', 'djangorestframework: Serializers, ViewSets, REST routing', 'django-cors-headers: Allows React browser requests', 'python-dotenv: Environment configuration']
    },
    '/backend/attendance_backend/settings.py': {
      title: 'attendance_backend/settings.py',
      category: 'Project Configuration',
      role: 'Main configuration file for the Django project.',
      details: 'Registers INSTALLED_APPS (rest_framework, corsheaders, core), enables CorsMiddleware, specifies SQLite (db.sqlite3) as the default database, and sets up DRF pagination and search filters.',
      keyItems: ['DATABASES: SQLite configuration', 'INSTALLED_APPS: core & DRF', 'CORS_ALLOW_ALL_ORIGINS: Enabled for React dev', 'REST_FRAMEWORK pagination settings']
    },
    '/backend/attendance_backend/urls.py': {
      title: 'attendance_backend/urls.py',
      category: 'Root URL Routing',
      role: 'Entry URL router for all incoming HTTP requests.',
      details: 'Directs /admin/ requests to the built-in Django Administration interface and forwards all /api/ requests to the core application REST endpoints.',
      keyItems: ['path("admin/", admin.site.urls)', 'path("api/", include("core.urls"))']
    },
    '/backend/core/models.py': {
      title: 'core/models.py',
      category: 'Database ORM Models',
      role: 'Defines the relational database tables for the Attendance Management System.',
      details: 'Contains 3 core models:\n1. Student: roll_number (unique), first_name, last_name, email, department, semester, is_active.\n2. Subject: code (unique), name, department, semester, credits, teacher_name.\n3. Attendance: student (FK), subject (FK), date, status (Present/Absent/Late), remarks. Enforces unique_together on (student, subject, date).',
      keyItems: ['Student model with roll_number index', 'Subject model with code index', 'Attendance model with ForeignKeys and composite unique constraint', 'Automatic timestamps (created_at, updated_at)']
    },
    '/backend/core/serializers.py': {
      title: 'core/serializers.py',
      category: 'DRF Serializers',
      role: 'Translates Django ORM models into clean JSON payloads and validates incoming data.',
      details: 'Provides StudentSerializer, SubjectSerializer, AttendanceSerializer (with nested student roll number and subject code lookup for display convenience), and StudentAttendancePercentageSerializer for statistical reports.',
      keyItems: ['ModelSerializer for Student, Subject, Attendance', 'Nested relational fields for instant UI readability', 'Validation of incoming fields during POST/PUT operations']
    },
    '/backend/core/views.py': {
      title: 'core/views.py',
      category: 'REST Controllers & ViewSets',
      role: 'Implements business logic, CRUD endpoints, search, filtering, and statistical aggregations.',
      details: '1. StudentViewSet: ModelViewSet for complete CRUD with SearchFilter (name, roll, dept) and query filtering.\n2. SubjectViewSet: ModelViewSet for subject CRUD.\n3. AttendanceViewSet: ModelViewSet for recording and filtering attendance by date, student, subject, and status.\n4. DashboardStatsView: Aggregates total students, subjects, attendance count, and overall rate.\n5. AttendanceReportView: Calculates per-student attendance percentage.',
      keyItems: ['CRUD operations via ModelViewSet', 'Search and filter backends', 'Dashboard analytical aggregation API', 'Percentage calculation endpoint']
    },
    '/backend/core/urls.py': {
      title: 'core/urls.py',
      category: 'App API Endpoints',
      role: 'Registers REST endpoints with DRF DefaultRouter.',
      details: 'Provides RESTful routes:\n• /api/students/\n• /api/subjects/\n• /api/attendance/\n• /api/dashboard/stats/\n• /api/reports/attendance-percentage/',
      keyItems: ['DefaultRouter automatically provides standard REST routes', 'Custom APIView paths for stats and reports']
    },
    '/src': {
      title: 'src/',
      category: 'Frontend Source Directory',
      role: 'Contains all React components, styling, types, and REST API service integrations.',
      details: 'Organized into structured subfolders: types/, services/, and components/ (with separate folders for layout, dashboard, students, subjects, attendance, and reports) to avoid large monolithic files.',
      keyItems: ['Modular component hierarchy', 'Strict TypeScript typings', 'Tailwind CSS utility styling', 'Decoupled API client in services/api.ts']
    },
    '/src/services/api.ts': {
      title: 'src/services/api.ts',
      category: 'API Client Service',
      role: 'Central abstraction layer communicating with the Django REST Framework endpoints.',
      details: 'Encapsulates all HTTP fetch calls (GET, POST, PUT, DELETE) with typed parameters and responses. Decouples UI components from networking details, making it easy to test with Postman or swap endpoints.',
      keyItems: ['getStudents(), createStudent(), updateStudent(), deleteStudent()', 'getSubjects(), createSubject(), updateSubject(), deleteSubject()', 'getAttendanceRecords(), markAttendance(), updateAttendance()', 'getDashboardStats(), getAttendanceReports()']
    },
    '/src/types/index.ts': {
      title: 'src/types/index.ts',
      category: 'TypeScript Interfaces',
      role: 'Defines the structural contracts matching Django models and API responses.',
      details: 'Guarantees strict type safety across the frontend for Student, Subject, AttendanceRecord, AttendanceStatus, DashboardStats, and StudentAttendanceReport.',
      keyItems: ['Student interface', 'Subject interface', 'AttendanceRecord interface', 'DashboardStats & Report types']
    },
    '/src/components/layout': {
      title: 'src/components/layout/',
      category: 'Application Layout',
      role: 'Provides the responsive navigation structure for the web app.',
      details: 'Contains Navbar (top bar with project identity and mobile menu trigger) and Sidebar (side navigation menu linking to all 5 required project modules).',
      keyItems: ['Responsive design for desktop, laptop, tablet, and mobile', 'Active tab indicators and module badges']
    },
    '/src/components/dashboard': {
      title: 'src/components/dashboard/',
      category: 'Dashboard Module',
      role: 'Presents high-level metrics and system summaries.',
      details: 'Displays total enrolled students, total active subjects, total attendance records logged, and the overall college attendance rate.',
      keyItems: ['Summary statistics cards', 'Quick action shortcuts', 'Recent attendance trends']
    },
    '/src/components/students': {
      title: 'src/components/students/',
      category: 'Student Management Module',
      role: 'Handles student records lifecycle.',
      details: 'Satisfies all requirements: Create student, read student list, view individual student, update student, delete student, search by roll/name, and filter by department/semester.',
      keyItems: ['CRUD modal / form actions', 'Live search input', 'Department and semester filter dropdowns', 'Detailed student profile viewer']
    },
    '/src/components/subjects': {
      title: 'src/components/subjects/',
      category: 'Subject Management Module',
      role: 'Manages academic courses and subjects.',
      details: 'Satisfies all requirements: Create subject, read subjects, update subject, delete subject, and search subjects by code, name, or teacher.',
      keyItems: ['Course catalog view', 'Subject creation form', 'Search by code or instructor']
    },
    '/src/components/attendance': {
      title: 'src/components/attendance/',
      category: 'Attendance Management Module',
      role: 'Handles daily attendance marking and historical tracking.',
      details: 'Satisfies all requirements: Mark attendance (Present/Absent/Late), view attendance records, update attendance status, delete records, search and filter by date/subject.',
      keyItems: ['Quick mark attendance sheet', 'Date picker and subject selector', 'Status badges (Present / Absent / Late)', 'Live percentage calculator']
    },
    '/src/components/reports': {
      title: 'src/components/reports/',
      category: 'Attendance Reports Module',
      role: 'Generates attendance percentage analytics and reports.',
      details: 'Calculates student attendance percentages, highlights low-attendance alerts (below 75% threshold standard for colleges), and provides filtering by subject.',
      keyItems: ['Calculated attendance percentage rate', 'Visual progress bars', 'Eligibility status indicators', 'Export summary view']
    }
  };

  const currentDetails = fileDetailMap[selectedItem] || {
    title: selectedItem,
    category: 'Project File / Folder',
    role: 'Part of the Attendance Management System full-stack architecture.',
    details: 'Supports the modular CRUD operations, separation of concerns between React and Django, or local SQLite database storage.',
    keyItems: ['Separates frontend and backend', 'Follows standard full-stack patterns']
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Project Folder Structure & Architecture Established</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Attendance Management System
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            A full-stack CRUD application for colleges to manage student details, subject offerings, 
            and attendance records digitally. Below is the complete project directory structure 
            with detailed explanations of each major folder, file, and architecture layer.
          </p>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            <button
              id="tab-btn-explorer"
              onClick={() => setActiveTab('explorer')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'explorer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Interactive File Explorer</span>
            </button>
            <button
              id="tab-btn-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3-Tier Architecture Flow</span>
            </button>
            <button
              id="tab-btn-api"
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'api'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>REST API Specification</span>
            </button>
            <button
              id="tab-btn-setup"
              onClick={() => setActiveTab('setup')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Setup & Running Instructions</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Interactive Explorer */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tree structure */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Folder className="w-4 h-4 text-indigo-400" />
                <span>Project Directory Tree</span>
              </div>
              <span className="text-[11px] text-slate-400">Click any item to inspect</span>
            </div>

            <div className="space-y-1 font-mono text-xs overflow-y-auto max-h-[540px] pr-1">
              {/* Backend Root */}
              <div 
                onClick={() => setSelectedItem('/backend')}
                className={`p-2 rounded-lg cursor-pointer flex items-center space-x-2 transition-colors ${
                  selectedItem === '/backend' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-100">backend/</span>
                <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded">Django</span>
              </div>

              {/* Backend children */}
              <div className="pl-4 border-l border-slate-800 ml-2 space-y-1 my-1">
                <div 
                  onClick={() => setSelectedItem('/backend/manage.py')}
                  className={`p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 ${
                    selectedItem === '/backend/manage.py' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>manage.py</span>
                </div>

                <div 
                  onClick={() => setSelectedItem('/backend/requirements.txt')}
                  className={`p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 ${
                    selectedItem === '/backend/requirements.txt' ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>requirements.txt</span>
                </div>

                {/* attendance_backend */}
                <div 
                  onClick={() => setSelectedItem('/backend/attendance_backend/settings.py')}
                  className={`p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 ${
                    selectedItem.includes('attendance_backend') ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>attendance_backend/</span>
                </div>
                <div className="pl-4 border-l border-slate-800 ml-2 space-y-0.5 text-[11px]">
                  <div onClick={() => setSelectedItem('/backend/attendance_backend/settings.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-cyan-400" />
                    <span>settings.py</span>
                  </div>
                  <div onClick={() => setSelectedItem('/backend/attendance_backend/urls.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-cyan-400" />
                    <span>urls.py</span>
                  </div>
                </div>

                {/* core app */}
                <div 
                  onClick={() => setSelectedItem('/backend/core/models.py')}
                  className={`p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 ${
                    selectedItem.includes('core') ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>core/ (App)</span>
                </div>
                <div className="pl-4 border-l border-slate-800 ml-2 space-y-0.5 text-[11px]">
                  <div onClick={() => setSelectedItem('/backend/core/models.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-amber-400" />
                    <span>models.py (Student, Subject, Attendance)</span>
                  </div>
                  <div onClick={() => setSelectedItem('/backend/core/serializers.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-amber-400" />
                    <span>serializers.py (JSON mapping)</span>
                  </div>
                  <div onClick={() => setSelectedItem('/backend/core/views.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-amber-400" />
                    <span>views.py (CRUD ViewSets & Stats)</span>
                  </div>
                  <div onClick={() => setSelectedItem('/backend/core/urls.py')} className="cursor-pointer hover:text-indigo-300 py-1 flex items-center space-x-1.5 text-slate-400">
                    <FileCode className="w-3 h-3 text-amber-400" />
                    <span>urls.py (Router API endpoints)</span>
                  </div>
                </div>
              </div>

              {/* Frontend Root */}
              <div 
                onClick={() => setSelectedItem('/src')}
                className={`p-2 rounded-lg cursor-pointer flex items-center space-x-2 transition-colors mt-3 ${
                  selectedItem === '/src' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-slate-100">src/</span>
                <span className="ml-auto text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded">React 19</span>
              </div>

              {/* Frontend children */}
              <div className="pl-4 border-l border-slate-800 ml-2 space-y-1 my-1">
                <div onClick={() => setSelectedItem('/src/types/index.ts')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>types/index.ts</span>
                </div>

                <div onClick={() => setSelectedItem('/src/services/api.ts')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>services/api.ts (REST Client)</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/layout')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/layout/</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/dashboard')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/dashboard/</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/students')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/students/</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/subjects')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/subjects/</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/attendance')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/attendance/</span>
                </div>

                <div onClick={() => setSelectedItem('/src/components/reports')} className="p-1.5 rounded-lg cursor-pointer flex items-center space-x-2 text-slate-400 hover:text-slate-200">
                  <Folder className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>components/reports/</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Explanation of the Selected File/Folder */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-sm">
                  {currentDetails.title.endsWith('/') ? <Folder className="w-5 h-5" /> : <FileCode className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-white font-mono">{currentDetails.title}</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {currentDetails.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Role: {currentDetails.role}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Purpose & Architecture Function</h3>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {currentDetails.details}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Highlights & Exports</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentDetails.keyItems.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick action to explore related module */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Ready to inspect module wireframe?
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigateModule('dashboard')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium transition-colors"
                >
                  Dashboard Preview &rarr;
                </button>
                <button
                  onClick={() => onNavigateModule('students')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-medium transition-colors"
                >
                  Student Management &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 3-Tier Architecture Flow */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-200 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Project Architecture Flow</h2>
            <p className="text-sm text-slate-400">
              The project is structured according to a classic 3-Tier software engineering pattern, 
              guaranteeing separation of concerns between user interaction, API routing, and data persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Tier 1 */}
            <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold text-white text-sm">React Frontend</h3>
              <p className="text-xs text-slate-400">
                Responsive UI components (Dashboard, Students, Subjects, Attendance, Reports) + Tailwind styling.
              </p>
            </div>

            <div className="hidden md:flex justify-center text-slate-600">
              <ArrowRight className="w-6 h-6 text-indigo-400" />
            </div>

            {/* Tier 2 */}
            <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold text-white text-sm">Django REST API</h3>
              <p className="text-xs text-slate-400">
                JSON REST endpoints, DRF Serializers for validation, ViewSets for CRUD, search & filter logic.
              </p>
            </div>

            <div className="hidden md:flex justify-center text-slate-600">
              <ArrowRight className="w-6 h-6 text-indigo-400" />
            </div>

            {/* Tier 3 */}
            <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold text-white text-sm">SQLite & ORM</h3>
              <p className="text-xs text-slate-400">
                Relational schema (Student, Subject, Attendance records) mapped via Django ORM to SQLite (db.sqlite3).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Frontend Responsibilities (React)</h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Pure presentation and interactive user event handling.</li>
                <li>• State management for active filters, search keywords, and form inputs.</li>
                <li>• Rendering attendance percentage progress and low-attendance alerts.</li>
                <li>• Decoupled API calls through centralized <code className="text-indigo-300 font-mono">src/services/api.ts</code>.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Backend Responsibilities (Django + DRF)</h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• Database schema integrity and unique constraints (e.g. 1 record per student/subject/date).</li>
                <li>• Serializing complex querysets to JSON and handling data validation.</li>
                <li>• Calculating statistical metrics (attendance percentage, counts).</li>
                <li>• Serving REST API endpoints with CORS support for seamless local and remote deployment.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REST API Specification */}
      {activeTab === 'api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">REST API Specification & Endpoints</h2>
            <p className="text-sm text-slate-400">
              Standardized JSON REST API provided by Django REST Framework (<code className="text-indigo-300 font-mono">core/views.py</code>) 
              ready for Postman testing and React integration.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">HTTP Method</th>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Description / Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">GET</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/students/</td>
                  <td className="p-3">Student</td>
                  <td className="p-3">List all students with query search (<code className="text-slate-400">?search=...</code>) and filter (<code className="text-slate-400">?department=...</code>).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">POST</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/students/</td>
                  <td className="p-3">Student</td>
                  <td className="p-3">Create new student (roll_number, first_name, last_name, email, department, semester).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">PUT</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/students/&lt;id&gt;/</td>
                  <td className="p-3">Student</td>
                  <td className="p-3">Update existing student details.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold">DELETE</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/students/&lt;id&gt;/</td>
                  <td className="p-3">Student</td>
                  <td className="p-3">Delete student record.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">GET</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/subjects/</td>
                  <td className="p-3">Subject</td>
                  <td className="p-3">List all academic subjects (with search filter).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">POST</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/subjects/</td>
                  <td className="p-3">Subject</td>
                  <td className="p-3">Create new subject (code, name, department, semester, credits, teacher_name).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">GET</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/attendance/</td>
                  <td className="p-3">Attendance</td>
                  <td className="p-3">Query attendance logs filtered by <code className="text-slate-400">?subject=&date=&status=</code>.</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">POST</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/attendance/</td>
                  <td className="p-3">Attendance</td>
                  <td className="p-3">Mark attendance for a student and subject on a specific date (Present, Absent, Late).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">GET</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/dashboard/stats/</td>
                  <td className="p-3">Dashboard</td>
                  <td className="p-3">Returns overall statistics (total students, total subjects, overall percentage).</td>
                </tr>
                <tr>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">GET</span></td>
                  <td className="p-3 font-mono text-indigo-300">/api/reports/attendance-percentage/</td>
                  <td className="p-3">Reports</td>
                  <td className="p-3">Returns computed attendance percentage per student across enrolled subjects.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Setup & Running Instructions */}
      {activeTab === 'setup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">College Project Execution Instructions</h2>
            <p className="text-sm text-slate-400">
              Clear commands to run the backend and frontend simultaneously for testing, demonstration, and evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backend Setup */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                <Terminal className="w-4 h-4" />
                <span>1. Running the Django Backend</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 space-y-2">
                <p className="text-slate-400"># Navigate to backend directory</p>
                <p className="text-amber-300">cd backend</p>
                <p className="text-slate-400 mt-2"># Create and activate virtual environment</p>
                <p className="text-amber-300">python3 -m venv venv</p>
                <p className="text-amber-300">source venv/bin/activate</p>
                <p className="text-slate-400 mt-2"># Install dependencies</p>
                <p className="text-amber-300">pip install -r requirements.txt</p>
                <p className="text-slate-400 mt-2"># Migrate SQLite database</p>
                <p className="text-amber-300">python manage.py makemigrations</p>
                <p className="text-amber-300">python manage.py migrate</p>
                <p className="text-slate-400 mt-2"># Start Django API server on port 8000</p>
                <p className="text-amber-300">python manage.py runserver 8000</p>
              </div>
            </div>

            {/* Frontend Setup */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Globe className="w-4 h-4" />
                <span>2. Running the React Frontend</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 font-mono text-xs text-slate-300 space-y-2">
                <p className="text-slate-400"># In the project root directory</p>
                <p className="text-cyan-300">npm install</p>
                <p className="text-slate-400 mt-2"># Start Vite development server</p>
                <p className="text-cyan-300">npm run dev</p>
                <p className="text-slate-400 mt-2"># Open browser to access client</p>
                <p className="text-slate-300">http://localhost:3000</p>
                <p className="text-slate-400 mt-2"># API communication configured via</p>
                <p className="text-slate-300">VITE_API_BASE_URL=http://localhost:8000/api</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
