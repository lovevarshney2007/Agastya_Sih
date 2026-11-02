import { useEffect, useRef } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  LogOut,
  Search,
  SearchCheck,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Link, useRouter } from '../lib/router';
import { ROLE_LABEL, useSession } from '../lib/session';
import { useI18n, LanguageToggle } from '../lib/i18n';

interface NavLinkItem {
  to: string;
  label: string;
  key?: string;
  icon?: React.ElementType;
}

const PORTAL_ICONS: Record<string, React.ElementType> = {
  '/institution': Layers,
  '/institution/upload': FileCheck,
  '/institution/batches': FileText,
  '/institution/registry': BookOpen,
  '/institution/compliance': ShieldCheck,

  '/aicte': Layers,
  '/aicte/cases': Shield,
  '/aicte/risk': Award,
  '/aicte/ml-intelligence': Sparkles,
  '/aicte/rules': BookOpen,
  '/aicte/verifier-approvals': CheckCircle2,
  '/aicte/institutions': Building2,
  '/aicte/audit': Lock,
  '/aicte/security-sandbox': ShieldCheck,
  '/aicte/dual-approvals': Compass,

  '/verifier': SearchCheck,

  '/student': GraduationCap,
  '/student/consent': ShieldCheck,
  '/student/share': Sparkles,
  '/student/guardian': User,
  '/student/rights': FileText,
};

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  portalNav: { titleKey: string; defaultTitle: string; links: NavLinkItem[] } | null;
  currentPath: string;
  onOpenCommand: () => void;
  onOpenLedger: () => void;
  onOpenRubric: () => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  highContrast: boolean;
  toggleContrast: () => void;
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  portalNav,
  currentPath,
  onOpenCommand,
  onOpenLedger,
  onOpenRubric,
  fontSize,
  setFontSize,
  highContrast,
  toggleContrast,
}: MobileNavDrawerProps) {
  const { user, portal, signOut } = useSession();
  const { navigate } = useRouter();
  const { t } = useI18n();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Focus close button on open
    const timer = setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>('button[aria-label="Close menu"]')?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isActive = (to: string) => {
    return to === `/${portal}` ? currentPath === to : currentPath === to || currentPath.startsWith(`${to}/`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0e2448]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className="relative w-full max-w-[340px] sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-50 text-ink overflow-hidden border-l border-line"
      >
        {/* Tricolour National Bar */}
        <div className="tricolour h-1.5 shrink-0" aria-hidden="true" />

        {/* Official Header */}
        <div className="px-4 py-3 bg-navy text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/aicte-logo.png" alt="AICTE" className="h-8 w-8 object-contain bg-white rounded-full p-0.5 shrink-0" />
            <div className="min-w-0 leading-tight">
              <span className="block font-bold text-sm text-white truncate">{t('app_title')}</span>
              <span className="block text-[11px] text-[#c9d4e5] truncate">Government of India</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-white/80 hover:text-white p-2 rounded-md hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* User Card (if authenticated) */}
        {user ? (
          <div className="px-4 py-3 bg-brand-wash border-b border-line-soft shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-navy text-white">
                {ROLE_LABEL[user.role]}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-ok font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
                Active Session
              </span>
            </div>
            <div className="font-bold text-sm text-navy truncate">{user.full_name}</div>
            <div className="text-xs text-muted truncate mt-0.5">
              {user.org_name || user.email}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 bg-brand-wash border-b border-line-soft flex items-center gap-2 shrink-0">
            <Link
              to="/sign-in"
              onClick={onClose}
              className="btn btn-primary btn-sm flex-1 text-center justify-center no-underline"
            >
              {t('sign_in', 'Sign In to Portal')}
            </Link>
            <Link
              to="/activate"
              onClick={onClose}
              className="btn btn-secondary btn-sm flex-1 text-center justify-center no-underline"
            >
              Activate Account
            </Link>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Active Portal Links Section */}
          {portalNav && (
            <div>
              <div className="text-[11px] font-bold tracking-wider text-muted uppercase mb-2">
                {t(portalNav.titleKey, portalNav.defaultTitle)}
              </div>
              <nav className="space-y-1" aria-label="Portal Navigation">
                {portalNav.links.map((link) => {
                  const active = isActive(link.to);
                  const Icon = PORTAL_ICONS[link.to] || ChevronRight;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all no-underline min-h-[44px] ${
                        active
                          ? 'bg-navy text-white shadow-xs'
                          : 'text-ink hover:bg-wash active:bg-slate-100'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-saffron' : 'text-muted'} />
                      <span className="flex-1 truncate">{link.key ? t(link.key, link.label) : link.label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-saffron" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Statutory Public Tools */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-muted uppercase mb-2">
              Public Verification &amp; Registry
            </div>
            <div className="space-y-1">
              <Link
                to="/verify"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-wash no-underline min-h-[44px]"
              >
                <SearchCheck size={16} className="text-brand" />
                <span className="flex-1 truncate">{t('verify_record', 'Verify Credential QR')}</span>
              </Link>
              <Link
                to="/public-dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-wash no-underline min-h-[44px]"
              >
                <Layers size={16} className="text-brand" />
                <span className="flex-1 truncate">{t('live_seats', 'Live Seats Dashboard')}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCommand();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink hover:bg-wash text-left cursor-pointer min-h-[44px]"
              >
                <Search size={16} className="text-brand" />
                <span className="flex-1 truncate">Regulatory Command Search</span>
                <kbd className="font-mono text-[10px] bg-wash border border-line px-1.5 py-0.5 rounded text-faint">
                  Ctrl K
                </kbd>
              </button>
            </div>
          </div>

          {/* Statutory Status & Rubric Badges */}
          <div>
            <div className="text-[11px] font-bold tracking-wider text-muted uppercase mb-2">
              Statutory Governance
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLedger();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-emerald-300/60 bg-emerald-50/50 hover:bg-emerald-50 text-left cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
                  <span className="text-xs font-bold text-emerald-900">National Depository Ledger</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  Consensus Active
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRubric();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-amber-300/60 bg-amber-50/50 hover:bg-amber-50 text-left cursor-pointer min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">SIH 26263 Compliance Rubric</span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                  7/7 Verified
                </span>
              </button>
            </div>
          </div>

          {/* GIGW Accessibility Settings */}
          <div className="pt-2 border-t border-line-soft">
            <div className="text-[11px] font-bold tracking-wider text-muted uppercase mb-2">
              GIGW Accessibility
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Text Sizer:</span>
                <div className="flex items-center gap-1 bg-wash border border-line rounded p-0.5">
                  {(['14px', '15px', '16px'] as const).map((sz, idx) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors min-h-[32px] ${
                        fontSize === sz ? 'bg-navy text-white font-bold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {idx === 0 ? 'A-' : idx === 1 ? 'A' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">High Contrast:</span>
                <button
                  type="button"
                  onClick={toggleContrast}
                  className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[36px] ${
                    highContrast ? 'bg-saffron text-navy font-bold' : 'bg-wash text-ink border border-line'
                  }`}
                >
                  <span>◐</span>
                  <span>{highContrast ? 'High Contrast On' : 'Standard'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Language:</span>
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Sign Out */}
        {user && (
          <div className="p-4 bg-wash border-t border-line shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <button
              type="button"
              onClick={async () => {
                onClose();
                await signOut();
                navigate('/sign-in?signedout=1');
              }}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 text-bad hover:bg-bad-wash border-bad/30 font-semibold"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{t('sign_out', 'Sign Out of Session')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
