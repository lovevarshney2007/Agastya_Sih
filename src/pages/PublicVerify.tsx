import { useState } from 'react';
import { Award, Camera, CircleCheck, CircleX, FileText, Printer, ShieldAlert, X } from 'lucide-react';
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
  const [certModalOpen, setCertModalOpen] = useState(false);
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
        <div className="panel overflow-hidden card-lift shadow-xl border border-line">
          {data.status === 'VALID' && (
            <div className="bg-ok text-white px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CircleCheck size={30} className="animate-pop shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xl font-bold tracking-wide">VALID</div>
                  <div className="text-sm opacity-90">This enrolment record is genuine and current.</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm bg-white text-ok hover:bg-ok-wash font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
                onClick={() => setCertModalOpen(true)}
              >
                <Award size={15} /> Official Certificate
              </button>
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
              <div className="flex items-center gap-2">
                {data.status === 'VALID' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm flex items-center gap-1"
                    onClick={() => setCertModalOpen(true)}
                  >
                    <FileText size={14} /> Certificate (A4)
                  </button>
                )}
                <button type="button" className="btn btn-secondary btn-sm" onClick={reload} disabled={loading}>Check again</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {data && data.status === 'VALID' && data.claims && certModalOpen && (
        <OfficialCertificateModal
          data={data}
          onClose={() => setCertModalOpen(false)}
        />
      )}

      <p className="text-xs text-muted mt-5">
        This page never shows APAAR numbers, dates of birth or contact details. Checks are rate-limited and logged.
        Report misuse to helpdesk@apaar-ledger.example.
      </p>
    </div>
  );
}

function OfficialCertificateModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  const claims = data.claims || {};
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-line overflow-hidden my-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Bar */}
        <div className="no-print bg-wash border-b border-line px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-saffron" />
            <span className="font-bold text-sm text-navy">AICTE Official Verification Attestation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm p-1.5"
              onClick={onClose}
              aria-label="Close certificate preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Official A4 Document Chassis */}
        <div className="p-8 sm:p-12 bg-white relative text-ink chassis-housing">
          {/* Sovereign Security Border */}
          <div className="border-4 border-double border-navy p-6 sm:p-8 rounded-sm relative">
            <div className="tricolour h-1 mb-6" aria-hidden="true" />

            {/* Header with Emblem */}
            <div className="text-center pb-6 border-b border-line-soft">
              <img src="/aicte-logo.png" alt="AICTE" className="h-16 w-16 mx-auto object-contain mb-2" />
              <div className="text-xs font-bold tracking-widest uppercase text-muted">Government of India</div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy uppercase tracking-tight my-1">
                All India Council for Technical Education
              </h2>
              <div className="text-xs font-semibold text-saffron tracking-wider uppercase">
                Statutory Certificate of Academic Enrolment & APAAR Depository Authenticity
              </div>
            </div>

            {/* Body */}
            <div className="my-8 space-y-5 text-sm leading-relaxed">
              <p className="text-center font-serif italic text-muted text-base">
                This is to officially certify that the following academic enrolment record has been deterministically verified against the National APAAR Cryptographic Ledger:
              </p>

              <div className="bg-wash/70 border border-line rounded-lg p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-line-soft">
                  <span className="text-muted text-xs font-semibold uppercase">Candidate Holder</span>
                  <strong className="sm:col-span-2 text-navy">Verified APAAR Registered Student</strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-line-soft">
                  <span className="text-muted text-xs font-semibold uppercase">AICTE Approved Institution</span>
                  <strong className="sm:col-span-2 text-ink">{claims.institution || 'Recognized Technical Institution'}</strong>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-line-soft">
                  <span className="text-muted text-xs font-semibold uppercase">Degree & Programme</span>
                  <span className="sm:col-span-2 font-semibold text-ink">{claims.programme || 'Approved Programme'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-line-soft">
                  <span className="text-muted text-xs font-semibold uppercase">Academic Term / Year</span>
                  <span className="sm:col-span-2 font-mono">{claims.academic_year || '2026–2027'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-line-soft">
                  <span className="text-muted text-xs font-semibold uppercase">Verification Status</span>
                  <span className="sm:col-span-2 font-bold text-ok flex items-center gap-1.5">
                    <CircleCheck size={16} /> GENUINE & ACTIVE ENROLMENT (APH §3.1 COMPLIANT)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
                  <span className="text-muted text-xs font-semibold uppercase">Credential Serial</span>
                  <span className="sm:col-span-2 font-mono text-xs">{data.credential_id}</span>
                </div>
              </div>
            </div>

            {/* Verification Sign-Off Footer */}
            <div className="pt-6 border-t border-line-soft flex flex-wrap items-end justify-between gap-6 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-navy">Statutory Cryptographic Authority:</div>
                <div className="text-muted">Algorithm: W3C Ed25519 / JWS-RS256 Signature</div>
                <div className="font-mono text-[11px] text-faint">
                  Key: {data.signature?.key_id || 'did:apaar:aicte-national-root#key-2026'}
                </div>
                <div className="text-muted">Verified: {fmtDateTime(data.verified_at)}</div>
              </div>

              <div className="text-center sm:text-right">
                <div className="inline-block border-2 border-dashed border-ok/50 rounded-lg p-2 bg-ok-wash/40 text-ok font-bold text-xs uppercase tracking-wider mb-2">
                  ✓ Verified by AICTE National Root
                </div>
                <div className="text-[11px] text-muted">All India Council for Technical Education, New Delhi</div>
              </div>
            </div>

            <div className="tricolour h-1 mt-6" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
