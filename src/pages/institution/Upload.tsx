import { useRef, useState } from 'react';
import { CheckCheck, CircleCheck, Download, Eye, EyeOff, FileSpreadsheet, ShieldCheck, Upload } from 'lucide-react';
import { api, API_BASE } from '../../api/client';
import type { BatchReport, CommitResult } from '../../api/types';
import { Alert, ErrorState, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { Link } from '../../lib/router';
import { useAction } from '../../lib/useApi';
import { CountsRow, useInstitutionId } from './shared';
import { IssueSummary, downloadIssuesCsv } from './BatchDetail';
import { DEMO_BATCHES } from '../../utils/demoBatches';

interface PreFlightRow {
  rowNum: number;
  data: Record<string, string>;
  issues: { field: string; severity: 'ERROR' | 'WARNING'; message: string }[];
}

interface PreFlightResult {
  totalRows: number;
  cleanRows: number;
  warningCount: number;
  errorCount: number;
  hasAadhaarLeak: boolean;
  duplicateApaars: string[];
  rows: PreFlightRow[];
  headers: string[];
}

function runPreFlightCheck(csvText: string): PreFlightResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      totalRows: 0,
      cleanRows: 0,
      warningCount: 0,
      errorCount: 0,
      hasAadhaarLeak: false,
      duplicateApaars: [],
      rows: [],
      headers: [],
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const hasAadhaarHeader = headers.some((h) => h.includes('aadhaar') || h.includes('aadhar') || h === 'uid');

  const apaarOccurrences = new Map<string, number[]>();
  const parsedRows: PreFlightRow[] = [];
  let warningCount = 0;
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const rowData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowData[h] = rawCols[idx] || '';
    });

    const apaar = rowData['apaar_id'] || '';
    if (apaar && /^\d{12}$/.test(apaar)) {
      const list = apaarOccurrences.get(apaar) || [];
      list.push(i + 1);
      apaarOccurrences.set(apaar, list);
    }
  }

  const duplicates = Array.from(apaarOccurrences.entries())
    .filter(([_, list]) => list.length > 1)
    .map(([apaar]) => apaar);

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const rowData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowData[h] = rawCols[idx] || '';
    });

    const issues: { field: string; severity: 'ERROR' | 'WARNING'; message: string }[] = [];

    if (hasAadhaarHeader) {
      issues.push({ field: 'headers', severity: 'ERROR', message: 'Aadhaar/UID column detected. Prohibited under DPDP Act Sec 6.' });
      errorCount++;
    }

    const apaar = rowData['apaar_id'] || '';
    if (apaar) {
      if (!/^\d{12}$/.test(apaar)) {
        issues.push({ field: 'apaar_id', severity: 'ERROR', message: 'APAAR ID must be 12 numeric digits.' });
        errorCount++;
      } else if (duplicates.includes(apaar)) {
        const rowsList = apaarOccurrences.get(apaar)?.join(', ');
        issues.push({ field: 'apaar_id', severity: 'ERROR', message: `Duplicate APAAR ID in rows: ${rowsList}` });
        errorCount++;
      }
    } else {
      issues.push({ field: 'apaar_id', severity: 'WARNING', message: 'No APAAR provided. Student record will be held for verification.' });
      warningCount++;
    }

    if (!rowData['name'] || rowData['name'].trim().length === 0) {
      issues.push({ field: 'name', severity: 'ERROR', message: 'Student name is required.' });
      errorCount++;
    }

    const dob = rowData['dob'] || '';
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      issues.push({ field: 'dob', severity: 'WARNING', message: 'DOB should follow YYYY-MM-DD standard format.' });
      warningCount++;
    }

    if (!rowData['course'] || rowData['course'].trim().length === 0) {
      issues.push({ field: 'course', severity: 'ERROR', message: 'Course programme is required.' });
      errorCount++;
    }

    parsedRows.push({
      rowNum: i + 1,
      data: rowData,
      issues,
    });
  }

  const cleanRows = parsedRows.filter((r) => r.issues.length === 0).length;

  return {
    totalRows: parsedRows.length,
    cleanRows,
    warningCount,
    errorCount,
    hasAadhaarLeak: hasAadhaarHeader,
    duplicateApaars: duplicates,
    rows: parsedRows,
    headers,
  };
}

function downloadCleanCsv(preFlight: PreFlightResult, filename: string) {
  const cleanRows = preFlight.rows.filter((r) => !r.issues.some((i) => i.severity === 'ERROR'));
  if (cleanRows.length === 0) return;
  const filteredHeaders = preFlight.headers.filter((h) => !h.includes('aadhaar') && !h.includes('aadhar') && h !== 'uid');
  const headerLine = filteredHeaders.join(',');
  const rowLines = cleanRows.map((r) => {
    return filteredHeaders.map((h) => `"${(r.data[h] || '').replace(/"/g, '""')}"`).join(',');
  });
  const csvContent = [headerLine, ...rowLines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sanitized_${filename.replace(/\.[^/.]+$/, '')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  const [preFlight, setPreFlight] = useState<PreFlightResult | null>(null);
  const [showInspector, setShowInspector] = useState(false);
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
      setPreFlight(null);
      setTypeError('Only .csv and .xlsx files are accepted.');
      return;
    }
    setTypeError(null);
    setFile(f);
    if (f.name.toLowerCase().endsWith('.csv')) {
      f.text().then((text) => {
        setPreFlight(runPreFlightCheck(text));
      }).catch(() => {
        setPreFlight(null);
      });
    } else {
      setPreFlight(null);
    }
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
    setFile(null); setReport(null); setCommitted(null); setDeclared(false); setPreFlight(null); setShowInspector(false);
    upload.clearError(); commit.clearError(); discard.clearError();
    if (inputRef.current) inputRef.current.value = '';
  }

  function loadDemoBatch(id: string) {
    const b = DEMO_BATCHES[id];
    if (!b) return;
    const demoFile = new File([b.csv], b.filename, { type: 'text/csv' });
    pick(demoFile);
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
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => void api.templateDownload()}>
                    <FileSpreadsheet size={15} aria-hidden="true" /> Download template (CSV)
                  </button>
                </div>

                {/* Instant Hackathon Demo Batches */}
                <div className="mt-4 pt-3.5 border-t border-line-soft">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-saffron" />
                      Hackathon Demo Batches (1-Click Load)
                    </span>
                    <span className="text-[10px] text-muted font-mono">No typing required</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(DEMO_BATCHES).map((batch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => loadDemoBatch(batch.id)}
                        className="text-left p-2.5 rounded-lg border border-line bg-surface hover:border-brand hover:bg-brand-wash/30 transition-all cursor-pointer group"
                        title={`Load ${batch.title} immediately into pre-flight validation`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-ink group-hover:text-brand truncate">{batch.title}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono shrink-0 ${batch.badgeColor}`}>
                            {batch.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted line-clamp-2 leading-tight">{batch.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

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

                {preFlight && (
                  <div className="mt-4 p-4 rounded-lg border border-line bg-wash space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs uppercase text-navy tracking-wider flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-brand" /> Pre-Upload Compliance Inspection
                      </div>
                      <span className="text-xs text-muted">Client-side statutory validation</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded border border-line-soft">
                        <div className="text-muted">Total Rows</div>
                        <div className="text-base font-bold text-navy">{preFlight.totalRows}</div>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                        <div className="text-emerald-800">Clean Rows</div>
                        <div className="text-base font-bold text-emerald-900">{preFlight.cleanRows}</div>
                      </div>
                      <div className="p-2 bg-amber-50 rounded border border-amber-200">
                        <div className="text-amber-800">Warnings</div>
                        <div className="text-base font-bold text-amber-900">{preFlight.warningCount}</div>
                      </div>
                      <div className="p-2 bg-bad-wash rounded border border-bad/30">
                        <div className="text-bad">Anomalies</div>
                        <div className="text-base font-bold text-bad">{preFlight.errorCount}</div>
                      </div>
                    </div>

                    {preFlight.hasAadhaarLeak && (
                      <Alert tone="bad" title="Critical DPDP Act Violation: Aadhaar Field Detected">
                        Aadhaar numbers or UID column found. The immutable ledger strictly rejects files containing biometric/UID numbers. Please click 'Sanitize & Download Clean CSV' below.
                      </Alert>
                    )}

                    {preFlight.duplicateApaars.length > 0 && (
                      <Alert tone="warn" title="In-File Concurrent Duplicate APAARs">
                        Found {preFlight.duplicateApaars.length} APAAR ID(s) repeated across multiple rows in this file (e.g. {preFlight.duplicateApaars[0]}).
                      </Alert>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm flex items-center gap-1.5"
                        onClick={() => setShowInspector((prev) => !prev)}
                      >
                        {showInspector ? <EyeOff size={14} /> : <Eye size={14} />}
                        {showInspector ? 'Hide Anomaly Table' : `Inspect ${preFlight.errorCount + preFlight.warningCount} Row Issues`}
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm flex items-center gap-1.5 text-brand"
                        onClick={() => file && downloadCleanCsv(preFlight, file.name)}
                      >
                        <CheckCheck size={14} /> Sanitize & Download Clean CSV
                      </button>
                    </div>

                    {showInspector && (
                      <div className="mt-2 border border-line-soft rounded bg-white overflow-x-auto max-h-60 overflow-y-auto">
                        <table className="data-table !text-xs">
                          <thead>
                            <tr>
                              <th>Row</th>
                              <th>Name</th>
                              <th>APAAR</th>
                              <th>Issues Detected</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preFlight.rows.filter((r) => r.issues.length > 0).map((r) => (
                              <tr key={r.rowNum}>
                                <td className="mono font-bold text-muted">#{r.rowNum}</td>
                                <td>{r.data['name'] || <span className="text-bad font-semibold">Missing</span>}</td>
                                <td className="mono">{r.data['apaar_id'] || <span className="text-muted">None</span>}</td>
                                <td>
                                  <div className="space-y-1">
                                    {r.issues.map((iss, idx) => (
                                      <span
                                        key={idx}
                                        className={`inline-block mr-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                                          iss.severity === 'ERROR' ? 'bg-bad/10 text-bad border border-bad/20' : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {iss.message}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!file || (preFlight ? preFlight.hasAadhaarLeak : false)}
                      onClick={() => runUpload(false)}
                    >
                      Upload and check
                    </button>
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
