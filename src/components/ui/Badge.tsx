import { type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Clock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { humanize } from '../../lib/format';

export type Tone = 'ok' | 'warn' | 'bad' | 'hold' | 'neutral';

/**
 * Institutional Status Mapping conforming to AICTE Statutory Vocabulary & APAAR Registry.
 * Always combines color, border, and text for WCAG 2.1 AA accessibility.
 */
const TONE_MAP: Record<string, Tone> = {
  // Verified / Success (Emerald)
  VERIFIED: 'ok', ACCEPT: 'ok', ACCEPTED: 'ok', ACTIVE: 'ok', VALID: 'ok',
  GRANTED: 'ok', COMMITTED: 'ok', RESOLVED: 'ok', OK: 'ok', LOW: 'ok',
  COMPLETED: 'ok', INTACT: 'ok', ATTESTED: 'ok',

  // Warning / Regulatory Review (Saffron)
  ACCEPT_WITH_WARNING: 'warn', PENDING_APAAR: 'warn', NO_APAAR: 'warn',
  CHECK_PENDING: 'warn', AWAITING_CONSENT: 'warn', PENDING_APPROVAL: 'warn',
  READY_TO_COMMIT: 'warn', MEDIUM: 'warn', UNDER_REVIEW: 'warn',
  WARNING: 'warn', REVIEW: 'warn', HELD_FOR_REVIEW: 'warn',
  PENDING_CHECKER_SIGNATURE: 'warn',

  // Breach / Violation (Crimson)
  REJECT: 'bad', REJECTED: 'bad', FLAGGED: 'bad', FLAGGED_DUPLICATE: 'bad',
  REVOKED: 'bad', DENIED: 'bad', INVALID: 'bad', MISMATCH: 'bad',
  REFUSED: 'bad', HIGH: 'bad', CRITICAL: 'bad', VIOLATION: 'bad',
  ERROR: 'bad', FAILED: 'bad', OPEN: 'bad', TAMPER_DETECTED: 'bad',
  BREACH: 'bad', OVER_INTAKE: 'bad',

  // Held / Provisional (Slate-Blue)
  HOLD: 'hold', ON_HOLD: 'hold', PROVISIONAL: 'hold', VALIDATING: 'hold',

  // Neutral / Administrative
  WITHDRAWN: 'neutral', TRANSFERRED: 'neutral', DISCARDED: 'neutral',
  FALSE_POSITIVE: 'neutral', EXPIRED: 'neutral',
};

const LABEL_MAP: Record<string, string> = {
  ACCEPT: 'Accepted',
  ACCEPTED: 'Accepted on Ledger',
  ACCEPT_WITH_WARNING: 'Conditional Acceptance',
  HOLD: 'Held for Review',
  HELD_FOR_REVIEW: 'Held for Review',
  FLAGGED_DUPLICATE: 'Concurrent Enrolment Flag',
  REJECT: 'Rejected',
  REJECTED: 'Breach: Rejected',
  PROVISIONAL: 'Provisional Enrolment',
  ON_HOLD: 'Held for Review',
  READY_TO_COMMIT: 'Ready for Cryptographic Seal',
  AWAITING_CONSENT: 'DigiLocker Consent Awaited',
  PENDING_APPROVAL: 'Checker Approval Pending',
  CHECK_PENDING: 'Statutory Verification Pending',
  TAMPER_DETECTED: 'Cryptographic Hash Mismatch',
  OK: 'Ledger Chain Intact',
  LOW: 'Low Risk',
  MEDIUM: 'Moderate Risk',
  HIGH: 'Regulatory Audit Triggered',
  EXECUTED_DUAL_SIGNED: 'Dual-Key Sanction Executed',
  PENDING_CHECKER_SIGNATURE: 'Pending Checker Counter-Signature',
};

const STYLE_MAP: Record<Tone, { badge: string; iconClass: string; Icon: typeof CircleCheck }> = {
  ok: {
    badge: 'bg-[rgba(0,214,143,0.15)] text-[#00D68F] border-[rgba(0,214,143,0.45)]',
    iconClass: 'text-[#00D68F]',
    Icon: CircleCheck,
  },
  warn: {
    badge: 'bg-[rgba(255,176,32,0.15)] text-[#FFB020] border-[rgba(255,176,32,0.45)]',
    iconClass: 'text-[#FFB020]',
    Icon: TriangleAlert,
  },
  bad: {
    badge: 'bg-[rgba(255,82,99,0.15)] text-[#FF5263] border-[rgba(255,82,99,0.45)]',
    iconClass: 'text-[#FF5263]',
    Icon: CircleAlert,
  },
  hold: {
    badge: 'bg-[rgba(0,217,232,0.15)] text-[#00D9E8] border-[rgba(0,217,232,0.45)]',
    iconClass: 'text-[#00D9E8]',
    Icon: Clock,
  },
  neutral: {
    badge: 'bg-[#1C293B] text-[#C0CAD8] border-[#35445A]',
    iconClass: 'text-[#929FB0]',
    Icon: ShieldCheck,
  },
};

export function statusLabel(value: string): string {
  return LABEL_MAP[value] ?? humanize(value);
}

export interface BadgeProps {
  variant?: Tone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, icon, className = '' }: BadgeProps) {
  const conf = STYLE_MAP[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border leading-tight ${conf.badge} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export interface StatusTagProps {
  value: string | null | undefined;
  label?: string;
  showIcon?: boolean;
}

/**
 * Standard StatusTag component used across tables, audits, and cards.
 * Maintains full backwards compatibility with existing specs.
 */
export function StatusTag({ value, label, showIcon = true }: StatusTagProps) {
  if (!value) return <span className="text-slate-400 font-mono text-xs">—</span>;

  const tone = TONE_MAP[value.toUpperCase()] ?? 'neutral';
  const conf = STYLE_MAP[tone];
  const IconComponent = conf.Icon;
  const displayText = label ?? statusLabel(value);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border leading-tight select-none ${conf.badge}`}
    >
      {showIcon && <IconComponent size={12} className={`${conf.iconClass} shrink-0`} aria-hidden="true" strokeWidth={2.4} />}
      <span>{displayText}</span>
    </span>
  );
}
