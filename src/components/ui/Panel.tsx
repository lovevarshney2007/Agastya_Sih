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
      className={`bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden ${className}`}
    >
      {(title || actions) && (
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            {typeof title === 'string' ? (
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
      {footer && (
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-2">
          {footer}
        </div>
      )}
    </section>
  );
}
