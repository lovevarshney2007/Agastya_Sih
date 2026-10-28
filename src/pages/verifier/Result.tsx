import { useState } from 'react';
import { CircleCheck, Download, ShieldAlert } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, ErrorState, KeyValue, Loading, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDate, fmtDateTime, fmtTime, humanize, verifyLink } from '../../lib/format';
import { useAction, useApi } from '../../lib/useApi';

export function VerificationResult({ token }: { token: string }) {
  const { data, error, loading, loadedAt, reload } = useApi(() => api.verifier.result(token), [token]);
  const pdf = useAction(() => api.verifier.downloadPdf(token));
  const [copied, setCopied] = useState(false);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  const valid = data.status === 'VALID';
  const bannerClass = valid ? 'bg-ok' : data.status === 'REVOKED' ? 'bg-bad' : 'bg-[#4a5465]';

  return (
    <>
      <PageHeader back={{ to: '/verifier', label: 'All requests' }} title="Verification result"
                  description={<>Request <span className="mono">{data.request_id.slice(0, 8).toUpperCase()}</span> · {data.purpose}</>} />

      <div className="panel overflow-hidden">
        <div className={`${bannerClass} text-white px-5 py-4 flex items-center gap-3`}>
          {valid ? <CircleCheck size={28} className="animate-pop" aria-hidden="true" /> : <ShieldAlert size={28} className="animate-pop" aria-hidden="true" />}
          <div>
            <div className="text-xl font-bold tracking-wide">{data.status === 'AWAITING_CONSENT' ? 'AWAITING CONSENT' : data.status}</div>
            <div className="text-sm opacity-90">
              {valid ? `Valid until ${fmtDate(data.expires_at)}, when the student’s consent ends.`
                : data.status === 'REVOKED' ? 'The student withdrew consent. Do not rely on this result.'
                : data.status === 'EXPIRED' ? 'The consent period has ended. Send a new request if you still need this.'
                : 'Nothing is shared until the student responds.'}
            </div>
          </div>
        </div>

        <div className="p-5 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            {data.claims ? (
              <KeyValue items={[
                ['Institution', data.claims.institution],
                ['Programme', data.claims.programme],
                ['Academic year', data.claims.academic_year],
                ['Enrolment status', humanize(data.claims.status)],
                ['Verified at', fmtDateTime(data.verified_at)],
                ['Credential ID', <span key="kv1" className="mono">{data.credential_id}</span>],
                ['Signature', data.signature?.valid
                  ? <span key="kv2" className="text-ok font-semibold">Signed by AICTE · key <span className="mono">{data.signature.key_id.split('#')[1]}</span></span>
                  : <span key="kv3" className="text-bad font-semibold">Signature did not verify</span>],
              ]} />
            ) : <p className="text-sm text-muted">No claims are available for this request.</p>}

            <Alert tone="info">Use only for <strong>{data.purpose.toLowerCase()}</strong>. This access is logged and visible to the student.</Alert>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-primary" disabled={!valid || pdf.pending} onClick={() => void pdf.run()}>
                {pdf.pending ? <Spinner /> : <Download size={16} aria-hidden="true" />} Download PDF
              </button>
              <button type="button" className="btn btn-secondary" onClick={reload} disabled={loading}>{loading && <Spinner />} Re-check status</button>
              <span className="text-xs text-muted">Checked {fmtTime(loadedAt)}</span>
            </div>
            {pdf.error && <Alert tone="bad">{pdf.error}</Alert>}

            {data.signature && (
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold">Machine-readable credential (JWS)</summary>
                <pre className="mono text-xs bg-wash border border-line-soft rounded p-3 mt-2 whitespace-pre-wrap break-all">{data.signature.jws}</pre>
                <button type="button" className="btn btn-ghost btn-sm" onClick={async () => {
                  try { await navigator.clipboard.writeText(data.signature!.jws); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
                }}>{copied ? 'Copied' : 'Copy'}</button>
              </details>
            )}
          </div>

          {data.qr_codes && (
            <Panel title="Re-check by QR" className="self-start">
              <div className="flex flex-wrap gap-5 justify-center text-center text-xs text-muted">
                <figure >
                  <img src={data.qr_codes.online} alt="QR code linking to the public verification page" className="w-36 h-36 mx-auto" style={{ imageRendering: 'pixelated' }} />
                  <figcaption className="mt-1">Online check</figcaption>
                </figure>
                <figure >
                  <img src={data.qr_codes.offline} alt="QR code containing the signed credential" className="w-36 h-36 mx-auto" style={{ imageRendering: 'pixelated' }} />
                  <figcaption className="mt-1">Offline (signed data)</figcaption>
                </figure>
              </div>
              <p className="text-xs text-muted mt-3 break-all">Link: <a href={verifyLink(data.token)} target="_blank" rel="noreferrer">{verifyLink(data.token)}</a></p>
            </Panel>
          )}
        </div>
      </div>

      <p className="text-sm text-muted mt-4">
        Status: <StatusTag value={data.status} /> · Something wrong with this result? Write to helpdesk@apaar-ledger.example quoting {data.credential_id ?? 'the request ID'}.
      </p>
    </>
  );
}
