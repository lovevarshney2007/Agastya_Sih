import { useState, isValidElement, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge, type Tone } from './Badge';

export interface DataCardField {
  label: string;
  value: ReactNode;
  mono?: boolean;
  isMono?: boolean;
}

export interface DataCardBadgeObject {
  label: ReactNode;
  tone?: Tone | 'ok' | 'warn' | 'bad' | 'hold' | 'neutral' | string;
}

export interface DataCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode | DataCardBadgeObject;
  fields?: DataCardField[];
  actions?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  expandedContent?: ReactNode;
  expandableContent?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function DataCard({
  title,
  subtitle,
  badge,
  fields = [],
  actions,
  children,
  onClick,
  expandedContent,
  expandableContent,
  defaultExpanded = false,
  className = '',
}: DataCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isClickable = Boolean(onClick);
  const actualExpandedContent = expandedContent ?? expandableContent;
  const hasExpandable = Boolean(actualExpandedContent);

  let renderedBadge: ReactNode = null;
  if (badge) {
    if (isValidElement(badge) || typeof badge === 'string' || typeof badge === 'number') {
      renderedBadge = badge;
    } else if (typeof badge === 'object' && 'label' in badge) {
      const b = badge as DataCardBadgeObject;
      const tone = (b.tone as Tone) || 'neutral';
      renderedBadge = <Badge variant={tone}>{b.label}</Badge>;
    }
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs text-slate-900 transition-all ${
        isClickable ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs active:bg-slate-50' : ''
      } ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm sm:text-base text-[#0e2448] leading-snug truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</div>
          )}
        </div>
        {renderedBadge && <div className="shrink-0">{renderedBadge}</div>}
      </div>

      {/* Fields Grid */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
          {fields.map((f, i) => (
            <div key={i} className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">{f.label}</div>
              <div
                className={`font-semibold text-slate-800 truncate mt-0.5 ${
                  f.mono || f.isMono ? 'font-mono text-[11px]' : ''
                }`}
              >
                {f.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Body Children */}
      {children && <div className="pt-2.5 text-xs">{children}</div>}

      {/* Expandable Accordion Content */}
      {hasExpandable && (
        <>
          {isExpanded && (
            <div className="pt-3 mt-2.5 border-t border-slate-100 text-xs text-slate-700 animate-in fade-in duration-150">
              {actualExpandedContent}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer min-h-[36px]"
          >
            <span>{isExpanded ? 'Hide details' : 'Show full details'}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </>
      )}

      {/* Actions Bar */}
      {actions && (
        <div
          className="pt-3 mt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export function DataCardGroup({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}
