import { api } from '../../api/client';
import { Alert, AsOf, ErrorState, Loading, Meter, PageHeader, Panel, StatusTag } from '../../components/ui';
import { Link } from '../../lib/router';
import { useApi } from '../../lib/useApi';
import { useInstitutionId } from './shared';
import { ComplianceRadar } from '../../components/ComplianceRadar';

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

  if (!instId) return <ErrorState message="Your account is not linked to an institution." />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <Loading rows={8} />;

  const over = data.program_breakdown.filter((p) => p.enrolled > p.approved_intake || p.supernumerary > p.supernumerary_cap || p.lateral > p.lateral_cap);

  return (
    <>
      <PageHeader
        title="Intake and seat compliance"
        description="Approved intake comes from AICTE’s approval records and cannot be edited here. Supernumerary seats are counted separately."
        actions={<AsOf at={data.as_of} onRefresh={reload} loading={loading} />}
      />

      <div className="mb-5">
        {over.length === 0
          ? <Alert tone="ok" title="All programmes are within their limits">for academic year 2026–27.</Alert>
          : <Alert tone="bad" title={`${over.length} programme(s) exceed a limit`}>
              {over.map((p) => p.course).join(', ')}. Rows that would exceed a limit are rejected or held at upload; see the <Link to="/institution/batches">upload reports</Link> for rules V-INT-01 and V-INT-02.
            </Alert>}
      </div>

      <ComplianceRadar institutionName={data.institution.name} institutionId={data.institution.id} />

      <Panel bodyClassName="" title="By programme, 2026–27" actions={<span className="text-xs text-muted">Caps are illustrative · rules version 2026.1</span>}>
        <div className="table-wrap">
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
    </>
  );
}
