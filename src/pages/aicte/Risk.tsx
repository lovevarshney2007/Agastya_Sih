import { useMemo, useState } from 'react';
import { api } from '../../api/client';
import type { RiskRow } from '../../api/types';
import { Alert, AsOf, ErrorState, Loading, Modal, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtNum } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { FilterSelect } from '../institution/BatchDetail';

export function RiskRankingPage() {
  const { data, error, loading, reload } = useApi(() => api.aicte.risk(), []);
  const [state, setState] = useState('ALL');
  const [why, setWhy] = useState<RiskRow | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const rows = useMemo(() => (data?.institutions ?? []).filter((r) => state === 'ALL' || r.state === state), [data, state]);
  const states = useMemo(() => [...new Set((data?.institutions ?? []).map((r) => r.state))].sort(), [data]);

  return (
    <>
      <PageHeader
        title="Institution risk ranking"
        description="Ranks institutions so reviews and inspections can be prioritised. Recomputed from current data each time this page loads."
        actions={data && <AsOf at={data.as_of} onRefresh={reload} loading={loading} />}
      />

      <div className="mb-5">
        <Alert tone="warn" title="An indicator for review, not a finding">
          A high score means the reported data looks unusual compared with other institutions. Any action needs a case and a second officer’s approval.
        </Alert>
      </div>
      {feedback && <div className="mb-5"><Alert tone="ok" onClose={() => setFeedback(null)}>{feedback}</Alert></div>}

      {error && !data ? <ErrorState message={error} onRetry={reload} /> : !data ? <Loading rows={8} /> : (
        <Panel bodyClassName="" title={<h2>Ranking <span className="text-xs text-muted font-normal mono ml-2">model {data.model_version}</span></h2>}
               actions={<FilterSelect label="State" value={state} onChange={setState} options={states} />}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th className="num">#</th><th>Institution</th><th>Score</th><th>Level</th><th>Main reasons</th><th className="num">Enrolled / intake</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.institution_id}>
                    <td className="num text-muted">{i + 1}</td>
                    <td className="min-w-[220px]">
                      <Link to={`/aicte/institutions/${r.institution_id}`} className="font-semibold">{r.name}</Link>
                      <div className="text-xs text-muted">{r.state} · <span className="mono">{r.aicte_permanent_id}</span></div>
                    </td>
                    <td>
                      {r.scored ? (
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="h-2 w-20 bg-line-soft rounded-sm overflow-hidden">
                            <div className={`h-full ${r.risk_level === 'HIGH' ? 'bg-bad' : r.risk_level === 'MEDIUM' ? 'bg-[#d4a72c]' : 'bg-ok'}`} style={{ width: `${r.risk_score * 100}%` }} />
                          </div>
                          <span className="tabular-nums font-semibold">{r.risk_score.toFixed(2)}</span>
                        </div>
                      ) : <span className="text-muted text-sm">Not scored</span>}
                    </td>
                    <td>{r.scored ? <StatusTag value={r.risk_level} /> : <StatusTag value="NEUTRAL" label="Too little data" />}</td>
                    <td className="min-w-[260px]">
                      <ul className="list-disc pl-4 space-y-0.5">{r.top_reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                    </td>
                    <td className="num whitespace-nowrap">{fmtNum(r.total_enrolled)} / {fmtNum(r.total_intake)}</td>
                    <td><button type="button" className="btn btn-secondary btn-sm" onClick={() => setWhy(r)}>Why?</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Modal open={!!why} onClose={() => setWhy(null)} title={why ? `Why ${why.name} scores ${why.risk_score.toFixed(2)}` : ''}
             footer={why && (
               <>
                 <button type="button" className="btn btn-secondary" onClick={() => { setFeedback(`Thanks — your note on ${why.name} was sent to the analytics team.`); setWhy(null); }}>This looks wrong</button>
                 <Link to={`/aicte/institutions/${why.institution_id}`} className="btn btn-primary no-underline">Open institution</Link>
               </>
             )}>
        {why && (
          <>
            <p className="text-sm mt-0">The model compares four measures with every other institution. Measures marked “unusual” pushed the score up.</p>
            <table className="data-table border border-line-soft">
              <thead><tr><th>Measure</th><th className="num">Value</th><th></th></tr></thead>
              <tbody>
                {why.factors.map((f) => (
                  <tr key={f.name}>
                    <td>{f.name}</td>
                    <td className="num font-semibold">{f.display}</td>
                    <td>{f.flagged ? <StatusTag value="REVIEW" label="Unusual" /> : <span className="text-muted text-xs">Typical</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted mt-3">Isolation Forest over these measures, scaled 0–1 across institutions. High ≥ 0.65, medium ≥ 0.40.</p>
          </>
        )}
      </Modal>
    </>
  );
}
