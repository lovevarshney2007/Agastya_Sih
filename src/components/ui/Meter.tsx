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
  const color =
    ratio > 1
      ? 'bg-rose-600'
      : ratio >= 0.95
      ? 'bg-amber-600'
      : 'bg-emerald-600';

  const [shown, setShown] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(width));
    return () => cancelAnimationFrame(id);
  }, [width]);

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div
        className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Intake capacity meter'}
      >
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-500 ease-out`}
          style={{ width: `${shown}%` }}
        />
      </div>
      {showNumbers && (
        <span
          className={`text-xs tabular-nums w-[70px] text-right font-mono ${
            ratio > 1 ? 'text-rose-700 font-bold' : 'text-slate-600'
          }`}
        >
          {value} / {max}
        </span>
      )}
    </div>
  );
}
