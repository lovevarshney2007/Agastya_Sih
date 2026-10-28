import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  Building2, 
  ArrowUpRight,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Lock,
  X
} from 'lucide-react';
import { Institution, StudentRecord, ViolationCase } from '../types';
import { aicteApi, reportsApi, userStore } from '../api/client';
import { Language, TRANSLATIONS } from '../data/translations';

interface AictePortalProps {
  institutions: Institution[];
  students: StudentRecord[];
  violations: ViolationCase[];
  onResolveViolation: (id: string, notes: string) => void;
  language?: Language;
}

export const AictePortal: React.FC<AictePortalProps> = ({
  institutions,
  students,
  violations,
  onResolveViolation,
  language = 'EN',
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.EN;
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DRILL_DOWN' | 'VIOLATION_CENTRE' | 'REPORT_BUILDER'>('DASHBOARD');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedViolation, setSelectedViolation] = useState<ViolationCase | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // Read current session user for officer attribution (BUG-010 fix)
  const sessionUser = userStore.get();
  const currentOfficerName = sessionUser?.full_name || 'AICTE Officer';

  // Backend state
  const [apiDashboard, setApiDashboard] = useState<Record<string, unknown> | null>(null);
  const [apiViolations, setApiViolations] = useState<Record<string, unknown>[] | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [makerAction, setMakerAction] = useState('');
  const [makerReason, setMakerReason] = useState('');
  const [checkerName, setCheckerName] = useState('');
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedApiCaseId, setSelectedApiCaseId] = useState<string | null>(null);
  const [apiRiskRanking, setApiRiskRanking] = useState<Record<string, unknown>[] | null>(null);
  const [anchorResult, setAnchorResult] = useState<Record<string, unknown> | null>(null);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [auditData, setAuditData] = useState<Record<string, unknown> | null>(null);
  const [chainResult, setChainResult] = useState<Record<string, unknown> | null>(null);
  const [tamperResult, setTamperResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setApiLoading(true);
    Promise.all([
      aicteApi.dashboard() as Promise<Record<string, unknown>>,
      aicteApi.violations() as Promise<Record<string, unknown>[]>,
      aicteApi.auditLedger() as Promise<Record<string, unknown>>,
      aicteApi.riskRanking() as Promise<Record<string, unknown>[]>,
    ])
      .then(([dash, viols, audit, risk]) => {
        setApiDashboard(dash);
        setApiViolations(viols);
        setAuditData(audit);
        setApiRiskRanking(risk);
      })
      .catch(err => setApiError(err instanceof Error ? err.message : 'Backend load failed'))
      .finally(() => setApiLoading(false));
  }, []);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedViolation) {
        setSelectedViolation(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedViolation]);

  const handleProposeAction = async (caseId: string) => {
    setActionMsg(null);
    try {
      await aicteApi.proposeAction(caseId, makerAction, currentOfficerName, makerReason);
      setActionMsg({ ok: true, text: 'Proposal submitted. Awaiting Checker approval.' });
      const updated = await aicteApi.violations() as Record<string, unknown>[];
      setApiViolations(updated);
    } catch (err) {
      setActionMsg({ ok: false, text: err instanceof Error ? err.message : 'Propose failed' });
    }
  };

  const handleCheckerApprove = async (caseId: string, approve: boolean) => {
    setActionMsg(null);
    try {
      await aicteApi.approveAction(caseId, checkerName || 'Dr. Abhay Jere', approve);
      setActionMsg({ ok: true, text: approve ? 'Action approved & resolved.' : 'Proposal rejected.' });
      const updated = await aicteApi.violations() as Record<string, unknown>[];
      setApiViolations(updated);
    } catch (err) {
      setActionMsg({ ok: false, text: err instanceof Error ? err.message : 'Approve failed' });
    }
  };

  const handleVerifyChain = async () => {
    try { setChainResult(await aicteApi.verifyChain() as Record<string, unknown>); } catch {}
  };

  const handleSimulateTamper = async () => {
    try { setTamperResult(await aicteApi.simulateTamper() as Record<string, unknown>); } catch {}
  };

  const handleAnchorAudit = async () => {
    setIsAnchoring(true);
    setAnchorResult(null);
    try {
      const res = await aicteApi.anchorAudit() as Record<string, unknown>;
      setAnchorResult(res);
      const audit = await aicteApi.auditLedger() as Record<string, unknown>;
      setAuditData(audit);
    } catch (err) {
      setAnchorResult({ error: err instanceof Error ? err.message : 'Anchor failed' });
    } finally {
      setIsAnchoring(false);
    }
  };

  const totalApprovedIntake = institutions.reduce((acc, curr) => acc + curr.approvedIntake, 0);
  const totalActualEnrolled = institutions.reduce((acc, curr) => acc + curr.currentEnrolment, 0);
  const verifiedStudentsCount = students.filter(s => s.verificationStatus === 'Verified').length;
  const verifiedPercentage = Math.round((verifiedStudentsCount / students.length) * 100);
  const duplicatesIntercepted = students.filter(s => s.duplicateRisk === 'CROSS_INSTITUTION').length;
  const openViolations = violations.filter(v => v.status === 'OPEN' || v.status === 'UNDER_REVIEW');

  const filteredViolations = violations.filter(v => {
    if (selectedStatusFilter === 'ALL') return true;
    return v.status === selectedStatusFilter;
  });

  const filteredInstitutions = institutions.filter(i => {
    if (selectedState === 'ALL') return true;
    return i.state === selectedState;
  });

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedViolation && resolutionNote) {
      onResolveViolation(selectedViolation.id, resolutionNote);
      setResolutionNote('');
      setSelectedViolation(null);
    }
  };

  // Backend KPIs prioritized over static fallback
  const kpis = (apiDashboard?.kpis as Record<string, unknown>) || null;
  const approvedInstitutionsCount = typeof kpis?.approved_institutions === 'number' ? kpis.approved_institutions : institutions.length;
  const totalEnrolmentsCount = typeof kpis?.total_students_enrolled === 'number' ? kpis.total_students_enrolled : totalActualEnrolled;
  const identityVerifiedRate = typeof kpis?.identity_verified_pct === 'number' ? kpis.identity_verified_pct : verifiedPercentage;
  const duplicateInterceptCount = typeof kpis?.duplicates_intercepted === 'number' ? kpis.duplicates_intercepted : duplicatesIntercepted;
  const activeInfractionsCount = typeof kpis?.open_violations === 'number' ? kpis.open_violations : openViolations.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>AICTE NATIONAL MONITORING COMMAND</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">Technical Education Directorate</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">National APAAR Enrolment & Compliance Desk</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-state institutional audit, intake cap enforcement, and cross-state duplicate seat prevention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setActiveTab('VIOLATION_CENTRE')}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 rounded-xl text-xs font-bold cursor-pointer shadow-sm"
          >
            <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{activeInfractionsCount} Active Infractions</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Institutions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{approvedInstitutionsCount}</p>
          <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-mono font-bold">
            Across 4 States / UTs monitored
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalEnrolmentsCount.toLocaleString()}</p>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Capacity: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalApprovedIntake.toLocaleString()} seats</span>
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">APAAR Verification Rate</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{identityVerifiedRate}%</p>
          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authenticated via APAAR Adapter</span>
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cross-College Duplicates</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{duplicateInterceptCount}</p>
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center space-x-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dual seat blocking prevented</span>
          </div>
        </div>
      </div>

      {/* Tabs — horizontally scrollable on small screens */}
      <div className="overflow-x-auto -mx-1">
        <div className="flex items-center space-x-2 border-b dark:border-slate-800 border-slate-200 pb-2 min-w-max px-1">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'DASHBOARD'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          {t.aicteTabDashboard || 'National Overview'}
        </button>
        <button
          onClick={() => setActiveTab('DRILL_DOWN')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'DRILL_DOWN'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hierarchy Drill-Down (State → College)</span>
        </button>
        <button
          onClick={() => setActiveTab('VIOLATION_CENTRE')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
            activeTab === 'VIOLATION_CENTRE'
              ? 'bg-rose-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{t.aicteTabViolations || 'Violation Centre'} ({openViolations.length})</span>
        </button>
          <button
            onClick={() => setActiveTab('REPORT_BUILDER')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'REPORT_BUILDER'
                ? 'bg-blue-700 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Report & Audit Builder</span>
          </button>
        </div>
      </div>

      {/* TAB 1: NATIONAL OVERVIEW */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">State-Wise Intake vs Enrolment Distribution</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Comparison of approved statutory intake against live validated APAAR registrations.</p>
            
            <div className="space-y-4 pt-2">
              {institutions.map(inst => {
                const percentage = Math.round((inst.currentEnrolment / inst.approvedIntake) * 100);
                const isOver = inst.currentEnrolment > inst.approvedIntake;
                return (
                  <div key={inst.id} className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{inst.name}</span>
                        <span className="text-xs text-slate-500 block font-mono">
                          {inst.state} • {inst.aicteCode}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold font-mono ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400'}`}>
                          {inst.currentEnrolment} / {inst.approvedIntake}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-medium">({percentage}% capacity)</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isOver ? 'bg-rose-500' : 'bg-blue-700'}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    {isOver && (
                      <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 font-mono font-bold">
                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                        <span>Intake breached by +{inst.currentEnrolment - inst.approvedIntake} seats! Automatic show-cause notice triggered.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Ingestion & Guardrails</h3>
              
              <div className="space-y-3">
                <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200">12-Digit Format Check</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Every APAAR entry checked on entry. Invalid length quarantined.</p>
                  </div>
                </div>

                <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200">APAAR / DigiLocker Adapter</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Automated identity verification with name & DOB validation.</p>
                  </div>
                </div>

                <div className="p-3 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200">Tamper-Proof Audit Hashing</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Every upload, correction, and verification logged with SHA-256 block hash.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRILL DOWN */}
      {activeTab === 'DRILL_DOWN' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-900 bg-white p-4 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Filter by State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-semibold dark:text-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All States (National View)</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Telangana">Telangana</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Displaying {filteredInstitutions.length} of {institutions.length} institutions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstitutions.map((inst) => (
              <div key={inst.id} className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 uppercase tracking-widest font-bold">{inst.state} • {inst.district}</span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{inst.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">AICTE Permanent ID: {inst.aicteCode}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    inst.complianceStatus === 'Compliant'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : inst.complianceStatus === 'Warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                  }`}>
                    {inst.complianceStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 dark:bg-slate-950 bg-slate-50 p-3 rounded-lg border dark:border-slate-800 border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Intake</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{inst.approvedIntake}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Enrolled</span>
                    <span className={`text-xs font-bold ${inst.currentEnrolment > inst.approvedIntake ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400'}`}>
                      {inst.currentEnrolment}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Supernumerary</span>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{inst.supernumeraryUsed}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t dark:border-slate-800 border-slate-100">
                  <span>Contact: {inst.contactEmail}</span>
                  <button 
                    onClick={() => setActiveTab('REPORT_BUILDER')}
                    className="text-blue-700 dark:text-blue-400 hover:underline font-bold inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Audit Dossier</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VIOLATION CENTRE */}
      {activeTab === 'VIOLATION_CENTRE' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-900 bg-white p-4 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Central Incident & Violation Review Hub</h3>
              <p className="text-xs text-slate-500">Investigate excess intakes, multi-college seat blocking, and fraudulent submissions.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Filter Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 text-xs font-semibold dark:text-slate-200 text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Incidents</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {actionMsg && (
              <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between ${
                actionMsg.ok 
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <span>{actionMsg.text}</span>
                <button 
                  onClick={() => setActionMsg(null)} 
                  aria-label="Dismiss message"
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white ml-2 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {apiViolations && apiViolations.length > 0 ? (
              apiViolations
                .filter(v => {
                  if (selectedStatusFilter === 'ALL') return true;
                  return (v.status as string) === selectedStatusFilter;
                })
                .map((v) => {
                  const caseId = v.case_id as string;
                  const caseNum = (v.case_number as string) || caseId;
                  const severity = (v.severity as string) || 'CRITICAL';
                  const status = (v.status as string) || 'OPEN';
                  const maskedApaar = (v.masked_apaar as string) || '••••••••';
                  const conflictType = (v.conflict_type as string) || 'Dual Admission Conflict';
                  const insts = (v.institutions_involved as string[]) || [];
                  const programs = (v.programs_involved as string[]) || [];
                  const proposedAction = v.proposed_action as string | null;
                  const isSelectedForAction = selectedApiCaseId === caseId;

                  return (
                    <div 
                      key={caseId}
                      className={`p-5 rounded-2xl border transition-all shadow-sm ${
                        status === 'RESOLVED'
                          ? 'dark:bg-slate-900/60 bg-slate-50 dark:border-slate-800 border-slate-200 opacity-80'
                          : severity === 'CRITICAL'
                          ? 'dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-800/60 border-rose-200'
                          : 'dark:bg-amber-950/20 bg-amber-50/50 dark:border-amber-800/60 border-amber-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800 border-slate-200">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            severity === 'CRITICAL' ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white'
                          }`}>
                            {severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">{caseNum}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-500">Logged: {(v.created_at as string) || 'Live Event'}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : status === 'ACTION_PROPOSED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          }`}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="py-3 space-y-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{conflictType}</h4>
                        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                          <div>
                            <span className="text-slate-500">Colleges: </span>
                            <span className="text-slate-900 dark:text-slate-200 font-semibold">{insts.join(' ↔ ') || 'Cross-State Colleges'}</span>
                          </div>
                          {programs.length > 0 && (
                            <div>
                              <span className="text-slate-500">Programs: </span>
                              <span className="text-slate-900 dark:text-slate-200 font-semibold">{programs.join(', ')}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500">Masked APAAR: </span>
                            <span className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                              {maskedApaar}
                            </span>
                          </div>
                        </div>

                        {proposedAction && (
                          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
                            <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">Maker Proposed Action:</span>
                            <p className="text-slate-700 dark:text-slate-300">{proposedAction}</p>
                            <span className="text-[10px] text-slate-500 font-mono mt-1 block">Proposed by: {(v.maker_officer as string) || 'Maker Officer'}</span>
                          </div>
                        )}

                        {Boolean(v.checker_officer) && (
                          <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                            Verified & Approved by: <strong>{v.checker_officer as string}</strong>
                          </div>
                        )}
                      </div>

                      {/* Maker / Checker Workflow Actions */}
                      <div className="pt-3 border-t dark:border-slate-800 border-slate-200">
                        {status === 'OPEN' && (
                          <div>
                            {!isSelectedForAction ? (
                              <button
                                onClick={() => {
                                  setSelectedApiCaseId(caseId);
                                  setMakerAction('REVOKE_SECONDARY_SEAT');
                                  setMakerReason('Duplicate enrollment confirmed via APAAR identity adapter. Recommending seat cancellation in College B.');
                                }}
                                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                              >
                                Maker: Propose Resolution
                              </button>
                            ) : (
                              <div className="space-y-3 dark:bg-slate-950 bg-slate-100 p-4 rounded-xl border dark:border-slate-800 border-slate-200">
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">Maker Proposal Form:</span>
                                <div>
                                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Select Proposed Action</label>
                                  <select
                                    value={makerAction}
                                    onChange={(e) => setMakerAction(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-300 dark:text-white"
                                  >
                                    <option value="REVOKE_SECONDARY_SEAT">Revoke Secondary Duplicate Seat</option>
                                    <option value="ISSUE_SHOW_CAUSE_NOTICE">Issue Statutory Show-Cause Notice</option>
                                    <option value="INTAKE_PENALTY">Apply Sanctioned Intake Penalty</option>
                                    <option value="DISMISS_VALID_TRANSFER">Dismiss Conflict (Valid Inter-University Transfer)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-mono text-slate-500 block mb-1">Justification Reason</label>
                                  <textarea
                                    rows={2}
                                    value={makerReason}
                                    onChange={(e) => setMakerReason(e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border dark:bg-slate-900 bg-white dark:border-slate-700 border-slate-300 dark:text-white"
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleProposeAction(caseId)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    Submit Proposal
                                  </button>
                                  <button
                                    onClick={() => setSelectedApiCaseId(null)}
                                    className="px-3 py-1.5 dark:bg-slate-800 bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {status === 'ACTION_PROPOSED' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCheckerApprove(caseId, true)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                            >
                              Checker: Approve & Execute Resolution
                            </button>
                            <button
                              onClick={() => handleCheckerApprove(caseId, false)}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                            >
                              Reject Proposal
                            </button>
                          </div>
                        )}

                        {status === 'RESOLVED' && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Case formally ratified and archived into immutable audit ledger.</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              filteredViolations.map((v) => (
                <div 
                  key={v.id}
                  className={`p-5 rounded-2xl border transition-all shadow-sm ${
                    v.status === 'RESOLVED'
                      ? 'dark:bg-slate-900/60 bg-slate-50 dark:border-slate-800 border-slate-200 opacity-80'
                      : v.severity === 'CRITICAL'
                      ? 'dark:bg-rose-950/20 bg-rose-50/50 dark:border-rose-800/60 border-rose-200'
                      : 'dark:bg-amber-950/20 bg-amber-50/50 dark:border-amber-800/60 border-amber-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800 border-slate-200">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        v.severity === 'CRITICAL' ? 'bg-rose-700 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {v.severity}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">{v.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs text-slate-500">Reported: {v.reportedDate}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        v.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : v.status === 'UNDER_REVIEW'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {v.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="py-3 space-y-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{v.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{v.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600 dark:text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-500">Institution A: </span>
                        <span className="text-slate-900 dark:text-slate-200 font-semibold">{v.institutionA}</span>
                      </div>
                      {v.institutionB && (
                        <div>
                          <span className="text-slate-500">Institution B: </span>
                          <span className="text-slate-900 dark:text-slate-200 font-semibold">{v.institutionB}</span>
                        </div>
                      )}
                      {v.apaarId && (
                        <div>
                          <span className="text-slate-500">APAAR ID: </span>
                          <span className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {v.apaarId}
                          </span>
                        </div>
                      )}
                    </div>

                    {v.notes.length > 0 && (
                      <div className="mt-3 dark:bg-slate-950 bg-slate-100 p-3 rounded-lg border dark:border-slate-800 border-slate-200 text-xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1 font-bold">Investigation Notes</span>
                        {v.notes.map((note, idx) => (
                          <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">• {note}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Officer In-Charge: <strong className="text-slate-700 dark:text-slate-300">{v.assignedOfficer}</strong></span>
                    {v.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setSelectedViolation(v)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Resolve / Record Decision
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REPORT BUILDER */}
      {activeTab === 'REPORT_BUILDER' && (
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">National Academic Audit & Report Generator</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Generate certified CSV, Excel, or official PDF compliance digests for Parliament, Ministry, or State Regulators.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">National Intake Compliance Digest</h4>
              <p className="text-xs text-slate-500">State-wise breakdown of approved seats vs actual registrations.</p>
              <button 
                onClick={() => window.open(reportsApi.nationalCsvUrl(), '_blank')}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export National Summary CSV</span>
              </button>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admission Intake CSV Template</h4>
              <p className="text-xs text-slate-500">Official AICTE pre-formatted CSV template for registrar batch uploads.</p>
              <button 
                onClick={() => window.open(reportsApi.admissionTemplateUrl(), '_blank')}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template</span>
              </button>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Audit Chain & WORM Anchor</h4>
              <p className="text-xs text-slate-500">Tamper-evident logs of every transaction with SHA-256 block hashes and WORM storage receipt anchoring.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <button 
                  onClick={async () => {
                    try {
                      const data = await aicteApi.auditLedger();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `aicte_audit_ledger_${Date.now()}.json`;
                      a.click();
                    } catch {
                      alert('Audit ledger download failed');
                    }
                  }}
                  className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button 
                  onClick={handleAnchorAudit}
                  disabled={isAnchoring}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAnchoring ? 'Anchoring…' : 'Anchor to WORM'}</span>
                </button>
              </div>

              {anchorResult && (
                <div className="mt-2 p-2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-mono">
                  {anchorResult.message ? String(anchorResult.message) : 'Merkle root anchored to WORM storage successfully!'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedViolation && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedViolation(null); }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolution-modal-title"
            className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto"
          >
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-bold">{selectedViolation.id}</span>
                <h3 id="resolution-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Record Official Resolution
                </h3>
              </div>
              <button 
                onClick={() => setSelectedViolation(null)}
                aria-label="Close dialog"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 font-medium">
                  <strong>Case:</strong> {selectedViolation.title}
                </p>
                <label htmlFor="resolution-finding" className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Hearing Finding / Corrective Action Imposed
                </label>
                <textarea
                  id="resolution-finding"
                  required
                  rows={4}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Institution provided proof of withdrawal for duplicate student. Excess seats ratified under revised supernumerary sanction..."
                  className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg p-3 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedViolation(null)}
                  className="px-4 py-2 dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm transition-colors"
                >
                  Mark Case Resolved & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
