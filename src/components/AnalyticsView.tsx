import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Filter, 
  Download,
  Users,
  Compass,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Institution, StudentRecord, ViolationCase } from '../types';

interface AnalyticsViewProps {
  institutions: Institution[];
  students: StudentRecord[];
  violations: ViolationCase[];
  theme: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  institutions,
  students,
  violations,
  theme
}) => {
  const isDark = theme === 'dark';
  const [selectedState, setSelectedState] = useState('ALL');
  const [activeChartMetric, setActiveChartMetric] = useState<'ENROLMENT' | 'COMPLIANCE'>('ENROLMENT');

  const totalSeats = institutions.reduce((acc, i) => acc + i.approvedIntake, 0);
  const totalEnrolled = institutions.reduce((acc, i) => acc + i.currentEnrolment, 0);
  const totalVerified = students.filter(s => s.verificationStatus === 'Verified').length;
  const totalPending = students.filter(s => s.verificationStatus === 'Pending').length;
  const totalFlagged = students.filter(s => s.verificationStatus === 'Flagged').length;
  const totalCrossDuplicates = students.filter(s => s.duplicateRisk === 'CROSS_INSTITUTION').length;

  const states = Array.from(new Set(institutions.map(i => i.state)));

  const filteredInstitutions = selectedState === 'ALL'
    ? institutions
    : institutions.filter(i => i.state === selectedState);

  // 1. Data for State-wise Bar Chart
  const stateAggregates = [
    { state: 'Maharashtra', sanctioned: 340, enrolled: 345, verified: 320, pct: 94 },
    { state: 'Tamil Nadu', sanctioned: 310, enrolled: 305, verified: 298, pct: 96 },
    { state: 'Karnataka', sanctioned: 245, enrolled: 240, verified: 229, pct: 93 },
    { state: 'Delhi NCR', sanctioned: 230, enrolled: 238, verified: 212, pct: 92 },
    { state: 'Uttar Pradesh', sanctioned: 450, enrolled: 465, verified: 396, pct: 88 },
  ];

  // 2. Data for Category Distribution Pie Chart (General, OBC, SC, ST, EWS, TFW)
  const categoryData = [
    { label: 'General / Open', count: 42, color: '#3B82F6', percentage: 42 },
    { label: 'OBC (Non-Creamy)', count: 27, color: '#10B981', percentage: 27 },
    { label: 'SC / ST Category', count: 16, color: '#F59E0B', percentage: 16 },
    { label: 'EWS (Economically Weaker)', count: 8, color: '#8B5CF6', percentage: 8 },
    { label: 'TFW / Supernumerary', count: 7, color: '#EC4899', percentage: 7 },
  ];

  // 3. Data for Verification Status Donut Chart
  const verificationBreakdown = [
    { label: 'Verified & Aadhaar-Linked', count: totalVerified, color: '#10B981', pct: Math.round((totalVerified / (students.length || 1)) * 100) },
    { label: 'Pending Verification', count: totalPending, color: '#F59E0B', pct: Math.round((totalPending / (students.length || 1)) * 100) },
    { label: 'Duplicate / Flagged Risk', count: totalFlagged + totalCrossDuplicates, color: '#EF4444', pct: Math.round(((totalFlagged + totalCrossDuplicates) / (students.length || 1)) * 100) },
  ];

  // Pie chart calculation helper using conic-gradient
  let cumulativeCategoryPercent = 0;
  const categoryGradientParts = categoryData.map(c => {
    const start = cumulativeCategoryPercent;
    cumulativeCategoryPercent += c.percentage;
    return `${c.color} ${start}% ${cumulativeCategoryPercent}%`;
  });
  const categoryConicGradient = `conic-gradient(${categoryGradientParts.join(', ')})`;

  let cumulativeVerPercent = 0;
  const verGradientParts = verificationBreakdown.map(v => {
    const start = cumulativeVerPercent;
    cumulativeVerPercent += v.pct;
    return `${v.color} ${start}% ${cumulativeVerPercent}%`;
  });
  const verConicGradient = `conic-gradient(${verGradientParts.join(', ')})`;

  return (
    <div className="space-y-8 py-4 font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>NATIONAL TELEMETRY & ADMISSION CENSUS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b2559] dark:text-white tracking-tight">
            National Intake, Enrolment & Compliance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual breakdown of state-level intake adherence, reservation quota shares, and DigiLocker APAAR sync status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 font-mono font-bold">State Filter:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 border font-medium focus:outline-none bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white cursor-pointer"
          >
            <option value="ALL">All States (National View)</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            SANCTIONED SEATS
          </span>
          <div className="text-3xl font-black text-[#0b2559] dark:text-blue-400 font-mono mt-1">
            {totalSeats.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across Monitored Institutions</p>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            LIVE ENROLMENTS
          </span>
          <div className={`text-3xl font-black font-mono mt-1 ${totalEnrolled > totalSeats ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {totalEnrolled.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {Math.round((totalEnrolled / totalSeats) * 100)}% Capacity Occupied
          </p>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            APAAR VERIFICATION
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {Math.round((totalVerified / (students.length || 1)) * 100)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {totalVerified} Authenticated Records
          </p>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            DUPLICATE INFRACTIONS
          </span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {totalCrossDuplicates}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dual Seat Blocking Intercepted
          </p>
        </div>
      </div>

      {/* 3. VISUAL CHARTS SECTION: Bar Graph & Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: State-Wise Multi-Bar Comparison Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  State-Wise Intake vs Verified Enrolments
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0b2559] dark:bg-blue-600 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300">Sanctioned</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  <span className="text-slate-600 dark:text-slate-300">Verified</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Bar comparison across high-density educational states against AICTE quota guidelines.
            </p>

            {/* Chart Area */}
            <div className="relative pt-4 pb-2">
              <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-[10px] font-mono text-slate-400 pr-2 pointer-events-none">
                <span>500k</span>
                <span>375k</span>
                <span>250k</span>
                <span>125k</span>
                <span>0</span>
              </div>

              <div className="ml-10 border-b border-slate-200 dark:border-slate-800">
                <div className="h-52 flex items-end justify-around gap-2 sm:gap-6 px-2 sm:px-4">
                  {stateAggregates.map((item, idx) => {
                    const sancHeight = Math.round((item.sanctioned / 500) * 100);
                    const verHeight = Math.round((item.verified / 500) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center max-w-[90px] h-full justify-end group">
                        <div className="w-full flex items-end justify-center space-x-1.5 h-full">
                          <div 
                            style={{ height: `${sancHeight}%` }}
                            className="w-1/2 rounded-t bg-[#0b2559] dark:bg-blue-600 transition-all duration-500 hover:brightness-125 relative cursor-pointer"
                            title={`${item.state} Sanctioned: ${item.sanctioned}k`}
                          />
                          <div 
                            style={{ height: `${verHeight}%` }}
                            className="w-1/2 rounded-t bg-emerald-500 transition-all duration-500 hover:brightness-110 relative cursor-pointer"
                            title={`${item.state} Verified: ${item.verified}k (${item.pct}%)`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="ml-10 flex justify-around gap-2 sm:gap-6 px-2 sm:px-4 pt-3">
                {stateAggregates.map((item, idx) => (
                  <div key={idx} className="flex-1 text-center max-w-[90px]">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.state}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {item.pct}% Sync
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Aggregated telemetry from AICTE Cloud Ledger</span>
            <span className="font-mono text-emerald-600 font-bold">Kafka Pipeline Latency: ~140ms</span>
          </div>
        </div>

        {/* RIGHT: Two Interactive Pie / Donut Charts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Pie Chart 1: Seat Category Allocation Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <PieChartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seat Category Quota Share
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Distribution across standard AICTE reservation categories & supernumerary quota.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Conic Gradient Donut Wheel */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div 
                  className="w-32 h-32 rounded-full shadow-inner flex items-center justify-center transition-transform hover:scale-105"
                  style={{ background: categoryConicGradient }}
                >
                  <div className="w-18 h-18 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-xs">
                    <span className="text-xs font-black text-slate-800 dark:text-white">100%</span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">SEATS</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 flex-1 w-full text-xs">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate">
                        {cat.label}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart 2: APAAR Verification Health Donut */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                DigiLocker Verification Ratio
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Conic Gradient Donut Wheel */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div 
                  className="w-28 h-28 rounded-full shadow-inner flex items-center justify-center transition-transform hover:scale-105"
                  style={{ background: verConicGradient }}
                >
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center shadow-xs">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {verificationBreakdown[0].pct}%
                    </span>
                    <span className="text-[8px] text-slate-400 uppercase font-mono">SYNCED</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 flex-1 w-full text-xs">
                {verificationBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px]">
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Institutional Capacity vs Admission Records List */}
      <div className="rounded-2xl border p-6 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Institutional Capacity vs Actual Admission Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Individual college audit of sanctioned seats against active student enrollments
            </p>
          </div>
          <button 
            onClick={() => alert('Exporting Analytics Data (.csv)...')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="space-y-4">
          {filteredInstitutions.map((inst) => {
            const pct = Math.round((inst.currentEnrolment / inst.approvedIntake) * 100);
            const isBreached = inst.currentEnrolment > inst.approvedIntake;
            return (
              <div 
                key={inst.id} 
                className={`p-4 rounded-xl border transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {inst.name}
                    </span>
                    <span className="text-xs text-slate-500 block font-mono">
                      {inst.state} • {inst.aicteCode} • {inst.type}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className={`text-xs font-mono font-bold ${isBreached ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400'}`}>
                      {inst.currentEnrolment} / {inst.approvedIntake} seats ({pct}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${isBreached ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 to-emerald-500'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {isBreached && (
                  <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-1.5 font-mono font-semibold">
                    <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                    <span>Intake Breached (+{inst.currentEnrolment - inst.approvedIntake} students above sanctioned limit). Auto show-cause notice sent.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
