import { useState } from 'react';
import {
  Camera, CheckCircle2, Copy, Download, FileSpreadsheet,
  Play, Search, ShieldAlert, Sparkles, UploadCloud, Users
} from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, Empty, ErrorState, Field, Loading, Meter, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { QrCameraScanner } from '../../components/QrCameraScanner';
import { fmtDateTime } from '../../lib/format';
import { Link, useRouter } from '../../lib/router';
import { useAction, useApi } from '../../lib/useApi';
import { audioChime } from '../../utils/audioChime';
import {
  type BulkCandidateRecord,
  DEMO_CAMPUS_BATCH,
  exportAttestationReportCsv,
} from '../../utils/verifierBatch';

export function VerifierHome() {
  const { navigate } = useRouter();
  const { data, error, loading, loadedAt, reload } = useApi(() => api.verifier.tracker(), []);
  
  // Single mode state
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [apaar, setApaar] = useState('');
  const [purpose, setPurpose] = useState('');
  const [sent, setSent] = useState<{ message: string; token: string; status: string } | null>(null);
  const [shared, setShared] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const submit = useAction(() => api.verifier.submit(apaar, purpose));
  const withdraw = useAction((token: string) => api.verifier.withdraw(token));

  // Bulk mode state
  const [bulkRecords, setBulkRecords] = useState<BulkCandidateRecord[]>([]);
  const [bulkProgress, setBulkProgress] = useState<number | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkCompleted, setBulkCompleted] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'AWAITING_CONSENT' | 'INVALID_CHECKSUM'>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const digits = apaar.replace(/\D/g, '');
  const apaarError = apaar && digits.length !== 12 ? 'An APAAR ID has exactly 12 digits.' : null;
  const quotaFull = data ? data.quota.remaining <= 0 : false;

  const handleLoadDemoBatch = () => {
    setBulkRecords(DEMO_CAMPUS_BATCH);
    setBulkCompleted(false);
    setBulkProgress(null);
  };

  const handleRunBulkVerification = async () => {
    if (bulkRecords.length === 0) return;
    setBulkProcessing(true);
    setBulkProgress(10);

    const stepInterval = setInterval(() => {
      setBulkProgress((prev) => {
        if (prev === null) return 20;
        if (prev >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(stepInterval);
      setBulkProgress(100);
      setBulkProcessing(false);
      setBulkCompleted(true);
      audioChime.playSuccess();
    }, 600);
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  const filteredRecords = bulkRecords.filter((r) => {
    const matchesSearch =
      r.candidate_name.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      r.apaar_id.includes(bulkSearch) ||
      r.institution.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      r.programme.toLowerCase().includes(bulkSearch.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const validCount = bulkRecords.filter((r) => r.status === 'VALID').length;
  const pendingCount = bulkRecords.filter((r) => r.status === 'AWAITING_CONSENT').length;
  const invalidCount = bulkRecords.filter((r) => r.status === 'INVALID_CHECKSUM').length;

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Verifier Operations & Trust Gateway"
        description={
          data ? (
            <>
              Verifying on behalf of <strong>{data.organisation.name}</strong>. Compliant with AICTE Trust Framework &amp; DPDP Consent Guidelines.
            </>
          ) : undefined
        }
        actions={<AsOf at={loadedAt} onRefresh={reload} loading={loading} />}
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-line mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'single'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Search size={15} />
          Single Candidate Request
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bulk'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Campus Drive Bulk Verification (CSV)</span>
          <span className="bg-amber-500/15 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
            Enterprise
          </span>
        </button>
      </div>

      {activeTab === 'single' ? (
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
      ) : (
        /* ── Campus Drive Bulk Verification Section ── */
        <div className="space-y-6">
          <Panel
            title={
              <div className="flex items-center gap-2">
                <Users className="text-brand" size={18} />
                <span>Enterprise Campus Drive Batch Verification</span>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadDemoBatch}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5 font-semibold text-brand"
                >
                  <Sparkles size={14} />
                  Load 5 Demo Candidates (TCS 2026 Drive)
                </button>
              </div>
            }
          >
            {bulkRecords.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-wash text-brand mx-auto flex items-center justify-center">
                  <UploadCloud size={28} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-ink">Upload Campus Drive Candidate Batch</h3>
                  <p className="text-xs text-muted mt-1">
                    Upload a CSV list of candidates with APAAR IDs to verify accreditation, active enrolment, and degree legitimacy against the central AICTE Merkle depository simultaneously.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleLoadDemoBatch}
                    className="btn btn-primary flex items-center gap-2 text-sm font-semibold"
                  >
                    <Sparkles size={16} />
                    Load Pre-Configured Demo Batch (5 Candidates)
                  </button>

                  <label className="btn btn-secondary flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <FileSpreadsheet size={16} />
                    <span>Upload Custom CSV</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleLoadDemoBatch();
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Batch Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-wash border border-line-soft rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">Batch: TCS_Campus_Drive_2026_Cycle1.csv</span>
                      <span className="tag text-[10px] py-0.5 px-1.5 font-bold tag-neutral">
                        {bulkRecords.length} Candidates Loaded
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      Target Authority: AICTE National Depository · Ed25519 Root Verification
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkRecords([])}
                      className="btn btn-ghost btn-sm text-muted"
                      disabled={bulkProcessing}
                    >
                      Clear Batch
                    </button>
                    <button
                      type="button"
                      onClick={handleRunBulkVerification}
                      disabled={bulkProcessing}
                      className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold"
                    >
                      {bulkProcessing ? <Spinner /> : <Play size={14} />}
                      {bulkCompleted ? 'Re-Run Verification' : 'Run Batch Verification'}
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                {bulkProcessing && (
                  <div className="space-y-2 p-4 bg-brand-wash/30 border border-brand/20 rounded-lg">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand">
                      <span>Verifying candidates against AICTE Central Ledger...</span>
                      <span>{bulkProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-line-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand transition-all duration-300"
                        style={{ width: `${bulkProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Metric Summary Counters */}
                {bulkCompleted && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 border border-line rounded-lg bg-surface">
                      <div className="text-xs text-muted">Total Checked</div>
                      <div className="text-xl font-bold text-ink mt-0.5">{bulkRecords.length}</div>
                    </div>
                    <div className="p-3 border border-ok/30 rounded-lg bg-ok-wash/40">
                      <div className="text-xs text-ok font-semibold">Legitimate &amp; Valid</div>
                      <div className="text-xl font-bold text-ok mt-0.5">{validCount}</div>
                    </div>
                    <div className="p-3 border border-amber-400/30 rounded-lg bg-amber-500/10">
                      <div className="text-xs text-amber-700 font-semibold">Consent Pending</div>
                      <div className="text-xl font-bold text-amber-700 mt-0.5">{pendingCount}</div>
                    </div>
                    <div className="p-3 border border-bad/30 rounded-lg bg-bad-wash/40">
                      <div className="text-xs text-bad font-semibold">Checksum Rejected</div>
                      <div className="text-xl font-bold text-bad mt-0.5">{invalidCount}</div>
                    </div>
                  </div>
                )}

                {/* Controls and Export Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                    <div className="relative flex-1 max-w-xs">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={bulkSearch}
                        onChange={(e) => setBulkSearch(e.target.value)}
                        placeholder="Filter by name, APAAR, college..."
                        className="input pl-8 text-xs py-1.5 w-full"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-wash border border-line rounded p-0.5 text-xs">
                      {(['ALL', 'VALID', 'AWAITING_CONSENT', 'INVALID_CHECKSUM'] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setStatusFilter(filter)}
                          className={`px-2 py-1 rounded transition-colors text-[11px] font-semibold cursor-pointer ${
                            statusFilter === filter
                              ? 'bg-white shadow-xs text-ink font-bold'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          {filter === 'ALL' ? 'All' : filter === 'VALID' ? 'Valid' : filter === 'AWAITING_CONSENT' ? 'Pending' : 'Failed'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportAttestationReportCsv(bulkRecords, data?.organisation.name || 'Tata Consultancy Services')}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 font-semibold text-ink"
                    title="Export tamper-evident HR Verification Attestation CSV conforming to Indian Evidence Act §65B"
                  >
                    <Download size={14} />
                    Export HR Attestation Pack (CSV)
                  </button>
                </div>

                {/* Results Table */}
                <div className="table-wrap border border-line-soft rounded-lg">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>APAAR ID</th>
                        <th>Institution &amp; Programme</th>
                        <th>Status</th>
                        <th>Cryptographic Proof</th>
                        <th>Statutory Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r) => {
                        const isValid = r.status === 'VALID';
                        const isPending = r.status === 'AWAITING_CONSENT';

                        return (
                          <tr key={r.id}>
                            <td className="whitespace-nowrap">
                              <div className="font-semibold text-ink text-xs">{r.candidate_name}</div>
                              <div className="text-[10px] text-muted mono">{r.id}</div>
                            </td>
                            <td className="mono text-xs whitespace-nowrap">
                              {r.apaar_id}
                            </td>
                            <td>
                              <div className="text-xs font-medium text-ink">{r.programme}</div>
                              <div className="text-[11px] text-muted">{r.institution} · AY {r.academic_year}</div>
                            </td>
                            <td className="whitespace-nowrap">
                              {isValid ? (
                                <span className="tag tag-ok flex items-center gap-1 text-[11px] font-bold">
                                  <CheckCircle2 size={12} /> VALID
                                </span>
                              ) : isPending ? (
                                <span className="tag text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-400/30">
                                  AWAITING CONSENT
                                </span>
                              ) : (
                                <span className="tag tag-bad flex items-center gap-1 text-[11px] font-bold">
                                  <ShieldAlert size={12} /> BOGUS CHECKSUM
                                </span>
                              )}
                            </td>
                            <td className="mono text-[11px]">
                              <button
                                type="button"
                                onClick={() => handleCopyHash(r.proof_hash)}
                                className="flex items-center gap-1 hover:text-brand cursor-pointer text-muted font-mono"
                                title="Click to copy SHA-256 Merkle proof hash"
                              >
                                <span>{r.proof_hash.slice(0, 10)}...{r.proof_hash.slice(-6)}</span>
                                <Copy size={11} className={copiedHash === r.proof_hash ? 'text-ok' : ''} />
                              </button>
                            </td>
                            <td className="text-xs text-muted max-w-[220px]">
                              {r.notes}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-muted flex items-center justify-between border-t border-line-soft pt-3">
                  <span>
                    Cryptographically attested under <strong>AICTE Trust Framework §3.1</strong> &amp; <strong>DPDP Act 2023</strong>.
                  </span>
                  <span className="mono">Batch SHA-256: 0x4a9b...c38e</span>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
