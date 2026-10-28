import type { BatchCounts } from '../../api/types';
import { useSession } from '../../lib/session';

export function useInstitutionId() {
  return useSession().user?.institution_id ?? null;
}

/** Maps an attention-item target from the API to a page in this portal. */
export function attentionLink(target: string) {
  const [kind, value] = target.split(':');
  if (kind === 'batch') return `/institution/batches/${value}`;
  if (kind === 'compliance') return '/institution/compliance';
  if (kind === 'registry') {
    if (value === 'FLAGGED') return '/institution/registry?verification=FLAGGED';
    if (value === 'PROVISIONAL') return '/institution/registry?status=PROVISIONAL';
    if (value === 'PENDING_APAAR') return '/institution/registry?identity=PENDING_APAAR';
  }
  return '/institution';
}

export function CountsRow({ counts }: { counts: BatchCounts }) {
  const cells: [string, number, string][] = [
    ['Accepted', counts.accepted, 'text-ok'],
    ['With warning', counts.warnings, 'text-warn'],
    ['On hold', counts.holds, 'text-hold'],
    ['Rejected', counts.rejected, 'text-bad'],
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 border border-line rounded-md bg-white divide-x divide-line-soft">
      <div className="px-4 py-3">
        <div className="text-xs text-muted">Rows in file</div>
        <div className="text-xl font-bold tabular-nums">{counts.total}</div>
      </div>
      {cells.map(([label, n, color]) => (
        <div key={label} className="px-4 py-3">
          <div className="text-xs text-muted">{label}</div>
          <div className={`text-xl font-bold tabular-nums ${n ? color : 'text-faint'}`}>{n}</div>
        </div>
      ))}
    </div>
  );
}

export const SEAT_CATEGORIES = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS', 'TFW', 'NRI', 'OCI', 'PIO', 'FN', 'Gulf', 'Lateral_Entry', 'PwD', 'PMSSS'];
export const SUPERNUMERARY_CATEGORIES = new Set(['TFW', 'OCI', 'PIO', 'FN', 'Gulf', 'Lateral_Entry', 'PwD', 'PMSSS']);
