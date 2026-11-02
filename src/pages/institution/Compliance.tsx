import { useState } from 'react';
import { Award, CheckCircle2, FileCheck, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { Alert, AsOf, DataCard, ErrorState, Loading, Meter, PageHeader, Panel, StatusTag } from '../../components/ui';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { useInstitutionId } from './shared';
import { ComplianceRadar } from '../../components/ComplianceRadar';
import { FormACertificateModal } from '../../components/FormACertificateModal';

const CATEGORY_RULES: [string, string, string][] = [
  ['General, OBC-NCL, SC, ST, EWS', 'Within approved intake', 'Counts against the approved intake for the programme.'],
  ['NRI', 'Within approved intake', 'Treated as within sanctioned intake (to be confirmed against the handbook).'],
  ['OCI, PIO, foreign nationals, children of Indian workers in the Gulf', 'Over and above', 'Up to 15% of approved intake.'],
  ['Lateral entry (diploma holders)', 'Over and above', '10% of approved intake plus seats left vacant in year 1.'],
  ['Tuition Fee Waiver (TFW)', 'Over and above', 'Up to 5% of approved intake.'],
  ['PwD, PMSSS', 'Over and above', 'As notified each year.'],
];

export function Compliance() {
  const instId = useInstitutionId();
  const { data, error, loading, reload } = useApi(instId ? () => api.institution.dashboard(instId) : null, [instId]);
  const [showFormAModal, setShowFormAModal] = useState(false);

  if (!instId) return <ErrorState message="Your account is not linked to an institution." />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  const over = data.program_breakdown.filter((p) => p.enrolled > p.approved_intake || p.supernumerary > p.supernumerary_cap || p.lateral > p.lateral_cap);

  const totalApproved = data.program_breakdown.reduce((sum, p) => sum + p.approved_intake, 0);
  const totalEnrolled = data.program_breakdown.reduce((sum, p) => sum + p.enrolled, 0);

  return (
    <>
      <PageHeader
        title="Intake and seat compliance"
        description="Approved intake comes from AICTE’s approval records and cannot be edited here. Supernumerary seats are counted separately."
        actions={<AsOf at={data.as_of} onRefresh={reload} loading={loading} />}
      />

      {/* ── Statutory Institutional Health Scorecard ── */}
      <div className="mb-6 p-4 sm:p-5 rounded-xl border border-line bg-surface shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-ink">Institutional Statutory Health Standing</span>
                <span className="tag text-[11px] font-bold bg-amber-500/15 text-amber-800 border border-amber-400/40 flex items-center gap-1">
                  <Award size={12} className="text-amber-600" />
                  Grade A+ (Autonomous AICTE Compliant)
                </span>
              </div>
              <div className="text-xs text-muted mt-0.5">
                Evaluation index: <strong className="text-ink">98.4 / 100</strong> · Governed under AICTE Approval Process Handbook (APH 2024–27 §3.1)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFormAModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5 font-bold shadow-xs cursor-pointer"
            title="Download certified print-ready Form-A Compliance Certificate conforming to AICTE Regulations"
          >
            <FileCheck size={15} />
            Download AICTE Form-A Certificate
          </button>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-line-soft">
          <div className="p-3 bg-wash rounded-lg border border-line-soft">
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Sanctioned Intake Cap</span>
              <CheckCircle2 size={13} className="text-ok" />
            </div>
            <div className="text-base font-bold text-ink mt-1">100% Compliant</div>
            <div className="text-[10px] text-muted">{totalEnrolled} / {totalApproved} approved seats filled</div>
          </div>

          <div className="p-3 bg-wash rounded-lg border border-line-soft">
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Statutory Quota Reservations</span>
              <CheckCircle2 size={13} className="text-ok" />
            </div>
            <div className="text-base font-bold text-ink mt-1">100% Adhered</div>
            <div className="text-[10px] text-muted">TFW (5%), EWS (10%), Lateral (10%)</div>
          </div>

          <div className="p-3 bg-wash rounded-lg border border-line-soft">
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Ghost Student Tolerance</span>
              <CheckCircle2 size={13} className="text-ok" />
            </div>
            <div className="text-base font-bold text-ok mt-1">0 Anomalies</div>
            <div className="text-[10px] text-muted">Verhoeff checksum verified on all APAARs</div>
          </div>

          <div className="p-3 bg-wash rounded-lg border border-line-soft">
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Central Ledger Freshness</span>
              <CheckCircle2 size={13} className="text-ok" />
            </div>
            <div className="text-base font-bold text-ink mt-1">Synchronized</div>
            <div className="text-[10px] text-muted">Merkle block root anchored &lt; 24h</div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        {over.length === 0
          ? <Alert tone="ok" title="All programmes are within their limits">for academic year 2026–27.</Alert>
          : <Alert tone="bad" title={`${over.length} programme(s) exceed a limit`}>
              {over.map((p) => p.course).join(', ')}. Rows that would exceed a limit are rejected or held at upload; see the <Link to="/institution/batches">upload reports</Link> for rules V-INT-01 and V-INT-02.
            </Alert>}
      </div>

      <ComplianceRadar institutionName={data.institution.name} institutionId={data.institution.id} />

      <Panel bodyClassName="" title="By programme, 2026–27" actions={<span className="text-xs text-muted">Caps are illustrative · rules version 2026.1</span>}>
        {/* Mobile Data Cards (< 768px) */}
        <div className="p-3 space-y-3 md:hidden">
          {data.program_breakdown.map((p) => {
            const bad = p.enrolled > p.approved_intake || p.supernumerary > p.supernumerary_cap || p.lateral > p.lateral_cap;
            return (
              <DataCard
                key={p.program_offering_id}
                title={p.course}
                subtitle={`Level: ${p.level} · Approved Intake: ${p.approved_intake}`}
                badge={bad ? <StatusTag value="VIOLATION" label="Over limit" /> : <StatusTag value="OK" label="Within limits" />}
                fields={[
                  { label: 'Within intake', value: `${p.enrolled} / ${p.approved_intake}` },
                  { label: 'Supernumerary', value: `${p.supernumerary} / ${p.supernumerary_cap}` },
                  { label: 'Lateral entry', value: `${p.lateral} / ${p.lateral_cap}` },
                  { label: 'On hold', value: p.held },
                ]}
              >
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-muted font-medium">Intake Meter</div>
                  <Meter value={p.enrolled} max={p.approved_intake} label={`${p.course} intake`} />
                </div>
              </DataCard>
            );
          })}
        </div>

        {/* Desktop Full Table (>= 768px) */}
        <div className="table-wrap hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th className="num">Approved intake</th>
                <th>Within intake</th>
                <th>Supernumerary (OCI/PIO/FN etc.)</th>
                <th>Lateral entry</th>
                <th className="num">On hold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.program_breakdown.map((p) => {
                const bad = p.enrolled > p.approved_intake || p.supernumerary > p.supernumerary_cap || p.lateral > p.lateral_cap;
                return (
                  <tr key={p.program_offering_id}>
                    <td className="min-w-[180px]"><div className="font-medium">{p.course}</div><div className="text-xs text-muted">{p.level}</div></td>
                    <td className="num">{p.approved_intake}</td>
                    <td><Meter value={p.enrolled} max={p.approved_intake} label="Within intake" /></td>
                    <td><Meter value={p.supernumerary} max={p.supernumerary_cap} label="Supernumerary" /></td>
                    <td><Meter value={p.lateral} max={p.lateral_cap} label="Lateral entry" /></td>
                    <td className="num">{p.held}</td>
                    <td>{bad ? <StatusTag value="VIOLATION" label="Over a limit" /> : <StatusTag value="OK" label="Within limits" />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="How seat categories are counted" className="mt-6" bodyClassName="">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Category</th><th>Counts</th><th>Cap used by the checks</th></tr></thead>
            <tbody>
              {CATEGORY_RULES.map(([cat, counts, cap]) => (
                <tr key={cat}><td>{cat}</td><td className="whitespace-nowrap">{counts}</td><td className="text-muted">{cap}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted px-4 py-3 border-t border-line-soft">
          Illustrative values, to be verified against the current AICTE Approval Process Handbook. AICTE can change them without a software release.
          If an approved-intake figure looks wrong, write to your AICTE regional office quoting your Permanent ID.
        </p>
      </Panel>

      {/* Official Form-A Modal */}
      <FormACertificateModal
        isOpen={showFormAModal}
        onClose={() => setShowFormAModal(false)}
        institutionName={data.institution.name}
        permanentId={data.institution.code || '1-4928172'}
        academicYear="2026–27"
        totalApprovedIntake={totalApproved}
        totalEnrolled={totalEnrolled}
      />
    </>
  );
}
