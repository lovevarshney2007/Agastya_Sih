import { useState } from 'react';
import { AlertTriangle, FileText, GitCompare, Lock, Volume2, VolumeX } from 'lucide-react';
import { api } from '../../api/client';
import { bhashiniVoice } from '../../utils/bhashiniVoice';
import type { CaseDetail } from '../../api/types';
import { Alert, ErrorState, Field, KeyValue, Loading, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDate, fmtDateTime, humanize } from '../../lib/format';
import { useSession } from '../../lib/session';
import { useAction, useApi } from '../../lib/useApi';

const ACTIONS = [
  { id: 'CONFIRM_VIOLATION', label: 'Confirm the violation', help: 'The student holds two full-time seats. Both records stay flagged; the institutions are told to resolve it.' },
  { id: 'FALSE_POSITIVE', label: 'Mark as false positive', help: 'The match is wrong (e.g. a transfer already completed). Held records are released.' },
  { id: 'REQUEST_CLARIFICATION', label: 'Ask the institutions for clarification', help: 'Moves the case to under review. Takes effect at once; no approval needed.' },
];

export function CaseDetailPage({ caseId }: { caseId: string }) {
  const { user } = useSession();
  const { data, error, reload, setData } = useApi(() => api.aicte.case(caseId), [caseId]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceNotice = () => {
    if (isSpeaking) {
      bhashiniVoice.stop();
      setIsSpeaking(false);
      return;
    }

    if (!data) return;

    const noticeSummary = `Statutory Show-Cause Notice for Case number ${data.case_number}. Status: ${data.status}. Flagged on rule ${data.rule_id}. Cross-institution conflict detected involving duplicate full-time admissions. This notice is issued under AICTE Act 1987 and UGC simultaneous enrolment regulations.`;

    setIsSpeaking(true);
    bhashiniVoice.speak(noticeSummary, 'en-IN', {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={10} />;

  const isMaker = data.maker_email?.toLowerCase() === user?.email.toLowerCase();
  const closed = data.status === 'RESOLVED' || data.status === 'FALSE_POSITIVE';

  return (
    <>
      <PageHeader
        back={{ to: '/aicte/cases', label: 'All cases' }}
        title={<span className="flex flex-wrap items-center gap-3"><span className="mono">{data.case_number}</span> <StatusTag value={data.status} /></span>}
        description={<>Cross-institution duplicate · rule <span className="mono">{data.rule_id}</span> version {data.rule_version} · flagged {fmtDate(data.created_at)} ({data.age_days} days ago)</>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`btn flex items-center gap-1.5 transition-all ${
                isSpeaking ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : 'btn-secondary'
              }`}
              onClick={handleVoiceNotice}
              title="Bhashini Voice Readout of Show-Cause Notice"
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={16} />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} className="text-indigo-600" />
                  <span>Listen Notice (Bhashini)</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-primary flex items-center gap-2"
              disabled={pdfLoading}
              onClick={async () => {
                setPdfLoading(true);
                setPdfError(null);
                try {
                  await api.aicte.downloadShowCausePdf(data.case_number);
                } catch (e) {
                  setPdfError(e instanceof Error ? e.message : 'Failed to generate Show-Cause notice');
                } finally {
                  setPdfLoading(false);
                }
              }}
            >
              {pdfLoading ? <Spinner /> : <FileText size={16} aria-hidden="true" />}
              Issue Show-Cause Notice (PDF)
            </button>
          </div>
        }
      />

      {pdfError && <div className="mb-4"><Alert tone="bad" onClose={() => setPdfError(null)}>{pdfError}</Alert></div>}
      {data.overdue && <div className="mb-5"><Alert tone="warn">This case has been open for more than 14 days.</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Side-by-Side Incompatibility Evidence">
            <ConflictDiffViewer evidence={data.evidence} maskedApaar={data.masked_apaar} />
          </Panel>

          <Panel title="Activity">
            {data.timeline.length === 0 ? <p className="text-sm text-muted">No activity yet.</p> : (
              <ol className="list-none p-0 border-l-2 border-line-soft ml-1 space-y-4">
                {data.timeline.map((ev) => (
                  <li key={ev.seq} className="pl-4 text-sm">
                    <div className="font-semibold">{humanize(ev.action)}</div>
                    <div className="text-xs text-muted">{fmtDateTime(ev.at)} · {ev.actor} · ledger #{ev.seq}</div>
                    {typeof ev.detail.note === 'string' && <p className="mt-1">“{ev.detail.note}”</p>}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          {closed ? (
            <Panel title="Outcome">
              <Alert tone={data.status === 'RESOLVED' ? 'bad' : 'ok'} title={data.status === 'RESOLVED' ? 'Violation confirmed' : 'False positive'}>
                {data.resolution_reason}
              </Alert>
              <div className="mt-4">
                <KeyValue items={[
                  ['Proposed by', data.maker_officer],
                  ['Approved by', data.checker_officer],
                  ['Closed', fmtDateTime(data.resolved_at)],
                ]} />
              </div>
            </Panel>
          ) : data.status === 'PENDING_APPROVAL' ? (
            <ApprovalPanel data={data} isMaker={isMaker} canApprove={user?.role === 'AICTE_CHECKER'} onDone={setData} />
          ) : (
            <ProposePanel caseId={data.case_id} onDone={setData} />
          )}

          <Panel title="Notice to the institutions">
            <p className="text-sm text-muted">Each institution receives this, with the case ID only. Neither is told the other’s name.</p>
            <blockquote className="text-sm border-l-4 border-line pl-3 mt-3 italic">{data.notification_preview}</blockquote>
          </Panel>
        </div>
      </div>
    </>
  );
}

function ProposePanel({ caseId, onDone }: { caseId: string; onDone: (c: CaseDetail) => void }) {
  const [action, setAction] = useState('');
  const [note, setNote] = useState('');
  const submit = useAction(async () => {
    await api.aicte.propose(caseId, action, note.trim());
    return api.aicte.case(caseId);
  });

  return (
    <Panel title="Decide this case">
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        const updated = await submit.run();
        if (updated) { onDone(updated); setAction(''); setNote(''); }
      }}>
        <fieldset className="border-0 p-0 space-y-2">
          <legend className="label">Proposed outcome</legend>
          {ACTIONS.map((a) => (
            <label key={a.id} className={`flex gap-2.5 items-start border rounded p-3 cursor-pointer text-sm ${action === a.id ? 'border-brand bg-brand-wash' : 'border-line'}`}>
              <input type="radio" name="case-action" value={a.id} checked={action === a.id} onChange={() => setAction(a.id)} className="mt-1" />
              <span><span className="font-semibold block">{a.label}</span><span className="text-muted">{a.help}</span></span>
            </label>
          ))}
        </fieldset>
        <Field label="Reason" hint="At least 10 characters. Shown to the approving officer and kept in the audit log." htmlFor="case-note" error={submit.error}>
          <textarea id="case-note" className="textarea" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <button type="submit" className="btn btn-primary" disabled={!action || note.trim().length < 10 || submit.pending}>
          {submit.pending && <Spinner />} {action === 'REQUEST_CLARIFICATION' ? 'Send request' : 'Submit for approval'}
        </button>
      </form>
    </Panel>
  );
}

function ApprovalPanel({ data, isMaker, canApprove, onDone }: { data: CaseDetail; isMaker: boolean; canApprove: boolean; onDone: (c: CaseDetail) => void }) {
  const [note, setNote] = useState('');
  const decide = useAction(async (approve: boolean) => {
    await api.aicte.decide(data.case_id, approve, note.trim());
    return api.aicte.case(data.case_id);
  });

  return (
    <Panel title="Awaiting approval">
      <div className="text-sm space-y-3">
        <div>
          <span className="text-muted">Proposed outcome</span>
          <div className="font-semibold">{data.proposed_resolution === 'FALSE_POSITIVE' ? 'Mark as false positive' : 'Confirm the violation'}</div>
        </div>
        <div><span className="text-muted">Proposed by</span><div>{data.maker_officer} <span className="text-muted">({data.maker_email})</span></div></div>
        <div><span className="text-muted">Reason given</span><p >“{data.proposed_action}”</p></div>
      </div>

      <div className="mt-4">
        {isMaker ? (
          <Alert tone="info" title="You proposed this outcome">A different senior officer must approve it. You cannot approve your own proposal.</Alert>
        ) : !canApprove ? (
          <Alert tone="info" title="A senior officer approves this">Your role can propose outcomes but not approve them.</Alert>
        ) : (
          <div className="space-y-3">
            <Field label="Your note" hint="Required. Recorded in the audit log." htmlFor="approve-note" error={decide.error}>
              <textarea id="approve-note" className="textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-primary" disabled={note.trim().length < 5 || decide.pending}
                      onClick={async () => { const u = await decide.run(true); if (u) onDone(u); }}>
                {decide.pending && <Spinner />} Approve
              </button>
              <button type="button" className="btn btn-secondary" disabled={note.trim().length < 5 || decide.pending}
                      onClick={async () => { const u = await decide.run(false); if (u) onDone(u); }}>
                Return to maker
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ConflictDiffViewer({ evidence, maskedApaar }: { evidence: CaseDetail['evidence']; maskedApaar: string }) {
  if (evidence.length < 2) {
    return (
      <div className="space-y-4">
        {evidence.map((e, i) => (
          <div key={e.enrolment_id} className="border border-line rounded p-4 bg-wash">
            <div className="text-xs text-muted mb-1">Enrolment {i + 1} · reported {fmtDate(e.reported_at)}</div>
            <div className="font-semibold">{e.institution}</div>
            <div className="text-xs text-muted mb-3">Permanent ID <span className="mono">{e.aicte_permanent_id}</span> · {e.state}</div>
            <KeyValue items={[
              ['Programme', e.course],
              ['Student ID', <span key="kv6" className="mono">{e.student_id_no}</span>],
              ['Mode', humanize(e.mode)],
              ['Year', e.year_of_study],
              ['Status', <StatusTag key="kv7" value={e.status} />],
              ['Verification', <StatusTag key="kv8" value={e.verification_status} />],
            ]} />
          </div>
        ))}
        <p className="text-sm text-muted">One of the enrolments is no longer in the repository.</p>
      </div>
    );
  }

  const [e1, e2] = evidence;
  const isModeConflict = e1.mode.toLowerCase() === 'full_time' && e2.mode.toLowerCase() === 'full_time';

  return (
    <div className="space-y-4">
      {/* Cryptographic Match Header Badge */}
      <div className="p-3.5 bg-brand-wash/50 border border-brand/30 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-navy text-white rounded-md shrink-0">
            <Lock size={15} />
          </span>
          <div>
            <div className="font-bold text-navy flex items-center gap-1.5">
              <span>Cryptographic Blind Index Interception</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold border border-emerald-300">
                HMAC-SHA256 Match
              </span>
            </div>
            <div className="text-muted text-[11px] mt-0.5">
              Target Blind Index: <span className="mono font-semibold text-ink">{maskedApaar}</span> · Protected under DPDP Act 2023 §11
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-navy text-[11px] font-semibold bg-white px-2.5 py-1 rounded border border-line">
          <GitCompare size={13} className="text-saffron" /> Side-by-Side Incompatibility Audit
        </div>
      </div>

      {/* Side-by-Side Column Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Institution 1 */}
        <div className="border-2 border-brand/40 bg-white rounded-lg p-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-brand" />
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-brand-wash text-brand rounded">
              ENROLMENT A (Anchor)
            </span>
            <span className="text-[11px] text-muted">Reported {fmtDate(e1.reported_at)}</span>
          </div>
          <div className="font-bold text-base text-navy leading-tight">{e1.institution}</div>
          <div className="text-xs text-muted mt-0.5 mb-3 font-mono">
            Permanent ID: {e1.aicte_permanent_id} · {e1.state}
          </div>
          <div className="space-y-2 text-xs border-t border-line-soft pt-2.5">
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Programme</span>
              <strong className="text-ink">{e1.course}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Student ID / Roll</span>
              <span className="mono font-semibold">{e1.student_id_no}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft items-center">
              <span className="text-muted">Enrolment Mode</span>
              <span className="px-2 py-0.5 bg-bad-wash text-bad font-bold rounded border border-bad/30">
                {humanize(e1.mode)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Academic Year</span>
              <strong className="text-ink">Year {e1.year_of_study}</strong>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span className="text-muted">Status</span>
              <StatusTag value={e1.status} />
            </div>
          </div>
        </div>

        {/* Institution 2 */}
        <div className="border-2 border-saffron/50 bg-white rounded-lg p-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-saffron" />
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-saffron-wash text-saffron rounded">
              ENROLMENT B (Concurrent)
            </span>
            <span className="text-[11px] text-muted">Reported {fmtDate(e2.reported_at)}</span>
          </div>
          <div className="font-bold text-base text-navy leading-tight">{e2.institution}</div>
          <div className="text-xs text-muted mt-0.5 mb-3 font-mono">
            Permanent ID: {e2.aicte_permanent_id} · {e2.state}
          </div>
          <div className="space-y-2 text-xs border-t border-line-soft pt-2.5">
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Programme</span>
              <strong className="text-ink">{e2.course}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Student ID / Roll</span>
              <span className="mono font-semibold">{e2.student_id_no}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft items-center">
              <span className="text-muted">Enrolment Mode</span>
              <span className="px-2 py-0.5 bg-bad-wash text-bad font-bold rounded border border-bad/30">
                {humanize(e2.mode)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line-soft">
              <span className="text-muted">Academic Year</span>
              <strong className="text-ink">Year {e2.year_of_study}</strong>
            </div>
            <div className="flex justify-between py-1 items-center">
              <span className="text-muted">Status</span>
              <StatusTag value={e2.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Violation Callout */}
      {isModeConflict && (
        <div className="p-3 bg-bad-wash border border-bad/30 rounded-lg text-xs text-bad flex items-start gap-2.5">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-bad">Statutory Conflict: Dual Full-Time Attendance Violation</div>
            <div className="mt-0.5 text-bad/90 leading-relaxed">
              Under AICTE Approval Process Handbook (APH) rules and UGC 2022 Guidelines §3.1, a student is strictly prohibited from simultaneous enrollment in two concurrent full-time physical academic programmes.
            </div>
          </div>
        </div>
      )}

      {/* Concurrent Timeline Overlap Visual */}
      <div className="border border-line rounded-lg p-3 bg-wash/60 text-xs">
        <div className="font-semibold text-ink mb-1.5 flex items-center justify-between">
          <span>Concurrent Academic Term Overlap</span>
          <span className="text-muted text-[11px]">Academic Term 2026–27</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-28 text-[11px] truncate text-muted" title={e1.institution}>{e1.institution}</span>
            <div className="flex-1 h-3 bg-brand/20 rounded-xs overflow-hidden relative">
              <div className="h-full bg-brand rounded-xs" style={{ width: '85%', marginLeft: '5%' }} />
            </div>
            <span className="text-[10px] mono text-muted">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 text-[11px] truncate text-muted" title={e2.institution}>{e2.institution}</span>
            <div className="flex-1 h-3 bg-saffron/20 rounded-xs overflow-hidden relative">
              <div className="h-full bg-saffron rounded-xs" style={{ width: '80%', marginLeft: '10%' }} />
            </div>
            <span className="text-[10px] mono text-bad font-semibold">Simultaneous</span>
          </div>
        </div>
      </div>
    </div>
  );
}
