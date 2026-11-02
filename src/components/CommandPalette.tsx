import { useEffect, useRef, useState } from 'react';
import {
  Building2, CheckSquare, Compass, FileCheck, FileText,
  KeyRound, Layers, Lock, LogIn, Search, Shield, ShieldAlert,
  Sparkles, UserCheck, Users, X
} from 'lucide-react';
import { api } from '../api/client';
import { useRouter } from '../lib/router';
import { useSession } from '../lib/session';

export interface CommandItem {
  id: string;
  category: 'Navigation' | 'Regulatory Action' | 'Auditing & Security' | 'Role Switch';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  action: () => void | Promise<void>;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  const { signIn } = useSession();

  const handleDemoSwitch = async (personaId: string, path: string) => {
    try {
      const res = await api.auth.demoLogin(personaId);
      signIn(res);
      navigate(path);
      onClose();
    } catch {
      navigate(path);
      onClose();
    }
  };

  const allItems: CommandItem[] = [
    // ── Navigation & Portals ──
    {
      id: 'nav-national-overview',
      category: 'Navigation',
      title: 'National AICTE Regulatory Overview',
      subtitle: 'Real-time telemetry, intake capacity, and state aggregates',
      icon: Layers,
      action: () => { navigate('/aicte'); onClose(); },
    },
    {
      id: 'nav-cases',
      category: 'Navigation',
      title: 'Regulatory Cases & Interceptions',
      subtitle: 'Simultaneous full-time enrolment conflicts and adjudication',
      icon: ShieldAlert,
      badge: 'APH §3.1',
      action: () => { navigate('/aicte/cases'); onClose(); },
    },
    {
      id: 'nav-risk',
      category: 'Navigation',
      title: 'Institutional Risk & Anomaly Ranking',
      subtitle: 'Ghost student detection and compliance scoring',
      icon: Shield,
      action: () => { navigate('/aicte/risk'); onClose(); },
    },
    {
      id: 'nav-ml-intel',
      category: 'Navigation',
      title: 'Policy & Machine Learning Intelligence',
      subtitle: 'National enrollment velocity and statistical anomaly projections',
      icon: Sparkles,
      action: () => { navigate('/aicte/ml-intelligence'); onClose(); },
    },
    {
      id: 'nav-rules',
      category: 'Navigation',
      title: 'Statutory Rules & Seat Cap Matrix',
      subtitle: 'APH ceiling constraints and supernumerary quotas',
      icon: FileCheck,
      action: () => { navigate('/aicte/rules'); onClose(); },
    },
    {
      id: 'nav-dual-sanctions',
      category: 'Auditing & Security',
      title: 'Dual-Key Sanctions Desk',
      subtitle: '4-Eyes multi-signature approval for quota reductions & penalties',
      icon: KeyRound,
      badge: '4-Eyes Quorum',
      action: () => { navigate('/aicte/dual-approvals'); onClose(); },
    },
    {
      id: 'nav-audit',
      category: 'Auditing & Security',
      title: 'Immutable SHA-256 Audit Ledger',
      subtitle: 'Merkle verification, tamper-evident block hashes & WORM storage',
      icon: Lock,
      badge: 'SHA-256 Chain',
      action: () => { navigate('/aicte/audit'); onClose(); },
    },
    {
      id: 'nav-sandbox',
      category: 'Auditing & Security',
      title: 'Red-Team vs Blue-Team Security Sandbox',
      subtitle: 'Adversarial payload simulations and firewall defense evaluation',
      icon: Shield,
      action: () => { navigate('/aicte/security-sandbox'); onClose(); },
    },
    {
      id: 'nav-inst-dashboard',
      category: 'Navigation',
      title: 'Institution Portal Dashboard',
      subtitle: 'College intake fill rates and pending compliance actions',
      icon: Building2,
      action: () => { navigate('/institution'); onClose(); },
    },
    {
      id: 'nav-inst-upload',
      category: 'Regulatory Action',
      title: 'Pre-Flight Batch Ingestion Desk',
      subtitle: 'Upload CSV with 14 APH rule validations before ledger commit',
      icon: FileText,
      badge: 'Pre-Flight Engine',
      action: () => { navigate('/institution/upload'); onClose(); },
    },
    {
      id: 'nav-inst-registry',
      category: 'Navigation',
      title: 'Student Enrolment Registry',
      subtitle: 'Searchable college registry with APAAR blind indices',
      icon: Users,
      action: () => { navigate('/institution/registry'); onClose(); },
    },
    {
      id: 'nav-inst-compliance',
      category: 'Navigation',
      title: 'Intake Capacity Compliance Radar',
      subtitle: 'Supernumerary and lateral intake ceiling analysis',
      icon: CheckSquare,
      action: () => { navigate('/institution/compliance'); onClose(); },
    },
    {
      id: 'nav-public-verify',
      category: 'Regulatory Action',
      title: 'Public Offline Credential Verification',
      subtitle: 'Scan QR with camera or enter JWS token code',
      icon: UserCheck,
      badge: 'Zero-Trust',
      action: () => { navigate('/verify'); onClose(); },
    },
    {
      id: 'nav-live-seats',
      category: 'Regulatory Action',
      title: 'National Live Seat Matrix Dashboard',
      subtitle: 'Public transparency portal for sanctioned vs filled college seats',
      icon: Layers,
      action: () => { navigate('/public-dashboard'); onClose(); },
    },
    {
      id: 'nav-student-wallet',
      category: 'Navigation',
      title: 'Student APAAR Credential & Wallet',
      subtitle: 'Digital ID card with 3D cryptographic tilt & DPDP consent rights',
      icon: UserCheck,
      action: () => { navigate('/student'); onClose(); },
    },

    // ── Direct Role Switching ──
    {
      id: 'role-aicte-maker',
      category: 'Role Switch',
      title: 'Switch Persona: AICTE Maker (Regulatory Officer)',
      subtitle: 'Rajesh Verma · Regulations Bureau · Case investigation',
      icon: LogIn,
      badge: 'AICTE Maker',
      action: () => handleDemoSwitch('AICTE_MAKER', '/aicte/cases'),
    },
    {
      id: 'role-aicte-checker',
      category: 'Role Switch',
      title: 'Switch Persona: AICTE Checker (Senior Approving Officer)',
      subtitle: 'Dr. Anil Deshpande · Regional Director · Dual-Key quorum sign-off',
      icon: LogIn,
      badge: 'AICTE Checker',
      action: () => handleDemoSwitch('AICTE_CHECKER', '/aicte/dual-approvals'),
    },
    {
      id: 'role-registrar',
      category: 'Role Switch',
      title: 'Switch Persona: College Registrar (COEP Pune)',
      subtitle: 'Dr. S. K. Mahajan · Batch ingestion & seat management',
      icon: LogIn,
      badge: 'Registrar',
      action: () => handleDemoSwitch('INSTITUTION_REGISTRAR', '/institution/batches'),
    },
    {
      id: 'role-student',
      category: 'Role Switch',
      title: 'Switch Persona: Student (APAAR Holder)',
      subtitle: 'Priya Nair · W3C credential, DigiLocker & DPDP rights',
      icon: LogIn,
      badge: 'Student',
      action: () => handleDemoSwitch('STUDENT', '/student'),
    },
    {
      id: 'role-verifier',
      category: 'Role Switch',
      title: 'Switch Persona: Corporate Verifier (TCS Lead Verifier)',
      subtitle: 'Vikram Malhotra · Background checks & cryptographic verification',
      icon: LogIn,
      badge: 'Verifier',
      action: () => handleDemoSwitch('VERIFIER', '/verifier'),
    },
  ];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          void filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Keep highlighted item visible
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-2 sm:px-4 bg-[#0e2448]/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-md border border-line overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Universal Command Search"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 border-b border-line bg-wash/50">
          <Search size={20} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-ink placeholder:text-muted/70 text-base font-medium"
            placeholder="Search records, statutory desks, audit ledger, role switches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="text-muted hover:text-ink p-1 rounded-sm"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono rounded bg-line-soft text-muted border border-line">
            ESC
          </span>
        </div>

        {/* Search Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-line-soft/60">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <Search size={32} className="mx-auto text-muted/40 mb-2" />
              <div className="font-semibold text-ink">No commands or records found</div>
              <div className="text-xs text-muted mt-1">Try searching for “audit”, “cases”, “seats”, or “maker”</div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-active={isSelected}
                  onClick={() => void item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-wash text-navy font-medium' : 'hover:bg-wash text-ink'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-brand text-white' : 'bg-surface border border-line text-muted'
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{item.title}</span>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-navy/10 text-navy font-bold uppercase shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted truncate mt-0.5">{item.subtitle}</div>
                  </div>
                  <span className="text-[11px] text-faint font-medium uppercase tracking-wider shrink-0 hidden sm:inline">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="bg-wash border-t border-line px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span><strong className="font-mono text-ink">↑↓</strong> Move</span>
            <span><strong className="font-mono text-ink">↵</strong> Select</span>
            <span><strong className="font-mono text-ink">ESC</strong> Exit</span>
          </div>
          <div className="flex items-center gap-1.5 text-navy font-medium text-[11px] truncate">
            <Compass size={13} className="text-saffron shrink-0" /> <span className="hidden sm:inline">AICTE Sovereign Command Palette</span><span className="sm:hidden">Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
