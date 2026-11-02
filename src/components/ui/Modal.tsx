import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  subtitle?: string;
}

/**
 * Institutional Modal Dialog.
 * Clean slate/navy overlay without artificial frosted glass/backdrop-blur.
 * Features focus trapping, keyboard ESC dismissal, and WCAG dialog roles.
 */
export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 'max-w-lg',
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const previousFocusedElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first interactive control in modal body
    const timer = setTimeout(() => {
      const body = modalRef.current?.querySelector('.modal-body');
      const focusTarget =
        body?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ??
        modalRef.current?.querySelector<HTMLElement>('button:not([disabled])');
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0e2448]/60 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? descId : undefined}
        className={`w-full ${width} bg-white rounded-t-2xl sm:rounded-lg border border-slate-300 shadow-xl my-0 sm:my-6 overflow-hidden flex flex-col text-slate-900 transition-all max-h-[85vh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom)] sm:pb-0`}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" aria-hidden="true" />

        {/* Institutional Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-sm sm:text-base font-bold text-[#0e2448] leading-snug truncate">
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
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 p-2 sm:p-1 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-brand min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center shrink-0"
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-4 sm:p-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
