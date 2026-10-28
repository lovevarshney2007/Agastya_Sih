import { Fragment, useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import type { ChainCheck } from '../../api/types';
import { Alert, AsOf, Empty, ErrorState, KeyValue, Loading, PageHeader, Panel, Spinner } from '../../components/ui';
import { fmtDateTime, humanize, shortHash } from '../../lib/format';
import { useAction, useApi } from '../../lib/useApi';
import { FilterSelect } from '../institution/BatchDetail';

export function AuditLedgerPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [action, setAction] = useState('ALL');
  const [actorType, setActorType] = useState('ALL');
  const [open, setOpen] = useState<number | null>(null);
  const [check, setCheck] = useState<ChainCheck | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn' | 'bad'; text: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, error, loading, reload } = useApi(() => api.aicte.audit({ search: debounced, action, actor_type: actorType }), [debounced, action, actorType]);

  const verify = useAction(() => api.aicte.verifyChain());
  const tamper = useAction(() => api.aicte.tamper());
  const restore = useAction(() => api.aicte.restore());
  const anchor = useAction(() => api.aicte.anchor());

  // Verify once when the page opens so the integrity card is never blank.
  const verifyRun = verify.run;
  useEffect(() => { void verifyRun().then((r) => r && setCheck(r)); }, [verifyRun]);

  async function runVerify() {
    const r = await verify.run();
    if (r) setCheck(r);
  }

  const broken = check?.status === 'TAMPER_DETECTED';
  const busy = verify.pending || tamper.pending || restore.pending || anchor.pending;
  const actionError = verify.error || tamper.error || restore.error || anchor.error;

  return (
    <>
      <PageHeader
        title="Audit ledger"
        description="Every upload, change, decision, consent and verification is appended here. Each entry carries the hash of the one before it, so an edit anywhere breaks the chain."
        actions={data && <AsOf at={data.as_of} onRefresh={reload} loading={loading} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] mb-6">
        <section className={`panel overflow-hidden ${broken ? 'border-bad' : ''}`}>
          <div className={`px-5 py-4 flex items-center gap-3 ${broken ? 'bg-bad text-white' : check ? 'bg-ok-wash' : 'bg-wash'}`}>
            {broken ? <ShieldAlert size={28} aria-hidden="true" /> : <ShieldCheck size={28} className="text-ok" aria-hidden="true" />}
            <div>
              <h2 className="text-base font-bold">{!check ? 'Checking chain…' : broken ? 'Tampering detected' : 'Chain intact'}</h2>
              <div className={`text-sm ${broken ? 'opacity-90' : 'text-muted'}`}>
                {check ? `Last verified ${fmtDateTime(check.checked_at)}` : 'Recomputing every hash'}
              </div>
            </div>
          </div>
          <div className="p-5 text-sm space-y-3">
            {broken ? (
              <p ><strong>Entry #{check?.broken_at_seq}</strong> no longer matches its stored hash. {check?.reason}</p>
            ) : check ? (
              <p >All {check.total_events} entries re-hashed and linked correctly, up to #{check.latest_sequence}.</p>
            ) : <Loading rows={2} />}
            {actionError && <Alert tone="bad">{actionError}</Alert>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={runVerify}>{verify.pending && <Spinner size={14} />} Verify now</button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={busy || broken} onClick={async () => {
                const r = await anchor.run();
                if (r) { setNotice({ tone: 'ok', text: r.status === 'ANCHORED' ? `Anchored ${r.events_anchored} new entries. Merkle root ${shortHash(r.merkle_root, 16)}` : r.message ?? 'Nothing new to anchor.' }); void reload(); }
              }}>Anchor to WORM storage</button>
            </div>
          </div>
        </section>

        <Panel title="Demonstration: tamper with the database">
          <p className="text-sm mt-0 mb-3">
            Simulates a database administrator editing the newest ledger entry directly, without going through the application.
            Run it, then press <em>Verify now</em> to see the break detected.
          </p>
          {notice && <div className="mb-3"><Alert tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Alert></div>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-danger btn-sm" disabled={busy || broken} onClick={async () => {
              const r = await tamper.run();
              if (r) { setNotice({ tone: 'warn', text: r.message }); void reload(); }
            }}>{tamper.pending && <Spinner size={14} />} Tamper with entry</button>
            <button type="button" className="btn btn-secondary btn-sm" disabled={busy || !broken} onClick={async () => {
              const r = await restore.run();
              if (r) { setNotice({ tone: 'ok', text: r.message }); await runVerify(); void reload(); }
            }}>Undo the tampering</button>
          </div>
          {data?.latest_anchor && (
            <div className="mt-4 pt-4 border-t border-line-soft">
              <KeyValue items={[
                ['Last anchor', fmtDateTime(data.latest_anchor.anchored_at)],
                ['Entries', `#${data.latest_anchor.start_seq}–#${data.latest_anchor.end_seq}`],
                ['Merkle root', <span key="kv14" className="mono" title={data.latest_anchor.merkle_root}>{shortHash(data.latest_anchor.merkle_root, 20)}</span>],
              ]} />
            </div>
          )}
        </Panel>
      </div>

      {error && !data ? <ErrorState message={error} onRetry={reload} /> : (
        <Panel bodyClassName="" title={`Entries${data ? ` (${data.total_events} in total)` : ''}`}>
          <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-line-soft bg-wash">
            <input className="input !w-64 !py-1" placeholder="Actor or entity ID" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search the ledger" />
            <FilterSelect label="Action" value={action} onChange={setAction} options={data?.actions ?? []} />
            <FilterSelect label="Actor type" value={actorType} onChange={setActorType} options={['USER', 'SERVICE', 'VERIFIER']} />
          </div>
          {!data ? <div className="p-4"><Loading rows={8} /></div> : data.events.length === 0 ? <Empty title="No entries match" /> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th className="num">#</th><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Purpose</th><th>Hash</th></tr></thead>
                <tbody>
                  {data.events.map((ev) => {
                    const isBroken = broken && check?.broken_at_seq === ev.seq;
                    return (
                      <Fragment key={ev.seq}>
                        <tr className={`clickable ${isBroken ? 'bg-bad-wash' : ''}`} onClick={() => setOpen(open === ev.seq ? null : ev.seq)} aria-expanded={open === ev.seq}>
                          <td className={`num mono ${isBroken ? 'text-bad font-bold' : ''}`}>{ev.seq}</td>
                          <td className="whitespace-nowrap">{fmtDateTime(ev.occurred_at)}</td>
                          <td className="min-w-[160px] break-all"><span className="text-xs text-muted block">{humanize(ev.actor_type)}</span>{ev.actor_id}</td>
                          <td className="whitespace-nowrap font-medium">{humanize(ev.action)}</td>
                          <td className="whitespace-nowrap">{humanize(ev.entity)} <span className="mono text-xs text-muted">{ev.entity_id?.slice(0, 14)}</span></td>
                          <td className="text-muted min-w-[140px]">{ev.purpose}</td>
                          <td className="mono text-xs whitespace-nowrap">{shortHash(ev.hash, 12)}</td>
                        </tr>
                        {open === ev.seq && (
                          <tr>
                            <td colSpan={7} className="bg-wash">
                              <div className="grid gap-4 md:grid-cols-2 text-xs">
                                <div>
                                  <div className="font-semibold mb-1 text-sm">Recorded detail</div>
                                  <pre className="mono bg-white border border-line-soft rounded p-3 whitespace-pre-wrap break-all">{JSON.stringify(ev.detail, null, 2)}</pre>
                                </div>
                                <div className="space-y-2">
                                  <div><div className="font-semibold text-sm">Previous hash</div><div className="mono break-all">{ev.prev_hash}</div></div>
                                  <div><div className="font-semibold text-sm">This entry’s hash</div><div className="mono break-all">{ev.hash}</div></div>
                                  <p className="text-muted">hash = SHA-256(previous hash | canonical JSON of this entry)</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
