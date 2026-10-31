import { useState } from 'react';
import { Alert, Modal, Panel, StatusTag } from '../../components/ui';
import { api } from '../../api/client';
import { useApi } from '../../lib/useApi';
import { RefreshCw } from 'lucide-react';

interface VerifierOrg {
  org_id: string;
  org_name: string;
  org_type: string;
  registration_no?: string;
  contact_email: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  allowed_purposes: string[];
  monthly_quota: number;
  used_this_month: number;
  suspension_reason?: string;
  applied_at: string;
  reviewed_at: string;
}

export function VerifierApprovals() {
  const { data: orgs, loading, error, reload } = useApi(() => api.aicte.verifierOrgs(), []);
  
  // Status Change Modal
  const [selectedOrg, setSelectedOrg] = useState<VerifierOrg | null>(null);
  const [targetStatus, setTargetStatus] = useState<'APPROVED' | 'SUSPENDED' | 'REJECTED'>('APPROVED');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Quota Modal
  const [quotaOrg, setQuotaOrg] = useState<VerifierOrg | null>(null);
  const [newQuota, setNewQuota] = useState<number>(500);
  const [updatingQuota, setUpdatingQuota] = useState(false);

  const totalApproved = orgs?.filter((o: VerifierOrg) => o.status === 'APPROVED').length || 0;
  const totalPending = orgs?.filter((o: VerifierOrg) => o.status === 'PENDING').length || 0;
  const totalSuspended = orgs?.filter((o: VerifierOrg) => o.status === 'SUSPENDED').length || 0;
  const totalVerifications = orgs?.reduce((acc: number, o: VerifierOrg) => acc + (o.used_this_month || 0), 0) || 0;

  const handleUpdateStatus = async () => {
    if (!selectedOrg) return;
    setUpdatingStatus(true);
    try {
      await api.aicte.updateVerifierOrgStatus(selectedOrg.org_id, targetStatus, statusReason || undefined);
      setSelectedOrg(null);
      setStatusReason('');
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to update organization status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateQuota = async () => {
    if (!quotaOrg) return;
    setUpdatingQuota(true);
    try {
      await api.aicte.updateVerifierOrgQuota(quotaOrg.org_id, Number(newQuota));
      setQuotaOrg(null);
      void reload();
    } catch (e: any) {
      alert(e.message || 'Failed to update quota');
    } finally {
      setUpdatingQuota(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">Verifier Organisation Governance</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Page 19 · G2B Access Control
            </span>
          </div>
          <p className="text-muted mt-1">
            Authorisation, query quotas, and emergency kill-switch for third-party background checkers, employers, and banks.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary inline-flex items-center gap-2"
          onClick={() => void reload()}
        >
          <RefreshCw size={14} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Panel>
          <div className="text-xs font-semibold text-muted uppercase">Active Verifier Orgs</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalApproved}</div>
          <div className="text-xs text-muted mt-0.5">Approved under signed NDA</div>
        </Panel>
        <Panel>
          <div className="text-xs font-semibold text-muted uppercase">Pending Approvals</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{totalPending}</div>
          <div className="text-xs text-muted mt-0.5">Under AICTE legal review</div>
        </Panel>
        <Panel>
          <div className="text-xs font-semibold text-muted uppercase">Suspended Orgs</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{totalSuspended}</div>
          <div className="text-xs text-muted mt-0.5">API access revoked (kill-switch)</div>
        </Panel>
        <Panel>
          <div className="text-xs font-semibold text-muted uppercase">Monthly Queries Run</div>
          <div className="text-2xl font-bold text-navy mt-1">{totalVerifications}</div>
          <div className="text-xs text-muted mt-0.5">Across all authorized verifiers</div>
        </Panel>
      </div>

      {/* Security Notice */}
      <Alert tone="info" title="Zero-Trust Access Governance (Backend Stage 6)">
        <p className="text-xs">
          Authorised verifiers are bound by strict purpose limitation. Enrolment queries are capped by monthly quotas and rate limits to prevent bulk student data harvesting. Suspended organisations are immediately blocked at the API gateway.
        </p>
      </Alert>

      {loading && <p className="text-sm text-muted">Loading verifier organisations...</p>}
      {error && <Alert tone="warn" title="Error loading verifiers">{error}</Alert>}

      {/* Verifier Directory Table */}
      <Panel title="Registered Verifier Organisations Directory">
        <div className="table-wrap mt-2">
          <table className="table-base">
            <thead>
              <tr>
                <th>Organisation Name</th>
                <th>Type / Registration</th>
                <th>Allowed Purposes</th>
                <th>Monthly Quota &amp; Usage</th>
                <th>Status</th>
                <th>Governance Actions</th>
              </tr>
            </thead>
            <tbody>
              {!orgs || orgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted">No verifier organisations found.</td>
                </tr>
              ) : (
                orgs.map((org: VerifierOrg) => {
                  const usagePct = Math.round((org.used_this_month / org.monthly_quota) * 100);
                  return (
                    <tr key={org.org_id}>
                      <td>
                        <div className="font-bold text-sm text-ink">{org.org_name}</div>
                        <div className="text-xs text-muted font-mono">{org.org_id} · {org.contact_email}</div>
                      </td>
                      <td className="text-xs">
                        <div className="font-medium text-ink">{org.org_type}</div>
                        <div className="text-muted font-mono">{org.registration_no || 'N/A'}</div>
                      </td>
                      <td className="max-w-xs text-xs">
                        <div className="flex flex-wrap gap-1">
                          {org.allowed_purposes?.slice(0, 2).map((p: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-surface border border-line text-[11px] text-muted">
                              {p}
                            </span>
                          ))}
                          {org.allowed_purposes?.length > 2 && (
                            <span className="text-[11px] text-muted">+{org.allowed_purposes.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="text-xs font-mono">
                        <div className="flex justify-between mb-1">
                          <span>{org.used_this_month} / {org.monthly_quota}</span>
                          <span className={usagePct > 80 ? 'text-danger font-bold' : 'text-muted'}>{usagePct}%</span>
                        </div>
                        <div className="w-full bg-surface border border-line rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${usagePct > 80 ? 'bg-danger' : 'bg-navy'}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td>
                        <StatusTag value={org.status} />
                        {org.suspension_reason && (
                          <div className="text-[11px] text-danger max-w-xs truncate mt-0.5">
                            {org.suspension_reason}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {org.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setTargetStatus('APPROVED');
                                }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setTargetStatus('REJECTED');
                                }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {org.status === 'APPROVED' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setQuotaOrg(org);
                                  setNewQuota(org.monthly_quota);
                                }}
                              >
                                Quota
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm text-danger hover:text-danger"
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setTargetStatus('SUSPENDED');
                                }}
                              >
                                Kill-Switch
                              </button>
                            </>
                          )}
                          {org.status === 'SUSPENDED' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedOrg(org);
                                setTargetStatus('APPROVED');
                              }}
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Status Modal (Approve, Suspend, Reject) */}
      {selectedOrg && (
        <Modal
          title={`${targetStatus === 'SUSPENDED' ? 'Activate Kill-Switch' : targetStatus === 'APPROVED' ? 'Approve Organisation' : 'Reject Organisation'}: ${selectedOrg.org_name}`}
          open={!!selectedOrg}
          onClose={() => setSelectedOrg(null)}
        >
          <div className="space-y-4">
            {targetStatus === 'SUSPENDED' ? (
              <Alert tone="warn" title="Emergency Access Suspension">
                Suspending this organisation will immediately block their API key and invalidate all pending verification queries.
              </Alert>
            ) : (
              <Alert tone="info" title="AICTE Regulatory Onboarding">
                Approving grants verifiable credential access limited strictly to selected purposes and monthly quota.
              </Alert>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Written Reason / Justification
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="input w-full h-24"
                placeholder={
                  targetStatus === 'SUSPENDED'
                    ? 'Enter reason for suspension (e.g. rate limit breach, suspicious off-hours lookups)...'
                    : 'Enter approval note or meeting reference...'
                }
                required={targetStatus === 'SUSPENDED' || targetStatus === 'REJECTED'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedOrg(null)}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || ((targetStatus === 'SUSPENDED' || targetStatus === 'REJECTED') && !statusReason.trim())}
              >
                {updatingStatus ? 'Updating Status...' : `Confirm ${targetStatus}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quota Modal */}
      {quotaOrg && (
        <Modal
          title={`Adjust Monthly Query Quota: ${quotaOrg.org_name}`}
          open={!!quotaOrg}
          onClose={() => setQuotaOrg(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Current usage: <strong className="text-ink">{quotaOrg.used_this_month} queries</strong> this calendar month.
            </p>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                New Monthly Verification Quota
              </label>
              <input
                type="number"
                step="50"
                min="50"
                max="50000"
                value={newQuota}
                onChange={(e) => setNewQuota(parseInt(e.target.value) || 0)}
                className="input w-full font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setQuotaOrg(null)}
                disabled={updatingQuota}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateQuota}
                disabled={updatingQuota}
              >
                {updatingQuota ? 'Saving...' : 'Update Quota'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
