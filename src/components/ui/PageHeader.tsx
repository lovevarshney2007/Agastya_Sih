import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '../../lib/router';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
  badge?: ReactNode;
  meta?: ReactNode;
}

/**
 * Authoritative institutional page header.
 * Conforms to Digital India / GovTech UK layout hierarchy.
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
  badge,
  meta,
}: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-slate-200/80 pb-4">
      {back && (
        <Link
          to={back.to}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 no-underline py-1 mb-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          <span>{back.label}</span>
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-4xl leading-normal">
              {description}
            </p>
          )}
          {meta && <div className="mt-2">{meta}</div>}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
