import { type ReactNode } from 'react';

export interface PanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  footer?: ReactNode;
  id?: string;
}

/**
 * Enterprise Panel primitive with clean 1px border and high information density.
 * Strips away random gradient blobs and excessive shadow elevation.
 */
export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-4 sm:p-5',
  footer,
  id,
}: PanelProps) {
  return (
    <section
      id={id}
      className={`bg-[#151F30] border border-[#35445A] rounded-xl shadow-[0_4px_24px_-2px_rgba(0,0,0,0.45)] overflow-hidden transition-all ${className}`}
    >
      {(title || actions) && (
        <div className="px-4 sm:px-5 py-3.5 border-b border-[#35445A] bg-[#1C293B] flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#929FB0] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="px-4 sm:px-5 py-3 bg-[#101725] border-t border-[#35445A] text-xs text-[#C0CAD8] flex items-center justify-between gap-2">
          {footer}
        </div>
      )}
    </section>
  );
}
