import { useEffect, useState } from 'react';
import { Download, Plus, X } from 'lucide-react';
import { api } from '../../api/client';
import type { AddStudentInput, AddStudentResult, StudentRow } from '../../api/types';
import { Alert, AsOf, Empty, ErrorState, Field, KeyValue, Loading, Modal, PageHeader, Pagination, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDateTime, humanize } from '../../lib/format';
import { useRouter } from '../../lib/router';
import { useAction, useApi } from '../../lib/useApi';
import { FilterSelect } from './BatchDetail';
import { SEAT_CATEGORIES, SUPERNUMERARY_CATEGORIES, useInstitutionId } from './shared';

const PAGE_SIZE = 25;

const IDENTITY_HELP: Record<string, string> = {
  VERIFIED: 'The APAAR ID matched the ABC registry.',
  PENDING_APAAR: 'No APAAR ID yet, or the ID is not mapped to an institution. Submit it before 31 Dec 2026.',
  NO_APAAR: 'The APAAR ID was not found in the ABC registry. Check the number with the student.',
  MISMATCH: 'Name or date of birth differs from the registry. The student must confirm their details.',
  CHECK_PENDING: 'The registry could not be reached. The check will run again automatically.',
};

export function Registry() {
  const instId = useInstitutionId();
  const { search: query } = useRouter();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState(query.get('status') ?? 'ALL');
  const [identity, setIdentity] = useState(query.get('identity') ?? 'ALL');
  const [verification, setVerification] = useState(query.get('verification') ?? 'ALL');
  const [course, setCourse] = useState(query.get('course') ?? 'ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<StudentRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const dash = useApi(instId ? () => api.institution.dashboard(instId) : null, [instId]);
  const courses = dash.data?.program_breakdown.map((p) => p.course) ?? [];

  const { data, error, loading, reload } = useApi(
    instId ? () => api.institution.students(instId, { search: debounced, status, identity_status: identity, verification_status: verification, course, page, page_size: PAGE_SIZE }) : null,
    [instId, debounced, status, identity, verification, course, page],
  );

  if (!instId) return <ErrorState message="Your account is not linked to an institution." />;

  const filtersActive = debounced || status !== 'ALL' || identity !== 'ALL' || verification !== 'ALL' || course !== 'ALL';

  return (
    <>
      <PageHeader
        title="Student registry"
        description="Every student your institution has reported, keyed by APAAR ID. APAAR numbers are masked to the last four digits."
        actions={
          <>
            <AsOf at={data?.as_of} onRefresh={reload} loading={loading} />
            <button type="button" className="btn btn-secondary" onClick={async () => {
              setExportError(null);
              try { await api.institution.exportRegistry(instId); } catch (e) { setExportError(e instanceof Error ? e.message : 'Export failed.'); }
            }}><Download size={16} aria-hidden="true" /> Export CSV</button>
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" /> Add a student</button>
          </>
        }
      />

      {exportError && <div className="mb-4"><Alert tone="bad" onClose={() => setExportError(null)}>{exportError}</Alert></div>}

      <Panel bodyClassName="">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-line-soft bg-wash">
          <input className="input !w-64 !py-1" placeholder="Name, student ID or last 4 of APAAR" value={search}
                 onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
          <FilterSelect label="Programme" value={course} onChange={(v) => { setCourse(v); setPage(1); }} options={courses} />
          <FilterSelect label="Enrolment" value={status} onChange={(v) => { setStatus(v); setPage(1); }}
                        options={['ACTIVE', 'PROVISIONAL', 'WITHDRAWN', 'TRANSFERRED', 'COMPLETED']} labels={{ PROVISIONAL: 'On hold' }} />
          <FilterSelect label="Identity" value={identity} onChange={(v) => { setIdentity(v); setPage(1); }}
                        options={['VERIFIED', 'PENDING_APAAR', 'MISMATCH']} labels={{ PENDING_APAAR: 'Not verified (any reason)' }} />
          <FilterSelect label="Verification" value={verification} onChange={(v) => { setVerification(v); setPage(1); }}
                        options={['ACCEPTED', 'ON_HOLD', 'FLAGGED']} />
          {filtersActive && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
              setSearch(''); setDebounced(''); setStatus('ALL'); setIdentity('ALL'); setVerification('ALL'); setCourse('ALL'); setPage(1);
            }}>Clear filters</button>
          )}
        </div>

        {error && !data ? <div className="p-4"><ErrorState message={error} onRetry={reload} /></div>
          : !data ? <div className="p-4"><Loading rows={8} /></div>
          : data.students.length === 0 ? (
            <Empty title={filtersActive ? 'No students match these filters' : 'No students reported yet'}>
              {filtersActive ? 'Try a different search or clear the filters.' : 'Upload a file or add students one at a time.'}
            </Empty>
          ) : (
            <>
              <div className={`table-wrap ${loading ? 'opacity-60' : ''}`}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th><th>Name</th><th>APAAR</th><th>Programme</th><th className="num">Year</th>
                      <th>Seat</th><th>Enrolment</th><th>Identity</th><th>Verification</th>
                    </tr>
                  </thead>
                  <tbody className="stagger-rows">
                    {data.students.map((s) => (
                      <tr key={s.enrolment_id} className="clickable" onClick={() => setSelected(s)}>
                        <td className="mono whitespace-nowrap">
                          <button type="button" className="underline text-brand bg-transparent border-0 p-0 cursor-pointer mono" onClick={(e) => { e.stopPropagation(); setSelected(s); }}>{s.student_id_no}</button>
                        </td>
                        <td>{s.name}</td>
                        <td className="mono whitespace-nowrap">{s.masked_apaar}</td>
                        <td className="min-w-[160px]">{s.course}</td>
                        <td className="num">{s.year_of_study}</td>
                        <td className="whitespace-nowrap">{humanize(s.seat_category)}{s.is_supernumerary && <span className="text-muted text-xs"> · supernum.</span>}</td>
                        <td><StatusTag value={s.status} /></td>
                        <td><span title={IDENTITY_HELP[s.identity_status]}><StatusTag value={s.identity_status} /></span></td>
                        <td><StatusTag value={s.verification_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />
            </>
          )}
      </Panel>

      {selected && (
        <RecordDrawer
          instId={instId}
          record={selected}
          onClose={() => setSelected(null)}
          onChanged={(row) => { setSelected(row); void reload(); }}
        />
      )}

      <AddStudentModal
        open={adding}
        instId={instId}
        courses={courses}
        onClose={() => setAdding(false)}
        onAdded={() => { void reload(); void dash.reload(); }}
      />
    </>
  );
}

function RecordDrawer({ instId, record, onClose, onChanged }: { instId: string; record: StudentRow; onClose: () => void; onChanged: (r: StudentRow) => void }) {
  const history = useApi(() => api.institution.history(instId, record.enrolment_id), [record.enrolment_id, record.version]);
  const [newStatus, setNewStatus] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const change = useAction((status: string, why: string) => api.institution.changeStatus(instId, record.enrolment_id, status, why));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !newStatus) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, newStatus]);

  const verified = record.verification_status === 'ACCEPTED' && record.identity_status === 'VERIFIED';

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#0f172a]/30" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="bg-white w-full max-w-md h-full overflow-y-auto shadow-xl border-l border-line" role="dialog" aria-modal="true" aria-label={`Record ${record.student_id_no}`}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-line-soft sticky top-0 bg-white">
          <div>
            <div className="text-xs text-muted">Student record · version {record.version}</div>
            <h2 className="text-lg font-bold">{record.name}</h2>
            <div className="mono text-sm">{record.student_id_no}</div>
          </div>
          <button type="button" className="text-muted hover:text-ink bg-transparent border-0 cursor-pointer" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-6">
          <KeyValue items={[
            ['APAAR', <span key="kv15" className="mono">{record.masked_apaar}</span>],
            ['Programme', record.course],
            ['Academic year', `${record.academic_year}–${String(record.academic_year + 1).slice(2)}`],
            ['Year of study', record.year_of_study],
            ['Mode', humanize(record.mode)],
            ['Seat category', `${humanize(record.seat_category)}${record.is_supernumerary ? ' (supernumerary)' : ''}`],
            ['Nationality', record.nationality],
            ['Enrolment', <StatusTag key="kv16" value={record.status} />],
            ['Verification', <StatusTag key="kv17" value={record.verification_status} />],
            ['Reported', fmtDateTime(record.created_at)],
          ]} />

          <div>
            <h3 className="text-sm font-bold mb-1">Identity</h3>
            <div className="flex items-start gap-2 text-sm"><StatusTag value={record.identity_status} /><span className="text-muted">{IDENTITY_HELP[record.identity_status]}</span></div>
            {record.verification_status === 'FLAGGED' && (
              <div className="mt-3"><Alert tone="warn">This student is part of an AICTE conflict case. See the case ID on your dashboard. Do not change the record until the case is closed.</Alert></div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2">Change enrolment status</h3>
            {record.status === 'PROVISIONAL' ? (
              <p className="text-sm text-muted">This record is on hold. Correct the APAAR details through a new upload, or wait for the AICTE case to close.</p>
            ) : newStatus ? (
              <div className="space-y-3">
                {verified && <Alert tone="warn">This record is verified. Changing it starts a review and is recorded in the audit log.</Alert>}
                <Field label={`Reason for marking as ${humanize(newStatus).toLowerCase()}`} htmlFor="status-reason" error={change.error}>
                  <textarea id="status-reason" className="textarea" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Student withdrew on 12 Sep 2026; fee refunded" />
                </Field>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary btn-sm" disabled={reason.trim().length < 5 || change.pending}
                          onClick={async () => {
                            const updated = await change.run(newStatus, reason.trim());
                            if (updated) { setNewStatus(null); setReason(''); onChanged(updated); }
                          }}>
                    {change.pending && <Spinner size={14} />} Save change
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setNewStatus(null); setReason(''); change.clearError(); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {['WITHDRAWN', 'TRANSFERRED', 'COMPLETED', 'ACTIVE'].filter((s) => s !== record.status).map((s) => (
                  <button key={s} type="button" className="btn btn-secondary btn-sm" onClick={() => setNewStatus(s)}>
                    Mark {s === 'ACTIVE' ? 'active again' : humanize(s).toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2">Issues from upload</h3>
            {history.loading && !history.data ? <Loading rows={2} /> : history.data?.issues.length ? (
              <ul className="list-none p-0 space-y-2 text-sm">
                {history.data.issues.map((i, n) => (
                  <li key={n} className="border border-line-soft rounded p-2.5">
                    <div className="flex gap-2 items-center"><span className="mono font-semibold">{i.rule_id}</span><StatusTag value={i.severity} /></div>
                    <p className="mt-1">{i.message}</p>
                    {i.suggested_fix && <p className="mt-1 text-muted">{i.suggested_fix}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">None.</p>}
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2">History</h3>
            {history.error ? <p className="text-sm text-bad">{history.error}</p> : history.loading && !history.data ? <Loading rows={3} /> : (
              <ol className="list-none p-0 border-l-2 border-line-soft ml-1 space-y-3">
                {(history.data?.events ?? []).map((ev) => (
                  <li key={ev.seq} className="pl-3 text-sm">
                    <div className="font-semibold">{humanize(ev.action)}</div>
                    <div className="text-muted text-xs">{fmtDateTime(ev.at)} · {ev.actor}</div>
                    {ev.action === 'ENROLMENT_STATUS_CHANGED' && (
                      <div className="text-xs mt-0.5">{humanize(String(ev.detail.before))} → {humanize(String(ev.detail.after))}: “{String(ev.detail.reason)}”</div>
                    )}
                  </li>
                ))}
                {history.data?.events.length === 0 && <li className="pl-3 text-sm text-muted">Synced from an earlier submission; no changes since.</li>}
              </ol>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

const EMPTY_FORM: AddStudentInput = {
  apaar_id: '', student_id_no: '', name: '', dob: '', course: '', year_of_study: 1, mode: 'FULL_TIME',
  seat_category: 'General', is_supernumerary: false, nationality: 'Indian',
};

function AddStudentModal({ open, instId, courses, onClose, onAdded }: {
  open: boolean; instId: string; courses: string[]; onClose: () => void; onAdded: () => void;
}) {
  const [form, setForm] = useState<AddStudentInput>(EMPTY_FORM);
  const [result, setResult] = useState<AddStudentResult | null>(null);
  const add = useAction(() => api.institution.addStudent(instId, { ...form, course: form.course || courses[0] || '' }));

  const close = () => { setForm(EMPTY_FORM); setResult(null); add.clearError(); onClose(); };
  const set = <K extends keyof AddStudentInput>(k: K, v: AddStudentInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const apaarInvalid = form.apaar_id !== '' && !/^\d{12}$/.test(form.apaar_id);

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add a student"
      width="max-w-2xl"
      footer={result ? (
        <>
          <button type="button" className="btn btn-secondary" onClick={() => { setForm(EMPTY_FORM); setResult(null); }}>Add another</button>
          <button type="button" className="btn btn-primary" onClick={close}>Done</button>
        </>
      ) : (
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" form="add-student" className="btn btn-primary" disabled={add.pending || apaarInvalid}>{add.pending && <Spinner />} Check and add</button>
        </>
      )}
    >
      {result ? (
        <div className="space-y-3 text-sm">
          <Alert tone={result.decision === 'ACCEPT' ? 'ok' : result.decision === 'HOLD' ? 'warn' : 'info'}
                 title={result.decision === 'HOLD' ? `${result.student.name} was recorded on hold` : `${result.student.name} was added`}>
            Student ID <span className="mono">{result.student.student_id_no}</span>, APAAR <span className="mono">{result.student.masked_apaar}</span>.
            {result.case_number && <> Conflict, case <strong>{result.case_number}</strong> opened for AICTE review.</>}
          </Alert>
          {result.issues.length > 0 && (
            <ul className="list-disc pl-5 space-y-1">
              {result.issues.map((i, n) => <li key={n}><span className="mono">{i.rule_id}</span> — {i.message}</li>)}
            </ul>
          )}
        </div>
      ) : (
        <form id="add-student" className="grid gap-4 sm:grid-cols-2" onSubmit={async (e) => {
          e.preventDefault();
          const res = await add.run();
          if (res) { setResult(res); onAdded(); }
        }}>
          {add.error && <div className="sm:col-span-2"><Alert tone="bad" title="The student was not added">{add.error}</Alert></div>}
          <Field label="Full name" htmlFor="ad-name"><input id="ad-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Date of birth" htmlFor="ad-dob"><input id="ad-dob" className="input" type="date" required value={form.dob} onChange={(e) => set('dob', e.target.value)} /></Field>
          <Field label="APAAR ID" hint="Leave blank if the student has none yet." error={apaarInvalid ? 'Must be 12 digits.' : null} htmlFor="ad-apaar">
            <input id="ad-apaar" className="input mono" inputMode="numeric" maxLength={12} aria-invalid={apaarInvalid}
                   value={form.apaar_id} onChange={(e) => set('apaar_id', e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Student ID / roll number" htmlFor="ad-sid"><input id="ad-sid" className="input mono" required value={form.student_id_no} onChange={(e) => set('student_id_no', e.target.value)} /></Field>
          <Field label="Programme" htmlFor="ad-course">
            <select id="ad-course" className="select" value={form.course || courses[0] || ''} onChange={(e) => set('course', e.target.value)}>
              {courses.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Year of study" htmlFor="ad-year">
            <select id="ad-year" className="select" value={form.year_of_study} onChange={(e) => set('year_of_study', Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Mode" htmlFor="ad-mode">
            <select id="ad-mode" className="select" value={form.mode} onChange={(e) => set('mode', e.target.value)}>
              <option value="FULL_TIME">Full-time</option><option value="PART_TIME">Part-time</option><option value="ONLINE_ODL">Online / ODL</option>
            </select>
          </Field>
          <Field label="Seat category" htmlFor="ad-cat">
            <select id="ad-cat" className="select" value={form.seat_category}
                    onChange={(e) => setForm((f) => ({ ...f, seat_category: e.target.value, is_supernumerary: SUPERNUMERARY_CATEGORIES.has(e.target.value) }))}>
              {SEAT_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
            </select>
          </Field>
          <Field label="Nationality" htmlFor="ad-nat"><input id="ad-nat" className="input" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} /></Field>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input type="checkbox" checked={form.is_supernumerary} onChange={(e) => set('is_supernumerary', e.target.checked)} />
            Supernumerary seat (over and above intake)
          </label>
        </form>
      )}
    </Modal>
  );
}
