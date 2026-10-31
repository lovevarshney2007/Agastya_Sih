import { useState } from 'react';
import { api } from '../../api/client';
import { Alert, ErrorState, KeyValue, Loading, Modal, PageHeader, Panel, StatusTag } from '../../components/ui';
import { humanize } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const IDENTITY_TEXT: Record<string, string> = {
  VERIFIED: 'Your APAAR ID matched the national registry. Nothing to do.',
  PENDING_APAAR: 'Your institution has not yet submitted a verified APAAR ID for you. Give them your APAAR ID, or create one through DigiLocker, before 31 Dec 2026.',
  NO_APAAR: 'The APAAR ID your institution submitted was not found. Check the number with your institution.',
  MISMATCH: 'Your name or date of birth here differs from your APAAR record. Ask your institution to correct it.',
  CHECK_PENDING: 'The national registry could not be reached. This will be retried automatically.',
};

export function StudentHome() {
  const { data, error, reload } = useApi(() => api.student.me(), []);
  const { data: dlStatus, reload: reloadDl } = useApi(() => api.student.digilockerStatus(), []);

  // DigiLocker Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [linking, setLinking] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleLinkDigiLocker = async () => {
    if (pin.length !== 6) {
      alert('Please enter a 6-digit DigiLocker security PIN.');
      return;
    }
    setLinking(true);
    try {
      const res = await api.student.linkDigiLocker({ security_pin: pin });
      setNotice(res.message);
      setModalOpen(false);
      setPin('');
      void reloadDl();
    } catch (e: any) {
      alert(e.message || 'Failed to link DigiLocker.');
    } finally {
      setLinking(false);
    }
  };

  const handlePushCredential = async (enrolmentId: string) => {
    setPushing(true);
    try {
      const res = await api.student.pushToDigiLocker(enrolmentId);
      setNotice(res.message);
      void reloadDl();
    } catch (e: any) {
      alert(e.message || 'Failed to push credential to DigiLocker.');
    } finally {
      setPushing(false);
    }
  };

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  return (
    <>
      <PageHeader
        title={data.student.name}
        description={<>APAAR <span className="mono">{data.student.masked_apaar}</span> · what institutions have reported about you</>}
      />

      {notice && (
        <div className="mb-4">
          <Alert tone="ok" onClose={() => setNotice(null)}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{notice}</span>
            </div>
          </Alert>
        </div>
      )}

      {/* DigiLocker National Gateway Card */}
      <div className="mb-6 p-4 rounded-lg border border-blue-200 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-md mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-navy">National DigiLocker &amp; MeriPehchaan Gateway</h3>
              {dlStatus?.is_linked ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LINKED &amp; SYNCED
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  NOT CONNECTED
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              {dlStatus?.is_linked
                ? `Account ID: ${dlStatus.digilocker_id} · ${dlStatus.synced_credentials_count || 1} credential(s) in locker`
                : 'Connect your MeriPehchaan account to deposit verified degree certificates directly into your DigiLocker app.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dlStatus?.is_linked ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
              onClick={() => {
                if (data.enrolments[0]) {
                  void handlePushCredential(data.enrolments[0].enrolment_id);
                }
              }}
              disabled={pushing}
            >
              <ArrowUpRight size={14} />
              <span>{pushing ? 'Syncing...' : 'Deposit to DigiLocker'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              Connect DigiLocker
            </button>
          )}
        </div>
      </div>

      {data.pending.length > 0 && (
        <div className="mb-5">
          <Alert tone="warn" title={`${data.pending.length} organisation${data.pending.length === 1 ? ' is' : 's are'} asking to verify your record`}>
            Nothing is shared until you approve. <Link to="/student/consent">Review requests</Link>
          </Alert>
        </div>
      )}

      <h2 className="text-lg font-bold mb-3">Enrolments</h2>
      {data.enrolments.length === 0 ? (
        <Panel><p className="text-sm">No institution has reported an enrolment for you yet. Institutions submit data after admissions close.</p></Panel>
      ) : (
        <div className="space-y-4">
          {data.enrolments.map((e) => (
            <Panel key={e.enrolment_id} title={<h3 className="text-base font-bold">{e.institution}</h3>} actions={<StatusTag value={e.status} />}>
              <KeyValue items={[
                ['Programme', e.course],
                ['Academic year', `${e.academic_year}–${String(e.academic_year + 1).slice(2)}, year ${e.year_of_study}`],
                ['Student ID', <span key="kv4" className="mono">{e.student_id_no}</span>],
                ['Identity check', <StatusTag key="kv5" value={e.identity_status} />],
              ]} />
              <p className="text-sm text-muted mt-3">{IDENTITY_TEXT[e.identity_status] ?? humanize(e.identity_status)}</p>
              {e.verification_status === 'FLAGGED' && (
                <div className="mt-3"><Alert tone="warn">This record is under review by AICTE. You may be contacted through your institution.</Alert></div>
              )}
              {(e.identity_status === 'PENDING_APAAR' || e.identity_status === 'MISMATCH') && (
                <p className="text-sm mt-3">
                  To link your APAAR ID yourself, sign in to DigiLocker and confirm this institution under <em>ABC / APAAR → Link institution</em>.
                </p>
              )}
            </Panel>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        <Link to="/student/consent" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">Consent &amp; access log</div>
          <p className="text-sm text-muted mt-1">{data.active.length} active · {data.access_log.length} verifications</p>
        </Link>
        <Link to="/student/share" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">Share my record</div>
          <p className="text-sm text-muted mt-1">Create signed link &amp; QR credential.</p>
        </Link>
        <Link to="/student/guardian" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">Guardian consent</div>
          <p className="text-sm text-muted mt-1">Parental approval for minors under DPDP Rule 10.</p>
        </Link>
        <Link to="/student/rights" className="panel p-4 no-underline text-ink hover:border-brand">
          <div className="font-bold">My data rights</div>
          <p className="text-sm text-muted mt-1">Exercise DPDP rights, disputes &amp; portability.</p>
        </Link>
      </div>

      {/* DigiLocker Link Modal */}
      {modalOpen && (
        <Modal
          title="Connect National DigiLocker (MeriPehchaan)"
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            <Alert tone="info" title="Government Digital Identity Integration">
              Authenticate via MeriPehchaan to authorize AICTE to push your academic verifiable credential into your DigiLocker repository.
            </Alert>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                DigiLocker 6-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="input w-full text-center text-xl font-mono tracking-widest font-bold"
              />
              <p className="text-[11px] text-muted mt-1">
                Demo hint: Enter any 6-digit PIN (e.g. <strong>123456</strong>) to simulate MeriPehchaan authentication.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={linking}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLinkDigiLocker}
                disabled={linking || pin.length !== 6}
              >
                {linking ? 'Authenticating...' : 'Authorize & Connect'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
