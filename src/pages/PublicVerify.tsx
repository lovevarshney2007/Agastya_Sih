import { useState } from 'react';
import { Camera, CircleCheck, CircleX, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { ErrorState, KeyValue, Loading } from '../components/ui';
import { QrCameraScanner } from '../components/QrCameraScanner';
import { fmtDateTime, fmtTime, humanize } from '../lib/format';
import { useRouter } from '../lib/router';
import { useApi } from '../lib/useApi';

/** Page 2 — the QR target. Minimal output and one neutral message for anything that is not valid or revoked. */
export function PublicVerify({ token }: { token?: string }) {
  const { navigate } = useRouter();
  const [input, setInput] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const { data, error, loading, reload } = useApi(token ? () => api.publicVerify(token) : null, [token]);

  if (!token) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold mt-0">Verify an academic credential</h1>
          <p className="text-muted">
            Enter the code printed under the QR on a certificate, paste the verification link, or use your live camera to scan.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={`btn ${scannerOpen ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5`}
            onClick={() => setScannerOpen(!scannerOpen)}
          >
            <Camera size={16} />
            {scannerOpen ? 'Hide Camera Scanner' : 'Scan QR with Live Camera'}
          </button>
        </div>

        {scannerOpen && (
          <QrCameraScanner
            onScan={(result) => {
              if (result.token) {
                navigate(`/verify/${encodeURIComponent(result.token)}`);
              }
            }}
            onClose={() => setScannerOpen(false)}
          />
        )}

        <form
          className="panel p-5 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const value = input.trim().split('/').filter(Boolean).pop();
            if (value) navigate(`/verify/${encodeURIComponent(value)}`);
          }}
        >
          <label htmlFor="verify-token" className="sr-only">Verification code</label>
          <input id="verify-token" className="input mono flex-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Verification code or link (e.g. demo-priya-tcs-2026)" />
          <button className="btn btn-primary" type="submit" disabled={!input.trim()}>Check</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mt-0 mb-4">Record verification</h1>

      {loading && !data && <div className="panel p-5"><Loading rows={5} label="Checking record" /></div>}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="panel overflow-hidden">
          {data.status === 'VALID' && (
            <div className="bg-ok text-white px-5 py-4 flex items-center gap-3">
              <CircleCheck size={30} className="animate-pop" aria-hidden="true" />
              <div>
                <div className="text-xl font-bold tracking-wide">VALID</div>
                <div className="text-sm opacity-90">This enrolment record is genuine and current.</div>
              </div>
            </div>
          )}
          {data.status === 'REVOKED' && (
            <div className="bg-bad text-white px-5 py-4 flex items-center gap-3">
              <ShieldAlert size={30} className="animate-pop" aria-hidden="true" />
              <div>
                <div className="text-xl font-bold tracking-wide">REVOKED</div>
                <div className="text-sm opacity-90">This credential was withdrawn and must not be relied on.</div>
              </div>
            </div>
          )}
          {data.status === 'INVALID' && (
            <div className="bg-[#4a5465] text-white px-5 py-4 flex items-center gap-3">
              <CircleX size={30} className="animate-pop" aria-hidden="true" />
              <div>
                <div className="text-xl font-bold tracking-wide">NOT VALID</div>
                <div className="text-sm opacity-90">This code is invalid, expired or not active.</div>
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            {data.status === 'VALID' && data.claims && (
              <KeyValue items={[
                ['Institution', data.claims.institution],
                ['Programme', data.claims.programme],
                ['Academic year', data.claims.academic_year],
                ['Enrolment status', humanize(data.claims.status)],
                ['Verified at', fmtDateTime(data.verified_at)],
                ['Credential ID', <span key="kv9" className="mono">{data.credential_id}</span>],
                ['Signature', data.signature?.valid
                  ? <span key="kv10" className="text-ok font-semibold">Signed by AICTE · key <span className="mono">{data.signature.key_id.split('#')[1]}</span></span>
                  : <span key="kv11" className="text-bad">Signature could not be verified</span>],
              ]} />
            )}
            {data.status === 'REVOKED' && (
              <KeyValue items={[['Credential ID', <span key="kv12" className="mono">{data.credential_id}</span>]]} />
            )}
            {data.status === 'INVALID' && (
              <p className="text-sm text-muted">
                If you were given this code recently, ask the student to share their record again. For security,
                this page does not say why a code is not valid.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line-soft text-sm">
              <span className="text-muted">Last checked {fmtTime(data.checked_at)}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reload} disabled={loading}>Check again</button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted mt-5">
        This page never shows APAAR numbers, dates of birth or contact details. Checks are rate-limited and logged.
        Report misuse to helpdesk@apaar-ledger.example.
      </p>
    </div>
  );
}
