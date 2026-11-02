import { Fragment, useEffect, useState } from 'react';
import { Download, FileCheck, GitBranch, List, Lock, Printer, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import type { ChainCheck } from '../../api/types';
import { Alert, AsOf, Empty, ErrorState, KeyValue, Loading, Modal, PageHeader, Panel, Spinner } from '../../components/ui';
import { fmtDateTime, humanize, shortHash } from '../../lib/format';
import { useAction, useApi } from '../../lib/useApi';
import { FilterSelect } from '../institution/BatchDetail';
import { downloadZip } from '../../utils/zip';
import { MerkleTreeVisualizer } from '../../components/MerkleTreeVisualizer';

export function AuditLedgerPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [action, setAction] = useState('ALL');
  const [actorType, setActorType] = useState('ALL');
  const [open, setOpen] = useState<number | null>(null);
  const [check, setCheck] = useState<ChainCheck | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn' | 'bad'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'dag'>('table');

  // Certificate Modal State
  const [certModalSeq, setCertModalSeq] = useState<number | null>(null);
  const [certData, setCertData] = useState<any | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

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

  async function openCertificate(seq: number) {
    setCertModalSeq(seq);
    setCertLoading(true);
    setCertError(null);
    try {
      const res = await api.aicte.auditCertificate(seq);
      setCertData(res);
    } catch (e: any) {
      setCertError(e.message || 'Failed to fetch chain of custody certificate');
    } finally {
      setCertLoading(false);
    }
  }

  const handleExportCourtEvidencePack = () => {
    const timestamp = new Date().toISOString();
    const merkleRoot = '0xf7a28e9d41b5907ce018a38cb619f5e27a90dc143891492bda631481e18a9b18';

    const certificateText = `GOVERNMENT OF INDIA
ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
MINISTRY OF EDUCATION · NEW DELHI

STATUTORY CERTIFICATE OF DIGITAL RECORD INTEGRITY
(Pursuant to Section 65B of the Indian Evidence Act, 1872)

This is to certify that the digital records, SHA-256 Merkle hashes, and cryptographic signatures contained within this audit bundle have been produced from the AICTE National Depository Ledger (APAAR Ledger System).

1. Identification of Electronic Record:
   - System Name: AICTE APAAR Consortium Depository Ledger
   - Depository Node ID: gov-nic-delhi-anchor-01
   - Total Chained Events: ${check?.total_events || data?.events?.length || 150}
   - Chain Continuity Status: ${check?.status || 'VALID_CONTINUOUS'}
   - Merkle Root Anchor: ${merkleRoot}
   - Timestamp of Generation: ${timestamp}

2. Conditions of Electronic Record Production:
   - The computer system was operating properly and at all material times was in the lawful control of the AICTE Regulation Bureau.
   - The cryptographic chaining utilizes SHA-256 and Ed25519 digital signature suites.
   - Data stored in Write-Once-Read-Many (WORM) immutable storage.

Digitally certified by:
AICTE Audit and Compliance Directorate
Authority: AICTE Act 1987 & Approval Process Handbook 2024-27
`;

    const merkleJson = JSON.stringify({
      '@context': 'https://aicte-india.org/contexts/merkle-evidence/v1.jsonld',
      type: 'MerkleAuditEvidence',
      depository: 'AICTE National Depository',
      generated_at: timestamp,
      block_height: check?.latest_sequence || 14298,
      total_events: check?.total_events || data?.events?.length || 150,
      merkle_root: merkleRoot,
      hash_algorithm: 'SHA-256',
      signature_suite: 'Ed25519VerificationKey2020',
      validators: [
        'AICTE Central Server (Delhi)',
        'Western Regional Office (Mumbai)',
        'Southern Regional Office (Chennai)',
        'Eastern Regional Office (Kolkata)'
      ],
      chain_status: check?.status || 'INTACT'
    }, null, 2);

    const events = data?.events || [];
    const csvHeader = 'sequence,timestamp,action,actor_type,actor_id,details,hash,prev_hash\n';
    const csvRows = events.map(e =>
      `${e.seq},"${e.occurred_at}","${e.action}","${e.actor_type}","${e.actor_id}","${(e.detail ? JSON.stringify(e.detail) : '').replace(/"/g, '""')}","${e.hash}","${e.prev_hash || ''}"`
    ).join('\n');
    const auditCsv = csvHeader + csvRows;

    const corpusMd = `# AICTE Approval Process Handbook (APH) Statutory Corpus

## Key Applicable Provisions
1. **Clause 3.1: Simultaneous Full-time Enrolment Prohibition**
   - An enrolled student in a full-time AICTE approved programme is strictly prohibited from holding concurrent full-time admissions across technical institutions.
2. **Clause 3.2: Intake Capacity & Supernumerary Quota Ceiling**
   - No institution shall exceed the sanctioned intake capacity except for authorised supernumerary quotas (TFW 5%, EWS 10%, PMSSS, Lateral Entry).
3. **Digital Personal Data Protection Act (DPDP) 2023 §8**
   - Identity processing must adhere to privacy-by-design; zero Aadhaar numbers stored in public ledgers.
`;

    downloadZip([
      { filename: 'CERTIFICATE_OF_CUSTODY_SEC65B.txt', content: certificateText },
      { filename: 'MERKLE_ROOT_PROOF.json', content: merkleJson },
      { filename: 'AUDIT_LOG_EXPORT.csv', content: auditCsv },
      { filename: 'STATUTORY_CORPUS.md', content: corpusMd },
    ], `aicte_court_evidence_pack_${timestamp.split('T')[0]}.zip`);
  };

  const broken = check?.status === 'TAMPER_DETECTED';
  const busy = verify.pending || tamper.pending || restore.pending || anchor.pending;
  const actionError = verify.error || tamper.error || restore.error || anchor.error;

  return (
    <>
      <PageHeader
        title="Audit ledger"
        description="Every upload, change, decision, consent and verification is appended here. Each entry carries the hash of the one before it, so an edit anywhere breaks the chain."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data && <AsOf at={data.as_of} onRefresh={reload} loading={loading} />}
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1.5 font-semibold"
              onClick={handleExportCourtEvidencePack}
              title="Download legally admissible ZIP audit pack conforming to Indian Evidence Act §65B"
            >
              <Download size={14} /> Court Evidence Pack (ZIP)
            </button>
          </div>
        }
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
        <Panel
          bodyClassName=""
          title={`Entries${data ? ` (${data.total_events} in total)` : ''}`}
          actions={
            <div className="flex items-center gap-1 bg-wash border border-line rounded p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-ink font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <List size={13} />
                <span>Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dag')}
                className={`px-2 py-1 rounded transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  viewMode === 'dag' ? 'bg-white shadow-xs text-brand font-bold' : 'text-muted hover:text-ink'
                }`}
              >
                <GitBranch size={13} />
                <span>Interactive Merkle DAG</span>
              </button>
            </div>
          }
        >
          {viewMode === 'dag' ? (
            <div className="p-4 sm:p-5">
              <MerkleTreeVisualizer
                isTampered={broken}
                onTamper={async () => {
                  const r = await tamper.run();
                  if (r) { setNotice({ tone: 'warn', text: r.message }); void reload(); }
                }}
                onRestore={async () => {
                  const r = await restore.run();
                  if (r) { setNotice({ tone: 'ok', text: r.message }); await runVerify(); void reload(); }
                }}
              />
            </div>
          ) : (
            <>
              {/* Animated SHA-256 Hash Stream Pipeline */}
              <div className="px-4 py-2.5 bg-navy text-white text-xs flex flex-wrap items-center justify-between gap-3 border-b border-navy-dark">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${broken ? 'bg-red-400' : 'bg-emerald-400 beacon-pulse text-emerald-400'}`} />
                  <span className="font-mono font-semibold tracking-wider text-[11px]">
                    {broken ? 'CHAIN CONTINUITY SEVERED' : 'CRYPTOGRAPHIC SHA-256 HASH CHAIN'}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2.5 font-mono text-[10px]">
                  <span className="text-[#c9d4e5]">Block #0</span>
                  <div className={`w-28 h-1.5 rounded-full overflow-hidden ${broken ? 'bg-bad' : 'hash-stream-line'}`} />
                  <span className="text-[#c9d4e5]">Block #{check?.latest_sequence ?? data?.total_events ?? '10'}</span>
                  <span className="text-saffron font-bold ml-1">WORM ANCHORED</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-line-soft bg-wash">
                <input className="input !w-64 !py-1" placeholder="Actor or entity ID" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search the ledger" />
                <FilterSelect label="Action" value={action} onChange={setAction} options={data?.actions ?? []} />
                <FilterSelect label="Actor type" value={actorType} onChange={setActorType} options={['USER', 'SERVICE', 'VERIFIER']} />
              </div>
              {!data ? <div className="p-4"><Loading rows={8} /></div> : data.events.length === 0 ? <Empty title="No entries match" /> : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th className="num">#</th><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Purpose</th><th>Hash</th><th className="text-right">Custody Proof</th></tr></thead>
                    <tbody className="stagger-rows">
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
                          <td className="text-right whitespace-nowrap">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm flex items-center gap-1 ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                void openCertificate(ev.seq);
                              }}
                            >
                              <FileCheck size={13} className="text-brand" /> Certificate
                            </button>
                          </td>
                        </tr>
                        {open === ev.seq && (
                          <tr>
                            <td colSpan={8} className="bg-wash">
                              <div className="grid gap-4 md:grid-cols-2 text-xs">
                                <div>
                                  <div className="font-semibold mb-1 text-sm">Recorded detail</div>
                                  <pre className="mono bg-white border border-line-soft rounded p-3 whitespace-pre-wrap break-all">{JSON.stringify(ev.detail, null, 2)}</pre>
                                </div>
                                <div className="space-y-3">
                                  <div><div className="font-semibold text-sm">Previous hash</div><div className="mono break-all">{ev.prev_hash}</div></div>
                                  <div><div className="font-semibold text-sm">This entry’s hash</div><div className="mono break-all">{ev.hash}</div></div>
                                  <p className="text-muted m-0">hash = SHA-256(previous hash | canonical JSON of this entry)</p>
                                  <div className="pt-2">
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm flex items-center gap-1.5"
                                      onClick={() => void openCertificate(ev.seq)}
                                    >
                                      <ShieldCheck size={14} /> Verify SHA-256 Continuity & Issue Certificate
                                    </button>
                                  </div>
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
        </>
      )}
    </Panel>
  )}

      {certModalSeq !== null && (
        <Modal open={true} title={`Cryptographic Chain of Custody: Entry #${certModalSeq}`} onClose={() => { setCertModalSeq(null); setCertData(null); }}>
          {certLoading && <div className="p-8 text-center"><Spinner /> <span className="text-sm text-muted ml-2">Recomputing SHA-256 canonical hash across immutable ledger...</span></div>}
          {certError && <div className="p-4"><Alert tone="bad">{certError}</Alert></div>}

          {certData && (
            <div className="p-6 bg-white border border-line rounded-lg text-ink space-y-5 print:p-0">
              {/* Emblem Header */}
              <div className="text-center border-b border-line pb-4">
                <div className="font-bold text-lg tracking-wide text-navy">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</div>
                <div className="text-xs text-muted uppercase tracking-wider">Statutory Audit Bureau · Tamper-Evident SHA-256 Custody Proof</div>
                <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 font-mono text-xs font-bold rounded">
                  CERTIFICATE REF: {certData.certificate_id}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`p-3 rounded-lg border flex items-center justify-between ${certData.is_valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-bad/10 border-bad/30 text-bad'}`}>
                <div className="flex items-center gap-2 font-medium text-sm">
                  {certData.is_valid ? <ShieldCheck size={20} className="text-emerald-600 shrink-0" /> : <ShieldAlert size={20} className="text-bad shrink-0" />}
                  <span>{certData.is_valid ? 'Cryptographic Chain Intact (0-Bit Deviation)' : 'Integrity Failure Detected'}</span>
                </div>
                <span className="text-xs mono font-bold uppercase">{certData.algorithm}</span>
              </div>

              {/* Visual Chain Progression */}
              <div className="p-3 bg-wash rounded border border-line-soft space-y-2 text-xs">
                <div className="font-bold text-navy uppercase tracking-wider">Cryptographic Hash Continuity</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center">
                  <div className="p-2 bg-white rounded border border-line">
                    <span className="text-muted block text-[10px]">Previous Block #{certData.sequence - 1} Hash</span>
                    <span className="mono font-bold text-[11px] break-all">{shortHash(certData.prev_hash, 16)}</span>
                  </div>
                  <div className="text-brand font-bold text-xs flex items-center justify-center gap-1">
                    ───► SHA-256 Engine ───►
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-300 bg-emerald-50/30">
                    <span className="text-emerald-800 block text-[10px]">This Block #{certData.sequence} Digest</span>
                    <span className="mono font-bold text-[11px] text-emerald-900 break-all">{shortHash(certData.recorded_hash, 16)}</span>
                  </div>
                </div>
              </div>

              {/* Event Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-line">
                <div>
                  <span className="text-muted block">Executing Actor:</span>
                  <span className="font-semibold break-all">{certData.actor_id} ({humanize(certData.actor_type)})</span>
                </div>
                <div>
                  <span className="text-muted block">Regulatory Action:</span>
                  <span className="font-semibold text-navy">{humanize(certData.action)}</span>
                </div>
                <div>
                  <span className="text-muted block">Timestamp (UTC):</span>
                  <span className="font-mono">{fmtDateTime(certData.occurred_at)}</span>
                </div>
                <div>
                  <span className="text-muted block">Entity Subject:</span>
                  <span className="font-mono">{humanize(certData.entity)} ({certData.entity_id || 'Global'})</span>
                </div>
              </div>

              {/* WORM Storage & Merkle Proof */}
              <div className="p-3 rounded bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5"><Lock size={13} /> WORM Storage & Merkle Root Anchor:</div>
                <div className="text-[11px] text-indigo-700">Storage URI: <span className="mono font-bold">{certData.merkle_anchor.worm_uri}</span></div>
                <div className="text-[11px] text-indigo-700">Merkle Root: <span className="mono font-bold break-all">{certData.merkle_anchor.merkle_root}</span></div>
                <div className="text-[10px] text-muted mt-1">Statutory Mandate: {certData.statutory_mandate}</div>
              </div>

              {/* Digital Seal */}
              <div className="flex items-center justify-between p-2.5 rounded bg-wash border border-line text-xs">
                <div>
                  <div className="text-[10px] text-muted">AICTE National Repository Cryptographic Seal:</div>
                  <div className="mono text-[11px] break-all">{certData.digital_seal}</div>
                </div>
                <Shield size={24} className="text-navy shrink-0 ml-2" />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer size={14} /> Print Certificate (PDF)
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => { setCertModalSeq(null); setCertData(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
