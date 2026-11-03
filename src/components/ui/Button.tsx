import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'saffron' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-dark border-transparent shadow-xs active:bg-[#091830]',
  secondary: 'bg-white text-ink border-line hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-2xs',
  saffron: 'bg-saffron text-white hover:bg-[#b45309] border-transparent shadow-xs active:bg-[#92400e]',
  danger: 'bg-bad text-white hover:bg-[#b91c1c] border-transparent shadow-xs active:bg-[#991b1b]',
  ghost: 'bg-transparent text-brand hover:bg-brand-wash/60 border-transparent active:bg-brand-wash',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-[2rem] px-2.5 py-1 text-xs gap-1.5',
  md: 'min-h-[2.25rem] px-3.5 py-1.5 text-sm gap-2',
  lg: 'min-h-[2.6rem] px-4.5 py-2 text-base gap-2.5',
};

/**
 * Enterprise button primitive with strict GovTech/Stripe design standards.
 * Supports accessible focus-visible ring, loading state, and semantic variants.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    children,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={`
        btn btn-${variant}
        inline-flex items-center justify-center font-medium rounded-md border
        transition-colors duration-150 select-none
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={size === 'sm' ? 13 : 15} className="animate-spin shrink-0" aria-hidden="true" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
});
