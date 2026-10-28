import { useRef, useState } from 'react';
import { CircleCheck, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { api, API_BASE } from '../../api/client';
import type { BatchReport, CommitResult } from '../../api/types';
import { Alert, ErrorState, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { Link } from '../../lib/router';
import { useAction } from '../../lib/useApi';
import { CountsRow, useInstitutionId } from './shared';
import { IssueSummary, downloadIssuesCsv } from './BatchDetail';

const FIELDS: [string, string, string][] = [
  ['apaar_id', '12-digit APAAR ID. Leave blank if the student has none yet — the row is held, not rejected.', '412398765431'],
  ['student_id_no', 'Your roll or enrolment number. Required.', 'COEP-CSE-2026-101'],
  ['name', 'As on the APAAR / ABC record. Required.', 'Ishita Kulkarni'],
  ['dob', 'Date of birth, YYYY-MM-DD. Required.', '2006-02-11'],
  ['course', 'Programme name exactly as in your Extension of Approval. Required.', 'Computer Science and Engineering'],
  ['year_of_study', '1 to 6. Defaults to 1.', '1'],
  ['mode', 'FULL_TIME, PART_TIME or ONLINE_ODL.', 'FULL_TIME'],
  ['seat_category', 'General, OBC-NCL, SC, ST, EWS, TFW, NRI, OCI, PIO, FN, Gulf, Lateral_Entry, PwD, PMSSS.', 'General'],
  ['is_supernumerary', 'true for seats over and above approved intake (TFW, OCI/PIO/FN, lateral entry, PwD, PMSSS).', 'false'],
  ['nationality', 'Defaults to Indian.', 'Indian'],
];

const STAGES = ['File received', 'Security and format checks', 'Read rows', 'APAAR identity check', 'Rule checks', 'Report ready'];

export function UploadWizard() {
  const instId = useInstitutionId();
  const [tab, setTab] = useState<'file' | 'api'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [report, setReport] = useState<BatchReport | null>(null);
  const [declared, setDeclared] = useState(false);
  const [committed, setCommitted] = useState<CommitResult | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useAction((f: File | null) => (f ? api.institution.upload(instId!, f) : api.institution.uploadSample(instId!)));
  const commit = useAction((batchId: string) => api.institution.commit(instId!, batchId));
  const discard = useAction((batchId: string) => api.institution.discard(instId!, batchId));

  if (!instId) return <ErrorState message="Your account is not linked to an institution." />;

  const step = committed ? 4 : report ? 4 : upload.pending ? 3 : file ? 2 : 1;

  function pick(f: File | undefined) {
    if (!f) return;
    upload.clearError();
    if (!/\.(csv|xlsx)$/i.test(f.name)) {
      setFile(null);
      setTypeError('Only .csv and .xlsx files are accepted.');
      return;
    }
    setTypeError(null);
    setFile(f);
  }

  async function runUpload(useSample: boolean) {
    setTypeError(null);
    const res = await upload.run(useSample ? null : file);
    if (res) { setReport(res); setDeclared(false); }
  }

  async function runCommit() {
    if (!report) return;
    const res = await commit.run(report.batch_id);
    if (res) setCommitted(res);
  }

  async function runDiscard() {
    if (!report) return;
    const res = await discard.run(report.batch_id);
    if (res) reset();
  }

  function reset() {
    setFile(null); setReport(null); setCommitted(null); setDeclared(false);
    upload.clearError(); commit.clearError(); discard.clearError();
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <>
      <PageHeader
        title="Upload student data"
        description="Submit one row per admitted student. Nothing is recorded until you review the checks and commit."
        actions={<Link to="/institution/batches" className="btn btn-secondary no-underline">Previous uploads</Link>}
      />

      <div className="flex gap-1 border-b border-line mb-6" role="tablist">
        {(['file', 'api'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm border-0 bg-transparent cursor-pointer border-b-[3px] -mb-px ${tab === t ? 'border-brand font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            {t === 'file' ? 'Upload a file' : 'Submit via API'}
          </button>
        ))}
      </div>

      {tab === 'api' ? <ApiHelp instId={instId} /> : (
        <>
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 list-none p-0 mb-6 text-sm">
            {['Get the template', 'Choose file', 'Checks', 'Review & commit'].map((label, i) => (
              <li key={label} className={`border-t-4 pt-2 ${i + 1 < step ? 'border-ok' : i + 1 === step ? 'border-brand' : 'border-line'}`}>
                <span className="text-muted">Step {i + 1}</span>
                <div className={i + 1 === step ? 'font-semibold' : ''}>{label}</div>
              </li>
            ))}
          </ol>

          {committed && report ? (
            <Panel>
              <div className="flex items-start gap-3">
                <CircleCheck className="text-ok shrink-0 mt-0.5" size={26} aria-hidden="true" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">Batch committed to the ledger</h2>
                  <p className="text-sm text-muted mt-1">
                    {committed.recorded} student record(s) recorded and {committed.held} held for correction. {committed.rejected} rejected row(s) were not recorded.
                  </p>
                  {committed.cases_opened.length > 0 && (
                    <div className="mt-3">
                      <Alert tone="warn" title={`Conflict, case ${committed.cases_opened.join(', ')}`}>
                        A student in this batch is already active full-time at another institution. AICTE will review the case and contact you.
                      </Alert>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Link to="/institution/registry" className="btn btn-primary no-underline">Open student registry</Link>
                    <Link to={`/institution/batches/${report.batch_id}`} className="btn btn-secondary no-underline">View batch report</Link>
                    <button type="button" className="btn btn-secondary" onClick={reset}>Upload another file</button>
                  </div>
                </div>
              </div>
            </Panel>
          ) : report ? (
            <div className="space-y-5">
              <Panel title={<h2 className="flex items-center gap-2 break-all">{report.filename} <StatusTag value={report.status} /></h2>}
                     actions={<Link to={`/institution/batches/${report.batch_id}`} className="text-sm">Row-by-row report</Link>}>
                <ol className="flex flex-wrap gap-x-5 gap-y-1 list-none p-0 mb-4 text-sm">
                  {STAGES.map((s) => (
                    <li key={s} className="flex items-center gap-1.5 text-ok"><CircleCheck size={14} aria-hidden="true" /> <span className="text-ink">{s}</span></li>
                  ))}
                </ol>
                <CountsRow counts={report.counts} />
                {report.status === 'FAILED' && (
                  <div className="mt-4"><Alert tone="bad" title="No row can be recorded">Every row was rejected. Correct the file using the report below and upload it again.</Alert></div>
                )}
              </Panel>

              {report.issues.length > 0 && (
                <Panel title="What the checks found" actions={
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadIssuesCsv(report)}>
                    <Download size={14} aria-hidden="true" /> Download error file
                  </button>
                }>
                  <IssueSummary issues={report.issues} />
                </Panel>
              )}

              {report.status === 'READY_TO_COMMIT' && (
                <Panel title="Commit this batch">
                  <p className="text-sm mb-3">
                    Committing records {report.counts.accepted + report.counts.warnings} student(s) and holds {report.counts.holds} for correction.
                    Rejected rows are not recorded — fix them and upload them in a new file.
                  </p>
                  <label className="flex items-start gap-2.5 text-sm bg-wash border border-line-soft rounded p-3 cursor-pointer">
                    <input type="checkbox" className="mt-1" checked={declared} onChange={(e) => setDeclared(e.target.checked)} />
                    <span>
                      I am the nodal officer for this institution. I declare that this data is a true record of students admitted for 2026–27,
                      taken from our admission register, and that it contains no Aadhaar numbers.
                    </span>
                  </label>
                  {(commit.error || discard.error) && <div className="mt-3"><Alert tone="bad">{commit.error || discard.error}</Alert></div>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button type="button" className="btn btn-primary" disabled={!declared || commit.pending} onClick={runCommit}>
                      {commit.pending && <Spinner />} Commit batch
                    </button>
                    <button type="button" className="btn btn-secondary" disabled={discard.pending || commit.pending} onClick={runDiscard}>
                      Discard and upload a corrected file
                    </button>
                  </div>
                </Panel>
              )}
              {report.status === 'FAILED' && <button type="button" className="btn btn-primary" onClick={reset}>Upload a corrected file</button>}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <Panel title="1. Get the template">
                <p className="text-sm mb-3">Template version <span className="mono">2026.1</span> for academic year 2026–27. Approved intake is taken from AICTE’s records, not from your file.</p>
                <button type="button" className="btn btn-secondary" onClick={() => void api.templateDownload()}>
                  <FileSpreadsheet size={16} aria-hidden="true" /> Download template (CSV)
                </button>
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold">Column guide</summary>
                  <div className="table-wrap mt-2 border border-line-soft rounded">
                    <table className="data-table">
                      <thead><tr><th>Column</th><th>What to enter</th><th>Example</th></tr></thead>
                      <tbody>
                        {FIELDS.map(([col, desc, ex]) => (
                          <tr key={col}><td className="mono whitespace-nowrap">{col}</td><td>{desc}</td><td className="mono whitespace-nowrap">{ex}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </Panel>

              <Panel title="2. Upload the file">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
                  className={`border-2 border-dashed rounded-md p-6 text-center ${dragging ? 'border-brand bg-brand-wash' : 'border-line bg-wash'}`}
                >
                  <Upload className="mx-auto text-muted" size={26} aria-hidden="true" />
                  <p className="text-sm my-2">Drag a .csv or .xlsx file here, or</p>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>Choose file</button>
                  <input ref={inputRef} type="file" accept=".csv,.xlsx" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} aria-label="Choose file" />
                  <p className="hint mt-3">Up to 5 MB. One sheet; first row must be the column names.</p>
                </div>

                {file && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm border border-line rounded px-3 py-2 bg-white">
                    <span className="break-all"><strong>{file.name}</strong> · {(file.size / 1024).toFixed(1)} KB</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}>Remove</button>
                  </div>
                )}

                <div className="mt-4">
                  <Alert tone="warn">Do not include Aadhaar numbers. Files with an Aadhaar column are refused.</Alert>
                </div>

                {(upload.error || typeError) && <div className="mt-3"><Alert tone="bad" title="The file was not accepted">{typeError || upload.error}</Alert></div>}

                {upload.pending ? (
                  <div className="mt-4 text-sm flex items-center gap-2"><Spinner /> Checking every row. Large files can take a minute — you can leave this page and find the result under Uploads.</div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button type="button" className="btn btn-primary" disabled={!file} onClick={() => runUpload(false)}>Upload and check</button>
                    <span className="text-sm text-muted">or</span>
                    <button type="button" className="btn btn-ghost" onClick={() => runUpload(true)}>Use the sample file</button>
                  </div>
                )}
                <p className="hint">The sample file has 15 rows that trigger each rule once — useful for a walkthrough.</p>
              </Panel>
            </div>
          )}
        </>
      )}
    </>
  );
}

function ApiHelp({ instId }: { instId: string }) {
  const origin = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
  return (
    <Panel title="Submit from your ERP">
      <p className="text-sm">
        Your admission system can send the same file through the API. Use a token issued to your institution account; production
        deployments issue separate client credentials per ERP. Full reference: <a href="/docs" target="_blank" rel="noreferrer">API documentation</a>.
      </p>
      <pre className="mono text-xs bg-[#0f172a] text-[#e2e8f0] rounded p-4 mt-4 overflow-x-auto">{`# 1. Upload and validate
curl -X POST "${origin}/institutions/${instId}/upload" \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@admissions_2026.csv"

# 2. Commit the batch id returned above
curl -X POST "${origin}/institutions/${instId}/batches/<batch_id>/commit" \\
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \\
  -d '{"declaration": true}'`}</pre>
    </Panel>
  );
}
