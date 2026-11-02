import { type ReactNode } from 'react';

export interface KeyValueProps {
  items: [ReactNode, ReactNode][];
  className?: string;
  dense?: boolean;
}

/**
 * Enterprise KeyValue definition list for record inspections and certificate verification.
 */
export function KeyValue({ items, className = '', dense = false }: KeyValueProps) {
  return (
    <dl
      className={`grid grid-cols-[minmax(130px,max-content)_1fr] gap-x-4 ${
        dense ? 'gap-y-1.5 text-xs' : 'gap-y-2.5 text-xs sm:text-sm'
      } ${className}`}
    >
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-slate-500 font-medium select-none">{k}</dt>
          <dd className="min-w-0 break-words text-slate-900 font-normal">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
