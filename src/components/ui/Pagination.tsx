import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  className?: string;
}

/**
 * Enterprise Pagination control with localized Indian numeric counts.
 */
export function Pagination({ page, pageSize, total, onPage, className = '' }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-600 bg-white select-none ${className}`}
    >
      <span className="tabular-nums font-medium">
        Showing <span className="text-slate-900 font-semibold">{from}</span>–<span className="text-slate-900 font-semibold">{to}</span> of{' '}
        <span className="text-slate-900 font-semibold">{total.toLocaleString('en-IN')}</span> records
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} aria-hidden="true" />
          <span>Previous</span>
        </button>

        <span className="px-2 font-mono text-[11px] text-slate-500">
          Page {page} of {pages}
        </span>

        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
