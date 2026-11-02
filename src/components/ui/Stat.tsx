import { type ReactNode } from 'react';
import { CountUp } from './CountUp';
import { MicroSparkline } from './MicroSparkline';

export interface StatProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: 'bad' | 'warn' | 'ok' | 'brand';
  sparkline?: number[];
  icon?: ReactNode;
  className?: string;
}

/**
 * Enterprise KPI metric card.
 * High-density scannable summary with tabular figures and micro-sparkline.
 */
export function Stat({
  label,
  value,
  note,
  tone,
  sparkline,
  icon,
  className = '',
}: StatProps) {
  const toneClass =
    tone === 'bad'
      ? 'text-rose-700'
      : tone === 'warn'
      ? 'text-amber-700'
      : tone === 'ok'
      ? 'text-emerald-700'
      : 'text-slate-900';

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {label}
          </span>
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-1">
          <div className={`text-2xl font-bold tabular-nums tracking-tight ${toneClass}`}>
            <CountUp value={value} />
          </div>
          {sparkline && (
            <MicroSparkline
              data={sparkline}
              tone={tone === 'bad' ? 'bad' : tone === 'ok' ? 'ok' : 'brand'}
              width={52}
              height={20}
            />
          )}
        </div>
      </div>

      {note && (
        <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
          {note}
        </div>
      )}
    </div>
  );
}
