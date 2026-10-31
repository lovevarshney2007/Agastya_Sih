import { useState } from 'react';
import { Award, FileCheck, Printer, Shield, ShieldCheck } from 'lucide-react';
import { Modal } from './ui';

interface ComplianceRadarProps {
  institutionName: string;
  institutionId?: string;
}

export function ComplianceRadar({ institutionName, institutionId = 'INST-MH-PUN-001' }: ComplianceRadarProps) {
  const [certModal, setCertModal] = useState(false);

  // 5 dimensions (scores out of 100)
  const scores = [
    { label: 'Intake Adherence', score: 98, weight: '25%', desc: 'Admissions strictly within AICTE approved intake cap' },
    { label: 'Faculty Cadre Ratio', score: 92, weight: '20%', desc: '1:2:6 Cadre ratio (Prof/Assoc/Asst) verified' },
    { label: 'Supernumerary Caps', score: 95, weight: '20%', desc: 'TFW, PMSSS & OCI seats within statutory sub-limits' },
    { label: 'Grievance Redressal', score: 100, weight: '15%', desc: 'Zero unresolved natural justice appeals' },
    { label: 'APAAR & DPDP Integrity', score: 96, weight: '20%', desc: 'Zero Aadhaar retention & 100% blind index adherence' },
  ];

  const overallScore = Math.round(
    scores.reduce((acc, s) => acc + s.score * (parseInt(s.weight) / 100), 0)
  );

  // Calculate SVG polygon points for radar chart (center at 120, 120, radius 90)
  const centerX = 120;
  const centerY = 120;
  const radius = 80;
  const numPoints = scores.length;

  const getCoordinates = (index: number, valPercent: number) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (radius * valPercent) / 100;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const polyPoints = scores
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.score);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPoints = scores
    .map((_, idx) => {
      const { x, y } = getCoordinates(idx, 75);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mb-6 rounded-xl border border-line bg-white shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-navy to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-lg shrink-0">
            <Award size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white m-0">AICTE Statutory Accreditation &amp; Compliance Radar</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                GRADE A++ (EXEMPLARY)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 m-0">
              Composite compliance rating computed across AICTE Approval Process Handbook (APH 2024–27) &amp; DPDP Act rules.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm flex items-center gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-500 border-none text-white shadow"
          onClick={() => setCertModal(true)}
        >
          <FileCheck size={15} />
          <span>Statutory Clearance Certificate</span>
        </button>
      </div>

      {/* Main Grid: Radar SVG + Breakdown */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-center">
        {/* Radar Graphic */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-wash border border-line-soft">
          <svg width="240" height="240" className="overflow-visible">
            {/* Grid circles */}
            {[25, 50, 75, 100].map((ring) => (
              <circle
                key={ring}
                cx={centerX}
                cy={centerY}
                r={(radius * ring) / 100}
                fill="none"
                stroke="#cbd5e1"
                strokeDasharray={ring === 100 ? 'none' : '3,3'}
                strokeWidth="1"
              />
            ))}

            {/* Radial axis lines */}
            {scores.map((_, idx) => {
              const { x, y } = getCoordinates(idx, 100);
              return <line key={idx} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />;
            })}

            {/* National Benchmark Polygon (Grey dashed) */}
            <polygon points={benchmarkPoints} fill="rgba(148, 163, 184, 0.15)" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Institutional Score Polygon (Vibrant Indigo/Emerald) */}
            <polygon points={polyPoints} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2.5" />

            {/* Data points */}
            {scores.map((s, idx) => {
              const { x, y } = getCoordinates(idx, s.score);
              return <circle key={idx} cx={x} cy={y} r="4" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />;
            })}
          </svg>

          <div className="flex items-center gap-4 text-[11px] mt-2">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> This Institution ({overallScore}%)
            </span>
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> National Benchmark (75%)
            </span>
          </div>
        </div>

        {/* 5-Dimension Scorecard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted pb-1 border-b border-line-soft">
            <span>COMPLIANCE DIMENSION</span>
            <span>SCORE / 100</span>
          </div>

          {scores.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ink">{s.label}</span>
                  <span className="text-[11px] text-muted ml-1.5 font-normal">({s.desc})</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">{s.score}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>Institutional Standing: <strong>Eligible for Full Seat Extension &amp; Supernumerary Grants</strong>.</span>
            </div>
            <span className="font-mono text-emerald-800 font-bold shrink-0">Composite: {overallScore}/100</span>
          </div>
        </div>
      </div>

      {/* Statutory Clearance Certificate Modal */}
      {certModal && (
        <Modal
          open={certModal}
          title="AICTE Statutory Compliance Clearance Certificate"
          onClose={() => setCertModal(false)}
        >
          <div className="p-6 bg-white border border-line rounded-lg text-ink space-y-5 print:p-0">
            {/* Header */}
            <div className="text-center border-b border-line pb-4">
              <div className="font-bold text-lg tracking-wide text-navy">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</div>
              <div className="text-xs text-muted uppercase tracking-wider">National Regulatory Bureau · Nelson Mandela Marg, New Delhi</div>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 font-mono text-xs font-bold rounded">
                CERTIFICATE REF: AICTE-CLEARANCE-2026-{institutionId.slice(-6).toUpperCase()}
              </div>
            </div>

            {/* Institution Details */}
            <div className="text-sm">
              <div><strong>INSTITUTION:</strong> {institutionName}</div>
              <div className="text-xs text-muted">Permanent ID: {institutionId} · Academic Year: 2026–27</div>
              <div className="mt-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                STATUS: COMPLIANCE CLEARED · GRADE A++ (COMPOSITE SCORE: {overallScore}/100)
              </div>
            </div>

            {/* Dimension Breakdown */}
            <div className="text-xs space-y-1.5 bg-wash p-3 rounded border border-line-soft">
              <div className="font-bold text-navy uppercase">STATUTORY VERIFICATION BREAKDOWN:</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 m-0">
                <li>Approved Intake Adherence: <strong>98%</strong> (Zero unapproved admissions)</li>
                <li>Cadre Ratio &amp; Faculty Norms: <strong>92%</strong> (AICTE Cadre Norms Satisfied)</li>
                <li>Supernumerary Allocation: <strong>95%</strong> (TFW/PMSSS/OCI strictly compliant)</li>
                <li>Natural Justice &amp; Grievance System: <strong>100%</strong> (No open appeals)</li>
                <li>DPDP Act 2023 Compliance: <strong>96%</strong> (Plaintext Aadhaar zero-leakage verified)</li>
              </ul>
            </div>

            {/* Cryptographic Seal */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-navy">Immutable Ledger Anchor:</div>
                <div className="font-mono text-[10px] text-slate-500 break-all">
                  SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>
              <Shield size={24} className="text-emerald-600 shrink-0 ml-2" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Certificate (PDF)
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCertModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
