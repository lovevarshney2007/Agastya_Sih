import { useState } from 'react';
import { CheckCircle2, FileCheck, FileSignature, KeyRound, Lock, Plus, Printer, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, Modal, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDateTime, shortHash } from '../../lib/format';
import { useSession } from '../../lib/session';
import { useApi } from '../../lib/useApi';

interface SanctionItem {
  sanction_id: string;
  institution_id: string;
  institution_name: string;
  sanction_type: string;
  legal_clause: string;
  penalty_value: string;
  rationale: string;
  evidence_summary?: string;
  status: 'PENDING_CHECKER_SIGNATURE' | 'EXECUTED_DUAL_SIGNED' | 'REJECTED';
  maker_id: string;
  maker_name: string;
  maker_role: string;
  maker_hash: string;
  proposed_at: string;
  checker_id?: string;
  checker_name?: string;
  checker_role?: string;
  checker_hash?: string;
  executed_at?: string;
  joint_crypto_seal?: string;
  checker_note?: string;
}

const SANCTION_TYPES = [
  { id: 'SEAT_REDUCTION_25_PERCENT', label: '25% Approved Intake Reduction', defaultVal: '25% Seat Cut in B.Tech' },
  { id: 'FINANCIAL_PENALTY_LAKHS', label: 'Statutory Monetary Penalty', defaultVal: '₹10,00,000 Penalty' },
  { id: 'ADMISSION_FREEZE_2026_27', label: 'Admission Freeze for Academic Year', defaultVal: 'Admission Freeze for 2026-27' },
  { id: 'DISAFFILIATION_WARNING', label: 'Disaffiliation Warning & Supernumerary Cancellation', defaultVal: 'Notice of Disaffiliation' },
  { id: 'COMPLIANCE_SHOW_CAUSE', label: 'Formal Natural Justice Show-Cause Sanction', defaultVal: '14-Day Mandatory Rectification' },
];

export function DualKeyApprovalsPage() {
  const { user } = useSession();
  const { data, loading, error, reload } = useApi(() => api.aicte.sanctions.list(), []);

  // Modals state
  const [proposeOpen, setProposeOpen] = useState(false);
  const [signOffModal, setSignOffModal] = useState<SanctionItem | null>(null);
  const [viewOrderModal, setViewOrderModal] = useState<SanctionItem | null>(null);

  // Propose form state
  const [instName, setInstName] = useState('COEP Technological University, Pune');
  const [sanctionType, setSanctionType] = useState('SEAT_REDUCTION_25_PERCENT');
  const [penaltyVal, setPenaltyVal] = useState('25% Seat Reduction in Mechanical Engineering');
  const [legalClause, setLegalClause] = useState('AICTE Regulations 2024 Chapter VIII Clause 13.4');
  const [rationale, setRationale] = useState('Discrepancy audit identified unregistered admissions admitted beyond AICTE sanctioned intake.');
  const [evidenceSummary, setEvidenceSummary] = useState('APAAR cross-audit flagged 15 unapproved admissions against approved quota.');
  const [submittingPropose, setSubmittingPropose] = useState(false);
  const [proposeErr, setProposeErr] = useState<string | null>(null);

  // Sign-off form state
  const [checkerNote, setCheckerNote] = useState('');
  const [authToken, setAuthToken] = useState('AICTE-SEC-2026-AUTH');
  const [submittingSign, setSubmittingSign] = useState(false);
  const [signErr, setSignErr] = useState<string | null>(null);

  const canPropose = user?.role === 'AICTE_MAKER';
  const canCheck = user?.role === 'AICTE_CHECKER';

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPropose(true);
    setProposeErr(null);
    try {
      await api.aicte.sanctions.propose({
        institution_id: instName,
        sanction_type: sanctionType,
        legal_clause: legalClause,
        penalty_value: penaltyVal,
        rationale: rationale,
        evidence_summary: evidenceSummary,
      });
      setProposeOpen(false);
      void reload();
    } catch (err: any) {
      setProposeErr(err.message || 'Failed to submit sanction proposal');
    } finally {
      setSubmittingPropose(false);
    }
  };

  const handleSignOff = async (action: 'APPROVE' | 'REJECT') => {
    if (!signOffModal) return;
    setSubmittingSign(true);
    setSignErr(null);
    try {
      await api.aicte.sanctions.signOff(signOffModal.sanction_id, {
        action,
        checker_note: checkerNote || (action === 'APPROVE' ? 'Approved and legally signed.' : 'Returned to maker.'),
        authorization_token: authToken,
      });
      setSignOffModal(null);
      setCheckerNote('');
      void reload();
    } catch (err: any) {
      setSignErr(err.message || 'Failed to complete digital sign-off');
    } finally {
      setSubmittingSign(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Dual-Key Regulatory Sanctions (4-Eye Principle)"
        description="High-penalty institutional sanctions require independent dual cryptographic signatures: proposed by the Enforcement Maker and approved by the Regional Director Checker."
        actions={
          canPropose && (
            <button type="button" className="btn btn-primary flex items-center gap-2" onClick={() => setProposeOpen(true)}>
              <Plus size={16} /> Propose New Sanction
            </button>
          )
        }
      />

      {/* Principle Banner */}
      <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <KeyRound className="shrink-0 text-indigo-600 mt-0.5" size={24} />
          <div>
            <h2 className="font-semibold text-sm m-0">Mandatory 4-Eye Cryptographic Dual-Authorization</h2>
            <p className="text-xs text-indigo-700 mt-1 m-0">
              Under AICTE Governance Norms, severe punitive actions (e.g. seat reductions, financial penalties, intake freeze) cannot be issued by a single officer.
              Both the Maker and Checker generate cryptographically bound SHA-256 signatures before the sanction order is stamped onto the immutable ledger.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-medium bg-white px-3 py-1.5 rounded border border-indigo-200 shadow-sm shrink-0">
          <Lock size={14} className="text-emerald-600" /> Key 1: Maker + Key 2: Checker
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="panel p-4 flex items-center gap-4 bg-amber-50/50 border-amber-200">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
            <Lock size={22} />
          </div>
          <div>
            <div className="text-xs text-amber-800 font-medium">Pending Checker Signature</div>
            <div className="text-2xl font-bold text-amber-900">{data?.pending_count ?? 0}</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-4 bg-emerald-50/50 border-emerald-200">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
            <FileSignature size={22} />
          </div>
          <div>
            <div className="text-xs text-emerald-800 font-medium">Dual-Signed & Executed</div>
            <div className="text-2xl font-bold text-emerald-900">{data?.executed_count ?? 0}</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-4 bg-slate-50 border-slate-200">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
            <ShieldAlert size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-medium">Returned / Objections</div>
            <div className="text-2xl font-bold text-slate-800">{data?.rejected_count ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Sanctions List */}
      <Panel title={`Regulatory Sanctions Docket (${data?.total_count ?? 0})`}>
        {loading && <div className="p-6 text-center"><Spinner /></div>}
        {error && <div className="p-4"><Alert tone="bad">{error}</Alert></div>}

        {!loading && data && data.sanctions.length === 0 && (
          <div className="p-8 text-center text-muted">No regulatory sanction proceedings currently on docket.</div>
        )}

        {!loading && data && data.sanctions.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sanction ID</th>
                  <th>Institution</th>
                  <th>Sanction Type & Penalty</th>
                  <th>Status</th>
                  <th>Dual-Key Signatures</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="stagger-rows">
                {data.sanctions.map((s: SanctionItem) => (
                  <tr key={s.sanction_id}>
                      <td className="mono font-bold text-xs">{s.sanction_id}</td>
                      <td>
                        <div className="font-semibold text-sm">{s.institution_name}</div>
                        <div className="text-xs text-muted mono">{s.institution_id}</div>
                      </td>
                      <td>
                        <div className="font-medium text-xs text-navy">{s.penalty_value}</div>
                        <div className="text-xs text-muted truncate max-w-xs">{s.legal_clause}</div>
                      </td>
                      <td>
                        <StatusTag value={s.status} />
                      </td>
                      <td>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 size={12} /> <span className="font-medium">Maker:</span> {s.maker_name}
                          </div>
                          {s.status === 'EXECUTED_DUAL_SIGNED' && s.checker_name ? (
                            <div className="flex items-center gap-1.5 text-indigo-700">
                              <CheckCircle2 size={12} /> <span className="font-medium">Checker:</span> {s.checker_name}
                            </div>
                          ) : s.status === 'PENDING_CHECKER_SIGNATURE' ? (
                            <div className="flex items-center gap-1 text-amber-700 font-medium">
                              <Lock size={12} /> Awaiting 2nd Key (Checker)
                            </div>
                          ) : (
                            <div className="text-slate-500 italic">Rejected by Checker</div>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-muted whitespace-nowrap">
                        {fmtDateTime(s.proposed_at)}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {s.status === 'PENDING_CHECKER_SIGNATURE' && canCheck && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm flex items-center gap-1"
                              onClick={() => { setSignOffModal(s); setCheckerNote(''); setSignErr(null); }}
                            >
                              <FileSignature size={14} /> Multi-Sign
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                            onClick={() => setViewOrderModal(s)}
                          >
                            <FileCheck size={14} /> View Order
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Propose Modal */}
      {proposeOpen && (
        <Modal open={true} title="Propose Regulatory Sanction (Key 1: Maker)" onClose={() => setProposeOpen(false)}>
          <form onSubmit={handlePropose} className="space-y-4">
            {proposeErr && <Alert tone="bad">{proposeErr}</Alert>}
            <div>
              <label className="label">Target Institution</label>
              <select className="input" value={instName} onChange={(e) => setInstName(e.target.value)}>
                <option value="COEP Technological University, Pune">COEP Technological University, Pune (INST-MH-PUN-001)</option>
                <option value="Veermata Jijabai Technological Institute (VJTI)">Veermata Jijabai Technological Institute (VJTI)</option>
                <option value="Delhi Technological University (DTU)">Delhi Technological University (DTU)</option>
                <option value="College of Engineering Guindy, Anna University">Anna University Guindy Campus</option>
              </select>
            </div>

            <div>
              <label className="label">Sanction Classification</label>
              <select
                className="input"
                value={sanctionType}
                onChange={(e) => {
                  setSanctionType(e.target.value);
                  const found = SANCTION_TYPES.find((t) => t.id === e.target.value);
                  if (found) setPenaltyVal(found.defaultVal);
                }}
              >
                {SANCTION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Enforced Penalty & Terms</label>
              <input
                type="text"
                className="input"
                value={penaltyVal}
                onChange={(e) => setPenaltyVal(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Statutory Legal Clause Reference</label>
              <input
                type="text"
                className="input"
                value={legalClause}
                onChange={(e) => setLegalClause(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Rationale & Audit Finding</label>
              <textarea
                className="textarea"
                rows={3}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Evidence Summary</label>
              <textarea
                className="textarea"
                rows={2}
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
              />
            </div>

            <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Cryptographic Key 1 Note:</strong> Submitting will sign this sanction proposal with your Maker certificate and place it in the approval queue. It will NOT take effect until a Checker provides the 2nd key.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn btn-secondary" onClick={() => setProposeOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submittingPropose}>
                {submittingPropose && <Spinner />} Submit Proposal (Sign Key 1)
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sign-Off Modal */}
      {signOffModal && (
        <Modal open={true} title={`4-Eye Digital Sign-Off: ${signOffModal.sanction_id}`} onClose={() => setSignOffModal(null)}>
          <div className="space-y-4 text-sm">
            {signErr && <Alert tone="bad">{signErr}</Alert>}

            <div className="p-3 bg-wash rounded border border-line space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Target:</span>
                <span className="font-semibold">{signOffModal.institution_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Proposed Penalty:</span>
                <span className="font-semibold text-bad">{signOffModal.penalty_value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Statutory Clause:</span>
                <span className="text-xs mono">{signOffModal.legal_clause}</span>
              </div>
              <div className="pt-2 border-t border-line-soft">
                <span className="text-muted block text-xs mb-1">Audit Finding:</span>
                <p className="text-xs m-0 italic bg-white p-2 rounded border border-line-soft">{signOffModal.rationale}</p>
              </div>
            </div>

            {/* Cryptographic Keys Status */}
            <div className="border border-line rounded p-3 bg-white space-y-2">
              <div className="font-bold text-xs uppercase text-muted tracking-wider">Cryptographic Signature Verification</div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="flex items-center gap-1.5 font-medium"><CheckCircle2 size={14} /> Key 1 (Maker Signed): {signOffModal.maker_name}</span>
                <span className="mono">{shortHash(signOffModal.maker_hash, 12)}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                <span className="flex items-center gap-1.5 font-medium"><KeyRound size={14} /> Key 2 (Checker Digital Token):</span>
                <input
                  type="text"
                  className="input !py-0.5 !px-2 !w-56 text-xs mono text-indigo-700 font-bold"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  aria-label="Checker Digital Token"
                />
              </div>
            </div>

            <div>
              <label className="label">Regional Director Review Note (Recorded in Audit Ledger)</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Enter review decision rationale..."
                value={checkerNote}
                onChange={(e) => setCheckerNote(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
              <button
                type="button"
                className="btn btn-secondary text-bad border-bad/30 hover:bg-bad-wash"
                disabled={submittingSign}
                onClick={() => handleSignOff('REJECT')}
              >
                Reject & Return Proposal
              </button>

              <div className="flex items-center gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setSignOffModal(null)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary flex items-center gap-1.5"
                  disabled={submittingSign}
                  onClick={() => handleSignOff('APPROVE')}
                >
                  {submittingSign ? <Spinner /> : <FileSignature size={16} />}
                  Digitally Sign & Execute Order
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* View Order Modal */}
      {viewOrderModal && (
        <Modal open={true} title={`Statutory Sanction Order: ${viewOrderModal.sanction_id}`} onClose={() => setViewOrderModal(null)}>
          <div className="p-6 bg-white border border-line rounded-lg text-ink space-y-5 print:p-0">
            {/* Header */}
            <div className="text-center border-b border-line pb-4">
              <div className="font-bold text-lg tracking-wide text-navy">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</div>
              <div className="text-xs text-muted uppercase tracking-wider">Statutory Regulation & Enforcement Bureau · New Delhi</div>
              <div className="inline-block mt-2 px-3 py-1 bg-bad/10 text-bad font-mono text-xs font-bold rounded">
                ORDER REF: {viewOrderModal.sanction_id}
              </div>
            </div>

            {/* Subject */}
            <div className="text-sm">
              <div><strong>IN THE MATTER OF:</strong> {viewOrderModal.institution_name}</div>
              <div className="text-xs text-muted">Permanent ID: {viewOrderModal.institution_id}</div>
              <div className="mt-2"><strong>STATUTORY SANCTION:</strong> <span className="font-bold text-bad">{viewOrderModal.penalty_value}</span></div>
              <div className="text-xs text-muted">Under Authority: {viewOrderModal.legal_clause}</div>
            </div>

            {/* Findings */}
            <div className="text-xs space-y-1.5 bg-wash p-3 rounded border border-line-soft">
              <div className="font-bold text-navy">REGULATORY FINDINGS & REASONING:</div>
              <p className="m-0 leading-relaxed">{viewOrderModal.rationale}</p>
              {viewOrderModal.evidence_summary && (
                <p className="m-0 text-muted mt-1 leading-relaxed">Evidence: {viewOrderModal.evidence_summary}</p>
              )}
            </div>

            {/* Cryptographic Dual Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-line rounded p-3 text-xs bg-slate-50">
              <div className="space-y-1">
                <div className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 size={13} /> KEY 1: ENFORCEMENT OFFICER
                </div>
                <div>{viewOrderModal.maker_name} ({viewOrderModal.maker_role})</div>
                <div className="text-[10px] text-muted mono break-all">Hash: {viewOrderModal.maker_hash}</div>
                <div className="text-[10px] text-muted">Proposed: {fmtDateTime(viewOrderModal.proposed_at)}</div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-line-soft sm:pl-3 pt-2 sm:pt-0">
                <div className="font-bold text-indigo-800 flex items-center gap-1">
                  {viewOrderModal.status === 'EXECUTED_DUAL_SIGNED' ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                  KEY 2: REGIONAL DIRECTOR / CHECKER
                </div>
                <div>{viewOrderModal.checker_name || 'Pending Review'}</div>
                {viewOrderModal.checker_hash && (
                  <div className="text-[10px] text-muted mono break-all">Hash: {viewOrderModal.checker_hash}</div>
                )}
                {viewOrderModal.executed_at && (
                  <div className="text-[10px] text-muted">Executed: {fmtDateTime(viewOrderModal.executed_at)}</div>
                )}
              </div>
            </div>

            {/* Joint Seal */}
            {viewOrderModal.joint_crypto_seal && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-xs text-emerald-950 flex items-center justify-between stamp-seal shadow-lg relative overflow-hidden">
                <div className="relative z-10 pr-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800 uppercase tracking-wider text-[11px]">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Joint Sovereign 4-Eyes Cryptographic Seal:
                  </div>
                  <div className="mono text-[11px] text-emerald-900 font-semibold break-all mt-1">
                    {viewOrderModal.joint_crypto_seal}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">
                    Anchored to AICTE WORM Storage · Section 65B Indian Evidence Act Admissible
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 shrink-0 shadow-xs">
                  <ShieldCheck size={26} />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print Official Order
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewOrderModal(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
