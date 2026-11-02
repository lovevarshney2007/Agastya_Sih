import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LogOut, Menu, Search, X } from 'lucide-react';
import { API_ORIGIN } from '../api/client';
import { Link, useRouter } from '../lib/router';
import { ROLE_LABEL, useSession, type Portal } from '../lib/session';
import { useI18n, LanguageToggle } from '../lib/i18n';
import { CommandPalette } from './CommandPalette';
import { JuryTourWidget } from './JuryTourWidget';
import { NotificationBell } from './NotificationBell';
import { RegulatoryCopilot } from './RegulatoryCopilot';

interface NavLinkItem {
  to: string;
  label: string;
  key?: string;
}

const PORTAL_NAV: Record<Portal, { titleKey: string; defaultTitle: string; links: NavLinkItem[] }> = {
  institution: {
    titleKey: 'portal_institution',
    defaultTitle: 'Institution portal',
    links: [
      { to: '/institution', label: 'Dashboard', key: 'nav_dashboard' },
      { to: '/institution/upload', label: 'Upload data', key: 'nav_upload_data' },
      { to: '/institution/batches', label: 'Uploads & reports', key: 'nav_uploads_reports' },
      { to: '/institution/registry', label: 'Student registry', key: 'nav_registry' },
      { to: '/institution/compliance', label: 'Intake compliance', key: 'nav_compliance' },
    ],
  },
  aicte: {
    titleKey: 'portal_aicte',
    defaultTitle: 'AICTE regulation desk',
    links: [
      { to: '/aicte', label: 'National overview', key: 'nav_overview' },
      { to: '/aicte/cases', label: 'Cases', key: 'nav_cases' },
      { to: '/aicte/risk', label: 'Risk ranking', key: 'nav_risk' },
      { to: '/aicte/ml-intelligence', label: 'Policy & ML Intel', key: 'nav_ml_intel' },
      { to: '/aicte/rules', label: 'Rules & seat caps', key: 'nav_rules_config' },
      { to: '/aicte/verifier-approvals', label: 'Verifier approvals', key: 'nav_verifier_approvals' },
      { to: '/aicte/institutions', label: 'Institutions', key: 'nav_institutions' },
      { to: '/aicte/audit', label: 'Audit ledger', key: 'nav_audit' },
      { to: '/aicte/security-sandbox', label: 'Security Sandbox', key: 'nav_security_sandbox' },
      { to: '/aicte/dual-approvals', label: 'Dual-Key Sanctions', key: 'nav_dual_approvals' },
    ],
  },
  verifier: {
    titleKey: 'portal_verifier',
    defaultTitle: 'Verifier portal',
    links: [{ to: '/verifier', label: 'Verification requests', key: 'nav_verifications' }],
  },
  student: {
    titleKey: 'portal_student',
    defaultTitle: 'My APAAR record',
    links: [
      { to: '/student', label: 'My record', key: 'nav_my_record' },
      { to: '/student/consent', label: 'Consent', key: 'nav_consent' },
      { to: '/student/share', label: 'Share my record', key: 'nav_share' },
      { to: '/student/guardian', label: 'Guardian consent', key: 'nav_guardian' },
      { to: '/student/rights', label: 'My data rights', key: 'nav_data_rights' },
    ],
  },
};

function isActive(path: string, to: string, portalRoot: string) {
  return to === portalRoot ? path === to : path === to || path.startsWith(`${to}/`);
}

export function Layout({ children, wide = false, full = false }: { children: ReactNode; wide?: boolean; full?: boolean }) {
  const { user, portal, signOut } = useSession();
  const { path, navigate } = useRouter();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [fontSize, setFontSizeState] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('agastya_font_size') || '15px' : '15px'));
  const [highContrast, setHighContrast] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('agastya_high_contrast') === 'true' : false));

  const nav = portal && path.startsWith(`/${portal}`) ? PORTAL_NAV[portal] : null;
  const navRef = useRef<HTMLDivElement>(null);

  const setFontSize = (size: string) => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = size;
    try { localStorage.setItem('agastya_font_size', size); } catch {}
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    try { localStorage.setItem('agastya_high_contrast', String(next)); } catch {}
  };

  useEffect(() => {
    if (fontSize) {
      document.documentElement.style.fontSize = fontSize;
    }
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }, [fontSize, highContrast]);

  useEffect(() => {
    const handler = () => setCommandOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  // On narrow screens the tab bar scrolls; keep the current tab visible.
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [path]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-3 focus:py-2">Skip to main content</a>

      <div className="tricolour h-1 no-print" aria-hidden="true" />
      <div className="bg-navy-dark text-[#c9d4e5] text-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="truncate max-w-[130px] sm:max-w-none">{t('gov_india')}</span>
            <span className="hidden md:inline text-white/30">|</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon-pulse text-emerald-400 shrink-0" />
              APAAR National Depository · Ledger Live
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* GIGW Text Resizer */}
            <div className="flex items-center gap-0.5 bg-white/10 px-1 py-0.5 rounded text-[11px]">
              <span className="text-white/60 mr-0.5 hidden sm:inline">Text:</span>
              <button
                type="button"
                onClick={() => setFontSize('13.5px')}
                className={`px-1 rounded hover:text-white transition-colors ${fontSize === '13.5px' ? 'bg-white/20 text-white font-bold' : 'text-white/70'}`}
                title="Decrease font size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('15px')}
                className={`px-1 rounded hover:text-white transition-colors ${fontSize === '15px' ? 'bg-white/20 text-white font-bold' : 'text-white/70'}`}
                title="Normal font size (A)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('17px')}
                className={`px-1 rounded hover:text-white transition-colors ${fontSize === '17px' ? 'bg-white/20 text-white font-bold' : 'text-white/70'}`}
                title="Increase font size (A+)"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              onClick={toggleContrast}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors ${
                highContrast ? 'bg-saffron text-navy font-bold' : 'bg-white/10 text-white/80 hover:text-white'
              }`}
              title="Toggle High Contrast Mode (GIGW Compliant)"
            >
              <span className="font-mono text-xs">◐</span>
              <span className="hidden sm:inline">{highContrast ? 'Standard' : 'High Contrast'}</span>
            </button>

            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline">{t('aicte_full')}</span>
            <LanguageToggle />
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-line no-print">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <Link to={user && portal ? `/${portal}` : '/'} className="flex items-center gap-2 sm:gap-3 no-underline text-ink min-w-0">
            <img src="/aicte-logo.png" alt="" className="h-9 w-9 sm:h-11 sm:w-11 object-contain shrink-0" />
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-sm sm:text-[17px] truncate text-navy">{t('app_title')}</span>
              <span className="hidden sm:block text-xs text-muted truncate">{t('app_subtitle')}</span>
            </span>
          </Link>

          {/* Universal Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-line bg-wash text-muted text-xs hover:border-brand/40 hover:bg-brand-wash/40 hover:text-ink transition-all shadow-2xs"
            title="Press Ctrl+K to search all portals & commands"
          >
            <Search size={14} className="text-muted" />
            <span className="hidden lg:inline">Search portal, records, rules...</span>
            <span className="lg:hidden">Search...</span>
            <kbd className="font-mono text-[10px] bg-white border border-line px-1.5 py-0.5 rounded text-faint ml-2 shadow-2xs">Ctrl K</kbd>
          </button>

          <button type="button" className="sm:hidden btn btn-ghost" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={`${menuOpen ? 'flex' : 'hidden'} sm:flex absolute sm:static top-full left-0 right-0 z-40 bg-white sm:bg-transparent border-b sm:border-0 border-line px-4 sm:px-0 py-3 sm:py-0 flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm`}>
            <button
              type="button"
              className="sm:hidden flex items-center gap-2 py-1 text-left text-ink hover:text-brand"
              onClick={() => { setMenuOpen(false); setCommandOpen(true); }}
            >
              <Search size={16} /> Search commands & portals...
            </button>
            <Link to="/verify" className="no-underline hover:underline text-ink" onClick={() => setMenuOpen(false)}>{t('verify_record', 'Verify a record')}</Link>
            <Link to="/public-dashboard" className="no-underline hover:underline text-ink" onClick={() => setMenuOpen(false)}>{t('live_seats', 'Live seats')}</Link>
            {user ? (
              <>
                <NotificationBell />
                <div className="sm:text-right leading-tight sm:border-l sm:border-line sm:pl-5">
                  <div className="font-semibold">{user.full_name}</div>
                  <div className="text-xs text-muted">{ROLE_LABEL[user.role]}{user.org_name ? ` · ${user.org_name}` : ''}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm self-start sm:self-auto"
                  onClick={async () => { setMenuOpen(false); await signOut(); navigate('/sign-in?signedout=1'); }}
                >
                  <LogOut size={14} aria-hidden="true" /> {t('sign_out')}
                </button>
              </>
            ) : (
              <Link to="/sign-in" className="btn btn-primary btn-sm no-underline self-start sm:self-auto" onClick={() => setMenuOpen(false)}>{t('sign_in')}</Link>
            )}
          </div>
        </div>
      </header>

        {nav && (
          <nav className="bg-navy sticky top-0 z-30 shadow-[0_2px_6px_rgb(14_36_72/.18)] no-print" aria-label={t(nav.titleKey, nav.defaultTitle)}>
            <div ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scroll-fade">
              {nav.links.map((l) => {
                const active = isActive(path, l.to, `/${portal}`);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={`relative px-3.5 py-2.5 text-sm no-underline whitespace-nowrap transition-all duration-200 ${
                      active
                        ? 'text-white font-semibold'
                        : 'text-[#c9d4e5] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{l.key ? t(l.key, l.label) : l.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] bg-saffron rounded-t-sm shadow-[0_-2px_6px_rgba(232,129,28,0.5)] animate-fade-up" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

      <main id="main" className={full ? 'flex-1 w-full pb-24 sm:pb-8' : `flex-1 w-full mx-auto px-3 sm:px-6 py-6 pb-24 sm:pb-8 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <div key={path} className="page-enter">{children}</div>
      </main>

      <footer className="bg-navy-dark text-sm text-[#c3cee0] no-print">
        <div className="tricolour h-1" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/aicte-logo.png" alt="" className="h-9 w-9 object-contain bg-white rounded-full p-0.5" />
              <span className="font-semibold text-white">{t('app_title')}</span>
            </div>
            <p className="mt-3">{t('footer_desc')}</p>
          </div>
          <div>
            <div className="font-semibold text-white">{t('footer_privacy')}</div>
            <p className="mt-2">{t('footer_privacy_desc')}</p>
          </div>
          <div>
            <div className="font-semibold text-white">{t('footer_help')}</div>
            <p className="mt-2">
              Report a problem: helpdesk@apaar-ledger.example<br />
              Developers: <a href={`${API_ORIGIN}/docs`} target="_blank" rel="noreferrer" className="text-[#f6c48f] hover:underline">API documentation</a>
            </p>
          </div>
        </div>
      </footer>
      <RegulatoryCopilot onNavigate={(route) => navigate(route)} userRole={user?.role} />
      <JuryTourWidget />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
