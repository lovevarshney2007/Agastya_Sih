const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const numFmt = new Intl.NumberFormat('en-IN');

export const fmtDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : '—');
export const fmtDateTime = (iso: string | null | undefined) => (iso ? dateTimeFmt.format(new Date(iso)) : '—');
export const fmtTime = (iso: string | null | undefined) => (iso ? timeFmt.format(new Date(iso)) : '—');
export const fmtNum = (n: number | null | undefined) => (n === null || n === undefined ? '—' : numFmt.format(n));

export function fmtRelative(iso: string | null | undefined) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return 'just now';
  if (Math.abs(mins) < 60) return mins > 0 ? `${mins} min ago` : `in ${-mins} min`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return hours > 0 ? `${hours} h ago` : `in ${-hours} h`;
  const days = Math.round(hours / 24);
  return days > 0 ? `${days} day${days === 1 ? '' : 's'} ago` : `in ${-days} day${days === -1 ? '' : 's'}`;
}

export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

/** Turns SNAKE_CASE codes into readable text: "PENDING_APAAR" → "Pending APAAR". */
export function humanize(code: string | null | undefined) {
  if (!code) return '—';
  const keepUpper = new Set(['APAAR', 'NOC', 'FN', 'OCI', 'PIO', 'TFW', 'NRI', 'EWS', 'SC', 'ST', 'OBC', 'NCL', 'ODL', 'CSV', 'PDF', 'PG', 'UG']);
  return code
    .split(/[_\s]+/)
    .map((w, i) => (keepUpper.has(w.toUpperCase()) ? w.toUpperCase() : i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(' ');
}

export const shortHash = (h: string | null | undefined, n = 10) => (h ? `${h.slice(0, n)}…` : '—');

/** Public verification link on this website, so links and QR codes always open the live site. */
export const verifyLink = (token: string) => `${window.location.origin}/verify/${encodeURIComponent(token)}`;
