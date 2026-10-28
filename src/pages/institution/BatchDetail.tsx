import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../../api/client';
import type { BatchReport, ValidationIssue } from '../../api/types';
import { Alert, Empty, ErrorState, Loading, PageHeader, Pagination, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDateTime } from '../../lib/format';
import { Link } from '../../lib/router';
import { useAction, useApi } from '../../lib/useApi';
import { CountsRow, useInstitutionId } from './shared';

const PAGE_SIZE = 25;

export function downloadIssuesCsv(report: BatchReport) {
  const escape = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [['row', 'student_id_no', 'masked_apaar', 'rule_id', 'severity', 'decision', 'message', 'suggested_fix'],
    ...report.issues.map((i) => [i.row_number, i.student_id_no, i.masked_apaar, i.rule_id, i.severity, i.row_decision, i.message, i.suggested_fix])];
  const blob = new Blob([rows.map((r) => r.map(escape).join(',')).join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.filename.replace(/\.(csv|xlsx)$/i, '')}_issues.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "37 rows: APAAR malformed" style grouping. */
export function IssueSummary({ issues }: { issues: ValidationIssue[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, { rule: string; severity: string; example: string; rows: Set<number> }>();
    for (const i of issues) {
      const g = map.get(i.rule_id) ?? { rule: i.rule_id, severity: i.severity, example: i.message, rows: new Set<number>() };
      g.rows.add(i.row_number);
      map.set(i.rule_id, g);
    }
    return [...map.values()].sort((a, b) => b.rows.size - a.rows.size);
  }, [issues]);

  return (
    <ul className="list-none p-0 divide-y divide-line-soft">
      {groups.map((g) => (
        <li key={g.rule} className="py-2.5 flex flex-wrap items-start gap-x-3 gap-y-1 text-sm">
          <span className="mono font-semibold w-[78px] shrink-0">{g.rule}</span>
          <StatusTag value={g.severity} />
          <span className="flex-1 min-w-[200px]">
            <strong>{g.rows.size} row{g.rows.size === 1 ? '' : 's'}</strong> — {g.example}
          </span>
          <span className="text-muted text-xs">Row{g.rows.size === 1 ? '' : 's'} {[...g.rows].slice(0, 8).join(', ')}{g.rows.size > 8 ? '…' : ''}</span>
        </li>
      ))}
    </ul>
  );
}

export function BatchDetail({ batchId }: { batchId: string }) {
  const instId = useInstitutionId();
  const { data, error, loading, reload, setData } = useApi(instId ? () => api.institution.batch(instId, batchId) : null, [instId, batchId]);
  const [severity, setSeverity] = useState('ALL');
  const [decision, setDecision] = useState('ALL');
  const [rule, setRule] = useState('ALL');
  const [page, setPage] = useState(1);
  const [declared, setDeclared] = useState(false);
  const commit = useAction(() => api.institution.commit(instId!, batchId));
  const discard = useAction(() => api.institution.discard(instId!, batchId));
  const [commitMsg, setCommitMsg] = useState<string | null>(null);

  const filtered = useMemo(() => (data?.issues ?? []).filter((i) =>
    (severity === 'ALL' || i.severity === severity) && (decision === 'ALL' || i.row_decision === decision) && (rule === 'ALL' || i.rule_id === rule)),
  [data, severity, decision, rule]);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data || loading && !data) return <Loading rows={8} />;

  const rules = [...new Set(data.issues.map((i) => i.rule_id))].sort();
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader
        back={{ to: '/institution/batches', label: 'All uploads' }}
        title={<span className="break-all">{data.filename}</span>}
        description={<>Uploaded {fmtDateTime(data.created_at)}{data.uploaded_by ? ` by ${data.uploaded_by}` : ''} · rules version <span className="mono">{data.rule_version}</span></>}
        actions={<StatusTag value={data.status} />}
      />

      <ol className="flex flex-wrap gap-x-6 gap-y-2 list-none p-0 mb-5 text-sm">
        <li><span className="text-muted">Uploaded</span> {fmtDateTime(data.created_at)}</li>
        <li><span className="text-muted">Checked</span> {data.status === 'VALIDATING' ? 'in progress' : 'done'}</li>
        <li><span className="text-muted">Committed</span> {data.committed_at ? fmtDateTime(data.committed_at) : data.status === 'DISCARDED' ? 'discarded' : 'not yet'}</li>
      </ol>

      <CountsRow counts={data.counts} />

      {commitMsg && <div className="mt-5"><Alert tone="ok" onClose={() => setCommitMsg(null)}>{commitMsg}</Alert></div>}

      {data.status === 'READY_TO_COMMIT' && (
        <Panel title="This batch is waiting to be committed" className="mt-5">
          <label className="flex items-start gap-2.5 text-sm">
            <input type="checkbox" className="mt-1" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
            <span>I am the nodal officer and declare this is a true record of students admitted for 2026–27, with no Aadhaar numbers.</span>
          </label>
          {(commit.error || discard.error) && <div className="mt-3"><Alert tone="bad">{commit.error || discard.error}</Alert></div>}
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" className="btn btn-primary" disabled={!declared || commit.pending}
                    onClick={async () => {
                      const res = await commit.run();
                      if (res) {
                        setCommitMsg(`Committed: ${res.recorded} recorded, ${res.held} held.${res.cases_opened.length ? ` Conflict case ${res.cases_opened.join(', ')} opened for AICTE review.` : ''}`);
                        await reload();
                      }
                    }}>
              {commit.pending && <Spinner />} Commit batch
            </button>
            <button type="button" className="btn btn-secondary" disabled={discard.pending}
                    onClick={async () => { const res = await discard.run(); if (res) setData({ ...data, status: 'DISCARDED' }); }}>
              Discard
            </button>
          </div>
        </Panel>
      )}

      {data.status === 'COMMITTED' && (
        <p className="text-sm text-muted mt-4">This batch is committed and read-only. To correct a record, edit it in the <Link to="/institution/registry">student registry</Link>.</p>
      )}

      {data.issues.length === 0 ? (
        <Panel className="mt-6"><Empty title="No issues">Every row passed all checks.</Empty></Panel>
      ) : (
        <>
          <Panel title="Issues by rule" className="mt-6"><IssueSummary issues={data.issues} /></Panel>

          <Panel
            className="mt-6"
            bodyClassName=""
            title={`Row-level issues (${filtered.length})`}
            actions={
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadIssuesCsv(data)}>
                <Download size={14} aria-hidden="true" /> Download error file
              </button>
            }
          >
            <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-line-soft bg-wash">
              <FilterSelect label="Severity" value={severity} onChange={(v) => { setSeverity(v); setPage(1); }}
                            options={['Critical', 'Violation', 'Error', 'Review', 'Warning']} />
              <FilterSelect label="Row decision" value={decision} onChange={(v) => { setDecision(v); setPage(1); }}
                            options={['REJECT', 'HOLD', 'ACCEPT_WITH_WARNING']} />
              <FilterSelect label="Rule" value={rule} onChange={(v) => { setRule(v); setPage(1); }} options={rules} />
            </div>
            {filtered.length === 0 ? <Empty title="No issues match these filters" /> : (
              <>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th className="num">Row</th><th>Student ID</th><th>APAAR</th><th>Rule</th><th>Severity</th><th>What we found</th><th>How to fix</th><th>Row decision</th></tr>
                    </thead>
                    <tbody>
                      {pageRows.map((i) => (
                        <tr key={i.issue_id}>
                          <td className="num">{i.row_number}</td>
                          <td className="mono whitespace-nowrap">{i.student_id_no || '—'}</td>
                          <td className="mono whitespace-nowrap">{i.masked_apaar}</td>
                          <td className="mono">{i.rule_id}</td>
                          <td><StatusTag value={i.severity} /></td>
                          <td className="min-w-[240px]">{i.message}</td>
                          <td className="min-w-[200px] text-muted">{i.suggested_fix}</td>
                          <td><StatusTag value={i.row_decision} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
              </>
            )}
          </Panel>
        </>
      )}
    </>
  );
}

export function FilterSelect({ label, value, onChange, options, labels }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string>;
}) {
  const id = `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-center gap-2 text-sm max-w-full min-w-0">
      <label htmlFor={id} className="text-muted whitespace-nowrap">{label}</label>
      <select id={id} className="select !py-1 !w-auto max-w-[16rem] min-w-0 truncate" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="ALL">All</option>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}
