import { type ReactNode } from 'react';

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

/**
 * Accessible Form Field wrapper with label, error announcement, and helper hint.
 */
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  required,
  className = '',
}: FieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-bold text-slate-800 tracking-tight"
      >
        {label}
        {required && <span className="text-rose-600 ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-700 font-medium mt-1 flex items-center gap-1" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-slate-500 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
