import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client';
import type { OnboardInput } from '../../api/types';
import { Alert, DataCard, Empty, ErrorState, Field, Loading, Modal, PageHeader, Panel, Spinner, StatusTag } from '../../components/ui';
import { fmtDate, fmtNum } from '../../lib/format';
import { Link, useRouter } from '../../lib/router';
import { useAction, useApi } from '../../lib/useApi';
import { FilterSelect } from '../institution/BatchDetail';

export function Institutions() {
  const { navigate } = useRouter();
  const { data, error, reload } = useApi(() => api.aicte.institutions(), []);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('ALL');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  const states = useMemo(() => [...new Set((data ?? []).map((i) => i.state))].sort(), [data]);
  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data ?? []).filter((i) => (state === 'ALL' || i.state === state)
      && (!needle || i.name.toLowerCase().includes(needle) || i.aicte_permanent_id.includes(needle)));
  }, [data, search, state]);

  return (
    <>
      <PageHeader
        title="Institutions"
        description="Approved institutions, keyed by AICTE Permanent ID, with this year’s reporting and compliance status."
        actions={<button type="button" className="btn btn-primary w-full sm:w-auto" onClick={() => setAdding(true)}><Plus size={16} aria-hidden="true" /> Register an institution</button>}
      />
      {added && <div className="mb-4"><Alert tone="ok" onClose={() => setAdded(null)}>{added}</Alert></div>}

      {error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <Panel bodyClassName="">
          <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-line-soft bg-wash">
            <input className="input w-full sm:w-72 !py-1" placeholder="Name or Permanent ID" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search institutions" />
            <FilterSelect label="State" value={state} onChange={setState} options={states} />
          </div>
          {!data ? <div className="p-4"><Loading /></div> : rows.length === 0 ? <Empty title="No institutions match" /> : (
            <>
              {/* Mobile Dual Pattern: Compact Data Cards */}
              <div className="p-3 space-y-3 md:hidden">
                {rows.map((i) => (
                  <DataCard
                    key={i.institution_id}
                    title={i.name}
                    subtitle={`${i.aicte_permanent_id} · ${i.type}`}
                    badge={{
                      label: i.risk_level,
                      tone: i.risk_level === 'HIGH' ? 'bad' : i.risk_level === 'MEDIUM' ? 'warn' : 'ok',
                    }}
                    onClick={() => navigate(`/aicte/institutions/${i.institution_id}`)}
                    fields={[
                      { label: 'State', value: i.state },
                      { label: 'Account Status', value: i.is_activated ? 'Active' : 'Awaiting Consent' },
                      { label: 'Intake vs Enrolled', value: `${fmtNum(i.enrolled)} / ${fmtNum(i.approved_intake)}` },
                      { label: 'Open Discrepancies', value: i.open_cases ? `${i.open_cases} cases` : '0 cases' },
                      { label: 'Last Submission', value: i.last_submission ? fmtDate(i.last_submission) : 'Synced only' },
                    ]}
                    actions={
                      <Link
                        to={`/aicte/institutions/${i.institution_id}`}
                        className="btn btn-secondary btn-sm w-full text-center flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Full Details & Audits
                      </Link>
                    }
                  />
                ))}
              </div>

              {/* Desktop Full Table */}
              <div className="hidden md:block table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Institution</th><th>State</th><th>Account</th><th className="num">Intake</th><th className="num">Enrolled</th><th className="num">Open cases</th><th>Risk</th><th>Last submission</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.institution_id} className="clickable" onClick={() => navigate(`/aicte/institutions/${i.institution_id}`)}>
                        <td className="min-w-[240px]">
                          <Link to={`/aicte/institutions/${i.institution_id}`} className="font-semibold" onClick={(e) => e.stopPropagation()}>{i.name}</Link>
                          <div className="text-xs text-muted"><span className="mono">{i.aicte_permanent_id}</span> · {i.type}</div>
                        </td>
                        <td className="whitespace-nowrap">{i.state}</td>
                        <td>{i.is_activated ? <StatusTag value="ACTIVE" /> : <StatusTag value="AWAITING_CONSENT" label="Not activated" />}</td>
                        <td className="num">{fmtNum(i.approved_intake)}</td>
                        <td className={`num ${i.within_intake > i.approved_intake ? 'text-bad font-semibold' : ''}`}>{fmtNum(i.enrolled)}</td>
                        <td className="num">{i.open_cases || '—'}</td>
                        <td><StatusTag value={i.risk_level} /></td>
                        <td className="whitespace-nowrap">{i.last_submission ? fmtDate(i.last_submission) : <span className="text-muted">Synced only</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      )}

      <OnboardModal open={adding} onClose={() => setAdding(false)}
                    onDone={(name, pid) => { setAdding(false); setAdded(`${name} (${pid}) was registered. Its nodal officer can now activate the account.`); void reload(); }} />
    </>
  );
}

const EMPTY: OnboardInput = {
  aicte_permanent_id: '', name: '', state: '', district: '', inst_type: 'Private / Self-Financing',
  nodal_officer_name: '', nodal_officer_email: '', programs: [{ course: '', approved_intake: 60, level: 'UG' }],
};

function OnboardModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (name: string, pid: string) => void }) {
  const [form, setForm] = useState<OnboardInput>(EMPTY);
  const save = useAction(() => api.aicte.onboard(form));
  const set = <K extends keyof OnboardInput>(k: K, v: OnboardInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setProg = (i: number, patch: Partial<OnboardInput['programs'][number]>) =>
    setForm((f) => ({ ...f, programs: f.programs.map((p, n) => (n === i ? { ...p, ...patch } : p)) }));
  const close = () => { setForm(EMPTY); save.clearError(); onClose(); };

  return (
    <Modal open={open} onClose={close} title="Register an approved institution" width="max-w-2xl"
           footer={<>
             <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
             <button type="submit" form="onboard" className="btn btn-primary" disabled={save.pending}>{save.pending && <Spinner />} Register</button>
           </>}>
      <form id="onboard" className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        const res = await save.run();
        if (res) { onDone(form.name, form.aicte_permanent_id); setForm(EMPTY); }
      }}>
        <p className="text-sm text-muted">Enter the details exactly as they appear in the Extension of Approval.</p>
        {save.error && <Alert tone="bad">{save.error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="AICTE Permanent ID" htmlFor="ob-pid"><input id="ob-pid" className="input mono" required placeholder="1-1234567" value={form.aicte_permanent_id} onChange={(e) => set('aicte_permanent_id', e.target.value)} /></Field>
          <Field label="Type" htmlFor="ob-type">
            <select id="ob-type" className="select" value={form.inst_type} onChange={(e) => set('inst_type', e.target.value)}>
              {['Private / Self-Financing', 'State Govt Autonomous', 'State Govt University', 'Central Govt', 'Institute of National Importance'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2"><Field label="Institution name" htmlFor="ob-name"><input id="ob-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
          <Field label="State" htmlFor="ob-state"><input id="ob-state" className="input" required value={form.state} onChange={(e) => set('state', e.target.value)} /></Field>
          <Field label="District" htmlFor="ob-district"><input id="ob-district" className="input" required value={form.district} onChange={(e) => set('district', e.target.value)} /></Field>
          <Field label="Nodal officer" htmlFor="ob-officer"><input id="ob-officer" className="input" required value={form.nodal_officer_name} onChange={(e) => set('nodal_officer_name', e.target.value)} /></Field>
          <Field label="Nodal officer’s email" htmlFor="ob-email"><input id="ob-email" className="input" type="email" required value={form.nodal_officer_email} onChange={(e) => set('nodal_officer_email', e.target.value)} /></Field>
        </div>

        <fieldset className="border border-line-soft rounded p-3">
          <legend className="text-sm font-semibold px-1">Approved programmes, 2026–27</legend>
          <div className="space-y-3">
            {form.programs.map((p, i) => (
              <div key={i} className="p-2.5 sm:p-0 bg-wash sm:bg-transparent rounded-lg border sm:border-0 border-line-soft grid grid-cols-1 sm:grid-cols-[1fr_90px_80px_auto] gap-2 items-end">
                <Field label={i === 0 ? 'Programme' : <span className="sm:sr-only">Programme</span>} htmlFor={`ob-c${i}`}>
                  <input id={`ob-c${i}`} className="input" required value={p.course} onChange={(e) => setProg(i, { course: e.target.value })} />
                </Field>
                <div className="grid grid-cols-[1fr_1fr_auto] sm:contents gap-2 items-end">
                  <Field label={i === 0 ? 'Intake' : <span className="sm:sr-only">Intake</span>} htmlFor={`ob-i${i}`}>
                    <input id={`ob-i${i}`} className="input" type="number" min={1} required value={p.approved_intake} onChange={(e) => setProg(i, { approved_intake: Number(e.target.value) })} />
                  </Field>
                  <Field label={i === 0 ? 'Level' : <span className="sm:sr-only">Level</span>} htmlFor={`ob-l${i}`}>
                    <select id={`ob-l${i}`} className="select" value={p.level} onChange={(e) => setProg(i, { level: e.target.value })}>
                      <option>UG</option><option>PG</option><option>Diploma</option>
                    </select>
                  </Field>
                  <button type="button" className="btn btn-ghost !px-2 mb-0.5" disabled={form.programs.length === 1} aria-label="Remove programme"
                          onClick={() => setForm((f) => ({ ...f, programs: f.programs.filter((_, n) => n !== i) }))}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => setForm((f) => ({ ...f, programs: [...f.programs, { course: '', approved_intake: 60, level: 'UG' }] }))}>
            <Plus size={14} aria-hidden="true" /> Add programme
          </button>
        </fieldset>
      </form>
    </Modal>
  );
}
