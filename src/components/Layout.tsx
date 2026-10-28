import { useState, type ReactNode } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useRouter } from '../lib/router';
import { ROLE_LABEL, useSession, type Portal } from '../lib/session';

const PORTAL_NAV: Record<Portal, { title: string; links: { to: string; label: string }[] }> = {
  institution: {
    title: 'Institution portal',
    links: [
      { to: '/institution', label: 'Dashboard' },
      { to: '/institution/upload', label: 'Upload data' },
      { to: '/institution/batches', label: 'Uploads & reports' },
      { to: '/institution/registry', label: 'Student registry' },
      { to: '/institution/compliance', label: 'Intake compliance' },
    ],
  },
  aicte: {
    title: 'AICTE regulation desk',
    links: [
      { to: '/aicte', label: 'National overview' },
      { to: '/aicte/cases', label: 'Cases' },
      { to: '/aicte/risk', label: 'Risk ranking' },
      { to: '/aicte/institutions', label: 'Institutions' },
      { to: '/aicte/audit', label: 'Audit ledger' },
    ],
  },
  verifier: {
    title: 'Verifier portal',
    links: [{ to: '/verifier', label: 'Verification requests' }],
  },
  student: {
    title: 'My APAAR record',
    links: [
      { to: '/student', label: 'My record' },
      { to: '/student/consent', label: 'Consent' },
      { to: '/student/share', label: 'Share my record' },
    ],
  },
};

function isActive(path: string, to: string, portalRoot: string) {
  return to === portalRoot ? path === to : path === to || path.startsWith(`${to}/`);
}

export function Layout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { user, portal, signOut } = useSession();
  const { path, navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = portal && path.startsWith(`/${portal}`) ? PORTAL_NAV[portal] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-3 focus:py-2">Skip to main content</a>

      <div className="bg-navy-dark text-[#c9d4e5] text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex justify-between gap-4">
          <span>Ministry of Education · All India Council for Technical Education</span>
          <span className="font-semibold text-[#f6c48f]">Prototype — synthetic data only</span>
        </div>
      </div>

      <header className="bg-white border-b border-line no-print">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to={user && portal ? `/${portal}` : '/'} className="flex items-center gap-3 no-underline text-ink min-w-0">
            <img src="/aicte-logo.png" alt="" className="h-11 w-11 object-contain shrink-0" />
            <span className="leading-tight min-w-0">
              <span className="block font-bold text-[17px] truncate">APAAR Student Ledger</span>
              <span className="block text-xs text-muted truncate">Enrolment reporting &amp; verification for AICTE-approved institutions</span>
            </span>
          </Link>

          <button type="button" className="sm:hidden btn btn-ghost" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={`${menuOpen ? 'flex' : 'hidden'} sm:flex absolute sm:static top-full left-0 right-0 z-40 bg-white sm:bg-transparent border-b sm:border-0 border-line px-4 sm:px-0 py-3 sm:py-0 flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-sm`}>
            <Link to="/verify" className="no-underline hover:underline text-ink" onClick={() => setMenuOpen(false)}>Verify a record</Link>
            {user ? (
              <>
                <div className="sm:text-right leading-tight sm:border-l sm:border-line sm:pl-5">
                  <div className="font-semibold">{user.full_name}</div>
                  <div className="text-xs text-muted">{ROLE_LABEL[user.role]}{user.org_name ? ` · ${user.org_name}` : ''}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm self-start sm:self-auto"
                  onClick={async () => { setMenuOpen(false); await signOut(); navigate('/sign-in?signedout=1'); }}
                >
                  <LogOut size={14} aria-hidden="true" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/sign-in" className="btn btn-primary btn-sm no-underline self-start sm:self-auto" onClick={() => setMenuOpen(false)}>Sign in</Link>
            )}
          </div>
        </div>

        {nav && (
          <nav className="bg-navy" aria-label={nav.title}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
              {nav.links.map((l) => {
                const active = isActive(path, l.to, `/${portal}`);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3.5 py-2.5 text-sm no-underline whitespace-nowrap border-b-[3px] ${active ? 'text-white border-saffron font-semibold' : 'text-[#c9d4e5] border-transparent hover:text-white'}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main id="main" className={`flex-1 w-full mx-auto px-4 sm:px-6 py-7 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>
        {children}
      </main>

      <footer className="bg-white border-t border-line text-sm text-muted no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-3">
          <div>
            <div className="font-semibold text-ink">APAAR Student Ledger</div>
            <p className="mt-1">Smart India Hackathon 2026 prototype for problem statement SIH26263. Not an official AICTE service.</p>
          </div>
          <div>
            <div className="font-semibold text-ink">Privacy</div>
            <p className="mt-1">No Aadhaar numbers are collected. APAAR IDs are encrypted and shown masked. Every access is written to a tamper-evident log.</p>
          </div>
          <div>
            <div className="font-semibold text-ink">Help</div>
            <p className="mt-1">Report a problem: helpdesk@apaar-ledger.example<br />API documentation: <a href="/docs" target="_blank" rel="noreferrer">/docs</a> on the backend server</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
