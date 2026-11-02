import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../../api/client';
import type { StudentShare } from '../../api/types';
import { Alert, DataCard, Empty, ErrorState, Field, KeyValue, Loading, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDate, humanize, verifyLink } from '../../lib/format';
import { useAction, useApi } from '../../lib/useApi';

function QrImage({ value }: { value: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(value, { margin: 1, width: 200, color: { dark: '#1b2333', light: '#ffffff' } })
      .then((url) => { if (live) setSrc(url); })
      .catch(() => { if (live) setSrc(null); });
    return () => { live = false; };
  }, [value]);
  return src ? <img src={src} alt="QR code for the shared record" className="w-40 h-40" /> : <div className="w-40 h-40 skeleton" />;
}

export function ShareRecord() {
  const { data, error, reload, setData } = useApi(() => api.student.me(), []);
  const [enrolmentId, setEnrolmentId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [days, setDays] = useState(30);
  const [created, setCreated] = useState<StudentShare | null>(null);
  const [copied, setCopied] = useState(false);
  const create = useAction(async (id: string) => {
    const share = await api.student.share(id, purpose.trim(), days);
    setData(await api.student.me());
    return share;
  });
  const revoke = useAction(async (token: string) => {
    await api.student.revokeShare(token);
    setData(await api.student.me());
    return true;
  });

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  const shareable = data.enrolments.filter((e) => e.verification_status === 'ACCEPTED' && ['ACTIVE', 'COMPLETED'].includes(e.status));
  const chosen = shareable.find((e) => e.enrolment_id === enrolmentId) ?? shareable[0];

  return (
    <>
      <PageHeader title="Share my record" description="Create a signed link and QR code that shows your enrolment. You can revoke it at any time." />

      {shareable.length === 0 ? (
        <Panel><Empty title="Nothing to share yet">Only a verified, active or completed enrolment can be shared. Check <em>My record</em> for anything pending.</Empty></Panel>
      ) : created ? (
        <Panel title="Your link is ready">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <QrImage value={verifyLink(created.token)} />
            <div className="flex-1 min-w-0 w-full space-y-3 text-sm">
              <p>Anyone with this link or QR code can see the details below until <strong>{fmtDate(created.expires_at)}</strong>.</p>
              <div className="flex gap-2">
                <input className="input mono text-xs flex-1 min-w-0" readOnly value={verifyLink(created.token)} aria-label="Share link" onFocus={(e) => e.currentTarget.select()} />
                <button type="button" className="btn btn-secondary shrink-0" onClick={async () => {
                  try { await navigator.clipboard.writeText(verifyLink(created.token)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
                }}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a href={verifyLink(created.token)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm no-underline text-center">Open as the recipient sees it</a>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setCreated(null); setPurpose(''); }}>Create another</button>
              </div>
            </div>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Panel title="New share">
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault();
              const share = await create.run(chosen.enrolment_id);
              if (share) setCreated(share);
            }}>
              {create.error && <Alert tone="bad">{create.error}</Alert>}
              <Field label="Enrolment" htmlFor="sh-enrol">
                <select id="sh-enrol" className="select" value={chosen.enrolment_id} onChange={(e) => setEnrolmentId(e.target.value)}>
                  {shareable.map((e) => <option key={e.enrolment_id} value={e.enrolment_id}>{e.course} — {e.institution}</option>)}
                </select>
              </Field>
              <Field label="Why are you sharing it?" hint="Shown in your own history, e.g. “Job application at Infosys”." htmlFor="sh-purpose">
                <input id="sh-purpose" className="input" required minLength={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </Field>
              <Field label="Valid for" htmlFor="sh-days">
                <select id="sh-days" className="select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {[7, 30, 90, 180].map((d) => <option key={d} value={d}>{d} days</option>)}
                </select>
              </Field>
              <Alert tone="warn">Anyone you give the link to can open it. Share it only with the organisation that asked.</Alert>
              <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={purpose.trim().length < 3 || create.pending}>{create.pending && <Spinner />} Create link and QR</button>
            </form>
          </Panel>

          <Panel title="What the recipient will see">
            <KeyValue items={[
              ['Status', <StatusTag key="kv13" value="VALID" />],
              ['Institution', chosen.institution],
              ['Programme', chosen.course],
              ['Academic year', chosen.academic_year],
              ['Enrolment status', humanize(chosen.status)],
            ]} />
            <p className="text-xs text-muted mt-4">Plus a credential ID and AICTE’s signature. Not your name, date of birth, APAAR number or seat category.</p>
          </Panel>
        </div>
      )}

      <Panel title="Earlier shares" className="mt-6" bodyClassName="">
        {revoke.error && <div className="p-3"><Alert tone="bad">{revoke.error}</Alert></div>}
        {data.shares.length === 0 ? <Empty title="You have not shared your record yet" /> : (
          <>
            {/* Mobile Dual Pattern: Earlier Shares */}
            <div className="p-3 space-y-3 md:hidden">
              {data.shares.map((s) => (
                <DataCard
                  key={s.token}
                  title={s.purpose}
                  subtitle={`Created ${fmtDate(s.created_at)}`}
                  badge={{
                    label: s.status,
                    tone: s.status === 'VALID' ? 'ok' : 'bad',
                  }}
                  fields={[
                    { label: 'Expires On', value: fmtDate(s.expires_at) },
                    { label: 'Token Snippet', value: `${s.token.slice(0, 14)}...`, isMono: true },
                  ]}
                  actions={
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <a href={verifyLink(s.token)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm w-full text-center flex items-center justify-center no-underline">
                        Open Link
                      </a>
                      {s.status === 'VALID' ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm w-full text-bad"
                          disabled={revoke.pending}
                          onClick={() => void revoke.run(s.token)}
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-muted self-center text-center">Revoked</span>
                      )}
                    </div>
                  }
                />
              ))}
            </div>

            {/* Desktop Full Table */}
            <div className="hidden md:block table-wrap">
              <table className="data-table">
                <thead><tr><th>Purpose</th><th>Created</th><th>Expires</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {data.shares.map((s) => (
                    <tr key={s.token}>
                      <td>{s.purpose}</td>
                      <td className="whitespace-nowrap">{fmtDate(s.created_at)}</td>
                      <td className="whitespace-nowrap">{fmtDate(s.expires_at)}</td>
                      <td><StatusTag value={s.status} /></td>
                      <td className="text-right whitespace-nowrap">
                        <a href={verifyLink(s.token)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm no-underline">Open</a>
                        {s.status === 'VALID' && (
                          <button type="button" className="btn btn-secondary btn-sm ml-1" disabled={revoke.pending} onClick={() => void revoke.run(s.token)}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
