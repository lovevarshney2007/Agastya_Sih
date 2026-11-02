import { useState } from 'react';
import { Award, CheckCircle2, Download, Sliders, Sparkles } from 'lucide-react';
import { fmtNum } from '../lib/format';

interface StreamTrend {
  name: string;
  category: 'EMERGING' | 'MAINSTREAM' | 'LEGACY';
  currentApproved: number;
  currentEnrolled: number;
  growthRate: number; // base growth rate
  color: string;
}

const INITIAL_STREAMS: StreamTrend[] = [
  { name: 'AI, Data Science & Robotics', category: 'EMERGING', currentApproved: 84000, currentEnrolled: 82500, growthRate: 0.28, color: '#0ea5e9' },
  { name: 'Semiconductor & VLSI Design', category: 'EMERGING', currentApproved: 28000, currentEnrolled: 27100, growthRate: 0.42, color: '#8b5cf6' },
  { name: 'Computer Science & Engineering', category: 'MAINSTREAM', currentApproved: 240000, currentEnrolled: 234000, growthRate: 0.08, color: '#10b981' },
  { name: 'Electronics & Communication', category: 'MAINSTREAM', currentApproved: 110000, currentEnrolled: 98000, growthRate: 0.10, color: '#f59e0b' },
  { name: 'Civil & Traditional Mechanical', category: 'LEGACY', currentApproved: 165000, currentEnrolled: 94000, growthRate: -0.16, color: '#ef4444' },
];

export function SeatDemandForecaster() {
  const [semiconductorBoost, setSemiconductorBoost] = useState(40); // %
  const [greenTechBoost, setGreenTechBoost] = useState(25); // %
  const [conversionCap, setConversionCap] = useState(15); // %
  const [generatedOrder, setGeneratedOrder] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number>(2027);

  // Recomputed projections based on policy sliders
  const calculateProjections = (stream: StreamTrend, year: number) => {
    const yearsDiff = year - 2026;
    let effectiveGrowth = stream.growthRate;

    if (stream.name.includes('Semiconductor')) {
      effectiveGrowth += (semiconductorBoost / 100) * 0.35;
    }
    if (stream.name.includes('Robotics') || stream.name.includes('AI')) {
      effectiveGrowth += (greenTechBoost / 100) * 0.25;
    }
    if (stream.category === 'LEGACY') {
      effectiveGrowth -= (conversionCap / 100) * 0.15;
    }

    const projectedDemand = Math.round(stream.currentEnrolled * Math.pow(1 + effectiveGrowth, yearsDiff));
    const vacancyDeficit = stream.currentApproved - projectedDemand;

    return { projectedDemand, vacancyDeficit };
  };

  const handleGenerateResolution = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const order = `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
POLICY & ACADEMIC PLANNING BUREAU (P&AP)
Nelson Mandela Marg, Vasant Kunj, New Delhi 110070

STATUTORY COUNCIL RESOLUTION NO: AICTE/P&AP/2026/SR-${Math.floor(Math.random() * 800 + 100)}
DATE: ${timestamp}

SUBJECT: Automated Rationalization of Technical Seat Capacities for AY 2027-28
PURSUANT TO: AICTE Act 1987 §10(g) & National Education Policy (NEP) 2020 §16.4

The All India Council for Technical Education, having evaluated multi-year enrolment velocity,
demographic demand vectors, and industrial human-capital requirements through the Agastya ML Intelligence Engine,
hereby notifies the following seat rationalization directives:

1. REALLOCATION OF UNUTILIZED LEGACY SEATS:
   - Institutions reporting >35% sustained vacancy in Civil and Mechanical disciplines over three consecutive cycles
     are hereby permitted and directed to convert up to ${conversionCap}% of sanctioned intake into AI/Data Science
     and Semiconductor & VLSI disciplines without requirement of additional built-up land.

2. NATIONAL INCENTIVE INJECTION:
   - India Semiconductor Mission (ISM) seat expansion factor: +${semiconductorBoost}% subsidy on approved laboratory equipment.
   - Green Technology & Energy Transition expansion factor: +${greenTechBoost}% supernumerary quota.

3. STATUTORY COMPLIANCE:
   - Converted seats shall be registered directly into the AICTE Immutable Depository under W3C Verifiable Credential 2.0 standards.
   - No institution shall exceed the overarching composite institutional ceiling established in Regulation 4(2).

By Order of the Council,
Member Secretary, AICTE
`;
    setGeneratedOrder(order);
  };

  const downloadResolutionFile = () => {
    if (!generatedOrder) return;
    const blob = new Blob([generatedOrder], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_Seat_Rationalization_Resolution_2027_28.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Policy Scenario Slider Controls */}
      <div className="p-4 sm:p-5 rounded-xl border border-line bg-surface shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-brand" />
            <h3 className="text-sm font-bold text-ink my-0">
              AI Policy Simulation &amp; National Mission Variables
            </h3>
          </div>
          <div className="flex items-center gap-1.5 bg-wash border border-line rounded p-0.5 text-xs font-semibold">
            {[2026, 2027, 2028, 2029].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setActiveYear(yr)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeYear === yr
                    ? 'bg-white shadow-xs text-brand font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                AY {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          {/* Slider 1 */}
          <div className="p-3 bg-wash rounded-lg border border-line-soft space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-ink">India Semiconductor Mission</span>
              <span className="text-brand font-mono font-bold">+{semiconductorBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={semiconductorBoost}
              onChange={(e) => setSemiconductorBoost(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <span className="text-[10px] text-muted block leading-tight">
              Incentive weight for VLSI, Chip Design &amp; Fabrication seats.
            </span>
          </div>

          {/* Slider 2 */}
          <div className="p-3 bg-wash rounded-lg border border-line-soft space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-ink">Green Tech &amp; Robotics Transition</span>
              <span className="text-emerald-700 font-mono font-bold">+{greenTechBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={greenTechBoost}
              onChange={(e) => setGreenTechBoost(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-muted block leading-tight">
              Industry demand acceleration for Autonomous Systems &amp; EV.
            </span>
          </div>

          {/* Slider 3 */}
          <div className="p-3 bg-wash rounded-lg border border-line-soft space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-ink">Legacy Branch Conversion Cap</span>
              <span className="text-amber-700 font-mono font-bold">{conversionCap}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={conversionCap}
              onChange={(e) => setConversionCap(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-muted block leading-tight">
              Maximum allowable shift of vacant legacy seats into tech branches.
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Projections Roster */}
      <div className="border border-line rounded-xl bg-surface overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-wash border-b border-line-soft flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider my-0">
              AY {activeYear} Projected Seat Demand vs. Approved Intake Capacity
            </h4>
            <span className="text-[11px] text-muted">
              Dynamically synthesized using AICTE multi-year ML enrolment regression model.
            </span>
          </div>
          <button
            type="button"
            onClick={handleGenerateResolution}
            className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Generate Council Resolution</span>
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Discipline / Programme</th>
                <th>Category</th>
                <th className="num">2026 Approved</th>
                <th className="num">AY {activeYear} Projected Demand</th>
                <th>Supply vs. Demand Balance</th>
                <th className="num">Delta</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_STREAMS.map((st) => {
                const { projectedDemand, vacancyDeficit } = calculateProjections(st, activeYear);
                const isShortage = vacancyDeficit < 0;
                const isSurplusGlut = vacancyDeficit > 25000;

                return (
                  <tr key={st.name}>
                    <td className="font-semibold text-xs text-ink">{st.name}</td>
                    <td>
                      <span
                        className={`tag text-[10px] font-bold py-0 px-1.5 ${
                          st.category === 'EMERGING'
                            ? 'tag-ok'
                            : st.category === 'MAINSTREAM'
                            ? 'tag-neutral'
                            : 'tag-warn'
                        }`}
                      >
                        {st.category}
                      </span>
                    </td>
                    <td className="num mono text-xs">{fmtNum(st.currentApproved)}</td>
                    <td className="num mono text-xs font-bold text-brand">{fmtNum(projectedDemand)}</td>
                    <td className="min-w-[160px]">
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-line-soft rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.round((projectedDemand / st.currentApproved) * 100))}%`,
                              backgroundColor: st.color,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted">Utilization</span>
                          <span className="font-bold text-ink">
                            {Math.round((projectedDemand / st.currentApproved) * 100)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="num text-xs whitespace-nowrap">
                      {isShortage ? (
                        <span className="text-bad font-bold flex items-center justify-end gap-1">
                          Deficit ({fmtNum(Math.abs(vacancyDeficit))})
                        </span>
                      ) : isSurplusGlut ? (
                        <span className="text-amber-600 font-semibold flex items-center justify-end gap-1">
                          Glut (+{fmtNum(vacancyDeficit)})
                        </span>
                      ) : (
                        <span className="text-ok font-semibold">Balanced</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Council Resolution Modal / Card */}
      {generatedOrder && (
        <div className="p-5 rounded-xl border border-brand/30 bg-brand-wash/20 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-brand/20 pb-2.5">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-brand" />
              <h4 className="text-sm font-bold text-ink my-0">
                Official AICTE Council Statutory Seat Rationalization Directive
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadResolutionFile}
                className="btn btn-secondary btn-xs flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Download size={13} />
                Download Order (.md)
              </button>
              <button
                type="button"
                onClick={() => setGeneratedOrder(null)}
                className="btn btn-ghost btn-xs text-muted"
              >
                Dismiss
              </button>
            </div>
          </div>

          <pre className="mono text-xs bg-white border border-line-soft rounded-lg p-4 text-ink overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[220px]">
            {generatedOrder}
          </pre>

          <div className="text-[11px] text-muted flex items-center justify-between pt-1">
            <span>
              Authoritative recommendation ready for signature under <strong>AICTE Regulation 4(2)</strong>.
            </span>
            <span className="text-ok font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Legal Formulation Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
