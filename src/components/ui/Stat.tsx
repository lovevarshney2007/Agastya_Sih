import { type ReactNode } from 'react';
import { CountUp } from './CountUp';
import { MicroSparkline } from './MicroSparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: 'bad' | 'warn' | 'ok' | 'brand';
  sparkline?: number[];
  icon?: ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

/**
 * Enterprise KPI metric card.
 * High-contrast sovereign analytics card with WCAG 2.2 AA readability.
 * 30-34px prominent metric values, uppercase scannable labels, and sparkline trends.
 */
export function Stat({
  label,
  value,
  note,
  tone,
  sparkline,
  icon,
  trend,
  className = '',
}: StatProps) {
  const toneClass =
    tone === 'bad'
      ? 'text-[#FF5263]'
      : tone === 'warn'
      ? 'text-[#FFB020]'
      : tone === 'ok'
      ? 'text-[#00D68F]'
      : tone === 'brand'
      ? 'text-[#00D9E8]'
      : 'text-[#F8FAFC]';

  return (
    <div
      className={`bg-[#151F30] border border-[#35445A] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4)] hover:border-[#4A5F7E] hover:-translate-y-0.5 transition-all duration-200 group ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#929FB0] uppercase tracking-wider truncate">
            {label}
          </span>
          {icon && <span className="text-[#929FB0] group-hover:text-[#F8FAFC] transition-colors shrink-0">{icon}</span>}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-2">
          <div className={`text-[30px] sm:text-[32px] font-bold tabular-nums tracking-tight leading-none ${toneClass}`}>
            <CountUp value={value} />
          </div>
          {sparkline && (
            <div className="shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
              <MicroSparkline
                data={sparkline}
                tone={tone === 'bad' ? 'bad' : tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : 'brand'}
                width={54}
                height={22}
              />
            </div>
          )}
        </div>
      </div>

      {(note || trend) && (
        <div className="text-xs text-[#C0CAD8] mt-3 pt-2.5 border-t border-[#35445A]/70 flex items-center justify-between gap-2 leading-tight">
          <span className="truncate">{note}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                trend.positive
                  ? 'bg-[rgba(0,214,143,0.15)] text-[#00D68F]'
                  : 'bg-[rgba(255,82,99,0.15)] text-[#FF5263]'
              }`}
            >
              {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

