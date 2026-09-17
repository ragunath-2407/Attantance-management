import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  Link, 
  ShieldCheck, 
  Table, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowRight,
  Code2,
  Terminal,
  FileCheck,
  Hash,
  ListOrdered
} from 'lucide-react';

export const DatabaseDesignViewer: React.FC = () => {
  const [activeModel, setActiveModel] = useState<'student' | 'subject' | 'attendance'>('student');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SQLite Database Connected & Migrated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Database Design & Relational Architecture
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Implemented using <strong>Django ORM</strong> backed by <strong>SQLite</strong> (<code className="text-amber-300 font-mono">backend/db.sqlite3</code>). 
            Structured with primary keys, unique constraints, foreign keys with cascade deletion, and check constraints to guarantee database-level integrity.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Engine: SQLite 3.40.1</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Migration: core.0001_initial</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Integrity Constraints: Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relational Diagram / Visual Schema Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Entity-Relationship (ER) Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizing the One-to-Many relationships and junction table configuration.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/20">
            Relational Model
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Student Entity Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono font-bold text-sm text-blue-400">STUDENT</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded">1 (Parent)</span>
            </div>
            <ul className="space-y-1.5 text-xs font-mono text-slate-300">
              <li className="flex items-center justify-between text-amber-300">
                <span className="flex items-center space-x-1.5"><Key className="w-3 h-3 text-amber-400" /><span>id (PK)</span></span>
                <span className="text-slate-500">BigAutoField</span>
              </li>
              <li className="flex items-center justify-between text-indigo-300 font-semibold">
                <span>register_number (UQ)</span>
                <span className="text-slate-500">CharField(50)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>name</span>
                <span className="text-slate-500">CharField(100)</span>
              </li>
              <li className="flex items-center justify-between text-indigo-300 font-semibold">
                <span>email (UQ)</span>
                <span className="text-slate-500">EmailField</span>
              </li>
              <li className="flex items-center justify-between">
                <span>phone</span>
                <span className="text-slate-500">CharField(20)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>department</span>
                <span className="text-slate-500">CharField(100)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>year</span>
                <span className="text-slate-500">PositiveSmallInt</span>
              </li>
              <li className="flex items-center justify-between">
                <span>section</span>
                <span className="text-slate-500">CharField(10)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>admission_date</span>
                <span className="text-slate-500">DateField (Null)</span>
              </li>
            </ul>
          </div>

          {/* Junction / Attendance Entity Card */}
          <div className="p-4 rounded-xl bg-slate-950 border-2 border-indigo-500/50 space-y-3 relative shadow-lg shadow-indigo-500/10">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono font-bold text-sm text-indigo-400">ATTENDANCE</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded">M (Junction)</span>
            </div>
            <ul className="space-y-1.5 text-xs font-mono text-slate-300">
              <li className="flex items-center justify-between text-amber-300">
                <span className="flex items-center space-x-1.5"><Key className="w-3 h-3 text-amber-400" /><span>id (PK)</span></span>
                <span className="text-slate-500">BigAutoField</span>
              </li>
              <li className="flex items-center justify-between text-blue-400 font-semibold">
                <span className="flex items-center space-x-1"><Link className="w-3 h-3" /><span>student_id (FK)</span></span>
                <span className="text-slate-500">&rarr; Student</span>
              </li>
              <li className="flex items-center justify-between text-emerald-400 font-semibold">
                <span className="flex items-center space-x-1"><Link className="w-3 h-3" /><span>subject_id (FK)</span></span>
                <span className="text-slate-500">&rarr; Subject</span>
              </li>
              <li className="flex items-center justify-between text-indigo-200">
                <span>attendance_date</span>
                <span className="text-slate-500">DateField</span>
              </li>
              <li className="flex items-center justify-between text-emerald-300 font-semibold">
                <span>status (Check)</span>
                <span className="text-slate-500">Present | Absent</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>remarks</span>
                <span className="text-slate-500">CharField(255)</span>
              </li>
            </ul>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-amber-300/90 font-sans leading-tight">
              &bull; <strong>UniqueConstraint:</strong> (student, subject, date)<br />
              &bull; <strong>CheckConstraint:</strong> status &isin; [Present, Absent]
            </div>
          </div>

          {/* Subject Entity Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono font-bold text-sm text-emerald-400">SUBJECT</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">1 (Parent)</span>
            </div>
            <ul className="space-y-1.5 text-xs font-mono text-slate-300">
              <li className="flex items-center justify-between text-amber-300">
                <span className="flex items-center space-x-1.5"><Key className="w-3 h-3 text-amber-400" /><span>id (PK)</span></span>
                <span className="text-slate-500">BigAutoField</span>
              </li>
              <li className="flex items-center justify-between text-indigo-300 font-semibold">
                <span>subject_code (UQ)</span>
                <span className="text-slate-500">CharField(20)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>subject_name</span>
                <span className="text-slate-500">CharField(150)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>department</span>
                <span className="text-slate-500">CharField(100)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>year</span>
                <span className="text-slate-500">PositiveSmallInt</span>
              </li>
              <li className="flex items-center justify-between">
                <span>semester</span>
                <span className="text-slate-500">PositiveSmallInt</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Model Deep-Dives: Tabs for Student, Subject, Attendance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveModel('student')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeModel === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1. Student Model & Schema
            </button>
            <button
              onClick={() => setActiveModel('subject')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeModel === 'subject'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2. Subject Model & Schema
            </button>
            <button
              onClick={() => setActiveModel('attendance')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeModel === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3. Attendance Model & Constraints
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono">SQLite Table: attendance_{activeModel === 'attendance' ? 'record' : activeModel}</span>
        </div>

        {/* Tab 1: Student Table */}
        {activeModel === 'student' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Django Field Type</th>
                    <th className="p-3">SQLite Type</th>
                    <th className="p-3">Constraints</th>
                    <th className="p-3">Requirement & Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-mono font-bold text-amber-400">id</td>
                    <td className="p-3 font-mono text-slate-400">BigAutoField</td>
                    <td className="p-3 font-mono text-slate-400">INTEGER</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">PRIMARY KEY AUTOINCREMENT</span></td>
                    <td className="p-3">Unique identifier automatically assigned by Django & SQLite.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-indigo-300">register_number</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=50)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(50)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">UNIQUE, NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required and unique registration number (e.g. 717621CS101).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">name</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=100)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(100)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required full name of the student.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-indigo-300">email</td>
                    <td className="p-3 font-mono text-slate-400">EmailField</td>
                    <td className="p-3 font-mono text-slate-400">varchar(254)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">UNIQUE, NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required and unique email address for each student.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">phone</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=20)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(20)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required contact telephone or mobile number.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">department</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=100)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(100)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required academic department (e.g. Computer Science).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">year</td>
                    <td className="p-3 font-mono text-slate-400">PositiveSmallIntegerField</td>
                    <td className="p-3 font-mono text-slate-400">smallint unsigned</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL, [1-5]</span></td>
                    <td className="p-3 text-slate-200">Required current year of study (1 to 4/5).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">section</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=10)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(10)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required section (e.g. A, B, C).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">admission_date</td>
                    <td className="p-3 font-mono text-slate-400">DateField</td>
                    <td className="p-3 font-mono text-slate-400">date</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">NULLABLE</span></td>
                    <td className="p-3 text-slate-200">Optional admission date when student joined the institution.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Subject Table */}
        {activeModel === 'subject' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Django Field Type</th>
                    <th className="p-3">SQLite Type</th>
                    <th className="p-3">Constraints</th>
                    <th className="p-3">Requirement & Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-mono font-bold text-amber-400">id</td>
                    <td className="p-3 font-mono text-slate-400">BigAutoField</td>
                    <td className="p-3 font-mono text-slate-400">INTEGER</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">PRIMARY KEY AUTOINCREMENT</span></td>
                    <td className="p-3">Unique identifier automatically assigned by Django & SQLite.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-emerald-400">subject_code</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=20)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(20)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">UNIQUE, NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required and unique subject code (e.g. CS8591).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">subject_name</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=150)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(150)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required subject title (e.g. Database Management Systems).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">department</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=100)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(100)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required academic department offering the course.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">year</td>
                    <td className="p-3 font-mono text-slate-400">PositiveSmallIntegerField</td>
                    <td className="p-3 font-mono text-slate-400">smallint unsigned</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL, [1-5]</span></td>
                    <td className="p-3 text-slate-200">Required academic year when subject is taught.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-100">semester</td>
                    <td className="p-3 font-mono text-slate-400">PositiveSmallIntegerField</td>
                    <td className="p-3 font-mono text-slate-400">smallint unsigned</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL, [1-8]</span></td>
                    <td className="p-3 text-slate-200">Required academic semester (1 to 8).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance Table */}
        {activeModel === 'attendance' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Django Field Type</th>
                    <th className="p-3">SQLite Type</th>
                    <th className="p-3">Constraints</th>
                    <th className="p-3">Requirement & Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="p-3 font-mono font-bold text-amber-400">id</td>
                    <td className="p-3 font-mono text-slate-400">BigAutoField</td>
                    <td className="p-3 font-mono text-slate-400">INTEGER</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">PRIMARY KEY AUTOINCREMENT</span></td>
                    <td className="p-3">Unique identifier for each attendance entry.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-blue-400">student_id</td>
                    <td className="p-3 font-mono text-slate-400">ForeignKey(Student, on_delete=CASCADE)</td>
                    <td className="p-3 font-mono text-slate-400">bigint REFERENCES attendance_student(id)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono">FOREIGN KEY, CASCADE</span></td>
                    <td className="p-3 text-slate-200">Required foreign key referencing Student. If student is deleted, attendance records are cascaded.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-emerald-400">subject_id</td>
                    <td className="p-3 font-mono text-slate-400">ForeignKey(Subject, on_delete=CASCADE)</td>
                    <td className="p-3 font-mono text-slate-400">bigint REFERENCES attendance_subject(id)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">FOREIGN KEY, CASCADE</span></td>
                    <td className="p-3 text-slate-200">Required foreign key referencing Subject. Cascaded on subject deletion.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-indigo-300">attendance_date</td>
                    <td className="p-3 font-mono text-slate-400">DateField</td>
                    <td className="p-3 font-mono text-slate-400">date</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">NOT NULL</span></td>
                    <td className="p-3 text-slate-200">Required date when attendance was marked.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-emerald-300">status</td>
                    <td className="p-3 font-mono text-slate-400">CharField(choices=[Present, Absent])</td>
                    <td className="p-3 font-mono text-slate-400">varchar(10)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">CHECK (Present | Absent)</span></td>
                    <td className="p-3 text-slate-200">Required status, strictly constrained to either &apos;Present&apos; or &apos;Absent&apos;.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-400">remarks</td>
                    <td className="p-3 font-mono text-slate-400">CharField(max_length=255)</td>
                    <td className="p-3 font-mono text-slate-400">varchar(255)</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">NULLABLE</span></td>
                    <td className="p-3 text-slate-200">Optional notes (e.g. &apos;Medical Leave&apos;, &apos;Late arrival&apos;).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Constraints Callout */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Database Constraints Enforced:</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>
                  &bull; <code className="text-amber-300 font-mono">UniqueConstraint(fields=[&apos;student&apos;, &apos;subject&apos;, &apos;attendance_date&apos;])</code>: Prevents marking duplicate attendance records for the same student in the same subject on the same day.
                </li>
                <li>
                  &bull; <code className="text-amber-300 font-mono">CheckConstraint(check=Q(status__in=[&apos;Present&apos;, &apos;Absent&apos;]))</code>: Enforces at the database table level that any inserted record contains only &apos;Present&apos; or &apos;Absent&apos;.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Database Relationships Explained in Simple Terms */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Database Relationships Explained Simply</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            How Student, Subject, and Attendance connect in plain college terms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
              <Users className="w-4 h-4" />
              <span>1. Student to Attendance</span>
            </div>
            <div className="text-xs font-mono text-indigo-300 font-bold">One-to-Many (1:N)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              One student can attend many class sessions throughout the semester. 
              Therefore, one <strong>Student</strong> row links to many <strong>Attendance</strong> rows via <code className="text-slate-300">student_id</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Table className="w-4 h-4" />
              <span>2. Subject to Attendance</span>
            </div>
            <div className="text-xs font-mono text-indigo-300 font-bold">One-to-Many (1:N)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              One subject course (e.g. Database Systems) has multiple attendance records logged across various dates for different students. 
              Hence, one <strong>Subject</strong> row links to many <strong>Attendance</strong> rows via <code className="text-slate-300">subject_id</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
              <Link className="w-4 h-4" />
              <span>3. Student & Subject via Attendance</span>
            </div>
            <div className="text-xs font-mono text-indigo-300 font-bold">Many-to-Many (M:N)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Many students enroll in many subjects. 
              The <strong>Attendance</strong> table acts as an associative junction entity connecting a Student, a Subject, a Date, and the Status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon
function Users(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
