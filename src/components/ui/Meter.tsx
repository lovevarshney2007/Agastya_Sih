import { useEffect, useState } from 'react';

export interface MeterProps {
  value: number;
  max: number;
  label?: string;
  showNumbers?: boolean;
}

/**
 * Seat Intake Capacity Meter.
 * Displays approved intake ratio with clear statutory threshold indicators:
 * - Green (< 90% utilization)
 * - Amber (90% - 100% capacity)
 * - Crimson (> 100% statutory intake breach)
 */
export function Meter({ value, max, label, showNumbers = true }: MeterProps) {
  const ratio = max > 0 ? value / max : 0;
  const width = Math.min(ratio, 1) * 100;
  const pct = Math.round(ratio * 100);
  const color =
    ratio > 1
      ? 'bg-[#FF5263] shadow-[0_0_8px_rgba(255,82,99,0.5)]'
      : ratio >= 0.95
      ? 'bg-[#FFB020] shadow-[0_0_8px_rgba(255,176,32,0.4)]'
      : 'bg-[#00D68F] shadow-[0_0_8px_rgba(0,214,143,0.4)]';

  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(width));
    return () => cancelAnimationFrame(id);
  }, [width]);

  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div
        className="h-2 flex-1 rounded-full bg-[#1C293B] border border-[#35445A] overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Intake capacity meter'}
      >
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
          style={{ width: `${shown}%` }}
        />
      </div>
      {showNumbers && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold font-mono text-[#00D9E8] w-[42px] text-right">
            {pct}%
          </span>
          <span
            className={`text-xs tabular-nums text-right font-mono min-w-[70px] ${
              ratio > 1 ? 'text-[#FF5263] font-bold' : 'text-[#F8FAFC]'
            }`}
          >
            {value} / {max}
          </span>
        </div>
      )}
    </div>
  );
}
