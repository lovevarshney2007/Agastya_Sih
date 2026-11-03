import { useState } from 'react';
import { api } from '../../api/client';
import { Alert, DataCard, Empty, ErrorState, Field, KeyValue, Loading, Meter, Modal, PageHeader, Pagination, Panel, Stat, StatusTag } from '../../components/ui';
import { fmtNum, humanize } from '../../lib/format';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';

const PURPOSES = ['Investigating an open case', 'Planned inspection', 'Responding to a complaint', 'Approval renewal review'];

export function InstitutionProfile({ institutionId }: { institutionId: string }) {
  const { data, error, reload } = useApi(() => api.institution.dashboard(institutionId), [institutionId]);
  const list = useApi(() => api.aicte.institutions(), []);
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [purposeNote, setPurposeNote] = useState('');
  const [accessGranted, setAccessGranted] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const students = useApi(accessGranted ? () => api.institution.students(institutionId, { page, page_size: 20, purpose: accessGranted ?? undefined }) : null, [accessGranted, page, institutionId]);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={10} />;

  const meta = list.data?.find((i) => i.institution_id === institutionId);
  const k = data.kpis;

  return (
    <>
      <PageHeader
        back={{ to: '/aicte/institutions', label: 'All institutions' }}
        title={data.institution.name}
        description={<>Permanent ID <span className="mono">{data.institution.code}</span> · {data.institution.district}, {data.institution.state} · {data.institution.type}</>}
        actions={meta && <StatusTag value={meta.risk_level} label={`${humanize(meta.risk_level)} risk · ${meta.risk_score.toFixed(2)}`} />}
      />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <Stat label="Enrolled (active)" value={fmtNum(k.total_enrolled)} note={`Approved intake ${fmtNum(k.approved_intake)}`} />
        <Stat label="APAAR verified" value={`${k.identity_verified_pct}%`} />
        <Stat label="On hold" value={k.held_count} tone={k.held_count ? 'warn' : undefined} />
        <Stat label="Open cases" value={k.open_cases} tone={k.open_cases ? 'bad' : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Programmes and intake, 2026–27" bodyClassName="">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Programme</th><th>Within intake</th><th>Supernumerary</th><th>Lateral</th></tr></thead>
              <tbody>
                {data.program_breakdown.map((p) => (
                  <tr key={p.program_offering_id}>
                    <td className="min-w-[160px]">{p.course}<div className="text-xs text-muted">{p.level}</div></td>
                    <td><Meter value={p.enrolled} max={p.approved_intake} /></td>
                    <td><Meter value={p.supernumerary} max={p.supernumerary_cap} /></td>
                    <td><Meter value={p.lateral} max={p.lateral_cap} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Contact and status">
            <KeyValue items={[
              ['Nodal officer', data.institution.nodal_officer],
              ['Email', meta?.nodal_officer_email ?? '—'],
              ['Approval status', humanize(data.institution.status)],
              ['Portal account', meta ? (meta.is_activated ? 'Activated' : 'Not yet activated') : '—'],
            ]} />
          </Panel>
          {meta && meta.risk_level !== 'LOW' && (
            <Panel title="Why it is ranked here">
              <ul className="list-disc text-sm pl-5">{meta.risk_reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              <p className="text-xs text-muted mt-3">Indicator only — not a finding. <Link to="/aicte/risk">Full ranking</Link></p>
            </Panel>
          )}
        </div>
      </div>

      <Panel title="Student-level records" className="mt-6" bodyClassName={accessGranted ? '' : 'panel-body'}>
        {!accessGranted ? (
          <div className="text-sm">
            <p className="mt-0">Student records are hidden by default. Opening them requires a stated purpose, and the access is logged. Names stay hidden; APAAR IDs are masked.</p>
            <button type="button" className="btn btn-secondary mt-3" onClick={() => setPurposeOpen(true)}>View student records</button>
          </div>
        ) : students.error ? <div className="p-4"><ErrorState message={students.error} onRetry={students.reload} /></div>
          : !students.data ? <div className="p-4"><Loading /></div>
          : students.data.total === 0 ? <Empty title="No students reported" /> : (
            <>
              <div className="px-4 py-2 text-xs text-muted border-b border-line-soft bg-wash">Opened for: {accessGranted}. This access is logged.</div>
              {/* Mobile Data Cards (md:hidden) */}
              <div className="md:hidden divide-y divide-border">
                {students.data.students.map((s) => (
                  <DataCard
                    key={s.enrolment_id}
                    title={s.course}
                    subtitle={`Student ID: ${s.student_id_no}`}
                    badge={<StatusTag value={s.status} />}
                    fields={[
                      { label: 'APAAR ID', value: s.masked_apaar, mono: true },
                      { label: 'Seat Category', value: humanize(s.seat_category) },
                      { label: 'Identity', value: <StatusTag value={s.identity_status} /> },
                      { label: 'Verification', value: <StatusTag value={s.verification_status} /> },
                    ]}
                  />
                ))}
              </div>

              {/* Desktop Table (hidden md:block) */}
              <div className="hidden md:block table-wrap">
                <table className="data-table">
                  <thead><tr><th>Student ID</th><th>APAAR</th><th>Programme</th><th>Seat</th><th>Enrolment</th><th>Identity</th><th>Verification</th></tr></thead>
                  <tbody>
                    {students.data.students.map((s) => (
                      <tr key={s.enrolment_id}>
                        <td className="mono">{s.student_id_no}</td>
                        <td className="mono">{s.masked_apaar}</td>
                        <td>{s.course}</td>
                        <td>{humanize(s.seat_category)}</td>
                        <td><StatusTag value={s.status} /></td>
                        <td><StatusTag value={s.identity_status} /></td>
                        <td><StatusTag value={s.verification_status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} pageSize={20} total={students.data.total} onPage={setPage} />
            </>
          )}
      </Panel>

      <Modal open={purposeOpen} onClose={() => setPurposeOpen(false)} title="Why do you need these records?"
             footer={<>
               <button type="button" className="btn btn-secondary" onClick={() => setPurposeOpen(false)}>Cancel</button>
               <button type="button" className="btn btn-primary" disabled={purposeNote.trim().length < 5}
                       onClick={() => { setAccessGranted(`${purpose} — ${purposeNote.trim()}`); setPurposeOpen(false); }}>Open records</button>
             </>}>
        <div className="space-y-4">
          <Alert tone="info">This access is logged against your name with the purpose you give.</Alert>
          <Field label="Purpose" htmlFor="pp-purpose">
            <select id="pp-purpose" className="select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Note" hint="e.g. the case number or inspection order." htmlFor="pp-note">
            <input id="pp-note" className="input" value={purposeNote} onChange={(e) => setPurposeNote(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </>
  );
}
