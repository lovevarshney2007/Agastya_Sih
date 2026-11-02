import { useEffect, useState } from 'react';
import { Download, FileText, LayoutGrid, List, X } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, ErrorState, Loading, PageHeader, Panel, Stat, StatusTag } from '../../components/ui';
import { fmtNum, fmtRelative, pct } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { RegulatoryTelemetry } from '../../components/RegulatoryTelemetry';

type Metric = 'enrolled' | 'reporting' | 'utilisation' | 'open_cases';
const METRICS: Record<Metric, string> = {
  enrolled: 'Students enrolled',
  reporting: 'Institutions reporting (%)',
  utilisation: 'Enrolled ÷ approved intake (%)',
  open_cases: 'Institutions with open cases',
};

export function NationalOverview() {
  const { data, error, loading, reload } = useApi(() => api.aicte.dashboard(), []);
  const [metric, setMetric] = useState<Metric>('enrolled');
  const [viewMode, setViewMode] = useState<'grid' | 'bars'>('grid');
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => { void reload(); }, 60000);
    return () => clearInterval(t);
  }, [reload]);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={10} />;

  const k = data.kpis;
  const states = data.state_aggregates.map((s) => ({
    ...s,
    value: metric === 'enrolled' ? s.enrolled
      : metric === 'reporting' ? pct(s.reported, s.institutions)
      : metric === 'utilisation' ? pct(s.enrolled, s.approved_intake)
      : s.open_cases,
  })).sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...states.map((s) => s.value), 1);
  const funnelMax = Math.max(...data.reporting_funnel.map((f) => f.count), 1);
  const selectedState = selectedStateName ? data.state_aggregates.find((s) => s.state === selectedStateName) : null;

  return (
    <>
      <PageHeader
        title="National overview"
        description="Student-level reporting by AICTE-approved institutions for academic year 2026–27."
        actions={
          <>
            <AsOf at={data.as_of} onRefresh={reload} loading={loading} />
            <button type="button" className="btn btn-secondary" onClick={async () => {
              setExportError(null);
              try { await api.aicte.exportNational(); } catch (e) { setExportError(e instanceof Error ? e.message : 'Export failed.'); }
            }}><Download size={16} aria-hidden="true" /> National summary (CSV)</button>
            <button type="button" className="btn btn-primary" onClick={async () => {
              setExportError(null);
              try { await api.aicte.downloadExecutivePdf(); } catch (e) { setExportError(e instanceof Error ? e.message : 'PDF generation failed.'); }
            }}><FileText size={16} aria-hidden="true" /> Executive Briefing (PDF)</button>
          </>
        }
      />
      {exportError && <div className="mb-4"><Alert tone="bad" onClose={() => setExportError(null)}>{exportError}</Alert></div>}

      <RegulatoryTelemetry />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <Stat
          label="Institutions reporting"
          value={`${k.institutions_reported} / ${k.approved_institutions}`}
          note={`${pct(k.institutions_reported, k.approved_institutions)}% of approved institutions`}
          sparkline={[12, 15, 19, 24, 28, 33, 38]}
        />
        <Stat
          label="Students enrolled"
          value={fmtNum(k.total_students_enrolled)}
          note={`${k.identity_verified_pct}% APAAR verified`}
          sparkline={[140, 210, 290, 380, 460, 520, 610]}
        />
        <Stat
          label="Without verified APAAR"
          value={fmtNum(k.pending_apaar)}
          note="Held or pending, not rejected"
          tone={k.pending_apaar ? 'warn' : undefined}
          sparkline={[78, 65, 52, 41, 33, 25, 18]}
        />
        <Stat
          label="Open cases"
          value={k.open_cases}
          note={`${k.awaiting_approval} awaiting second approval`}
          tone={k.open_cases ? 'bad' : 'ok'}
          sparkline={[8, 7, 6, 5, 4, 3, Math.max(k.open_cases, 1)]}
        />
        <Stat
          label="Duplicates intercepted"
          value={k.duplicates_intercepted}
          note="Cross-institution conflicts, all time"
          sparkline={[3, 5, 8, 11, 14, 17, 21]}
        />
        <Stat
          label="High-risk institutions"
          value={k.high_risk_institutions}
          tone={k.high_risk_institutions ? 'bad' : undefined}
          note={<Link to="/aicte/risk" className="inline-block py-1">See ranking</Link>}
          sparkline={[6, 5, 5, 4, 3, 2, Math.max(k.high_risk_institutions, 1)]}
        />
        <Stat
          label="Over approved intake"
          value={k.over_intake_institutions}
          tone={k.over_intake_institutions ? 'bad' : undefined}
          note="Institutions, within-intake seats"
          sparkline={[4, 3, 3, 2, 2, 1, Math.max(k.over_intake_institutions, 0)]}
        />
        <Stat
          label="APAAR verified"
          value={`${k.identity_verified_pct}%`}
          tone={k.identity_verified_pct >= 95 ? 'ok' : 'warn'}
          note="Of active enrolments"
          sparkline={[80, 84, 88, 91, 94, 96, Math.max(k.identity_verified_pct, 90)]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="State-wise intelligence & Heatmap"
          actions={
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="inline-flex rounded border border-line p-0.5 bg-wash">
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${viewMode === 'grid' ? 'bg-surface font-semibold shadow-xs text-ink' : 'text-muted'}`}
                  onClick={() => setViewMode('grid')}
                  title="Heatmap matrix view"
                >
                  <LayoutGrid size={13} /> Heatmap
                </button>
                <button
                  type="button"
                  className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${viewMode === 'bars' ? 'bg-surface font-semibold shadow-xs text-ink' : 'text-muted'}`}
                  onClick={() => setViewMode('bars')}
                  title="Ranked bar comparison"
                >
                  <List size={13} /> Bars
                </button>
              </div>

              <select id="state-metric" className="select !py-1 !w-auto text-xs" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
                {Object.entries(METRICS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          }
        >
          {selectedState && (
            <div className="mb-4 p-3.5 border border-brand/40 bg-brand-wash/30 rounded text-sm relative">
              <button
                type="button"
                className="absolute top-2.5 right-2.5 text-muted hover:text-ink p-1"
                onClick={() => setSelectedStateName(null)}
                aria-label="Close inspector"
              >
                <X size={15} />
              </button>
              <div className="font-bold text-ink text-base mb-1">{selectedState.state} Regulatory Profile</div>
              <div className="grid gap-2 sm:grid-cols-4 text-xs mt-2">
                <div>
                  <span className="text-muted block">Approved Institutions</span>
                  <strong className="text-sm">{selectedState.institutions}</strong> ({pct(selectedState.reported, selectedState.institutions)}% reporting)
                </div>
                <div>
                  <span className="text-muted block">Seat Fill Ratio</span>
                  <strong className="text-sm">{pct(selectedState.enrolled, selectedState.approved_intake)}%</strong> ({fmtNum(selectedState.enrolled)} / {fmtNum(selectedState.approved_intake)})
                </div>
                <div>
                  <span className="text-muted block">Open Regulatory Cases</span>
                  <strong className={`text-sm ${selectedState.open_cases > 0 ? 'text-bad' : 'text-ok'}`}>{selectedState.open_cases}</strong>
                </div>
                <div>
                  <span className="text-muted block">High Risk Institutions</span>
                  <strong className={`text-sm ${selectedState.high_risk > 0 ? 'text-bad' : 'text-ok'}`}>{selectedState.high_risk}</strong>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {states.map((s) => {
                const fillPct = pct(s.enrolled, s.approved_intake);
                const hasAlert = s.open_cases > 0 || s.high_risk > 0;
                const isSelected = selectedStateName === s.state;
                return (
                  <button
                    key={s.state}
                    type="button"
                    onClick={() => setSelectedStateName(isSelected ? null : s.state)}
                    className={`text-left p-2.5 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand ring-2 ring-brand/20 bg-brand-wash/20'
                        : hasAlert
                        ? 'border-bad/40 bg-bad/5 hover:border-bad'
                        : fillPct >= 80
                        ? 'border-ok/30 bg-ok/5 hover:border-ok'
                        : 'border-line bg-surface hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-ink truncate block" title={s.state}>{s.state}</span>
                      {hasAlert && (
                        <span className="tag tag-bad text-[9px] py-0 px-1 font-bold">
                          {s.open_cases ? `${s.open_cases}c` : ''}{s.high_risk ? ` ${s.high_risk}r` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between text-xs mt-1">
                      <span className="text-muted text-[11px]">{s.institutions} colleges</span>
                      <strong className="num tabular-nums text-xs">{fillPct}%</strong>
                    </div>
                    <div className="h-1.5 bg-line-soft rounded-xs overflow-hidden mt-1.5">
                      <div
                        className={`h-full ${hasAlert ? 'bg-bad' : fillPct >= 80 ? 'bg-ok' : 'bg-brand'}`}
                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <ul className="list-none p-0 space-y-2.5">
              {states.map((s) => (
                <li
                  key={s.state}
                  onClick={() => setSelectedStateName(s.state)}
                  className={`grid grid-cols-[130px_1fr_64px] items-center gap-3 text-sm p-1.5 rounded cursor-pointer ${
                    selectedStateName === s.state ? 'bg-brand-wash font-semibold' : 'hover:bg-wash'
                  }`}
                >
                  <span className="truncate" title={s.state}>{s.state}</span>
                  <div className="h-5 bg-line-soft rounded-sm overflow-hidden">
                    <div className={`h-full ${metric === 'open_cases' && s.value ? 'bg-bad' : 'bg-brand'}`} style={{ width: `${(s.value / maxValue) * 100}%` }} />
                  </div>
                  <span className="num tabular-nums font-semibold">{metric === 'reporting' || metric === 'utilisation' ? `${s.value}%` : fmtNum(s.value)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted mt-4">{states.length} states and UTs with approved institutions. Click any state card to inspect details.</p>
        </Panel>

        <div className="space-y-6">
          <Panel title="Reporting progress">
            <ul className="list-none p-0 space-y-2.5">
              {data.reporting_funnel.map((f) => (
                <li key={f.stage} className="text-sm">
                  <div className="flex justify-between"><span>{f.stage}</span><span className="font-semibold tabular-nums">{f.count}</span></div>
                  <div className="h-2 bg-line-soft rounded-sm mt-1 overflow-hidden"><div className="h-full bg-navy" style={{ width: `${(f.count / funnelMax) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-3">Institutions, by where they are in this year’s submission.</p>
          </Panel>

          <Panel title="Needs attention" bodyClassName="">
            <ul className="list-none p-0 divide-y divide-line-soft text-sm">
              {data.attention.recent_cases.map((c) => (
                <li key={c.case_id}>
                  <Link to={`/aicte/cases/${c.case_id}`} className="flex justify-between gap-3 px-4 py-2.5 no-underline text-ink hover:bg-wash">
                    <span><span className="mono font-semibold">{c.case_number}</span> <span className="text-muted">· flagged {fmtRelative(c.created_at)}</span></span>
                    <StatusTag value={c.status} />
                  </Link>
                </li>
              ))}
              {data.attention.top_risk.filter((r) => r.risk_level !== 'LOW').map((r) => (
                <li key={r.institution_id}>
                  <Link to={`/aicte/institutions/${r.institution_id}`} className="block px-4 py-2.5 no-underline text-ink hover:bg-wash">
                    <div className="flex justify-between gap-3"><span className="font-semibold">{r.name}</span><StatusTag value={r.risk_level} label={`${r.risk_level === 'HIGH' ? 'High' : 'Medium'} risk`} /></div>
                    <div className="text-muted text-xs mt-0.5">{r.reasons[0]}</div>
                  </Link>
                </li>
              ))}
              {data.attention.recent_cases.length === 0 && data.attention.top_risk.every((r) => r.risk_level === 'LOW') && (
                <li className="px-4 py-6 text-center text-muted">No open cases or high-risk institutions.</li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
