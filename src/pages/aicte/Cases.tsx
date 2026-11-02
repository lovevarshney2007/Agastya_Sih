import { useMemo, useState } from 'react';
import { api } from '../../api/client';
import type { CaseStatus } from '../../api/types';
import { AsOf, DataCard, Empty, ErrorState, Loading, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtDate } from '../../lib/format';
import { Link, useRouter } from '../../lib/router';
import { useApi } from '../../lib/useApi';

const VIEWS: { id: string; label: string; states: CaseStatus[] }[] = [
  { id: 'open', label: 'Open', states: ['OPEN', 'UNDER_REVIEW'] },
  { id: 'approval', label: 'Awaiting approval', states: ['PENDING_APPROVAL'] },
  { id: 'closed', label: 'Closed', states: ['RESOLVED', 'FALSE_POSITIVE'] },
  { id: 'all', label: 'All', states: [] },
];

export function Cases() {
  const { navigate, search: query } = useRouter();
  const { data, error, loading, loadedAt, reload } = useApi(() => api.aicte.cases(), []);
  const [view, setView] = useState(query.get('view') ?? 'open');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.id, (data ?? []).filter((c) => !v.states.length || v.states.includes(c.status)).length])), [data]);
  const rows = useMemo(() => {
    const states = VIEWS.find((v) => v.id === view)?.states ?? [];
    const needle = search.trim().toLowerCase();
    return (data ?? []).filter((c) => (!states.length || states.includes(c.status))
      && (!needle || c.case_number.toLowerCase().includes(needle) || c.institutions_involved.some((i) => i.toLowerCase().includes(needle))));
  }, [data, view, search]);

  return (
    <>
      <PageHeader
        title="Cases"
        description="Records the checks have flagged for human review. A flag is not a finding: an outcome takes effect only after a second officer approves it."
        actions={<AsOf at={loadedAt} onRefresh={reload} loading={loading} />}
      />

      <div className="flex flex-wrap gap-1 border-b border-line mb-4 overflow-x-auto no-scrollbar scroll-fade" role="tablist">
        {VIEWS.map((v) => (
          <button key={v.id} type="button" role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}
                  className={`px-3 sm:px-4 py-2 text-sm border-0 bg-transparent cursor-pointer border-b-[3px] -mb-px whitespace-nowrap min-h-[44px] ${view === v.id ? 'border-brand font-semibold text-navy' : 'border-transparent text-muted hover:text-ink'}`}>
            {v.label} <span className="text-muted font-normal">({counts[v.id] ?? 0})</span>
          </button>
        ))}
      </div>

      {error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <Panel bodyClassName="">
          <div className="px-4 py-3 border-b border-line-soft bg-wash">
            <input className="input w-full sm:w-72 !py-1" placeholder="Case number or institution" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search cases" />
          </div>
          {!data ? <div className="p-4"><Loading /></div> : rows.length === 0 ? (
            <Empty title={view === 'open' ? 'No open cases' : 'No cases here'}>{view === 'open' ? 'Every flagged record has been reviewed.' : undefined}</Empty>
          ) : (
            <>
              {/* Mobile Data Cards (< 768px) */}
              <div className="p-3 space-y-3 md:hidden">
                {rows.map((c) => (
                  <DataCard
                    key={c.case_id}
                    title={c.case_number}
                    subtitle={`Cross-institution duplicate · Rule ${c.rule_id} v${c.rule_version}`}
                    badge={
                      <div className="flex items-center gap-1">
                        <StatusTag value={c.severity} />
                        <StatusTag value={c.status} />
                      </div>
                    }
                    onClick={() => navigate(`/aicte/cases/${c.case_id}`)}
                    fields={[
                      { label: 'Flagged on', value: fmtDate(c.created_at) },
                      {
                        label: 'Age',
                        value: (
                          <span className={c.overdue ? 'text-bad font-bold' : ''}>
                            {c.age_days} d{c.overdue ? ' · Overdue' : ''}
                          </span>
                        ),
                      },
                    ]}
                    expandedContent={
                      <div>
                        <div className="text-[11px] text-muted font-medium mb-1">Institutions Involved:</div>
                        <div className="space-y-1">
                          {c.institutions_involved.map((inst) => (
                            <div key={inst} className="text-xs font-semibold text-navy bg-slate-50 p-1.5 rounded border border-slate-200/60">
                              {inst}
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                    actions={
                      <Link
                        to={`/aicte/cases/${c.case_id}`}
                        className="btn btn-secondary btn-sm w-full no-underline"
                      >
                        Inspect Evidence &amp; Adjudicate
                      </Link>
                    }
                  />
                ))}
              </div>

              {/* Desktop Full Table (>= 768px) */}
              <div className="table-wrap hidden md:block">
                <table className="data-table">
                  <thead>
                    <tr><th>Case</th><th>Type</th><th>Institutions</th><th>Rule</th><th>Severity</th><th>State</th><th>Flagged</th><th className="num">Age</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.case_id} className="clickable" onClick={() => navigate(`/aicte/cases/${c.case_id}`)}>
                        <td><Link to={`/aicte/cases/${c.case_id}`} className="mono font-semibold" onClick={(e) => e.stopPropagation()}>{c.case_number}</Link></td>
                        <td className="whitespace-nowrap">Cross-institution duplicate</td>
                        <td className="min-w-[240px]">{c.institutions_involved.map((i) => <div key={i}>{i}</div>)}</td>
                        <td className="mono whitespace-nowrap">{c.rule_id} <span className="text-faint">v{c.rule_version}</span></td>
                        <td><StatusTag value={c.severity} /></td>
                        <td><StatusTag value={c.status} /></td>
                        <td className="whitespace-nowrap">{fmtDate(c.created_at)}</td>
                        <td className={`num whitespace-nowrap ${c.overdue ? 'text-bad font-semibold' : ''}`}>{c.age_days} d{c.overdue ? ' · overdue' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      )}
    </>
  );
}
