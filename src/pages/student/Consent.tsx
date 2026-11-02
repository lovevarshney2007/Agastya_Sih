import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import type { Consent } from '../../api/types';
import { Alert, DataCard, Empty, ErrorState, Loading, Modal, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDate, fmtDateTime } from '../../lib/format';
import { useAction, useApi } from '../../lib/useApi';
import { MeriPehchaanModal } from '../../components/MeriPehchaanModal';

const SCOPE_TEXT: Record<string, string> = {
  institution: 'the institution you are enrolled at',
  programme: 'your programme',
  academic_year: 'the academic year',
  status: 'whether you are currently enrolled',
};

export function ConsentCentre() {
  const { data, error, reload, setData } = useApi(() => api.student.me(), []);
  const [tab, setTab] = useState<'active' | 'history' | 'log'>('active');
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [revoking, setRevoking] = useState<Consent | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [meriPehchaanOpen, setMeriPehchaanOpen] = useState(false);
  const act = useAction(async (id: string, action: 'APPROVE' | 'DENY' | 'REVOKE', days?: number) => {
    const res = await api.student.consent(id, action, days);
    setData(await api.student.me());
    return res;
  });

  if (!data && !error) return <Loading rows={8} />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  async function respond(c: Consent, action: 'APPROVE' | 'DENY' | 'REVOKE') {
    const res = await act.run(c.consent_id, action, action === 'APPROVE' ? durations[c.consent_id] ?? 30 : undefined);
    if (res) {
      setDone(action === 'APPROVE' ? `${c.verifier_name} can now see your record until ${fmtDate(res.expires_at)}.`
        : action === 'DENY' ? `You refused ${c.verifier_name}’s request. They have not been told why.`
        : `Consent for ${c.verifier_name} is withdrawn. Their credential now shows as revoked.`);
      setRevoking(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Consent"
        description="Decide who may verify your enrolment, and see who already has."
        actions={
          <button
            type="button"
            onClick={() => setMeriPehchaanOpen(true)}
            className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 font-semibold text-brand w-full sm:w-auto"
            title="Open MeriPehchaan National Single Sign-On Gateway"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>MeriPehchaan Gateway</span>
          </button>
        }
      />
      {done && <div className="mb-5"><Alert tone="ok" onClose={() => setDone(null)}>{done}</Alert></div>}
      {act.error && <div className="mb-5"><Alert tone="bad" onClose={act.clearError}>{act.error}</Alert></div>}

      <Panel title={`Waiting for your answer (${data.pending.length})`} className="mb-6">
        {data.pending.length === 0 ? <p className="text-sm text-muted">No requests are waiting.</p> : (
          <ul className="list-none p-0 space-y-4">
            {data.pending.map((c) => (
              <li key={c.consent_id} className="border border-line rounded-lg p-4 bg-surface">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <div className="font-bold text-ink">{c.verifier_name}</div>
                    <div className="text-sm text-muted">Asked {fmtDateTime(c.requested_at)} · for {c.purpose.toLowerCase()}</div>
                  </div>
                  <StatusTag value={c.status} />
                </div>
                <p className="text-sm mt-3 mb-3 text-ink">If you approve, they will see only: <em>{c.scope.map((s) => SCOPE_TEXT[s] ?? s).join(', ')}</em>. Not your date of birth, contact details, APAAR number or category.</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm flex items-center gap-2">For
                    <select className="select !w-auto !py-1" value={durations[c.consent_id] ?? 30} onChange={(e) => setDurations((d) => ({ ...d, [c.consent_id]: Number(e.target.value) }))}>
                      {[7, 30, 90, 180].map((d) => <option key={d} value={d}>{d} days</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button type="button" className="btn btn-primary btn-sm flex-1 sm:flex-initial" disabled={act.pending} onClick={() => respond(c, 'APPROVE')}>{act.pending && <Spinner size={14} />} Approve</button>
                    <button type="button" className="btn btn-secondary btn-sm flex-1 sm:flex-initial" disabled={act.pending} onClick={() => respond(c, 'DENY')}>Refuse</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto no-scrollbar scroll-fade flex-nowrap" role="tablist">
        {([['active', `Active (${data.active.length})`], ['history', `Past (${data.history.length})`], ['log', `Who verified me (${data.access_log.length})`]] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                  className={`px-4 py-2 text-sm border-0 bg-transparent cursor-pointer border-b-[3px] -mb-px whitespace-nowrap shrink-0 ${tab === id ? 'border-brand font-semibold text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>

      <Panel bodyClassName="">
        {tab === 'active' && (data.active.length === 0 ? <Empty title="No active consents" /> : (
          <>
            {/* Mobile Dual Pattern: Active Consents */}
            <div className="p-3 space-y-3 md:hidden">
              {data.active.map((c) => (
                <DataCard
                  key={c.consent_id}
                  title={c.verifier_name}
                  subtitle={c.purpose}
                  badge={{ label: 'ACTIVE', tone: 'ok' }}
                  fields={[
                    { label: 'Granted Since', value: fmtDate(c.granted_at) },
                    { label: 'Expires On', value: fmtDate(c.expires_at) },
                  ]}
                  actions={
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm w-full text-bad"
                      onClick={() => setRevoking(c)}
                    >
                      Withdraw Consent
                    </button>
                  }
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead><tr><th>Organisation</th><th>Purpose</th><th>Since</th><th>Until</th><th></th></tr></thead>
                <tbody>
                  {data.active.map((c) => (
                    <tr key={c.consent_id}>
                      <td className="font-semibold">{c.verifier_name}</td><td>{c.purpose}</td>
                      <td className="whitespace-nowrap">{fmtDate(c.granted_at)}</td><td className="whitespace-nowrap">{fmtDate(c.expires_at)}</td>
                      <td className="text-right"><button type="button" className="btn btn-secondary btn-sm" onClick={() => setRevoking(c)}>Withdraw</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
        {tab === 'history' && (data.history.length === 0 ? <Empty title="Nothing here yet" /> : (
          <>
            {/* Mobile Dual Pattern: History */}
            <div className="p-3 space-y-3 md:hidden">
              {data.history.map((c) => (
                <DataCard
                  key={c.consent_id}
                  title={c.verifier_name}
                  subtitle={c.purpose}
                  badge={{
                    label: c.status,
                    tone: c.status === 'REVOKED' || c.status === 'EXPIRED' || c.status === 'DENIED' ? 'bad' : 'neutral',
                  }}
                  fields={[
                    { label: 'Requested At', value: fmtDate(c.requested_at) },
                    { label: 'Outcome Status', value: c.status },
                  ]}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead><tr><th>Organisation</th><th>Purpose</th><th>Requested</th><th>Outcome</th></tr></thead>
                <tbody>
                  {data.history.map((c) => (
                    <tr key={c.consent_id}><td className="font-semibold">{c.verifier_name}</td><td>{c.purpose}</td><td className="whitespace-nowrap">{fmtDate(c.requested_at)}</td><td><StatusTag value={c.status} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
        {tab === 'log' && (data.access_log.length === 0 ? <Empty title="No one has verified your record" /> : (
          <>
            {/* Mobile Dual Pattern: Access Log */}
            <div className="p-3 space-y-3 md:hidden">
              {data.access_log.map((l, i) => (
                <DataCard
                  key={i}
                  title={l.verifier_name}
                  subtitle={fmtDateTime(l.at)}
                  badge={{
                    label: l.result,
                    tone: (l.result as string) === 'SUCCESS' || (l.result as string) === 'VALID' ? 'ok' : 'warn',
                  }}
                  fields={[
                    { label: 'Stated Purpose', value: l.purpose },
                    { label: 'Timestamp', value: fmtDateTime(l.at) },
                  ]}
                />
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead><tr><th>When</th><th>Organisation</th><th>Purpose</th><th>Result</th></tr></thead>
                <tbody>
                  {data.access_log.map((l, i) => (
                    <tr key={i}><td className="whitespace-nowrap">{fmtDateTime(l.at)}</td><td className="font-semibold">{l.verifier_name}</td><td>{l.purpose}</td><td><StatusTag value={l.result} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
      </Panel>

      <Modal open={!!revoking} onClose={() => setRevoking(null)} title="Withdraw consent?"
             footer={revoking && (
               <>
                 <button type="button" className="btn btn-secondary" onClick={() => setRevoking(null)}>Keep it</button>
                 <button type="button" className="btn btn-danger" disabled={act.pending} onClick={() => respond(revoking, 'REVOKE')}>{act.pending && <Spinner />} Withdraw consent</button>
               </>
             )}>
        {revoking && <p className="text-sm">{revoking.verifier_name} will no longer be able to rely on your record. Any credential they hold will show as <strong>revoked</strong> the next time it is checked.</p>}
      </Modal>

      <MeriPehchaanModal
        isOpen={meriPehchaanOpen}
        onClose={() => setMeriPehchaanOpen(false)}
        onSuccess={() => {
          setDone('Successfully synchronized with MeriPehchaan NSSO & Academic Bank of Credits!');
          void reload();
        }}
        studentName={data?.student?.name || 'Priya Sharma'}
      />
    </>
  );
}
