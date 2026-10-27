import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Scale, 
  BookOpen, 
  Key, 
  EyeOff
} from 'lucide-react';

interface ComplianceViewProps {
  theme: 'dark' | 'light';
}

export const ComplianceView: React.FC<ComplianceViewProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-cyan-500 text-xs font-mono mb-1">
          <Scale className="w-4 h-4" />
          <span>STATUTORY FRAMEWORK & PRIVACY ARCHITECTURE</span>
        </div>
        <h1 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          AICTE Approval Process Handbook (APH) & DPDP Compliance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          The APAAR platform enforces statutory intake limits, seat categories, and data minimization protocols specified by the Ministry of Education and AICTE.
        </p>
      </div>

      {/* Grid of Compliance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3 text-cyan-500">
            <Lock className="w-6 h-6" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Zero-Aadhaar Leakage Guarantee
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Per Ministry and Supreme Court guidelines, Aadhaar numbers are <strong>never stored, collected, or exposed</strong> in the central database. The platform uses APAAR ID (12-digit academic registry key) exclusively. Any accidental Aadhaar column uploaded in CSVs is dropped and redacted automatically.
          </p>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-600 dark:text-cyan-400 font-mono">
            Check: Rule Code AADHAAR_DROP_SANITIZER = ACTIVE
          </div>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3 text-emerald-500">
            <ShieldCheck className="w-6 h-6" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              DPDP Act 2023 Consent Ledger
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Third-party verification requests (by employers, background checkers, embassies) are subject to active student consent. If a student revokes consent in their portal, the verifier receives a <em>Withheld by Candidate</em> notice with minimal zero-PII fields.
          </p>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
            Check: DPDP Purpose-Specific Time-Stamped Consent
          </div>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3 text-amber-500">
            <AlertTriangle className="w-6 h-6" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Supernumerary Seat Cap (APH 10% Norm)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            AICTE Approval Process Handbook permits up to 10% supernumerary admissions for Non-Resident Indians (NRI), Overseas Citizens of India (OCI), and Foreign Nationals (FN). The ingestion engine flags any batch exceeding this statutory ratio.
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-mono">
            Check: MAX_SUPERNUMERARY_CAP = 10% of Sanctioned
          </div>
        </div>

        <div className={`p-6 rounded-2xl border space-y-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3 text-purple-500">
            <Key className="w-6 h-6" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cryptographic Audit Chain (Tamper-Proof)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Every transaction—whether CSV ingestion, row correction, consent toggle, or regulatory decision—generates a SHA-256 block hash linked to the previous block hash. Any unauthorized modification breaks the audit chain immediately.
          </p>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400 font-mono">
            Check: Append-Only Immutable Blockchain Topology
          </div>
        </div>
      </div>
    </div>
  );
};
