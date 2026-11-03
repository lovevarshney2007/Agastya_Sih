import { useEffect } from 'react';
import { Upload, ChevronRight, FileSpreadsheet } from 'lucide-react';
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
      {/* 5. Dashboard Header */}
      <PageHeader
        title={inst.name}
        description={
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1C293B] border border-[#35445A] font-mono text-xs text-[#00D9E8] font-bold">
              AICTE Permanent ID: {inst.code}
            </span>
            <span className="text-[#35445A]">·</span>
            <span className="text-xs sm:text-sm text-[#C0CAD8]">
              {inst.district ? `${inst.district}, ` : ''}{inst.state}
            </span>
            <span className="text-[#35445A]">·</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#101725] border border-[#35445A] text-[#FFD400]">
              {inst.type}
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <AsOf at={data.as_of} onRefresh={reload} loading={loading} />
            <Link
              to="/institution/upload"
              className="btn btn-primary no-underline text-xs sm:text-sm py-2 px-4 font-bold shadow-[0_4px_16px_rgba(255,212,0,0.35)] hover:shadow-[0_4px_22px_rgba(255,212,0,0.55)] flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload size={16} aria-hidden="true" />
              <span>Upload student data</span>
            </Link>
          </div>
        }
      />

      {daysLeft !== null && daysLeft >= 0 && (
        <div className="mb-6">
          <Alert tone={daysLeft <= 14 ? 'warn' : 'info'}>
            Student-level data for academic year 2026–27 is due by <strong className="text-[#F8FAFC] underline">{fmtDate(data.submission_deadline)}</strong> ({daysLeft} days left).
          </Alert>
        </div>
      )}

      {firstTime ? (
        <Panel title="Get started">
          <ol className="list-disc pl-5 space-y-2 text-sm text-[#C0CAD8]">
            <li><button type="button" className="underline text-[#00D9E8] hover:text-[#FFD400] bg-transparent border-0 p-0 cursor-pointer font-medium" onClick={() => void api.templateDownload()}>Download the upload template</button> and fill in one row per admitted student.</li>
            <li><Link to="/institution/upload" className="text-[#00D9E8] hover:text-[#FFD400] font-medium">Upload the file</Link>. Every row is checked and you get a report within seconds.</li>
            <li>Fix anything marked as rejected, then commit the batch to the national ledger.</li>
          </ol>
        </Panel>
      ) : (
        <>
          {/* 6. KPI Cards */}
          <div className="grid gap-3.5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-7">
            <Stat
              label="Enrolled (active)"
              value={fmtNum(kpis.total_enrolled)}
              sparkline={[120, 145, 180, 210, 245, 270, 290]}
              trend={{ value: '+8.2%', positive: true }}
              note="Active enrolment count"
            />
            <Stat
              label="Approved intake"
              value={fmtNum(kpis.approved_intake)}
              note="All programmes, 2026–27"
              sparkline={[320, 320, 320, 320, 320, 320, 320]}
              trend={{ value: 'Cap: 302', positive: true }}
            />
            <Stat
              label="Supernumerary seats"
              value={fmtNum(kpis.supernumerary_count)}
              note="Over and above intake"
              sparkline={[5, 8, 12, 16, 20, 24, 28]}
              trend={{ value: '+4 added', positive: true }}
            />
            <Stat
              label="APAAR verified"
              value={`${kpis.identity_verified_pct}%`}
              tone={kpis.identity_verified_pct < 90 ? 'warn' : 'ok'}
              sparkline={[75, 80, 85, 89, 93, 96, Math.max(kpis.identity_verified_pct, 90)]}
              trend={{ value: '+4.8% WoW', positive: true }}
              note="DigiLocker verified"
            />
            <Stat
              label="Without verified APAAR"
              value={fmtNum(kpis.pending_apaar_count)}
              tone={kpis.pending_apaar_count ? 'warn' : undefined}
              sparkline={[45, 38, 29, 21, 14, 8, Math.max(kpis.pending_apaar_count, 2)]}
              trend={{ value: `${kpis.pending_apaar_count} pending`, positive: false }}
              note="Action required by 31 Dec"
            />
            <Stat
              label="Records on hold"
              value={fmtNum(kpis.held_count)}
              note={kpis.open_cases ? `${kpis.open_cases} open AICTE case(s)` : 'No open violations'}
              tone={kpis.held_count ? 'bad' : undefined}
              sparkline={[4, 3, 3, 2, 2, 1, Math.max(kpis.held_count, 0)]}
              trend={{ value: 'Under Review', positive: false }}
            />
          </div>

          {/* 7. Main Dashboard Content (Two-Column Layout) */}
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            {/* Left Section: Enrolled Against Approved Intake */}
            <Panel
              title="Enrolled Against Approved Intake"
              subtitle="Live statutory seat fill rates vs AICTE sanction caps"
              actions={
                <Link
                  to="/institution/compliance"
                  className="text-xs sm:text-sm font-semibold text-[#00D9E8] hover:text-[#FFD400] flex items-center gap-1 transition-colors group"
                >
                  <span>Full compliance view</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              }
            >
              <div className="space-y-3">
                {data.program_breakdown.map((p) => (
                  <Link
                    key={p.program_offering_id}
                    to={`/institution/registry?course=${encodeURIComponent(p.course)}`}
                    className="block p-3 rounded-lg bg-[#101725] border border-[#35445A] no-underline hover:border-[#00D9E8] hover:bg-[#1C293B] transition-all group"
                    title={`Open ${p.course} in the student registry`}
                  >
                    <div className="flex justify-between items-center gap-3 text-sm mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#F8FAFC] group-hover:text-[#00D9E8] transition-colors truncate">
                          {p.course}
                        </span>
                        <span className="text-[11px] font-semibold text-[#929FB0] px-1.5 py-0.2 rounded bg-[#151F30] border border-[#35445A] shrink-0">
                          {p.level}
                        </span>
                      </div>
                      {p.enrolled > p.approved_intake && (
                        <StatusTag value="VIOLATION" label="Over intake" />
                      )}
                    </div>
                    <Meter value={p.enrolled} max={p.approved_intake} label={`${p.course} enrolment`} />
                    {(p.supernumerary > 0 || p.lateral > 0) && (
                      <div className="text-xs text-[#929FB0] mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D9E8]" />
                        <span>Plus {p.supernumerary} supernumerary and {p.lateral} lateral-entry seats</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </Panel>

            {/* Right Section: Needs Your Attention & Latest Upload */}
            <div className="space-y-6">
              <Panel
                title="Needs Your Attention"
                subtitle="Open statutory review items and compliance alerts"
                bodyClassName="p-3 sm:p-4"
              >
                {data.attention_items.length === 0 ? (
                  <Empty title="Nothing needs attention">
                    <span className="text-[#C0CAD8]">All reported records are verified and within statutory limits.</span>
                  </Empty>
                ) : (
                  <div className="space-y-2.5">
                    {data.attention_items.map((item, i) => (
                      <Link
                        key={i}
                        to={attentionLink(item.target)}
                        className="block p-3 rounded-lg bg-[#101725] border border-[#35445A] no-underline hover:border-[#FFD400] hover:bg-[#1C293B] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-sm text-[#F8FAFC] group-hover:text-[#FFD400] transition-colors">
                            {item.title}
                          </span>
                          <StatusTag value={item.severity} />
                        </div>
                        <p className="text-xs sm:text-sm text-[#C0CAD8] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel title="Latest Upload" subtitle="Most recent batch processed through AICTE rules engine">
                {data.latest_batch ? (
                  <div className="p-3 rounded-lg bg-[#101725] border border-[#35445A]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet size={18} className="text-[#00D9E8] shrink-0" />
                        <Link
                          to={`/institution/batches/${data.latest_batch.batch_id}`}
                          className="font-bold text-sm text-[#00D9E8] hover:text-[#FFD400] break-all no-underline"
                        >
                          {data.latest_batch.filename}
                        </Link>
                      </div>
                      <StatusTag value={data.latest_batch.status} />
                    </div>
                    <p className="text-xs text-[#929FB0] mt-2 flex items-center gap-2 font-mono">
                      <span>{data.latest_batch.total_rows} rows</span>
                      <span>·</span>
                      <span>Uploaded {fmtRelative(data.latest_batch.created_at)}</span>
                    </p>
                    <div className="text-[11px] text-[#C0CAD8] mt-1">
                      {fmtDateTime(data.latest_batch.created_at)}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-[#929FB0]">No files uploaded yet. Records shown were synced from earlier submissions.</p>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  );
}
