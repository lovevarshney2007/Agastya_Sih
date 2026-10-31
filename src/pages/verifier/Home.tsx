import { useState } from 'react';
import { Camera } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, Empty, ErrorState, Field, Loading, Meter, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { QrCameraScanner } from '../../components/QrCameraScanner';
import { fmtDateTime } from '../../lib/format';
import { Link, useRouter } from '../../lib/router';
import { useAction, useApi } from '../../lib/useApi';

export function VerifierHome() {
  const { navigate } = useRouter();
  const { data, error, loading, loadedAt, reload } = useApi(() => api.verifier.tracker(), []);
  const [apaar, setApaar] = useState('');
  const [purpose, setPurpose] = useState('');
  const [sent, setSent] = useState<{ message: string; token: string; status: string } | null>(null);
  const [shared, setShared] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const submit = useAction(() => api.verifier.submit(apaar, purpose));
  const withdraw = useAction((token: string) => api.verifier.withdraw(token));

  const digits = apaar.replace(/\D/g, '');
  const apaarError = apaar && digits.length !== 12 ? 'An APAAR ID has exactly 12 digits.' : null;
  const quotaFull = data ? data.quota.remaining <= 0 : false;

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Verification requests"
        description={data ? <>Verifying on behalf of <strong>{data.organisation.name}</strong>. Students are asked for consent before anything is shared with you.</> : undefined}
        actions={<AsOf at={loadedAt} onRefresh={reload} loading={loading} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <Panel title="New request">
            {sent ? (
              <div className="space-y-3">
                <Alert tone={sent.status === 'VALID' ? 'ok' : 'info'} title="Request sent">{sent.message}</Alert>
                <div className="flex gap-2">
                  {sent.status === 'VALID' && <Link to={`/verifier/requests/${sent.token}`} className="btn btn-primary no-underline">View result</Link>}
                  <button type="button" className="btn btn-secondary" onClick={() => { setSent(null); setApaar(''); }}>New request</button>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const res = await submit.run();
                if (res) { setSent({ message: res.message, token: res.token, status: res.status }); void reload(); }
              }}>
                {submit.error && <Alert tone="bad">{submit.error}</Alert>}
                {quotaFull && <Alert tone="warn">Your organisation has used this month’s quota.</Alert>}
                <Field label="Student’s APAAR ID" hint="Ask the student for it. Try 663910284422 (demo student)." error={apaarError} htmlFor="v-apaar">
                  <input id="v-apaar" className="input mono tracking-wider" inputMode="numeric" maxLength={14} required aria-invalid={!!apaarError}
                         value={apaar} onChange={(e) => setApaar(e.target.value.replace(/[^\d\s]/g, ''))} placeholder="12 digits" />
                </Field>
                <Field label="Purpose" hint="Only your organisation’s approved purposes are listed." htmlFor="v-purpose">
                  <select id="v-purpose" className="select" required value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    <option value="" disabled>Choose a purpose</option>
                    {data?.approved_purposes.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <button type="submit" className="btn btn-primary" disabled={!!apaarError || digits.length !== 12 || !purpose || submit.pending || quotaFull}>
                  {submit.pending && <Spinner />} Send request
                </button>
              </form>
            )}
          </Panel>

          <Panel
            title="Instant QR & Link Verifier"
            actions={
              <button
                type="button"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                onClick={() => setCameraOpen(!cameraOpen)}
              >
                <Camera size={14} />
                {cameraOpen ? 'Hide Camera' : 'Scan Student QR'}
              </button>
            }
          >
            {cameraOpen ? (
              <QrCameraScanner
                onScan={(result) => {
                  if (result.token) {
                    navigate(`/verify/${encodeURIComponent(result.token)}`);
                  }
                }}
                onClose={() => setCameraOpen(false)}
              />
            ) : (
              <form className="flex gap-2" onSubmit={(e) => {
                e.preventDefault();
                const token = shared.trim().split('/').filter(Boolean).pop();
                if (token) navigate(`/verify/${encodeURIComponent(token)}`);
              }}>
                <label htmlFor="v-shared" className="sr-only">Shared link or code</label>
                <input id="v-shared" className="input mono flex-1" value={shared} onChange={(e) => setShared(e.target.value)} placeholder="Link or code (e.g. demo-priya-tcs-2026)" />
                <button type="submit" className="btn btn-secondary" disabled={!shared.trim()}>Open</button>
              </form>
            )}
          </Panel>

          {data && (
            <Panel title="Your organisation">
              <div className="text-sm space-y-3">
                <div>
                  <div className="text-muted mb-1">Requests this month</div>
                  <Meter value={data.quota.used} max={data.quota.limit} label="Monthly quota" />
                </div>
                <div>
                  <div className="text-muted">Approved purposes</div>
                  <ul className="list-disc pl-5">{data.approved_purposes.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
                <p className="text-xs text-muted">Use results only for the stated purpose. Every request is logged and shown to the student.</p>
              </div>
            </Panel>
          )}
        </div>

        <Panel title="Tracker" bodyClassName="">
          {!data ? <div className="p-4"><Loading rows={6} /></div> : data.requests.length === 0 ? (
            <Empty title="No requests yet">Requests you send appear here with their status.</Empty>
          ) : (
            <>
              {withdraw.error && <div className="p-3"><Alert tone="bad">{withdraw.error}</Alert></div>}
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Request</th><th>Purpose</th><th>Sent</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {data.requests.map((r) => (
                      <tr key={r.request_id}>
                        <td className="mono text-xs">{r.request_id.slice(0, 8).toUpperCase()}</td>
                        <td>{r.purpose}</td>
                        <td className="whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
                        <td><StatusTag value={r.status} /></td>
                        <td className="whitespace-nowrap text-right">
                          {['VALID', 'REVOKED', 'EXPIRED'].includes(r.status) && <Link to={`/verifier/requests/${r.token}`} className="btn btn-secondary btn-sm no-underline">View result</Link>}
                          {r.status === 'AWAITING_CONSENT' && (
                            <button type="button" className="btn btn-ghost btn-sm" disabled={withdraw.pending}
                                    onClick={async () => { if (await withdraw.run(r.token)) void reload(); }}>Withdraw</button>
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
      </div>
    </>
  );
}
