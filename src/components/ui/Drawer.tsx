import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  side?: 'right' | 'left';
}

/**
 * Institutional Slide-over Drawer.
 * Built for in-depth audit trail inspection, dual-key review records, and APAAR verification claims.
 */
export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 'max-w-xl',
  side = 'right',
}: DrawerProps) {
  const titleId = useId();
  const descId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previousFocusedElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const focusTarget =
        drawerRef.current?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), button:not([disabled])');
      focusTarget?.focus();
    }, 20);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusedElement?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#0e2448]/60 transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className={`fixed inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} flex max-w-full w-full sm:w-auto`}>
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={subtitle ? descId : undefined}
          className={`w-full sm:w-screen ${width} bg-white shadow-xl border-l border-slate-300 flex flex-col text-slate-900 max-w-full`}
        >
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-sm sm:text-base font-bold text-[#0e2448] truncate">
                {title}
              </h2>
              {subtitle && (
                <p id={descId} className="text-xs text-slate-600 mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 p-2 sm:p-1.5 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-brand min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center shrink-0"
              aria-label="Close drawer"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
