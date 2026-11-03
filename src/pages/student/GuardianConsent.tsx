import { useState } from 'react';
import { api } from '../../api/client';
import { Alert, DataCard, Modal, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtDate } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { CheckCircle2, Shield } from 'lucide-react';

interface GuardianRequest {
  guardian_consent_id: string;
  verifier_id: string;
  verifier_name: string;
  purpose: string;
  scope: string[];
  guardian_name?: string;
  guardian_phone?: string;
  relation?: string;
  status: string;
  duration_days: number;
  receipt_token?: string;
  created_at?: string;
  responded_at?: string;
}

export function GuardianConsent() {
  const { data: requests, loading, error, reload } = useApi(() => api.student.guardianRequests(), []);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  // OTP Verification state
  const [phone, setPhone] = useState('+91 98200 12345');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Approval Modal state
  const [selectedRequest, setSelectedRequest] = useState<GuardianRequest | null>(null);
  const [guardianName, setGuardianName] = useState('Narayanan Nair');
  const [relation, setRelation] = useState('Father / Legal Guardian');
  const [durationDays, setDurationDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [receiptModal, setReceiptModal] = useState<GuardianRequest | null>(null);

  const pendingList = requests?.filter((r) => r.status === 'PENDING') ?? [];
  const activeList = requests?.filter((r) => r.status !== 'PENDING') ?? [];

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtp('123456');
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      await api.student.verifyGuardianOtp(phone, otp);
      setOtpVerified(true);
    } catch (e: any) {
      alert(e.message || 'OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      const res = await api.student.guardianConsentAction(selectedRequest.guardian_consent_id, {
        action: 'APPROVE',
        guardian_name: guardianName,
        guardian_phone: phone,
        relation,
        duration_days: durationDays,
      });
      setSelectedRequest(null);
      void reload();
      setReceiptModal({
        ...selectedRequest,
        status: 'APPROVED',
        receipt_token: res.receipt_token,
        guardian_name: guardianName,
      });
    } catch (e: any) {
      alert(e.message || 'Failed to approve consent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeny = async (req: GuardianRequest) => {
    if (!confirm(`Are you sure you want to deny verification for ${req.verifier_name}?`)) return;
    try {
      await api.student.guardianConsentAction(req.guardian_consent_id, { action: 'DENY' });
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to deny request');
    }
  };

  const handleRevoke = async (req: GuardianRequest) => {
    if (!confirm(`Revoke parental consent for ${req.verifier_name}? The credential will immediately show REVOKED.`)) return;
    try {
      await api.student.guardianConsentAction(req.guardian_consent_id, { action: 'REVOKE' });
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to revoke consent');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parental & Guardian Consent Centre"
        description="Verifiable parental consent management for students under 18 years, as mandated under the Digital Personal Data Protection (DPDP) Act 2023 Rule 10."
      />

      <Alert tone="info" title="Child Data Protection Notice (Section 9 & Rule 10)">
        <p className="text-sm">
          Under AICTE DPDP compliance, student records of minors cannot be shared with third parties without verifiable parental consent. No behavioral tracking or commercial profiling of minors is permitted.
        </p>
      </Alert>

      <Panel title="Step 1: Guardian Identity Attestation">
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Parent / Guardian Mobile
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input w-full"
              disabled={otpVerified}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Verification Code (OTP)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input w-full font-mono text-center tracking-widest"
                placeholder="6 digits"
                disabled={otpVerified || !otpSent}
              />
              {!otpSent ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleSendOtp} disabled={otpVerified}>
                  Send OTP
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleVerifyOtp}
                  disabled={otpVerified || verifyingOtp}
                >
                  {otpVerified ? 'Verified' : 'Verify'}
                </button>
              )}
            </div>
          </div>
          <div>
            {otpVerified ? (
              <div className="flex items-center gap-1.5 text-ok font-semibold text-sm pb-2">
                <CheckCircle2 size={18} />
                <span>Guardian Identity Attested</span>
              </div>
            ) : (
              <div className="text-xs text-muted pb-2">
                Simulated DigiLocker/OTP check under GIGW 3.0 government standards.
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="border-b border-line flex gap-4 overflow-x-auto no-scrollbar scroll-fade whitespace-nowrap min-w-0">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 min-h-[44px] ${
            activeTab === 'pending' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Pending Guardian Approvals ({pendingList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors shrink-0 min-h-[44px] ${
            activeTab === 'active' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Active &amp; Historical Consents ({activeList.length})
        </button>
      </div>

      {loading && <p className="text-sm text-muted">Loading consent requests...</p>}
      {error && <Alert tone="warn" title="Error loading requests">{error}</Alert>}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <Panel>
              <div className="text-center py-6 text-muted">
                <Shield className="mx-auto h-9 w-9 text-ok opacity-80 mb-2" />
                <p className="font-semibold text-ink">No Pending Guardian Consent Requests</p>
                <p className="text-xs mt-1">All third-party inquiries for this minor student have been answered.</p>
              </div>
            </Panel>
          ) : (
            pendingList.map((req) => (
              <Panel key={req.guardian_consent_id} title={req.verifier_name} actions={<StatusTag value="AWAITING_CONSENT" label="Awaiting Parent Signature" />}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink">
                      <span className="font-medium text-muted">Requested Purpose:</span> {req.purpose}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Claims shared upon approval: {req.scope.join(', ')} (minimal verification only).
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Requested on: {fmtDate(req.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDeny(req)}>
                      Deny Access
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (!otpVerified) {
                          alert('Please complete Step 1 (Guardian Identity Attestation) first.');
                          return;
                        }
                        setSelectedRequest(req);
                      }}
                    >
                      Review &amp; Approve
                    </button>
                  </div>
                </div>
              </Panel>
            ))
          )}
        </div>
      )}

      {activeTab === 'active' && (
        <Panel title="Parental Consent History">
          {/* Mobile Data Cards (md:hidden) */}
          {activeList.length === 0 ? (
            <div className="md:hidden p-6 text-center text-muted">No historical guardian records found.</div>
          ) : (
            <div className="md:hidden divide-y divide-border">
              {activeList.map((r) => (
                <DataCard
                  key={r.guardian_consent_id}
                  title={r.verifier_name}
                  subtitle={r.purpose}
                  badge={<StatusTag value={r.status} />}
                  fields={[
                    { label: 'Guardian', value: `${r.guardian_name || 'Guardian'} (${r.relation})` },
                    { label: 'Responded On', value: fmtDate(r.responded_at) },
                    ...(r.receipt_token ? [{ label: 'Receipt Token', value: r.receipt_token, mono: true }] : [])
                  ]}
                  actions={
                    r.status === 'APPROVED' ? (
                      <div className="flex items-center gap-2 w-full pt-1">
                        <span className="mono text-xs text-brand font-semibold flex-1 truncate">{r.receipt_token}</span>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm min-h-[44px] px-4"
                          onClick={() => handleRevoke(r)}
                        >
                          Revoke
                        </button>
                      </div>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Verifier Organisation</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Guardian</th>
                  <th>Responded On</th>
                  <th>Receipt / Action</th>
                </tr>
              </thead>
              <tbody>
                {activeList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted">No historical guardian records found.</td>
                  </tr>
                ) : (
                  activeList.map((r) => (
                    <tr key={r.guardian_consent_id}>
                      <td className="font-semibold">{r.verifier_name}</td>
                      <td className="text-sm text-muted">{r.purpose}</td>
                      <td>
                        <StatusTag value={r.status} />
                      </td>
                      <td className="text-xs">
                        <div className="font-medium">{r.guardian_name || 'Guardian'}</div>
                        <div className="text-muted">{r.relation}</div>
                      </td>
                      <td className="text-xs text-muted">{fmtDate(r.responded_at)}</td>
                      <td>
                        {r.status === 'APPROVED' ? (
                          <div className="flex items-center gap-2">
                            <span className="mono text-xs text-brand font-semibold">{r.receipt_token}</span>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleRevoke(r)}>
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {selectedRequest && (
        <Modal
          title={`Approve Verifier Access for ${selectedRequest.verifier_name}`}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        >
          <div className="space-y-4">
            <Alert tone="info" title="Statutory Guardian Confirmation">
              By authorizing, you permit AICTE to generate a cryptographic credential for {selectedRequest.verifier_name} for the stated purpose.
            </Alert>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Parent / Guardian Full Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Relationship with Minor Student
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="select w-full"
              >
                <option value="Father / Legal Guardian">Father / Legal Guardian</option>
                <option value="Mother / Legal Guardian">Mother / Legal Guardian</option>
                <option value="Court Appointed Legal Guardian">Court Appointed Legal Guardian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Validity Duration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="select w-full"
              >
                <option value={15}>15 Days</option>
                <option value={30}>30 Days (Recommended)</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)} disabled={submitting}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Recording Consent...' : 'Sign & Approve Consent'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {receiptModal && (
        <Modal
          title="Parental Consent Receipt"
          open={!!receiptModal}
          onClose={() => setReceiptModal(null)}
        >
          <div className="space-y-4 text-center py-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-ok" />
            <h3 className="font-bold text-lg text-ink">Parental Consent Successfully Registered</h3>
            <p className="text-sm text-muted">
              Receipt reference for audit under DPDP Act 2023:
            </p>
            <div className="bg-line-soft p-3 rounded font-mono text-base font-bold text-brand">
              {receiptModal.receipt_token}
            </div>
            <div className="text-xs text-left bg-line-soft/50 p-3 rounded space-y-1">
              <div><span className="font-semibold">Authorised Verifier:</span> {receiptModal.verifier_name}</div>
              <div><span className="font-semibold">Parent Signatory:</span> {receiptModal.guardian_name}</div>
              <div><span className="font-semibold">Timestamp:</span> {new Date().toISOString()}</div>
              <div><span className="font-semibold">Immutable Audit:</span> Anchored to AICTE WORM Storage Ledger</div>
            </div>
            <button type="button" className="btn btn-primary w-full" onClick={() => setReceiptModal(null)}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
