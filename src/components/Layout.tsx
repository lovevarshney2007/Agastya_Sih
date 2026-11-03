import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Award, LogOut, Menu, Search,
  LayoutDashboard, UploadCloud, FileSpreadsheet, Users, ShieldCheck
} from 'lucide-react';
import { API_ORIGIN } from '../api/client';
import { Link, useRouter } from '../lib/router';
import { ROLE_LABEL, useSession, type Portal } from '../lib/session';
import { useI18n, LanguageToggle } from '../lib/i18n';
import { CommandPalette } from './CommandPalette';
import { JuryRubricModal } from './JuryRubricModal';
import { JuryTourWidget } from './JuryTourWidget';
import { NationalEventTicker } from './NationalEventTicker';
import { NationalLedgerModal } from './NationalLedgerModal';
import { NotificationBell } from './NotificationBell';
import { RegulatoryCopilot } from './RegulatoryCopilot';
import { MobileNavDrawer } from './MobileNavDrawer';

interface NavLinkItem {
  to: string;
  label: string;
  key?: string;
  icon?: any;
}

const PORTAL_NAV: Record<Portal, { titleKey: string; defaultTitle: string; links: NavLinkItem[] }> = {
  institution: {
    titleKey: 'portal_institution',
    defaultTitle: 'Institution portal',
    links: [
      { to: '/institution', label: 'Dashboard', key: 'nav_dashboard', icon: LayoutDashboard },
      { to: '/institution/upload', label: 'Upload data', key: 'nav_upload_data', icon: UploadCloud },
      { to: '/institution/batches', label: 'Uploads & reports', key: 'nav_uploads_reports', icon: FileSpreadsheet },
      { to: '/institution/registry', label: 'Student registry', key: 'nav_registry', icon: Users },
      { to: '/institution/compliance', label: 'Intake compliance', key: 'nav_compliance', icon: ShieldCheck },
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
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-[#080B12] text-[#F8FAFC]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-[#FFD400] focus:text-[#080B12] focus:px-4 focus:py-2 focus:font-bold">Skip to main content</a>

      <div className="tricolour h-1 no-print" aria-hidden="true" />
      
      {/* 3. Top Government Status Bar */}
      <div className="bg-[#080B12] border-b border-[#35445A] text-[#C0CAD8] text-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="truncate max-w-[140px] sm:max-w-none font-medium text-[#F8FAFC]">{t('gov_india')}</span>
            <span className="text-[#35445A]">|</span>
            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#00D68F] hover:text-white transition-all cursor-pointer bg-[#101725] hover:bg-[#1C293B] px-2.5 py-0.5 rounded border border-[#00D68F]/40 shadow-xs"
              title="Click to view AICTE National Depository Root Ledger Consensus Status"
            >
              <span className="w-2 h-2 rounded-full bg-[#00D68F] beacon-pulse text-[#00D68F] shrink-0" />
              <span>{t('ledger_badge', 'APAAR National Depository · Ledger Live')}</span>
            </button>
            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="md:hidden inline-flex items-center gap-1 text-[10px] font-semibold text-[#00D68F] bg-[#101725] px-2 py-0.5 rounded border border-[#00D68F]/30 shrink-0"
              title="Ledger Live Status"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] beacon-pulse shrink-0" />
              <span>Ledger Live</span>
            </button>
            <span className="text-[#35445A] hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => setRubricOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FFD400] hover:text-white transition-all cursor-pointer bg-[#FFD400]/10 hover:bg-[#FFD400]/20 px-2.5 py-0.5 rounded border border-[#FFD400]/40 shadow-xs shrink-0"
              title="Open SIH26263 Statutory Rubric & Architecture Compliance Matrix"
            >
              <Award size={13} className="text-[#FFD400] shrink-0" />
              <span className="hidden sm:inline">SIH Rubric (7/7 ✅)</span>
              <span className="sm:hidden">Rubric</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* GIGW Text Resizer */}
            <div className="flex items-center gap-0.5 bg-[#151F30] border border-[#35445A] px-1.5 py-0.5 rounded text-xs">
              <span className="text-[#929FB0] mr-1 hidden sm:inline text-[11px]">Text:</span>
              <button
                type="button"
                onClick={() => setFontSize('14px')}
                className={`px-1.5 py-0.5 rounded transition-colors text-[11px] ${fontSize === '14px' ? 'bg-[#FFD400] text-[#080B12] font-bold' : 'text-[#C0CAD8] hover:text-white'}`}
                title="Decrease font size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('15px')}
                className={`px-1.5 py-0.5 rounded transition-colors text-[11px] ${fontSize === '15px' ? 'bg-[#FFD400] text-[#080B12] font-bold' : 'text-[#C0CAD8] hover:text-white'}`}
                title="Normal font size (A)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('16px')}
                className={`px-1.5 py-0.5 rounded transition-colors text-[11px] ${fontSize === '16px' ? 'bg-[#FFD400] text-[#080B12] font-bold' : 'text-[#C0CAD8] hover:text-white'}`}
                title="Increase font size (A+)"
              >
                A+
              </button>
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              onClick={toggleContrast}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs transition-all cursor-pointer ${
                highContrast
                  ? 'bg-[#FFD400] text-[#080B12] font-extrabold shadow-[0_0_12px_rgba(255,212,0,0.4)]'
                  : 'bg-[#151F30] border border-[#35445A] text-[#C0CAD8] hover:text-white hover:border-[#FFD400]'
              }`}
              title="Toggle High Contrast Mode (WCAG 2.2 AA / GIGW Compliant)"
            >
              <span className="font-mono text-xs">◐</span>
              <span className="hidden sm:inline">{highContrast ? 'Standard' : 'High Contrast'}</span>
            </button>

            <span className="hidden sm:inline text-[#35445A]">|</span>
            <span className="hidden sm:inline text-[#C0CAD8] font-medium">{t('aicte_full')}</span>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#101725] border-b border-[#35445A] no-print sticky top-0 sm:static z-30 shadow-md">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
          <Link to={user && portal ? `/${portal}` : '/'} className="flex items-center gap-3 no-underline text-[#F8FAFC] min-w-0 group">
            <div className="p-1 rounded-lg bg-[#151F30] border border-[#35445A] group-hover:border-[#FFD400] transition-colors shrink-0">
              <img src="/aicte-logo.png" alt="AICTE Emblem" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
            </div>
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-sm sm:text-base truncate text-[#F8FAFC] tracking-tight">{t('app_title')}</span>
              <span className="hidden sm:block text-xs text-[#929FB0] truncate">{t('app_subtitle')}</span>
              {user && (
                <span className="sm:hidden text-[10px] text-[#929FB0] truncate block">
                  {ROLE_LABEL[user.role]}
                </span>
              )}
            </span>
          </Link>

          {/* Universal Search Command Bar */}
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border border-[#35445A] bg-[#151F30] text-[#929FB0] text-xs hover:border-[#00D9E8] hover:text-[#F8FAFC] transition-all shadow-inner cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00D9E8]"
            title="Press Ctrl+K to search all portals & commands"
          >
            <Search size={14} className="text-[#00D9E8]" />
            <span className="hidden lg:inline text-[#C0CAD8]">Search statutory portal, APAAR IDs, regulations...</span>
            <span className="lg:hidden text-[#C0CAD8]">Search...</span>
            <kbd className="font-mono text-[11px] bg-[#1C293B] border border-[#35445A] px-1.5 py-0.5 rounded text-[#FFD400] font-bold ml-2">Ctrl K</kbd>
          </button>

          {/* Mobile Right Controls: Notification Bell + Hamburger */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            {user && <NotificationBell />}
            <button
              type="button"
              className="btn btn-ghost p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#F8FAFC] hover:bg-[#1C293B]"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label="Open mobile navigation drawer"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Desktop Right Links & Profile */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link to="/verify" className="no-underline text-[#C0CAD8] hover:text-[#00D9E8] transition-colors font-medium text-xs sm:text-sm">{t('verify_record', 'Verify a record')}</Link>
            <Link to="/public-dashboard" className="no-underline text-[#C0CAD8] hover:text-[#FFD400] transition-colors font-medium text-xs sm:text-sm">{t('live_seats', 'Live seats')}</Link>
            {user ? (
              <>
                <NotificationBell />
                <div className="text-right leading-tight border-l border-[#35445A] pl-4">
                  <div className="font-bold text-xs text-[#F8FAFC]">{user.full_name}</div>
                  <div className="text-[11px] text-[#929FB0] truncate max-w-[180px]">{ROLE_LABEL[user.role]}{user.org_name ? ` · ${user.org_name}` : ''}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  onClick={async () => { await signOut(); navigate('/sign-in?signedout=1'); }}
                >
                  <LogOut size={13} aria-hidden="true" /> {t('sign_out')}
                </button>
              </>
            ) : (
              <Link to="/sign-in" className="btn btn-primary btn-sm no-underline">{t('sign_in')}</Link>
            )}
          </div>
        </div>
      </header>

      {/* Accessible Slide-out Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        portalNav={nav}
        currentPath={path}
        onOpenCommand={() => setCommandOpen(true)}
        onOpenLedger={() => setLedgerModalOpen(true)}
        onOpenRubric={() => setRubricOpen(true)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        toggleContrast={toggleContrast}
      />

      {/* 4. Main Navigation with clear active states, visible hover effects, professional icons and high-contrast text */}
      {nav && (
        <nav className="bg-[#080B12] sticky top-[49px] sm:top-0 z-20 border-b border-[#35445A] no-print shadow-[0_4px_16px_rgba(0,0,0,0.5)]" aria-label={t(nav.titleKey, nav.defaultTitle)}>
          <div ref={navRef} className="max-w-7xl mx-auto px-2 sm:px-6 flex gap-1.5 overflow-x-auto no-scrollbar scroll-fade py-1">
            {nav.links.map((l) => {
              const active = isActive(path, l.to, `/${portal}`);
              const IconComp = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm no-underline whitespace-nowrap transition-all duration-150 min-h-[38px] flex items-center gap-2 rounded-t-lg shrink-0 font-medium ${
                    active
                      ? 'bg-[#151F30] text-[#F8FAFC] font-bold border-b-2 border-[#FFD400] shadow-[0_-2px_10px_rgba(0,0,0,0.2)]'
                      : 'text-[#C0CAD8] hover:text-[#F8FAFC] hover:bg-[#151F30]/60'
                  }`}
                >
                  {IconComp && (
                    <IconComp
                      size={15}
                      className={active ? 'text-[#FFD400]' : 'text-[#929FB0] group-hover:text-[#F8FAFC]'}
                    />
                  )}
                  <span>{l.key ? t(l.key, l.label) : l.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <main id="main" className={full ? 'flex-1 w-full pb-28 sm:pb-12 min-w-0' : `flex-1 w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-12 min-w-0 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <div key={path} className="page-enter min-w-0">{children}</div>
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
      <NationalEventTicker />
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <NationalLedgerModal isOpen={ledgerModalOpen} onClose={() => setLedgerModalOpen(false)} />
      <JuryRubricModal isOpen={rubricOpen} onClose={() => setRubricOpen(false)} />
    </div>
  );
}
