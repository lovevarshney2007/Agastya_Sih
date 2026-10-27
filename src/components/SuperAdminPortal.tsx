import React, { useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Server,
  Database,
  Lock,
  Layers,
  CheckCircle2,
  AlertOctagon,
  Download
} from 'lucide-react';
import { Institution, StudentRecord, AuditLog } from '../types';

interface SuperAdminDashboardProps {
  institutions?: Institution[];
  students?: StudentRecord[];
  auditLogs?: AuditLog[];
  onAddInstitution?: (inst: Partial<Institution>) => void;
}

export const SuperAdminPortal: React.FC<SuperAdminDashboardProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Default state-wise data exactly matching the screenshot
  const stateData = [
    { state: 'Maharashtra', total: 340, verified: 320, pct: '94.0% Synced' },
    { state: 'Tamil Nadu', total: 310, verified: 298, pct: '96.3% Synced' },
    { state: 'Karnataka', total: 245, verified: 229, pct: '93.5% Synced' },
    { state: 'Delhi NCR', total: 230, verified: 212, pct: '92.4% Synced' },
    { state: 'Uttar Pradesh', total: 450, verified: 396, pct: '88.0% Synced' },
  ];

  // College-Wise Intake Compliance & Verification Master Table rows matching screenshot
  const colleges = [
    {
      code: 'AICTE-DL-0012',
      name: 'Delhi Institute of Engineering & Technology',
      location: 'New Delhi, Delhi',
      approvedIntake: 1200,
      actualEnrolment: 1240,
      variance: '+40 (Over-intake)',
      varianceType: 'error',
      supernumerary: '45 Seats',
      nriFn: '24 NRI / 8 FN',
      verificationPct: '79.0%',
      status: 'Under Audit',
      statusType: 'audit'
    },
    {
      code: 'AICTE-MH-0845',
      name: 'Maharashtra National Institute of Technology',
      location: 'Pune, Maharashtra',
      approvedIntake: 420,
      actualEnrolment: 418,
      variance: 'Compliant',
      varianceType: 'compliant',
      supernumerary: '21 Seats',
      nriFn: '12 NRI / 6 FN',
      verificationPct: '90.9%',
      status: 'Approved',
      statusType: 'approved'
    },
    {
      code: 'AICTE-KA-0491',
      name: 'Bangalore Technical & Science Academy',
      location: 'Bengaluru, Karnataka',
      approvedIntake: 300,
      actualEnrolment: 295,
      variance: 'Compliant',
      varianceType: 'compliant',
      supernumerary: '15 Seats',
      nriFn: '10 NRI / 8 FN',
      verificationPct: '88.1%',
      status: 'Approved',
      statusType: 'approved'
    },
    {
      code: 'AICTE-TN-0219',
      name: 'Tamil Nadu Engineering & Management Campus',
      location: 'Chennai, Tamil Nadu',
      approvedIntake: 480,
      actualEnrolment: 472,
      variance: 'Compliant',
      varianceType: 'compliant',
      supernumerary: '24 Seats',
      nriFn: '15 NRI / 10 FN',
      verificationPct: '93.2%',
      status: 'Approved',
      statusType: 'approved'
    },
    {
      code: 'AICTE-UP-0672',
      name: 'Uttar Pradesh Council of Technology',
      location: 'Lucknow, Uttar Pradesh',
      approvedIntake: 500,
      actualEnrolment: 515,
      variance: '+15 (Over-intake)',
      varianceType: 'error',
      supernumerary: '25 Seats',
      nriFn: '6 NRI / 2 FN',
      verificationPct: '79.6%',
      status: 'Under Audit',
      statusType: 'audit'
    }
  ];

  // Kafka Stream anomalies
  const kafkaAnomalies = [
    {
      id: 'FRD-2026-081',
      severity: 'CRITICAL',
      msg: 'Mohammad Farhan Akhtar (APAAR10000005) active at Delhi Inst of Tech and UP Council of Tech simultaneously.',
      sub: 'Action: Notice Issued • Streamed via Spring Kafka'
    },
    {
      id: 'FRD-2026-082',
      severity: 'HIGH',
      msg: 'Delhi Inst of Engineering & Tech exceeded approved intake by 40 seats without TFW clearance.',
      sub: 'Action: Audit Scheduled'
    },
    {
      id: 'FRD-2026-083',
      severity: 'CRITICAL',
      msg: 'Ananya Banerjee [APAAR10000012] dual admission logged in Delhi and Karnataka portals.',
      sub: 'Action: Seat Blocked'
    }
  ];

  // Immutable JPA Ledger
  const auditLedger = [
    {
      time: '10/27/26, 6:41 AM',
      tag: 'DUPLICATE_FLAGGED',
      detail: 'APAAR ID: 100000000012 (Ananya Banerjee)',
      actor: 'Actor: system_aicte_risk_engine • IP: 164.100.168.4'
    },
    {
      time: '10/27/26, 5:11 AM',
      tag: 'DUPLICATE_FLAGGED',
      detail: 'APAAR ID: 100000000005 (Mohammad Farhan Akhtar)',
      actor: 'Actor: system_aicte_risk_engine • IP: 164.100.168.4'
    },
    {
      time: '10/27/26, 3:11 AM',
      tag: 'VERIFIED',
      detail: 'APAAR ID: 123456789012 (Aarav Sharma)',
      actor: 'Actor: admin@delhi-tech.edu.in • IP: 14.139.60.2'
    }
  ];

  const filteredColleges = colleges.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#0b2559] flex items-center justify-center p-1.5 shadow-sm shrink-0">
            <img 
              src="/aicte-logo.png" 
              alt="AICTE Shield" 
              className="w-full h-full object-contain filter drop-shadow-md brightness-110"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0b2559] dark:text-white tracking-tight">
              AICTE Central Super Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Department of Higher Education • AICTE Regulation Bureau • National Monitoring Portal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => alert('Exporting National Compliance Report (.xlsx)...')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export National Compliance Report (.xlsx)</span>
          </button>
          <button 
            onClick={() => alert('Generating PDF Report...')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#0b2559] hover:bg-[#113880] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            APPROVED INSTITUTIONS
          </p>
          <h2 className="text-3xl font-black text-[#0b2559] dark:text-white mt-1 tracking-tight">
            9,840
          </h2>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center space-x-1">
            <span>All 28 States & UTs Active</span>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            NATIONAL ENROLMENTS
          </p>
          <h2 className="text-3xl font-black text-[#0b2559] dark:text-white mt-1 tracking-tight">
            34.6 L
          </h2>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
            Sanctioned: 34.2 L (+1.1%)
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            APAAR VERIFIED RECORDS
          </p>
          <h2 className="text-3xl font-black text-[#0b2559] dark:text-white mt-1 tracking-tight">
            31.1 L
          </h2>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            89.8% Synced with DigiLocker
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            DUPLICATES INTERCEPTED
          </p>
          <h2 className="text-3xl font-black text-[#0b2559] dark:text-white mt-1 tracking-tight">
            14,210
          </h2>
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-2">
            Kafka Risk Engine Flags
          </p>
        </div>
      </div>

      {/* 3. Pan-India State-Wise APAAR Verification Progress Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Pan-India State-Wise APAAR Verification Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative student verification statistics across major technical education states
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#0b2559] dark:bg-blue-600 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">Total Sanctioned Enrolments</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 inline-block"></span>
              <span className="text-slate-700 dark:text-slate-300">Verified APAAR Records</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="relative pt-4 pb-2">
          {/* Y-axis markers */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-[11px] font-mono text-slate-400 pr-2 pointer-events-none">
            <span>600k</span>
            <span>450k</span>
            <span>300k</span>
            <span>150k</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="ml-10 sm:ml-12 border-b border-slate-200 dark:border-slate-800">
            <div className="h-48 sm:h-56 flex items-end justify-around gap-2 sm:gap-6 px-2 sm:px-6">
              {stateData.map((item, idx) => {
                // Calculate height percentage relative to 600k
                const totalH = Math.round((item.total / 600) * 100);
                const verH = Math.round((item.verified / 600) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center max-w-[120px] h-full justify-end group">
                    <div className="w-full flex items-end justify-center space-x-1 sm:space-x-1.5 h-full">
                      {/* Bar 1: Total Sanctioned */}
                      <div 
                        style={{ height: `${totalH}%` }}
                        className="w-1/2 rounded-t bg-[#0b2559] dark:bg-blue-600 transition-all duration-500 hover:brightness-125 relative cursor-pointer"
                        title={`${item.state} Sanctioned: ${item.total}k`}
                      />
                      {/* Bar 2: Verified */}
                      <div 
                        style={{ height: `${verH}%` }}
                        className="w-1/2 rounded-t bg-emerald-500 transition-all duration-500 hover:brightness-110 relative cursor-pointer"
                        title={`${item.state} Verified: ${item.verified}k (${item.pct})`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="ml-10 sm:ml-12 flex justify-around gap-2 sm:gap-6 px-2 sm:px-6 pt-3">
            {stateData.map((item, idx) => (
              <div key={idx} className="flex-1 text-center max-w-[120px]">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {item.state}
                </p>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {item.pct}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. College-Wise Intake Compliance & Verification Master Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              College-Wise Intake Compliance & Verification Master Table
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AICTE regulatory oversight of approved intake versus actual student enrolment
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search College or Code"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0b2559] text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4 font-extrabold whitespace-nowrap">CODE</th>
                <th className="py-3 px-4 font-extrabold min-w-[240px]">COLLEGE NAME & STATE</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">APPROVED INTAKE</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">ACTUAL ENROLMENT</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">INTAKE VARIANCE</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">SUPERNUMERARY (TFW)</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">NRI / FN</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">VERIFICATION %</th>
                <th className="py-3 px-4 font-extrabold text-center whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredColleges.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0b2559] dark:text-blue-400 whitespace-nowrap">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.location}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-center text-slate-700 dark:text-slate-300">
                    {c.approvedIntake}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-center text-slate-900 dark:text-white">
                    {c.actualEnrolment}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {c.varianceType === 'error' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {c.variance}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {c.variance}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">
                    {c.supernumerary}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    {c.nriFn}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {c.verificationPct}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {c.statusType === 'audit' ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        {c.status}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {c.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Bottom Two Columns: Kafka Stream & Immutable Audit Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Kafka Duplicate Anomaly Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-base">🚨</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Kafka Duplicate Anomaly Stream
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              TOPIC: aicte.apaar.duplicate-events
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {kafkaAnomalies.map((item, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-rose-200/70 dark:border-rose-900/50 bg-[#fffbfa] dark:bg-rose-950/20 text-xs space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.id}
                  </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    ({item.severity})
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs">
                  {item.msg}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Immutable System Audit Ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-base">📜</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Immutable System Audit Ledger
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
              JPA AUDIT LOGS
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {auditLedger.map((log, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {log.time}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {log.tag}
                  </span>
                </div>
                <p className="font-mono text-slate-900 dark:text-white text-xs font-semibold">
                  {log.detail}
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {log.actor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Bottom Security & Regulatory Architecture Strip */}
      <div className="bg-[#071329] border border-blue-950 text-white rounded-xl px-4 py-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-medium">
          <span className="text-amber-400">🛡️</span>
          <span className="font-bold uppercase tracking-wider text-[11px]">
            Security & Regulatory Architecture:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 flex items-center space-x-1.5">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>AES-256 Encrypted</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Consent-Based Access (DPDP Act)</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 flex items-center space-x-1.5">
            <Database className="w-3 h-3 text-amber-400" />
            <span>Audit Logged Ledger (JPA)</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 flex items-center space-x-1.5">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Apache Kafka Message Broker</span>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 flex items-center space-x-1.5">
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span>Apache POI Excel Engine</span>
          </span>
        </div>
      </div>
    </div>
  );
};
