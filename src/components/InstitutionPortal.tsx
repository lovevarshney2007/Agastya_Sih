import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  PlusCircle, 
  Download, 
  Building,
  UserCheck,
  AlertOctagon,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { StudentRecord, Institution, UploadBatch } from '../types';
import { institutionApi, reportsApi } from '../api/client';
import { Language, TRANSLATIONS } from '../data/translations';

interface InstitutionPortalProps {
  students: StudentRecord[];
  institutions: Institution[];
  batches: UploadBatch[];
  onUploadCsv: (file: File) => void;
  onAddStudent: (newStudent: Partial<StudentRecord>) => void;
  onResolveIssue: (issueId: string) => void;
  institutionId: string | null;
  language?: Language;
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({
  students,
  institutions,
  batches,
  onUploadCsv,
  onAddStudent,
  onResolveIssue,
  institutionId,
  language = 'EN',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;
  const [selectedInstId, setSelectedInstId] = useState<string>('inst-1');
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'UPLOAD_WIZARD' | 'VALIDATION_REPORTS' | 'COMPLIANCE'>('REGISTRY');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Backend state ─────────────────────────────────────────────────────────
  const [apiDashboard, setApiDashboard] = useState<Record<string, unknown> | null>(null);
  const [apiStudents, setApiStudents] = useState<Record<string, unknown>[] | null>(null);
  const [apiLastBatch, setApiLastBatch] = useState<Record<string, unknown> | null>(null);
  const [activeBatchReport, setActiveBatchReport] = useState<Record<string, unknown> | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<Record<string, unknown> | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // institutionId comes from sessionUser.institution_id (set during login JWT)
  // If null, the user needs to re-authenticate to get their institution_id in the session
  const activeInstId = institutionId;

  // Load dashboard and student list from backend on mount (or when activeInstId changes)
  const loadBackendData = useCallback(async () => {
    if (!activeInstId) {
      setApiError('Institution ID not found in session. Please log in again using Institution Registrar credentials.');
      return;
    }
    setApiLoading(true);
    setApiError(null);
    try {
      const [dash, studs] = await Promise.all([
        institutionApi.dashboard(activeInstId) as Promise<Record<string, unknown>>,
        institutionApi.getStudents(activeInstId) as Promise<Record<string, unknown>>,
      ]);
      setApiDashboard(dash);
      setApiStudents((studs as Record<string, unknown[]>).students as Record<string, unknown>[]);

      // Check if dashboard has latest_batch and fetch live report if not yet set
      const latestBatch = dash.latest_batch as Record<string, unknown> | undefined;
      if (latestBatch?.batch_id) {
        try {
          const report = await institutionApi.getBatchReport(activeInstId, latestBatch.batch_id as string) as Record<string, unknown>;
          setActiveBatchReport(report);
        } catch {
          // ignore report fetch errors
        }
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to load backend data');
    } finally {
      setApiLoading(false);
    }
  }, [activeInstId]);

  useEffect(() => { loadBackendData(); }, [loadBackendData]);
  // ─────────────────────────────────────────────────────────────────────────

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    apaarId: '',
    dob: '',
    gender: 'M',
    course: 'Computer Science and Engineering',
    studentIdNo: '',
    seatCategory: 'General',
  });

  const currentInstitution = institutions.find(i => i.id === selectedInstId) || institutions[0];
  const institutionStudents = students.filter(s => s.collegeId === currentInstitution.id);

  // Merge live API students with mock fallback
  const displayStudents = useMemo<StudentRecord[]>(() => {
    if (apiStudents && apiStudents.length > 0) {
      return apiStudents.map((s, idx) => ({
        id: (s.enrolment_id as string) || `api-${idx}`,
        apaarId: (s.masked_apaar as string) || '••••••••0000',
        name: (s.student_id_no as string) ? `Student (${s.student_id_no})` : 'Enrolled Student',
        dob: 'Verified in Vault',
        gender: ((s.gender as 'M' | 'F' | 'O') || 'M'),
        collegeId: activeInstId || 'inst',
        collegeName: (apiDashboard?.institution as Record<string, string>)?.name || currentInstitution.name,
        program: (s.course as string) || 'Engineering & Technology',
        branch: ((s.course as string) || '').includes('AI') ? 'AI-DS' : ((s.course as string) || '').includes('Computer') ? 'CSE' : 'Engineering',
        academicYear: String(s.academic_year || '2026'),
        seatCategory: ((s.seat_category as StudentRecord['seatCategory']) || 'General'),
        enrolmentStatus: (s.status as string) === 'ACTIVE' ? 'Active' as const : 'Disputed' as const,
        verificationStatus: (s.identity_status as string) === 'VERIFIED' ? 'Verified' as const : 'Flagged' as const,
        duplicateRisk: (s.identity_status as string) === 'FLAGGED' ? 'CROSS_INSTITUTION' as const : 'NONE' as const,
        admissionDate: '2026-08-15',
        studentIdNo: (s.student_id_no as string) || `STU-${idx}`,
        aadhaarStatus: 'Not Stored (Privacy Preserved)',
        consentGranted: true,
        version: Number(s.version || 1),
        digitalCredentialId: `AICTE-VC-${String(s.enrolment_id || idx).slice(0, 8).toUpperCase()}`,
        isSupernumerary: Boolean(s.is_supernumerary)
      }));
    }
    return institutionStudents;
  }, [apiStudents, institutionStudents, activeInstId, apiDashboard, currentInstitution]);

  const filteredStudents = displayStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.apaarId.includes(searchQuery) || 
                          s.studentIdNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || s.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  const kpiData = (apiDashboard?.kpis as Record<string, number>) || null;
  const totalApprovedIntake = kpiData?.approved_intake ?? currentInstitution.approvedIntake;
  const totalEnrolled = kpiData?.total_enrolled ?? displayStudents.length;
  const verifiedCount = kpiData 
    ? Math.round(((kpiData.identity_verified_pct ?? 100) / 100) * totalEnrolled)
    : displayStudents.filter(s => s.verificationStatus === 'Verified').length;
  const flaggedCount = kpiData?.open_issues_count ?? displayStudents.filter(s => s.verificationStatus === 'Flagged').length;
  const supernumeraryUsed = kpiData?.supernumerary_count ?? currentInstitution.supernumeraryUsed;

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleApiUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleApiUpload(file);
    }
  };

  const handleApiUpload = async (file: File) => {
    if (!activeInstId) { setApiError('Session missing institution_id. Please re-login.'); return; }
    setUploadLoading(true);
    setUploadResult(null);
    setApiError(null);
    try {
      const result = await institutionApi.uploadBatch(activeInstId, file) as Record<string, unknown>;
      setUploadResult(result);
      setApiLastBatch(result);

      const batchId = result.batch_id as string;
      if (batchId) {
        try {
          const report = await institutionApi.getBatchReport(activeInstId, batchId) as Record<string, unknown>;
          setActiveBatchReport(report);
        } catch {
          setActiveBatchReport({
            batch_id: batchId,
            filename: file.name,
            status: result.status || 'READY_TO_COMMIT',
            created_at: new Date().toISOString(),
            counts: result.summary,
            issues: []
          });
        }
      }

      await loadBackendData();
      setActiveTab('VALIDATION_REPORTS');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDemoBatchUpload = async () => {
    if (!activeInstId) { setApiError('Session missing institution_id. Please re-login.'); return; }
    setUploadLoading(true);
    setUploadResult(null);
    setApiError(null);
    try {
      const result = await institutionApi.uploadDemoBatch(activeInstId) as Record<string, unknown>;
      setUploadResult(result);
      setApiLastBatch(result);

      const batchId = result.batch_id as string;
      if (batchId) {
        try {
          const report = await institutionApi.getBatchReport(activeInstId, batchId) as Record<string, unknown>;
          setActiveBatchReport(report);
        } catch {
          setActiveBatchReport({
            batch_id: batchId,
            filename: 'demo_admission_round_2026.csv',
            status: result.status || 'READY_TO_COMMIT',
            created_at: new Date().toISOString(),
            counts: result.summary,
            issues: []
          });
        }
      }

      await loadBackendData();
      setActiveTab('VALIDATION_REPORTS');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Demo upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCommitBatch = async (batchId: string) => {
    if (!activeInstId) { setApiError('Session missing institution_id. Please re-login.'); return; }
    try {
      await institutionApi.commitBatch(activeInstId, batchId);
      await loadBackendData();
      if (activeBatchReport) {
        setActiveBatchReport({ ...activeBatchReport, status: 'COMMITTED' });
      }
      setUploadResult(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Commit failed');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollLoading(true);
    setEnrollMsg(null);
    if (institutionId) {
      // Real API enrolment
      try {
        const result = await institutionApi.enrollStudent(institutionId, {
          apaar_id: formData.apaarId,
          student_id_no: formData.studentIdNo,
          name: formData.name,
          dob: formData.dob,
          course: formData.course,
          year_of_study: 1,
          mode: 'FULL_TIME',
          seat_category: formData.seatCategory,
          is_supernumerary: false,
          nationality: 'Indian',
        }) as Record<string, unknown>;
        setEnrollMsg({ ok: true, text: (result.message as string) || 'Student enrolled successfully!' });
        await loadBackendData();
        setTimeout(() => { setShowAddModal(false); setEnrollMsg(null); }, 2000);
      } catch (err) {
        setEnrollMsg({ ok: false, text: err instanceof Error ? err.message : 'Enrolment failed' });
      } finally {
        setEnrollLoading(false);
      }
    } else {
      // Fallback: local mock
      onAddStudent({
        name: formData.name,
        apaarId: formData.apaarId,
        dob: formData.dob,
        gender: 'M',
        collegeId: currentInstitution.id,
        collegeName: currentInstitution.name,
        program: formData.course,
        branch: 'CSE',
        academicYear: '2025-26',
        seatCategory: formData.seatCategory as StudentRecord['seatCategory'],
        enrolmentStatus: 'Active',
        verificationStatus: formData.apaarId.length === 12 ? 'Verified' : 'Flagged',
        duplicateRisk: 'NONE',
        admissionDate: new Date().toISOString().split('T')[0],
        studentIdNo: formData.studentIdNo,
        aadhaarStatus: 'Not Stored (Privacy Preserved)',
        consentGranted: true,
        version: 1
      });
      setEnrollLoading(false);
      setShowAddModal(false);
    }
    setFormData({
      name: '',
      apaarId: '',
      dob: '',
      gender: 'M',
      course: 'Computer Science and Engineering',
      studentIdNo: '',
      seatCategory: 'General',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900/90 dark:border-slate-800 bg-white border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <Building className="w-4 h-4" />
            <span>AICTE CODE: {currentInstitution.aicteCode}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">{currentInstitution.type} College</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentInstitution.name}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            State: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.state}</span> | District: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.district}</span> | Official Email: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentInstitution.contactEmail}</span>
          </p>
        </div>

        {/* Institution Switcher */}
        <div className="flex items-center space-x-3 dark:bg-slate-800 bg-slate-50 p-2 rounded-xl border dark:border-slate-700 border-slate-200">
          <label className="text-xs text-slate-600 dark:text-slate-400 font-bold">Switch College:</label>
          <select 
            value={selectedInstId} 
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="dark:bg-slate-900 bg-white dark:text-white text-slate-900 text-xs font-medium rounded-lg px-3 py-1.5 border dark:border-slate-600 border-slate-300 focus:outline-none"
          >
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.complianceStatus})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Live Backend Data Banner ─────────────────────────────────────────── */}
      {institutionId && (
        <div className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
          apiError
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            : apiLoading
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {apiLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Loading live data from backend…</span></>
              : apiError
              ? <><AlertOctagon className="w-3.5 h-3.5" /><span>Backend error: {apiError} — showing mock data</span></>
              : <><CheckCircle2 className="w-3.5 h-3.5" /><span>Live data from <strong>sih.monu14.me</strong> · {(apiDashboard?.as_of as string) || ''}</span></>
            }
          </div>
          <button onClick={loadBackendData} className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-current hover:opacity-80 cursor-pointer transition-opacity">
            <RefreshCw className="w-3 h-3" /><span>Refresh</span>
          </button>
        </div>
      )}

      {/* ── Upload Result Banner ──────────────────────────────────────────────── */}
      {uploadResult && (
        <div className="rounded-xl border bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 px-4 py-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-800 dark:text-blue-300 font-mono flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>Batch #{(uploadResult.batch_id as string)?.slice(-8)} — {uploadResult.status as string}</span>
            </span>
            {uploadResult.status === 'READY_TO_COMMIT' && Boolean(uploadResult.batch_id) && (
              <button onClick={() => handleCommitBatch(uploadResult.batch_id as string)} className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Commit to Ledger</span>
              </button>
            )}
          </div>
          {Boolean(uploadResult.summary) && (
            <div className="mt-2 flex flex-wrap gap-3 text-slate-700 dark:text-slate-300">
              {Object.entries((uploadResult.summary as Record<string, number | string>) || {}).map(([k, v]) => (
                <span key={k}><span className="text-slate-500 font-normal capitalize">{k.replace(/_/g, ' ')}: </span><strong>{String(v)}</strong></span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Intake</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalApprovedIntake} <span className="text-xs text-slate-500 font-normal">seats</span></p>
            <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-mono font-bold">
              Enrolled: {totalEnrolled} / {totalApprovedIntake}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">APAAR Verified</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{verifiedCount}</p>
            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>12-digit checks PASS</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duplicate / Flagged</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{flaggedCount}</p>
            <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center space-x-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Multi-college dual check</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="dark:bg-slate-900/90 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Status</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md font-mono ${
                currentInstitution.complianceStatus === 'Compliant'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : currentInstitution.complianceStatus === 'Warning'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {currentInstitution.complianceStatus.toUpperCase()}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              NRI/Supernumerary: {supernumeraryUsed}/{currentInstitution.supernumeraryQuota}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs — horizontally scrollable on small screens */}
      <div className="overflow-x-auto -mx-1">
        <div className="flex items-center space-x-1 border-b dark:border-slate-800 border-slate-200 pb-0 min-w-max px-1">
          <button
            onClick={() => setActiveTab('REGISTRY')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              activeTab === 'REGISTRY'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            {t.instTabRegistry || 'Student Registry'} ({filteredStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('UPLOAD_WIZARD')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'UPLOAD_WIZARD'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.instTabUpload || 'Batch Upload'}</span>
          </button>
          <button
            onClick={() => setActiveTab('VALIDATION_REPORTS')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap flex items-center space-x-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'VALIDATION_REPORTS'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t.instTabValidation || 'Validation Reports'} ({batches[0]?.issues.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              activeTab === 'COMPLIANCE'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            {t.instTabCompliance || 'Compliance'}
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT REGISTRY */}
      {activeTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-900 bg-white p-4 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by APAAR ID, Student Name, Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="dark:bg-slate-800 bg-white border dark:border-slate-700 border-slate-300 text-xs font-semibold dark:text-slate-300 text-slate-700 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="AI-DS">AI-DS</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
              </select>

              {activeInstId && (
                <button
                  onClick={() => window.open(reportsApi.institutionCsvUrl(activeInstId), '_blank')}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  title="Export official compliance report CSV from backend"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Compliance CSV</span>
                </button>
              )}

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Single Student Entry</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="dark:bg-slate-950 bg-slate-50 border-b dark:border-slate-800 border-slate-200 text-slate-600 dark:text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Student & ID</th>
                  <th className="py-3 px-4 font-bold">12-Digit APAAR ID</th>
                  <th className="py-3 px-4 font-bold">Program / Branch</th>
                  <th className="py-3 px-4 font-bold">Quota / Category</th>
                  <th className="py-3 px-4 font-bold">Verification State</th>
                  <th className="py-3 px-4 font-bold">Duplicate Integrity</th>
                  <th className="py-3 px-4 font-bold text-right">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800 divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No student records match the active criteria.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-[13px]">{student.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">{student.studentIdNo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md dark:bg-slate-800 bg-blue-50 border dark:border-slate-700 border-blue-200 text-blue-700 dark:text-blue-300 font-mono font-bold">
                          <span>{student.apaarId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{student.branch}</div>
                        <div className="text-[10px] text-slate-500">{student.academicYear}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium dark:bg-slate-800 bg-slate-100 text-slate-700 dark:text-slate-300 border dark:border-slate-700 border-slate-200">
                          {student.seatCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          student.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : student.verificationStatus === 'Pending'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {student.verificationStatus === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                          {student.verificationStatus === 'Flagged' && <AlertTriangle className="w-3 h-3" />}
                          <span>{student.verificationStatus}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.duplicateRisk === 'CROSS_INSTITUTION' ? (
                          <div className="text-rose-600 dark:text-rose-400 flex items-start space-x-1">
                            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold">Dual-College Enrolment</span>
                              <p className="text-[10px] text-rose-500/80">{student.crossCollegeDetails}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Unique Active</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-blue-700 dark:text-blue-400 font-mono font-bold">v{student.version}.0</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD WIZARD */}
      {activeTab === 'UPLOAD_WIZARD' && (
        <div className="space-y-6">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Step-by-Step Batch Ingestion Pipeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Download the official AICTE APAAR template, verify columns, and submit. The backend pipeline runs 12-digit format check, APAAR Adapter mock validation, intake quota limit checks, and cross-institution duplicate matching.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Download Template</h4>
                  <p className="text-xs text-slate-500 mt-1">Get pre-formatted CSV/XLSX with exact required schema headers.</p>
                  <button 
                    onClick={() => window.open(reportsApi.admissionTemplateUrl(), '_blank')}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border dark:border-slate-700 border-slate-300 cursor-pointer shadow-xs hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official CSV Template</span>
                  </button>
                </div>
              </div>

              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Verify Intake Details</h4>
                  <p className="text-xs text-slate-500 mt-1">Academic Year 2025-26. Approved capacity check active.</p>
                  <div className="mt-3 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded border dark:border-slate-800 border-slate-200">
                    Max Intake: {currentInstitution.approvedIntake} seats
                  </div>
                </div>
              </div>

              <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">Zero-Aadhaar Pipeline</h4>
                  <p className="text-xs text-slate-500 mt-1">Row-by-row parsing, duplicate check, and tamper-proof hashing.</p>
                  <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                    Zero-Aadhaar • Tamper-proof
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop File Zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed dark:border-slate-700 border-blue-300 dark:hover:border-blue-500 hover:border-blue-600 dark:bg-slate-950/60 bg-blue-50/40 rounded-2xl p-8 text-center transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv, .xlsx"
                onChange={handleFileInput}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {uploadLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {uploadLoading ? 'Uploading & validating…' : 'Click to upload or drag & drop CSV / Excel file'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Supported formats: CSV, XLSX (Up to 10MB per batch). Automated background queue processes batches up to 50,000 rows.
                </p>
                <div className="mt-4 px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-mono font-bold">
                  {institutionId ? '🔴 LIVE — will POST to sih.monu14.me API' : 'Upload triggers automatic row validation report'}
                </div>
              </label>
            </div>

            {/* Quick Demo Batch Upload for Evaluators */}
            {institutionId && (
              <div className="mt-4 p-4 rounded-xl dark:bg-slate-950/80 bg-blue-50/70 border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center space-x-1.5">
                    <span>⚡ Quick Evaluator Demo Batch Upload</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-mono">POST /upload-demo</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    No CSV file ready? 1-Click test: Streams 11 admission records through the backend ledger, runs quota checks and duplicate detection.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={handleDemoBatchUpload}
                  className="shrink-0 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
                >
                  {uploadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Run 1-Click Demo Upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VALIDATION REPORTS */}
      {activeTab === 'VALIDATION_REPORTS' && (
        <div className="space-y-6">
          {/* LIVE BACKEND BATCH REPORT */}
          {activeBatchReport ? (
            <div className="dark:bg-slate-900 bg-white border-2 dark:border-blue-700/80 border-blue-500 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200 gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      🔴 LIVE BACKEND BATCH
                    </span>
                    <span>BATCH ID: {String(activeBatchReport.batch_id).slice(-8)}</span>
                    <span>•</span>
                    <span>{new Date(String(activeBatchReport.created_at || Date.now())).toLocaleString()}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {String(activeBatchReport.filename || 'Admissions_Batch.csv')}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      STATUS: {String(activeBatchReport.status || 'READY_TO_COMMIT')}
                    </span>
                    {activeBatchReport.status === 'READY_TO_COMMIT' && (
                      <button
                        onClick={() => handleCommitBatch(String(activeBatchReport.batch_id))}
                        className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-sm flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>✅ Commit to Immutable Ledger</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-center px-3 py-1.5 dark:bg-slate-950 bg-slate-100 rounded-lg border dark:border-slate-800 border-slate-200">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Total</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {Number((activeBatchReport.counts as Record<string, number>)?.total ?? (activeBatchReport.summary as Record<string, number>)?.total_rows ?? 0)}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold">Accepted</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {Number((activeBatchReport.counts as Record<string, number>)?.accepted ?? (activeBatchReport.summary as Record<string, number>)?.accepted ?? 0)}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block uppercase font-bold">Warnings/Holds</span>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
                      {Number((activeBatchReport.counts as Record<string, number>)?.warnings ?? 0) + 
                       Number((activeBatchReport.counts as Record<string, number>)?.holds ?? (activeBatchReport.summary as Record<string, number>)?.on_hold ?? 0)}
                    </span>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800/40">
                    <span className="text-[10px] text-rose-700 dark:text-rose-400 block uppercase font-bold">Rejected</span>
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-400 font-mono">
                      {Number((activeBatchReport.counts as Record<string, number>)?.rejected ?? (activeBatchReport.summary as Record<string, number>)?.rejected ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row-Level Errors from Backend Rule Engine */}
              <div className="mt-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 font-bold flex items-center justify-between">
                  <span>Detailed Row-Level Rule Engine Inspection (Live Backend Output)</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {((activeBatchReport.issues as Record<string, unknown>[]) || []).length} Rule Anomalies Detected
                  </span>
                </h4>
                {((activeBatchReport.issues as Record<string, unknown>[]) || []).length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ✅ All rows passed schema and quota validation. Ready to be committed into the national ledger.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {((activeBatchReport.issues as Record<string, unknown>[]) || []).map((iss, idx) => (
                      <div 
                        key={String(iss.issue_id || idx)}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          iss.severity === 'REJECT' || iss.severity === 'Error' || iss.row_decision === 'REJECT'
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                            : iss.severity === 'CRITICAL' || iss.severity === 'Critical'
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                            : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              iss.severity === 'REJECT' || iss.severity === 'Error' || iss.row_decision === 'REJECT'
                                ? 'bg-rose-700 text-white'
                                : iss.severity === 'CRITICAL' || iss.severity === 'Critical'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-700 text-white'
                            }`}>
                              {String(iss.row_decision || iss.severity || 'FLAGGED')}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                              Row #{String(iss.row_number)}
                            </span>
                            {Boolean(iss.student_id_no) && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                                  {String(iss.student_id_no)}
                                </span>
                              </>
                            )}
                            {Boolean(iss.masked_apaar) && (
                              <span className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded font-bold">
                                APAAR: {String(iss.masked_apaar)}
                              </span>
                            )}
                            {Boolean(iss.rule_id) && (
                              <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                {String(iss.rule_id)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                            {String(iss.message || '')}
                          </p>
                          {Boolean(iss.suggested_fix) && (
                            <p className="text-xs text-slate-500 italic">
                              Suggested Action: <span className="text-blue-700 dark:text-blue-400 not-italic font-semibold">{String(iss.suggested_fix)}</span>
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center space-x-2">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold">
                            Decision: {String(iss.row_decision || 'HOLD')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Fallback to archived batches */
            batches.map((batch) => (
              <div key={batch.id} className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b dark:border-slate-800 border-slate-200 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
                      <span>BATCH ID: {batch.id}</span>
                      <span>•</span>
                      <span>{batch.uploadDate}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{batch.filename}</h3>
                    <p className="text-xs text-slate-500">{batch.program} ({batch.academicYear})</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-center px-3 py-1.5 dark:bg-slate-950 bg-slate-100 rounded-lg border dark:border-slate-800 border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Total</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{batch.totalRows}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold">Accepted</span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{batch.acceptedRows}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/40">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block uppercase font-bold">Warnings</span>
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">{batch.warningRows}</span>
                    </div>
                    <div className="text-center px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800/40">
                      <span className="text-[10px] text-rose-700 dark:text-rose-400 block uppercase font-bold">Rejected</span>
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400 font-mono">{batch.rejectedRows}</span>
                    </div>
                  </div>
                </div>

                {/* Row-Level Errors */}
                <div className="mt-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 font-bold">
                    Detailed Row-Level Rule Engine Inspection
                  </h4>
                  <div className="space-y-3">
                    {batch.issues.map((issue) => (
                      <div 
                        key={issue.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          issue.severity === 'REJECT'
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                            : issue.severity === 'CRITICAL'
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                            : 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              issue.severity === 'REJECT'
                                ? 'bg-rose-700 text-white'
                                : issue.severity === 'CRITICAL'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-700 text-white'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Row #{issue.rowNumber}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{issue.studentName}</span>
                            {issue.apaarId && (
                              <span className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded font-bold">
                                {issue.apaarId}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{issue.explanation}</p>
                          <p className="text-xs text-slate-500 italic">
                            Suggested Action: <span className="text-blue-700 dark:text-blue-400 not-italic font-semibold">{issue.suggestedCorrection}</span>
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center space-x-2">
                          {issue.status === 'RESOLVED' ? (
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-mono font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolved</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onResolveIssue(issue.id)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-300 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              Mark Corrected
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: COMPLIANCE PANEL */}
      {activeTab === 'COMPLIANCE' && (
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AICTE Approval Process Handbook (APH) Compliance Monitor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Real-time monitoring of seat caps, NRI/FN quotas, supernumerary allowances, and duplicate-free enrolments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-slate-950 bg-slate-50 p-5 rounded-xl border dark:border-slate-800 border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                <span>Sanctioned Capacity Utilization</span>
                <span className="text-xs font-mono text-blue-700 dark:text-blue-400 font-bold">
                  {Math.round((currentInstitution.currentEnrolment / currentInstitution.approvedIntake) * 100)}%
                </span>
              </h4>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    currentInstitution.currentEnrolment > currentInstitution.approvedIntake 
                      ? 'bg-rose-500' 
                      : 'bg-blue-700'
                  }`}
                  style={{ width: `${Math.min(100, (currentInstitution.currentEnrolment / currentInstitution.approvedIntake) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>Current: {currentInstitution.currentEnrolment} Students</span>
                <span>Max Sanctioned: {currentInstitution.approvedIntake}</span>
              </div>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-5 rounded-xl border dark:border-slate-800 border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                <span>Supernumerary (NRI/OCI/FN) Quota</span>
                <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400 font-bold">
                  {currentInstitution.supernumeraryUsed} / {currentInstitution.supernumeraryQuota}
                </span>
              </h4>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600"
                  style={{ width: `${(currentInstitution.supernumeraryUsed / currentInstitution.supernumeraryQuota) * 100}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
                <span>Utilized: {currentInstitution.supernumeraryUsed} seats</span>
                <span>Max Allowed (10% cap): {currentInstitution.supernumeraryQuota}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE STUDENT ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Individual Student Enrolment</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Full Legal Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">12-Digit APAAR ID</label>
                  <input 
                    type="text"
                    required
                    maxLength={12}
                    value={formData.apaarId}
                    onChange={(e) => setFormData({...formData, apaarId: e.target.value})}
                    placeholder="12 digits"
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Date of Birth</label>
                  <input 
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">College Roll / Reg No.</label>
                  <input 
                    type="text"
                    required
                    value={formData.studentIdNo}
                    onChange={(e) => setFormData({...formData, studentIdNo: e.target.value})}
                    placeholder="e.g. 2025-CSE-091"
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Seat Category</label>
                  <select
                    value={formData.seatCategory}
                    onChange={(e) => setFormData({...formData, seatCategory: e.target.value})}
                    className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="TFW">TFW</option>
                    <option value="Supernumerary (NRI/FN)">Supernumerary (NRI/FN)</option>
                  </select>
                </div>
              </div>

              {/* Course input */}
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">Course / Program</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg px-3 py-2 text-xs dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-medium"
                />
              </div>

              {/* Enroll Message */}
              {enrollMsg && (
                <div className={`px-3 py-2 rounded-lg text-xs font-bold ${enrollMsg.ok ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'}`}>
                  {enrollMsg.text}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollLoading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm flex items-center space-x-1.5 disabled:opacity-70"
                >
                  {enrollLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{enrollLoading ? 'Enrolling…' : 'Verify & Store Enrolment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
