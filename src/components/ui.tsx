import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Clock, Info, LoaderCircle, RefreshCw, TriangleAlert, X } from 'lucide-react';
import { fmtTime, humanize } from '../lib/format';
import { Link } from '../lib/router';

// ── Status vocabulary (frontend spec, Appendix B) ──────────────────────────
type Tone = 'ok' | 'warn' | 'bad' | 'hold' | 'neutral';

const TONE: Record<string, Tone> = {
  VERIFIED: 'ok', ACCEPT: 'ok', ACCEPTED: 'ok', ACTIVE: 'ok', VALID: 'ok', GRANTED: 'ok', COMMITTED: 'ok',
  RESOLVED: 'ok', OK: 'ok', LOW: 'ok', COMPLETED: 'ok',
  ACCEPT_WITH_WARNING: 'warn', PENDING_APAAR: 'warn', NO_APAAR: 'warn', CHECK_PENDING: 'warn', AWAITING_CONSENT: 'warn',
  PENDING_APPROVAL: 'warn', READY_TO_COMMIT: 'warn', MEDIUM: 'warn', UNDER_REVIEW: 'warn', WARNING: 'warn', REVIEW: 'warn',
  REJECT: 'bad', FLAGGED: 'bad', REVOKED: 'bad', DENIED: 'bad', INVALID: 'bad', MISMATCH: 'bad', REFUSED: 'bad',
  HIGH: 'bad', CRITICAL: 'bad', VIOLATION: 'bad', ERROR: 'bad', FAILED: 'bad', OPEN: 'bad', TAMPER_DETECTED: 'bad',
  HOLD: 'hold', ON_HOLD: 'hold', PROVISIONAL: 'hold', VALIDATING: 'hold',
  WITHDRAWN: 'neutral', TRANSFERRED: 'neutral', DISCARDED: 'neutral', FALSE_POSITIVE: 'neutral', EXPIRED: 'neutral',
};

const LABEL: Record<string, string> = {
  ACCEPT: 'Accept', ACCEPT_WITH_WARNING: 'Accept with warning', HOLD: 'Hold', REJECT: 'Reject',
  PROVISIONAL: 'On hold', ON_HOLD: 'On hold', READY_TO_COMMIT: 'Ready to commit',
  AWAITING_CONSENT: 'Awaiting consent', PENDING_APPROVAL: 'Pending approval', CHECK_PENDING: 'Check pending',
  TAMPER_DETECTED: 'Mismatch', OK: 'Intact', LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High',
};

export function statusLabel(value: string) {
  return LABEL[value] ?? humanize(value);
}

export function StatusTag({ value, label }: { value: string | null | undefined; label?: string }) {
  if (!value) return <span className="text-faint">—</span>;
  const tone = TONE[value.toUpperCase()] ?? 'neutral';
  const Icon = tone === 'ok' ? CircleCheck : tone === 'bad' ? CircleAlert : tone === 'warn' ? TriangleAlert : tone === 'hold' ? Clock : null;
  return (
    <span className={`tag tag-${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" strokeWidth={2.4} />}
      {label ?? statusLabel(value)}
    </span>
  );
}

// ── Page structure ─────────────────────────────────────────────────────────
export function PageHeader({ title, description, actions, back }: {
  title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { to: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link to={back.to} className="text-sm no-underline hover:underline inline-block mb-2">← {back.label}</Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {description && <p className="text-muted mt-1 max-w-3xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, actions, children, className = '', bodyClassName = 'panel-body', id }: {
  title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string;
}) {
  return (
    <section className={`panel ${className}`} id={id}>
      {(title || actions) && (
        <div className="panel-head">
          {typeof title === 'string' ? <h2>{title}</h2> : title}
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, note, tone }: { label: string; value: ReactNode; note?: ReactNode; tone?: 'bad' | 'warn' | 'ok' }) {
  const color = tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-ink';
  return (
    <div className="panel px-4 py-3">
      <div className="text-[13px] text-muted">{label}</div>
      <div className={`text-2xl font-bold tabular-nums mt-0.5 ${color}`}>{value}</div>
      {note && <div className="text-xs text-muted mt-1">{note}</div>}
    </div>
  );
}

export function AsOf({ at, onRefresh, loading }: { at: string | null | undefined; onRefresh?: () => void; loading?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted">
      <span>As of {fmtTime(at)}</span>
      {onRefresh && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading} aria-label="Refresh">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden="true" /> Refresh
        </button>
      )}
    </span>
  );
}

// ── Feedback ───────────────────────────────────────────────────────────────
export function Alert({ tone = 'info', title, children, onClose }: {
  tone?: 'info' | 'ok' | 'warn' | 'bad'; title?: ReactNode; children?: ReactNode; onClose?: () => void;
}) {
  const styles = {
    info: 'border-brand bg-brand-wash',
    ok: 'border-ok bg-ok-wash',
    warn: 'border-[#d4a72c] bg-warn-wash',
    bad: 'border-bad bg-bad-wash',
  }[tone];
  const Icon = { info: Info, ok: CircleCheck, warn: TriangleAlert, bad: CircleAlert }[tone];
  const iconColor = { info: 'text-brand', ok: 'text-ok', warn: 'text-warn', bad: 'text-bad' }[tone];
  return (
    <div className={`border-l-4 ${styles} rounded-r px-4 py-3 flex gap-3 text-sm`} role={tone === 'bad' ? 'alert' : 'status'}>
      <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="text-muted hover:text-ink shrink-0" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert tone="bad" title="This page could not be loaded">
      <p >{message}</p>
      {onRetry && <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={onRetry}>Try again</button>}
    </Alert>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="text-center py-10 px-4">
      <p className="font-semibold">{title}</p>
      {children && <div className="text-muted text-sm mt-1 max-w-md mx-auto">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${90 - (i % 3) * 18}%` }} />
      ))}
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <LoaderCircle size={size} className="animate-spin" aria-hidden="true" />;
}

// ── Forms ──────────────────────────────────────────────────────────────────
export function Field({ label, hint, error, children, htmlFor }: {
  label: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <p className="hint !text-bad">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

// ── Dialog ─────────────────────────────────────────────────────────────────
export function Modal({ open, title, onClose, children, footer, width = 'max-w-lg' }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  // Callers usually pass an inline onClose; keep it in a ref so the effect below runs only on open/close.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const body = ref.current?.querySelector('.panel-body');
    (body?.querySelector<HTMLElement>('input, select, textarea') ?? body?.querySelector<HTMLElement>('button'))?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-[#0f172a]/45 p-4 overflow-y-auto"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`panel w-full ${width} shadow-xl my-8`}>
        <div className="panel-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="panel-body">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-line-soft flex flex-wrap justify-end gap-2 bg-wash rounded-b-md">{footer}</div>}
      </div>
    </div>
  );
}

// ── Data helpers ───────────────────────────────────────────────────────────
export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line-soft text-sm">
      <span className="text-muted">{from}–{to} of {total.toLocaleString('en-IN')}</span>
      <div className="flex gap-2">
        <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

/** A simple horizontal meter; `max` marks the limit and overflow turns red. */
export function Meter({ value, max, label }: { value: number; max: number; label?: string }) {
  const ratio = max > 0 ? value / max : 0;
  const width = Math.min(ratio, 1) * 100;
  const color = ratio > 1 ? 'bg-bad' : ratio >= 0.95 ? 'bg-[#d4a72c]' : 'bg-brand';
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-2 flex-1 rounded-sm bg-line-soft overflow-hidden" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <div className={`h-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className={`text-xs tabular-nums w-[70px] text-right ${ratio > 1 ? 'text-bad font-semibold' : 'text-muted'}`}>{value} / {max}</span>
    </div>
  );
}

export function KeyValue({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(120px,max-content)_1fr] gap-x-5 gap-y-2 text-sm">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
