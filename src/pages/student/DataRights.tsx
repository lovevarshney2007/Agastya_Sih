import { useState } from 'react';
import { api } from '../../api/client';
import { Alert, Modal, PageHeader, Panel, StatusTag } from '../../components/ui';
import { fmtDate } from '../../lib/format';
import { useApi } from '../../lib/useApi';
import { Download, FileCheck, HelpCircle, Shield, AlertCircle } from 'lucide-react';

interface DataRightRequest {
  request_id: string;
  request_number: string;
  request_type: string;
  subject: string;
  description: string;
  evidence_notes?: string;
  status: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export function DataRights() {
  const { data: requests, loading, error, reload } = useApi<DataRightRequest[]>(() => api.student.rightsRequests(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<string>('CORRECTION');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert('Please fill out the subject and description.');
      return;
    }

    setSubmitting(true);
    try {
      await api.student.submitRightsRequest({
        request_type: requestType,
        subject,
        description,
        evidence_notes: evidenceNotes,
      });
      setModalOpen(false);
      setSubject('');
      setDescription('');
      setEvidenceNotes('');
      void reload();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await api.student.exportDataPortability();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aicte_apaar_data_portability_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My DPDP Data Rights"
        description="Exercise your statutory privacy rights under the Digital Personal Data Protection (DPDP) Act 2023."
        actions={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportData}
              disabled={exporting}
            >
              <Download size={14} aria-hidden="true" />
              <span>{exporting ? 'Generating...' : 'Data Portability (JSON)'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
            >
              Exercise a Right
            </button>
          </>
        }
      />

      {/* DPDP Statutory Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Panel>
          <div className="space-y-1 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <FileCheck size={18} className="text-brand" />
                <span>Right to Access</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Section 11: Request a summary of personal data being processed and all third parties with whom it was shared.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting}
              className="btn btn-secondary btn-xs w-full mt-3 cursor-pointer"
            >
              <Download size={12} />
              <span>{exporting ? 'Exporting...' : 'Download Dossier (JSON)'}</span>
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="space-y-1 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <Shield size={18} className="text-brand" />
                <span>Right to Correction</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Section 12: Request correction of inaccurate, misleading, or outdated academic and demographic information.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRequestType('CORRECTION');
                setSubject('Request Correction of Course/Name in APAAR record');
                setModalOpen(true);
              }}
              className="btn btn-secondary btn-xs w-full mt-3 cursor-pointer"
            >
              <span>Request Rectification</span>
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="space-y-1 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <AlertCircle size={18} className="text-brand" />
                <span>Right to Erasure</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Section 12(3): Request deletion of non-statutory records subject to AICTE academic record retention laws.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRequestType('ERASURE');
                setSubject('Erasure Request of Non-Statutory Academic Telemetry');
                setModalOpen(true);
              }}
              className="btn btn-secondary btn-xs w-full mt-3 cursor-pointer"
            >
              <span>Request Erasure</span>
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="space-y-1 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-ink">
                <HelpCircle size={18} className="text-brand" />
                <span>Grievance Redressal</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Section 13: Raise grievances to AICTE Data Protection Officer (DPO) with SLA tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRequestType('GRIEVANCE');
                setSubject('Statutory Appeal to AICTE Data Protection Officer');
                setModalOpen(true);
              }}
              className="btn btn-secondary btn-xs w-full mt-3 cursor-pointer"
            >
              <span>File DPO Grievance</span>
            </button>
          </div>
        </Panel>
      </div>

      {/* Statutory Retention Explanation */}
      <Alert tone="info" title="Academic Record Retention (Section 8(7) Statutory Exemption)">
        <p className="text-xs">
          Please note: Degree awards, institutional enrolments, and approved seat compliance records are preserved under the AICTE Act 1987 and UGC regulations. While corrections are prioritized, historical enrolment records cannot be deleted if required for genuine degree verification.
        </p>
      </Alert>

      {/* Request Tracker */}
      <Panel title="Submitted Requests &amp; Status Tracker">
        {loading && <p className="text-sm text-muted">Loading your requests...</p>}
        {error && <Alert tone="warn" title="Error loading requests">{error}</Alert>}

        <div className="table-wrap mt-2">
          <table className="table-base">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Right Type</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Submitted On</th>
                <th>Outcome / Resolution</th>
              </tr>
            </thead>
            <tbody>
              {!requests || requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted">
                    You have not submitted any data rights requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.request_id}>
                    <td className="mono font-semibold text-xs text-brand">{r.request_number}</td>
                    <td>
                      <StatusTag value={r.request_type} />
                    </td>
                    <td className="text-sm">
                      <div className="font-medium text-ink">{r.subject}</div>
                      <div className="text-xs text-muted line-clamp-1">{r.description}</div>
                    </td>
                    <td>
                      <StatusTag value={r.status} />
                    </td>
                    <td className="text-xs text-muted">{fmtDate(r.created_at)}</td>
                    <td className="text-xs text-muted max-w-xs">
                      {r.resolution_notes || 'Pending DPO evaluation'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Submit Request Modal */}
      {modalOpen && (
        <Modal
          title="Submit a DPDP Data Rights Request"
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Select Right You Wish to Exercise
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="select w-full"
              >
                <option value="CORRECTION">Right to Correction (Inaccurate / Outdated Records)</option>
                <option value="ACCESS">Right to Information &amp; Summary (Data Access)</option>
                <option value="ERASURE">Right to Erasure / Objection</option>
                <option value="GRIEVANCE">Grievance Redressal (Privacy Complaint to DPO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Request Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input w-full"
                placeholder="e.g. Spelling error in Father Name on enrolment record"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Detailed Description of the Request
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full h-24"
                placeholder="Provide specific details about the record, correct spelling, or grounds for your grievance..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Reference / Supporting Evidence Details (Optional)
              </label>
              <input
                type="text"
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                className="input w-full"
                placeholder="e.g. 10th Class Marksheet Roll # 2948191, Aadhar Vault Token #..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting to DPO...' : 'Submit Official Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
