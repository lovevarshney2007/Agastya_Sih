import { type ReactNode } from 'react';
import { FileQuestion, LoaderCircle, RefreshCw } from 'lucide-react';
import { fmtTime } from '../../lib/format';
import { Alert } from './Alert';

export function Spinner({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <LoaderCircle
      size={size}
      className={`animate-spin text-brand shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

export function Skeleton({
  className = 'h-4 w-full',
  rows = 1,
}: {
  className?: string;
  rows?: number;
}) {
  if (rows > 1) {
    return (
      <div className="space-y-2.5 py-1" role="status" aria-label="Loading content">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`skeleton ${className}`}
            style={{ width: `${95 - (i % 3) * 12}%` }}
          />
        ))}
      </div>
    );
  }
  return <div className={`skeleton ${className}`} role="status" aria-label="Loading content" />;
}

export function Loading({ rows = 4, label = 'Fetching regulatory records...' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-2.5 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <Spinner size={14} />
        <span>{label}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: `${90 - (i % 3) * 18}%` }}
        />
      ))}
    </div>
  );
}

export function Empty({
  title,
  children,
  action,
  icon,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="text-center py-10 px-4 max-w-md mx-auto">
      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
        {icon ?? <FileQuestion size={20} />}
      </div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {children && <div className="text-xs text-slate-500 mt-1 leading-relaxed">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert
      tone="bad"
      title="Regulatory Data Access Interrupted"
      action={
        onRetry && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 rounded text-xs font-semibold text-rose-900 hover:bg-rose-50 transition-colors focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
            onClick={onRetry}
          >
            <RefreshCw size={12} aria-hidden="true" />
            <span>Retry Operation</span>
          </button>
        )
      }
    >
      <p className="text-xs">{message}</p>
    </Alert>
  );
}

export function AsOf({
  at,
  onRefresh,
  loading,
}: {
  at: string | null | undefined;
  onRefresh?: () => void;
  loading?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 text-xs text-[#929FB0]">
      <span className="font-mono">As of {fmtTime(at)}</span>
      {onRefresh && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1C293B] border border-[#35445A] text-[#C0CAD8] hover:text-[#FFD400] hover:border-[#FFD400] hover:bg-[#233145] transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh record"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin text-[#FFD400]' : 'text-[#FFD400]'} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      )}
    </span>
  );
}
