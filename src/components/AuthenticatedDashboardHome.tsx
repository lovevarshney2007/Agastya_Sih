import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileSpreadsheet, 
  ExternalLink,
  RefreshCw,
  Bell,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  Database,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import { UserRole, StudentRecord, Institution, UploadBatch, ViolationCase, AuditLog, MainNavPage } from '../types';
import { Language } from '../data/translations';

interface AuthenticatedDashboardHomeProps {
  currentUserRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onSelectNavPage: (page: MainNavPage) => void;
  students: StudentRecord[];
  institutions: Institution[];
  batches: UploadBatch[];
  violations: ViolationCase[];
  auditLogs: AuditLog[];
  theme: 'dark' | 'light';
  language: Language;
  onLogout: () => void;
}

export const AuthenticatedDashboardHome: React.FC<AuthenticatedDashboardHomeProps> = ({
  currentUserRole,
  onSelectRole,
  onSelectNavPage,
  students,
  institutions,
  batches,
  violations,
  auditLogs,
  theme,
  language,
  onLogout
}) => {
  const isDark = theme === 'dark';
  const isHi = language === 'HI';

  // Search & filter state for recent records
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Verified' | 'Pending' | 'Flagged'>('ALL');
  const [selectedInstFilter, setSelectedInstFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 5;

  // Selected scope based on role
  const isInstitutionAdmin = currentUserRole === 'INSTITUTION';
  const isStudent = currentUserRole === 'STUDENT';
  const isVerifier = currentUserRole === 'VERIFIER';
  const isOfficer = currentUserRole === 'AICTE_OFFICER';
  const isSuperAdmin = currentUserRole === 'AICTE_SUPER_ADMIN';

  // Current institution if scoped
  const activeInstitution = institutions[0]; // Delhi Institute of Engineering & Technology (DIET)

  // Scoped dataset
  const scopedStudents = isInstitutionAdmin 
    ? students.filter(s => s.collegeId === activeInstitution.id)
    : isStudent
    ? students.filter(s => s.id === 'std-101')
    : students;

  // KPIs Calculation
  const totalRecords = scopedStudents.length;
  const verifiedRecords = scopedStudents.filter(s => s.verificationStatus === 'Verified').length;
  const pendingRecords = scopedStudents.filter(s => s.verificationStatus === 'Pending').length;
  const flaggedRecords = scopedStudents.filter(s => s.verificationStatus === 'Flagged').length;
  const duplicateCases = scopedStudents.filter(s => s.duplicateRisk !== 'NONE').length;
  const completionRate = totalRecords > 0 ? Math.round((verifiedRecords / totalRecords) * 100) : 0;

  // Filtered recent records
  const filteredRecords = scopedStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.apaarId.includes(searchTerm) ||
                          s.studentIdNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.verificationStatus === statusFilter;
    const matchesInst = selectedInstFilter === 'ALL' || s.collegeId === selectedInstFilter;
    return matchesSearch && matchesStatus && matchesInst;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const displayedRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // Verification Work Queue items
  const queueCases = isInstitutionAdmin
    ? batches.flatMap(b => b.issues.map(iss => ({
        id: iss.id,
        title: `${iss.ruleCode}: ${iss.studentName || 'Row #' + iss.rowNumber}`,
        subtitle: iss.explanation,
        severity: iss.severity,
        batch: b.filename,
        date: b.uploadDate.slice(0, 10),
        status: iss.status
      })))
    : violations.map(v => ({
        id: v.id,
        title: v.title,
        subtitle: v.description,
        severity: v.severity === 'CRITICAL' ? 'REJECT' : v.severity === 'HIGH' ? 'CRITICAL' : 'WARNING',
        batch: v.institutionA,
        date: v.reportedDate,
        status: v.status
      }));

  // Role labels
  const roleDisplayInfo = {
    INSTITUTION: {
      badge: isHi ? 'संस्थान पोर्टल' : 'Institution Portal',
      title: isHi ? 'कॉलेज प्रवेश एवं अपार सत्यापन कंसोल' : 'College Enrollment & Verification Console',
      sub: `${activeInstitution.name} (${activeInstitution.aicteCode})`,
      color: 'blue'
    },
    AICTE_OFFICER: {
      badge: isHi ? 'नियामक कमान' : 'Regulatory Command Desk',
      title: isHi ? 'एआईसीटीई क्षेत्रीय नियामक एवं अनुपालन कंसोल' : 'Regional Compliance & Intake Command Desk',
      sub: isHi ? 'अखिल भारतीय तकनीकी शिक्षा परिषद् • पश्चिम/दक्षिण क्षेत्र' : 'AICTE Regional Directorate • Western & Southern Regions',
      color: 'emerald'
    },
    AICTE_SUPER_ADMIN: {
      badge: isHi ? 'राष्ट्रीय नियंत्रण' : 'National Oversight Desk',
      title: isHi ? 'राष्ट्रीय अपार आर्किटेक्चर एवं ऑडिट लेजर' : 'National APAAR Architecture & Master Audit Ledger',
      sub: isHi ? 'समग्र अखिल भारतीय छात्र डेटा एवं काफ्का टेलीमेट्री' : 'Pan-India Student Telemetry & System Integration Health',
      color: 'purple'
    },
    VERIFIER: {
      badge: isHi ? 'सत्यापनकर्ता पोर्टल' : 'Authorized Verifier Desk',
      title: isHi ? 'शैक्षणिक साख पत्र एवं पृष्ठभूमि सत्यापन' : 'Academic Credential & Background Verification Desk',
      sub: isHi ? 'सहमति-आधारित डिजिटल सत्यापन' : 'Consent-Enforced Background Record Verification',
      color: 'amber'
    },
    STUDENT: {
      badge: isHi ? 'छात्र संप्रभु पोर्टल' : 'Student Sovereign Desk',
      title: isHi ? 'डिजिटल शैक्षणिक पहचान एवं सहमति कंसोल' : 'Academic Identity & Sovereign Consent Management',
      sub: 'Aarav Sharma • APAAR: 8920 1948 2019',
      color: 'blue'
    },
    PUBLIC_VERIFY: {
      badge: isHi ? 'सार्वजनिक सत्यापन' : 'Public Verification',
      title: isHi ? 'त्वरित प्रमाण पत्र वैधता जांच' : 'Instant Credential Attestation Check',
      sub: isHi ? 'बिना प्रकटीकरण न्यूनतम डेटा' : 'Zero-Knowledge Privacy Standard',
      color: 'blue'
    },
    ARCHITECTURE_MAP: {
      badge: 'Architecture',
      title: 'System Blueprint',
      sub: 'Architecture Overview',
      color: 'blue'
    }
  }[currentUserRole];

  return (
    <div className="space-y-6 sm:space-y-8 font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION A: HEADER & WELCOME AREA                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl border transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {roleDisplayInfo.badge}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isHi ? 'सिंक स्थिति: सक्रिय' : 'Sync: Active (14:30 IST)'}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {roleDisplayInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {roleDisplayInfo.sub}
            </p>
          </div>

          {/* Quick Context Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onSelectRole(currentUserRole);
                onSelectNavPage('PORTALS');
              }}
              className="px-4 py-2 rounded-xl bg-[#0b2559] hover:bg-[#113880] text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{isHi ? 'विस्तृत पोर्टल खोलें' : 'Open Full Workspace'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSelectNavPage('ANALYTICS')}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{isHi ? 'एनालिटिक्स' : 'Analytics'}</span>
            </button>

            <button
              onClick={() => onSelectNavPage('DOCUMENTATION')}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isHi ? 'दस्तावेज़' : 'API Docs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION B: KPI OVERVIEW                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>{isHi ? 'प्रशासनिक मुख्य प्रदर्शन संकेतक (KPIs)' : 'Core Verification & Enrollment Metrics'}</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            {isHi ? 'वास्तविक रिकॉर्ड टेलीमेट्री' : 'Live Repository Telemetry'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Records */}
          <div 
            onClick={() => setStatusFilter('ALL')}
            className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 hover:border-blue-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                {isHi ? 'कुल छात्र' : 'Total Students'}
              </span>
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
              {totalRecords}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {isInstitutionAdmin ? 'Institue Enrolled' : 'Repository Records'}
            </span>
          </div>

          {/* Card 2: Verified */}
          <div 
            onClick={() => setStatusFilter('Verified')}
            className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 hover:border-emerald-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400">
                {isHi ? 'सत्यापित' : 'Verified'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {verifiedRecords}
            </p>
            <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
              12-Digit & ABC Matched
            </span>
          </div>

          {/* Card 3: Pending */}
          <div 
            onClick={() => setStatusFilter('Pending')}
            className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
                {isHi ? 'प्रतीक्षारत' : 'Pending'}
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {pendingRecords}
            </p>
            <span className="text-[10px] text-amber-600/80 mt-0.5 block">
              Awaiting Verification
            </span>
          </div>

          {/* Card 4: Flagged */}
          <div 
            onClick={() => setStatusFilter('Flagged')}
            className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 hover:border-rose-400 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-rose-700 dark:text-rose-400">
                {isHi ? 'उल्लंघन/त्रुटि' : 'Flagged'}
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {flaggedRecords}
            </p>
            <span className="text-[10px] text-rose-600/80 mt-0.5 block">
              Needs Immediate Review
            </span>
          </div>

          {/* Card 5: Duplicate Risks */}
          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-700 dark:text-purple-400">
                {isHi ? 'दोहरा जोखिम' : 'Duplicates'}
              </span>
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
              {duplicateCases}
            </p>
            <span className="text-[10px] text-purple-600/80 mt-0.5 block">
              Cross-College Scans
            </span>
          </div>

          {/* Card 6: Completion Rate */}
          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-700 dark:text-blue-400">
                {isHi ? 'सत्यापन दर' : 'Completion Rate'}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 block">
              {verifiedRecords} of {totalRecords} records verified
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION C: ROLE-AUTHORIZED QUICK ACTIONS                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>{isHi ? 'त्वरित प्रशासनिक कार्य (Quick Shortcuts)' : 'Authorized Operational Quick Actions'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => {
              onSelectRole('INSTITUTION');
              onSelectNavPage('PORTALS');
            }}
            className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-left transition-all cursor-pointer group"
          >
            <PlusCircle className="w-4 h-4 text-blue-700 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'छात्र जोड़ें' : 'Add Student'}
            </span>
            <span className="text-[10px] text-slate-500 block">Single enrollment</span>
          </button>

          <button
            onClick={() => {
              onSelectRole('INSTITUTION');
              onSelectNavPage('PORTALS');
            }}
            className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-left transition-all cursor-pointer group"
          >
            <Upload className="w-4 h-4 text-amber-700 dark:text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'बैच अपलोड' : 'Bulk Upload'}
            </span>
            <span className="text-[10px] text-slate-500 block">CSV/Excel parser</span>
          </button>

          <button
            onClick={() => {
              onSelectRole('VERIFIER');
              onSelectNavPage('PORTALS');
            }}
            className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-left transition-all cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'सत्यापन कतार' : 'Review Queue'}
            </span>
            <span className="text-[10px] text-slate-500 block">Consent verification</span>
          </button>

          <button
            onClick={() => {
              onSelectRole('AICTE_OFFICER');
              onSelectNavPage('PORTALS');
            }}
            className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-left transition-all cursor-pointer group"
          >
            <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'उल्लंघन समाधान' : 'Resolve Duplicates'}
            </span>
            <span className="text-[10px] text-slate-500 block">Dual seat cases</span>
          </button>

          <button
            onClick={() => onSelectNavPage('ANALYTICS')}
            className="p-3 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-left transition-all cursor-pointer group"
          >
            <BarChart3 className="w-4 h-4 text-purple-700 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'रिपोर्ट जनरेट करें' : 'Generate Reports'}
            </span>
            <span className="text-[10px] text-slate-500 block">Intake & state trends</span>
          </button>

          <button
            onClick={() => {
              onSelectRole('AICTE_SUPER_ADMIN');
              onSelectNavPage('PORTALS');
            }}
            className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-left transition-all cursor-pointer group"
          >
            <Database className="w-4 h-4 text-slate-700 dark:text-slate-300 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {isHi ? 'ऑडिट लेजर' : 'Audit Logs'}
            </span>
            <span className="text-[10px] text-slate-500 block">Cryptographic trace</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION D: RECENT STUDENT RECORDS (FUNCTIONAL DATA TABLE)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{isHi ? 'नवीनतम छात्र रिकॉर्ड्स एवं सत्यापन स्थिति' : 'Recent Student Records & Verification Registry'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'मास्क्ड अपार आईडी, शाखा, संस्थान एवं सत्यापन फ़िल्टर' : 'Masked APAAR IDs, branch allocation, compliance flags, and action triggers'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Showing {displayedRecords.length} of {filteredRecords.length}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t dark:border-slate-800 border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isHi ? "नाम, अपार आईडी, रोल नंबर या ब्रांच से खोजें..." : "Search by student name, APAAR ID, roll no, or program..."}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl text-xs font-semibold dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Flagged">Flagged Only</option>
            </select>

            {!isInstitutionAdmin && (
              <select
                value={selectedInstFilter}
                onChange={(e) => { setSelectedInstFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 dark:text-white text-slate-900 focus:outline-none max-w-[180px] truncate"
              >
                <option value="ALL">All Institutions</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name.split(' ')[0]}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border dark:border-slate-800 border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-slate-950 bg-slate-100/80 text-[10px] font-mono font-bold uppercase text-slate-500 border-b dark:border-slate-800 border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Masked APAAR ID</th>
                <th className="px-4 py-3">Institution & Program</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 divide-slate-100 font-medium">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No student records match the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((s) => {
                  const maskedApaar = `XXXX-XXXX-${s.apaarId.slice(-4)}`;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <span className="text-[10px] font-mono text-slate-400">Roll: {s.studentIdNo}</span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                        {maskedApaar}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={s.collegeName}>
                          {s.collegeName}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                          {s.program} ({s.academicYear})
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.seatCategory}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-flex items-center space-x-1 ${
                          s.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : s.verificationStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          <span>{s.verificationStatus}</span>
                          {s.duplicateRisk !== 'NONE' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-1" title="Duplicate risk detected"></span>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectRole('PUBLIC_VERIFY');
                            onSelectNavPage('PORTALS');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border text-xs font-semibold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION E & G: WORK QUEUE & INTAKE COMPLIANCE                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Queue */}
        <div className="p-5 sm:p-6 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>{isHi ? 'सत्यापन कार्य कतार (Work Queue)' : 'Verification Work Queue & Actionable Cases'}</span>
            </h3>
            <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-full">
              {queueCases.length} Pending
            </span>
          </div>

          <div className="space-y-2.5">
            {queueCases.slice(0, 4).map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.severity === 'REJECT'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : item.severity === 'CRITICAL'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {item.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.subtitle}</p>

                <div className="pt-2 flex items-center justify-between border-t dark:border-slate-800 border-slate-200/60 text-[10px]">
                  <span className="font-mono text-slate-500">Scope: {item.batch}</span>
                  <button
                    onClick={() => {
                      onSelectRole('AICTE_OFFICER');
                      onSelectNavPage('PORTALS');
                    }}
                    className="font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>Inspect Case</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intake & Compliance Overview */}
        <div className="p-5 sm:p-6 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>{isHi ? 'स्वीकृत प्रवेश एवं कोटा अनुपालन' : 'Sanctioned Intake & Quota Compliance'}</span>
            </h3>
            <button
              onClick={() => onSelectNavPage('COMPLIANCE_STANDARDS')}
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              APH Guidelines
            </button>
          </div>

          <div className="space-y-3">
            {institutions.slice(0, 3).map((inst) => {
              const percentage = Math.round((inst.currentEnrolment / inst.approvedIntake) * 100);
              const isBreach = inst.complianceStatus === 'Breached';
              const isWarning = inst.complianceStatus === 'Warning';

              return (
                <div key={inst.id} className="p-3.5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[240px]">
                        {inst.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{inst.state} • Code: {inst.aicteCode}</span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isBreach 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : isWarning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {inst.complianceStatus} ({percentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${
                        isBreach ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Enrolled: {inst.currentEnrolment} / Intake: {inst.approvedIntake}</span>
                    <span>Supernumerary: {inst.supernumeraryUsed} / {inst.supernumeraryQuota}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION H: RECENT ACTIVITY & AUDIT CHAIN                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {isHi ? 'हालिया प्रशासनिक गतिविधि एवं ऑडिट ट्रेल' : 'Recent Administrative Activity & Audit Hash Trail'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Cryptographically Chained</span>
        </div>

        <div className="space-y-2">
          {auditLogs.slice(0, 4).map((log) => (
            <div 
              key={log.id} 
              className="p-3 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{log.actor}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {log.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{log.details}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 block">{log.timestamp}</span>
                <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold block">{log.hash.slice(0, 16)}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
