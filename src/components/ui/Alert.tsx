import { type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

export type AlertTone = 'info' | 'ok' | 'warn' | 'bad';

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
  action?: ReactNode;
}

const TONE_CONFIG: Record<
  AlertTone,
  {
    container: string;
    icon: typeof Info;
    iconClass: string;
    titleColor: string;
  }
> = {
  info: {
    container: 'bg-blue-50/70 border-blue-300 text-blue-900',
    icon: Info,
    iconClass: 'text-blue-600',
    titleColor: 'text-blue-950',
  },
  ok: {
    container: 'bg-emerald-50/70 border-emerald-300 text-emerald-900',
    icon: CircleCheck,
    iconClass: 'text-emerald-600',
    titleColor: 'text-emerald-950',
  },
  warn: {
    container: 'bg-amber-50/70 border-amber-300 text-amber-900',
    icon: TriangleAlert,
    iconClass: 'text-amber-600',
    titleColor: 'text-amber-950',
  },
  bad: {
    container: 'bg-rose-50/70 border-rose-300 text-rose-900',
    icon: CircleAlert,
    iconClass: 'text-rose-600',
    titleColor: 'text-rose-950',
  },
};

/**
 * Institutional Regulatory Alert Banner.
 * Designed with high contrast, semantic roles, and WCAG accessibility standards.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  className = '',
  action,
}: AlertProps) {
  const conf = TONE_CONFIG[tone];
  const IconComponent = conf.icon;

  return (
    <div
      role={tone === 'bad' ? 'alert' : 'status'}
      className={`border-l-4 border rounded-r-md px-4 py-3 flex gap-3 text-xs sm:text-sm leading-relaxed ${conf.container} ${className}`}
    >
      <IconComponent
        size={18}
        className={`${conf.iconClass} shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && <div className={`font-semibold ${conf.titleColor}`}>{title}</div>}
        {children && <div className={title ? 'mt-1 text-slate-700' : 'text-slate-800'}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 p-0.5 rounded transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-brand"
          aria-label="Dismiss notification"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
