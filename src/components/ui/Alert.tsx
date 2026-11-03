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
    container: 'bg-[#151F30] border-[#35445A] border-l-[#00D9E8] text-[#F8FAFC]',
    icon: Info,
    iconClass: 'text-[#00D9E8]',
    titleColor: 'text-[#00D9E8]',
  },
  ok: {
    container: 'bg-[#151F30] border-[#35445A] border-l-[#00D68F] text-[#F8FAFC]',
    icon: CircleCheck,
    iconClass: 'text-[#00D68F]',
    titleColor: 'text-[#00D68F]',
  },
  warn: {
    container: 'bg-[#151F30] border-[#35445A] border-l-[#FFB020] text-[#F8FAFC]',
    icon: TriangleAlert,
    iconClass: 'text-[#FFB020]',
    titleColor: 'text-[#FFB020]',
  },
  bad: {
    container: 'bg-[#151F30] border-[#35445A] border-l-[#FF5263] text-[#F8FAFC]',
    icon: CircleAlert,
    iconClass: 'text-[#FF5263]',
    titleColor: 'text-[#FF5263]',
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
      className={`border-l-4 border rounded-r-lg px-4 py-3.5 flex gap-3 text-xs sm:text-sm leading-relaxed shadow-md ${conf.container} ${className}`}
    >
      <IconComponent
        size={18}
        className={`${conf.iconClass} shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && <div className={`font-semibold ${conf.titleColor}`}>{title}</div>}
        {children && <div className={title ? 'mt-1 text-[#C0CAD8]' : 'text-[#F8FAFC]'}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[#929FB0] hover:text-[#F8FAFC] p-0.5 rounded transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#FFD400]"
          aria-label="Dismiss notification"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
