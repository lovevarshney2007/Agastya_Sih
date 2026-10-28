import { useMemo, useState } from 'react';
import { api } from '../../api/client';
import { Empty, ErrorState, Loading, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtDateTime } from '../../lib/format';
import { Link, useRouter } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { FilterSelect } from './BatchDetail';
import { useInstitutionId } from './shared';

export function BatchList() {
  const instId = useInstitutionId();
  const { navigate } = useRouter();
  const { data, error, loading, reload } = useApi(instId ? () => api.institution.batches(instId) : null, [instId]);
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => (data ?? []).filter((b) =>
    (status === 'ALL' || b.status === status) && b.filename.toLowerCase().includes(search.trim().toLowerCase())), [data, status, search]);

  return (
    <>
      <PageHeader
        title="Uploads and validation reports"
        description="Every file your institution has uploaded, what happened to each row, and why."
        actions={<Link to="/institution/upload" className="btn btn-primary no-underline">Upload a file</Link>}
      />
      {error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <Panel bodyClassName="">
          <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-line-soft bg-wash">
            <input className="input !w-64 !py-1" placeholder="Search file name" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search file name" />
            <FilterSelect label="State" value={status} onChange={setStatus} options={['READY_TO_COMMIT', 'COMMITTED', 'DISCARDED', 'FAILED']} />
          </div>
          {loading && !data ? <div className="p-4"><Loading /></div> : rows.length === 0 ? (
            <Empty title={data?.length ? 'No uploads match' : 'No uploads yet'} action={!data?.length && <Link to="/institution/upload" className="btn btn-primary no-underline">Upload your first file</Link>}>
              {!data?.length && 'Records from earlier years were synced directly; new admissions are submitted here.'}
            </Empty>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Uploaded</th><th>File</th><th>Uploaded by</th><th>State</th>
                    <th className="num">Rows</th><th className="num">Accepted</th><th className="num">Warning</th><th className="num">Held</th><th className="num">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.batch_id} className="clickable" onClick={() => navigate(`/institution/batches/${b.batch_id}`)}>
                      <td className="whitespace-nowrap">{fmtDateTime(b.created_at)}</td>
                      <td><Link to={`/institution/batches/${b.batch_id}`} className="break-all" onClick={(e) => e.stopPropagation()}>{b.filename}</Link></td>
                      <td className="text-muted">{b.uploaded_by ?? '—'}</td>
                      <td><StatusTag value={b.status} /></td>
                      <td className="num">{b.counts.total}</td>
                      <td className="num">{b.counts.accepted}</td>
                      <td className="num">{b.counts.warnings}</td>
                      <td className="num">{b.counts.holds}</td>
                      <td className={`num ${b.counts.rejected ? 'text-bad font-semibold' : ''}`}>{b.counts.rejected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
