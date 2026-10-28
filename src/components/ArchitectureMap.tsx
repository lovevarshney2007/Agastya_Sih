import React from 'react';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Workflow
} from 'lucide-react';

export const ArchitectureMap: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border transition-all dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <Layers className="w-4 h-4" />
            <span>AICTE TECHNICAL SPECIFICATION BLUEPRINT</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Complete Architecture, Core Logic & Service Topology
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Visual walkthrough of the 9 core backend services, 5 portals, and external DigiLocker/APAAR adapters.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 font-mono font-bold">
          <Workflow className="w-4 h-4" />
          <span>Interactive Architectural Map</span>
        </div>
      </div>

      {/* Layer 1: The 6 User Portals */}
      <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Frontend / User Portals (Web Application Layer)</h3>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">React + TypeScript + Tailwind</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 uppercase font-bold">1. Institution</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">College Admin</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>CSV/XLSX Upload</li>
              <li>Row Error Fixes</li>
              <li>Intake Capacity</li>
              <li>Single Entry</li>
            </ul>
          </div>

          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 uppercase font-bold">2. AICTE Officer</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">National Command</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>State/District Drill</li>
              <li>Violation Review</li>
              <li>Quota Alerts</li>
              <li>Export Reports</li>
            </ul>
          </div>

          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase font-bold">3. Super-Admin</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Governance Core</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>Manage Colleges</li>
              <li>Rule Config Engine</li>
              <li>Audit Hashing</li>
              <li>System Policies</li>
            </ul>
          </div>

          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold">4. Verifier</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Authorized Verifier</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>Candidate Lookup</li>
              <li>Consent Checking</li>
              <li>Signed Attestation</li>
              <li>Minimal Fields</li>
            </ul>
          </div>

          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 uppercase font-bold">5. Student</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Academic Passport</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>View Enrolment</li>
              <li>Toggle Consent</li>
              <li>Download QR Cert</li>
              <li>Lookup Activity</li>
            </ul>
          </div>

          <div className="dark:bg-slate-950 bg-slate-50 p-4 rounded-xl border dark:border-slate-800 border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold">6. Public Check</span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">QR Instant Check</h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-medium">
              <li>Scan Credential QR</li>
              <li>Token Verification</li>
              <li>Active/Revoked State</li>
              <li>Zero Tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Layer 2: The 9 Core Backend Services */}
      <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">2</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Core Backend Workflow (9 Micro-Services)</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">PostgreSQL + FastAPI / NestJS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auth & RBAC</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">JWT sessions, role isolation, institution data boundary scoping, MFA.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ingestion Service</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Streamed CSV/XLSX parser, Redis background worker, batch staging.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">APAAR Adapter</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Stable interface for 12-digit format check and DigiLocker ABC integration.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold flex items-center justify-center">4</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Validation Engine</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Field mandatory checks, date formats, student lifecycle rule validation.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold flex items-center justify-center">5</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Duplicate Detection</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Same-college duplicates, cross-institution active dual enrolments.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold flex items-center justify-center">6</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Intake Compliance</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Approved intake vs actual enrolment, 10% supernumerary quota cap.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold flex items-center justify-center">7</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Database Service</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Central PostgreSQL repository with versioning and immutable history.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold flex items-center justify-center">8</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reporting & Alerts</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Real-time aggregate views, show-cause triggers, PDF/Excel export.</p>
          </div>

          <div className="p-4 dark:bg-slate-950 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">9</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Verification & Credentials</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">JWS signed PDF credentials, QR generation, student consent checks.</p>
          </div>
        </div>
      </div>

      {/* Layer 3: Database & Security Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <Database className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Central PostgreSQL Relational Entities</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">users</span>
              <span>Login, role, permissions</span>
            </div>
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">institutions</span>
              <span>AICTE code, state, type</span>
            </div>
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">programs</span>
              <span>Course, year, approved cap</span>
            </div>
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">students</span>
              <span>12-digit APAAR, protected DOB</span>
            </div>
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">enrolments</span>
              <span>College, quota, version, status</span>
            </div>
            <div className="p-2.5 dark:bg-slate-950 bg-slate-50 rounded-lg border dark:border-slate-800 border-slate-200 text-slate-700 dark:text-slate-300">
              <span className="text-blue-700 dark:text-blue-400 font-bold block">consents</span>
              <span>Student grant/revoke ledger</span>
            </div>
          </div>
        </div>

        <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Security, Privacy & Trust Guarantees</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong className="text-slate-900 dark:text-white">Zero Aadhaar Storage:</strong> Uses APAAR ID purely as academic key to prevent PII leakage.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong className="text-slate-900 dark:text-white">DPDP Act Consent Compliance:</strong> Students hold sovereign grant/revoke authority.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong className="text-slate-900 dark:text-white">Tamper-Proof Audit Chain:</strong> Every transaction cryptographically signed with block hashes.</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong className="text-slate-900 dark:text-white">Data Minimisation:</strong> Public QR verification reveals only validity state.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
