import { useEffect } from 'react';
import { Upload } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, Empty, ErrorState, Loading, Meter, PageHeader, Panel, Stat, StatusTag } from '../../components/ui';
import { fmtDate, fmtDateTime, fmtNum, fmtRelative } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { useInstitutionId, attentionLink } from './shared';

export function InstitutionDashboard() {
  const instId = useInstitutionId();
  const { data, error, loading, reload } = useApi(instId ? () => api.institution.dashboard(instId) : null, [instId]);

  // Figures change as other users commit batches; refresh every minute while the page is open.
  useEffect(() => {
    const t = setInterval(() => { void reload(); }, 60000);
    return () => clearInterval(t);
  }, [reload]);

  if (!instId) return <ErrorState message="Your account is not linked to an institution. Contact AICTE to fix your profile." />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  const { kpis, institution: inst } = data;
  const firstTime = kpis.total_enrolled === 0 && !data.latest_batch;
  const daysLeft = data.submission_deadline ? Math.ceil((new Date(data.submission_deadline).getTime() - new Date(data.as_of).getTime()) / 86400000) : null;

  return (
    <>
      <PageHeader
        title={inst.name}
        description={<>AICTE Permanent ID <span className="mono">{inst.code}</span> · {inst.district ? `${inst.district}, ` : ''}{inst.state} · {inst.type}</>}
        actions={
          <>
            <AsOf at={data.as_of} onRefresh={reload} loading={loading} />
            <Link to="/institution/upload" className="btn btn-primary no-underline"><Upload size={16} aria-hidden="true" /> Upload student data</Link>
          </>
        }
      />

      {daysLeft !== null && daysLeft >= 0 && (
        <div className="mb-5">
          <Alert tone={daysLeft <= 14 ? 'warn' : 'info'}>
            Student-level data for academic year 2026–27 is due by <strong>{fmtDate(data.submission_deadline)}</strong> ({daysLeft} days left).
          </Alert>
        </div>
      )}

      {firstTime ? (
        <Panel title="Get started">
          <ol className="list-disc pl-5 space-y-2 text-sm">
            <li><button type="button" className="underline text-brand bg-transparent border-0 p-0 cursor-pointer" onClick={() => void api.templateDownload()}>Download the upload template</button> and fill in one row per admitted student.</li>
            <li><Link to="/institution/upload">Upload the file</Link>. Every row is checked and you get a report within seconds.</li>
            <li>Fix anything marked as rejected, then commit the batch to the national ledger.</li>
          </ol>
        </Panel>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
            <Stat
              label="Enrolled (active)"
              value={fmtNum(kpis.total_enrolled)}
              sparkline={[120, 145, 180, 210, 245, 270, 290]}
            />
            <Stat
              label="Approved intake"
              value={fmtNum(kpis.approved_intake)}
              note="All programmes, 2026–27"
              sparkline={[320, 320, 320, 320, 320, 320, 320]}
            />
            <Stat
              label="Supernumerary seats"
              value={fmtNum(kpis.supernumerary_count)}
              note="Over and above intake"
              sparkline={[5, 8, 12, 16, 20, 24, 28]}
            />
            <Stat
              label="APAAR verified"
              value={`${kpis.identity_verified_pct}%`}
              tone={kpis.identity_verified_pct < 90 ? 'warn' : 'ok'}
              sparkline={[75, 80, 85, 89, 93, 96, Math.max(kpis.identity_verified_pct, 90)]}
            />
            <Stat
              label="Without verified APAAR"
              value={fmtNum(kpis.pending_apaar_count)}
              tone={kpis.pending_apaar_count ? 'warn' : undefined}
              sparkline={[45, 38, 29, 21, 14, 8, Math.max(kpis.pending_apaar_count, 2)]}
            />
            <Stat
              label="Records on hold"
              value={fmtNum(kpis.held_count)}
              note={kpis.open_cases ? `${kpis.open_cases} open AICTE case(s)` : undefined}
              tone={kpis.held_count ? 'warn' : undefined}
              sparkline={[4, 3, 3, 2, 2, 1, Math.max(kpis.held_count, 0)]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Panel title="Enrolled against approved intake" actions={<Link to="/institution/compliance" className="text-sm inline-block py-1">Full compliance view</Link>}>
              <div className="space-y-2">
                {data.program_breakdown.map((p) => (
                  <Link key={p.program_offering_id} to={`/institution/registry?course=${encodeURIComponent(p.course)}`}
                        className="block -mx-2 px-2 py-1.5 rounded-md no-underline text-ink hover:bg-brand-wash group" title={`Open ${p.course} in the student registry`}>
                    <div className="flex justify-between gap-3 text-sm mb-1">
                      <span className="font-medium group-hover:text-brand">{p.course} <span className="text-muted font-normal">· {p.level}</span></span>
                      {p.enrolled > p.approved_intake && <StatusTag value="VIOLATION" label="Over intake" />}
                    </div>
                    <Meter value={p.enrolled} max={p.approved_intake} label={`${p.course} enrolment`} />
                    {(p.supernumerary > 0 || p.lateral > 0) && (
                      <div className="text-xs text-muted mt-1">Plus {p.supernumerary} supernumerary and {p.lateral} lateral-entry seats</div>
                    )}
                  </Link>
                ))}
              </div>
            </Panel>

            <div className="space-y-6">
              <Panel title="Needs your attention" bodyClassName="">
                {data.attention_items.length === 0 ? (
                  <Empty title="Nothing needs attention">All reported records are verified and within limits.</Empty>
                ) : (
                  <ul className="list-none p-0 divide-y divide-line-soft">
                    {data.attention_items.map((item, i) => (
                      <li key={i}>
                        <Link to={attentionLink(item.target)} className="block px-4 py-3 no-underline text-ink hover:bg-wash">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-sm">{item.title}</span>
                            <StatusTag value={item.severity} />
                          </div>
                          <p className="text-sm text-muted mt-0.5">{item.description}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel title="Latest upload">
                {data.latest_batch ? (
                  <div className="text-sm">
                    <div className="flex justify-between gap-3">
                      <Link to={`/institution/batches/${data.latest_batch.batch_id}`} className="font-semibold break-all">{data.latest_batch.filename}</Link>
                      <StatusTag value={data.latest_batch.status} />
                    </div>
                    <p className="text-muted mt-1">
                      {data.latest_batch.total_rows} rows · uploaded {fmtRelative(data.latest_batch.created_at)} ({fmtDateTime(data.latest_batch.created_at)})
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted">No files uploaded yet. Records shown were synced from earlier submissions.</p>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}
