import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, ErrorState, Loading, PageHeader, Panel, Stat, StatusTag } from '../../components/ui';
import { fmtNum, fmtRelative, pct } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';

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
          </>
        }
      />
      {exportError && <div className="mb-4"><Alert tone="bad" onClose={() => setExportError(null)}>{exportError}</Alert></div>}

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <Stat label="Institutions reporting" value={`${k.institutions_reported} / ${k.approved_institutions}`} note={`${pct(k.institutions_reported, k.approved_institutions)}% of approved institutions`} />
        <Stat label="Students enrolled" value={fmtNum(k.total_students_enrolled)} note={`${k.identity_verified_pct}% APAAR verified`} />
        <Stat label="Without verified APAAR" value={fmtNum(k.pending_apaar)} note="Held or pending, not rejected" tone={k.pending_apaar ? 'warn' : undefined} />
        <Stat label="Open cases" value={k.open_cases} note={`${k.awaiting_approval} awaiting second approval`} tone={k.open_cases ? 'bad' : 'ok'} />
        <Stat label="Duplicates intercepted" value={k.duplicates_intercepted} note="Cross-institution conflicts, all time" />
        <Stat label="High-risk institutions" value={k.high_risk_institutions} tone={k.high_risk_institutions ? 'bad' : undefined} note={<Link to="/aicte/risk">See ranking</Link>} />
        <Stat label="Over approved intake" value={k.over_intake_institutions} tone={k.over_intake_institutions ? 'bad' : undefined} note="Institutions, within-intake seats" />
        <Stat label="APAAR verified" value={`${k.identity_verified_pct}%`} tone={k.identity_verified_pct >= 95 ? 'ok' : 'warn'} note="Of active enrolments" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="By state"
          actions={
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="state-metric" className="text-muted">Show</label>
              <select id="state-metric" className="select !py-1 !w-auto" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
                {Object.entries(METRICS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          }
        >
          <ul className="list-none p-0 space-y-2.5">
            {states.map((s) => (
              <li key={s.state} className="grid grid-cols-[130px_1fr_64px] items-center gap-3 text-sm">
                <span className="truncate" title={s.state}>{s.state}</span>
                <div className="h-5 bg-line-soft rounded-sm overflow-hidden">
                  <div className={`h-full ${metric === 'open_cases' && s.value ? 'bg-bad' : 'bg-brand'}`} style={{ width: `${(s.value / maxValue) * 100}%` }} />
                </div>
                <span className="num tabular-nums font-semibold">{metric === 'reporting' || metric === 'utilisation' ? `${s.value}%` : fmtNum(s.value)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted mt-4">{states.length} states and UTs with approved institutions in this prototype.</p>
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
