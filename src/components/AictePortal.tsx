import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  FileText, 
  Building2, 
  ArrowUpRight,
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Institution, StudentRecord, ViolationCase } from '../types';

interface AictePortalProps {
  institutions: Institution[];
  students: StudentRecord[];
  violations: ViolationCase[];
  onResolveViolation: (id: string, notes: string) => void;
}

export const AictePortal: React.FC<AictePortalProps> = ({
  institutions,
  students,
  violations,
  onResolveViolation
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DRILL_DOWN' | 'VIOLATION_CENTRE' | 'REPORT_BUILDER'>('DASHBOARD');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedViolation, setSelectedViolation] = useState<ViolationCase | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

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
            <span>{openViolations.length} Active Infractions</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Institutions</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{institutions.length}</p>
          <div className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-mono font-bold">
            Across 4 States / UTs monitored
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolments</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalActualEnrolled.toLocaleString()}</p>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Capacity: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{totalApprovedIntake.toLocaleString()} seats</span>
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">APAAR Verification Rate</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{verifiedPercentage}%</p>
          <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authenticated via APAAR Adapter</span>
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white p-5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cross-College Duplicates</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{duplicatesIntercepted}</p>
          <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 flex items-center space-x-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dual seat blocking prevented</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b dark:border-slate-800 border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'DASHBOARD'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }`}
        >
          National Overview
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
          <span>Violation Centre ({openViolations.length})</span>
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
            {filteredViolations.map((v) => (
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
            ))}
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
                onClick={() => alert('Exporting Official AICTE Intake Compliance Digest (PDF)...')}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF Summary</span>
              </button>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cross-Institution Duplicate Ledger</h4>
              <p className="text-xs text-slate-500">Complete listing of flagged dual-enrolments across colleges.</p>
              <button 
                onClick={() => alert('Exporting Duplicate Cases Audit (XLSX)...')}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel Ledger</span>
              </button>
            </div>

            <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Audit Chain</h4>
              <p className="text-xs text-slate-500">Tamper-evident logs of every transaction with SHA-256 block hashes.</p>
              <button 
                onClick={() => alert('Exporting Tamper-evident Audit Chain (JSON)...')}
                className="mt-3 w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 text-blue-700 dark:text-blue-400 border dark:border-slate-700 border-slate-300 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Hash Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-bold">{selectedViolation.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Official Resolution</h3>
              </div>
              <button 
                onClick={() => setSelectedViolation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 font-medium">
                  <strong>Case:</strong> {selectedViolation.title}
                </p>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Hearing Finding / Corrective Action Imposed
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Institution provided proof of withdrawal for duplicate student. Excess seats ratified under revised supernumerary sanction..."
                  className="w-full dark:bg-slate-800 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-lg p-3 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedViolation(null)}
                  className="px-4 py-2 dark:bg-slate-800 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-sm"
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
