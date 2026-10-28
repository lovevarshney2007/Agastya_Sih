import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  GraduationCap, 
  QrCode, 
  Lock,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Globe,
  Menu,
  X,
  ArrowRight,
  Scale,
  Home,
  BarChart3,
  FileText,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { UserRole, MainNavPage } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeNavPage: MainNavPage;
  onSelectNavPage: (page: MainNavPage) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  openViolationsCount: number;
  isAuthenticated: boolean;
  currentUserRole: UserRole | null;
  onLogout: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentRole, 
  onSelectRole, 
  activeNavPage,
  onSelectNavPage,
  theme, 
  onToggleTheme, 
  openViolationsCount,
  isAuthenticated,
  currentUserRole,
  onLogout,
  language,
  onToggleLanguage
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstDrawerItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
      const day = language === 'HI' ? daysHi[now.getDay()] : daysEn[now.getDay()];
      const d = String(now.getDate()).padStart(2, '0');
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const y = now.getFullYear();
      let hrs = now.getHours();
      const ampm = hrs >= 12 ? (language === 'HI' ? 'अपराह्न' : 'pm') : (language === 'HI' ? 'पूर्वाह्न' : 'am');
      hrs = hrs % 12 || 12;
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentDateStr(`${day}, ${d}/${m}/${y}, ${hrs}:${mins}:${secs} ${ampm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  // Close dropdown on outside click — include trigger button in ref
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for dropdown menu
  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!loginDropdownOpen) return;
    const items = dropdownMenuRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');
    if (!items || items.length === 0) return;
    const currentIndex = Array.from(items).findIndex(el => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === 'Escape') {
      setLoginDropdownOpen(false);
    }
  }, [loginDropdownOpen]);

  // Focus management for mobile drawer
  useEffect(() => {
    if (mobileMenuOpen && firstDrawerItemRef.current) {
      firstDrawerItemRef.current.focus();
    }
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          hamburgerRef.current?.focus();
        }
        if (loginDropdownOpen) {
          setLoginDropdownOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, loginDropdownOpen]);

  const handlePortalNavigation = (targetRole: UserRole) => {
    setMobileMenuOpen(false);
    setLoginDropdownOpen(false);
    if (isAuthenticated && currentUserRole === targetRole) {
      onSelectRole(targetRole);
      onSelectNavPage('PORTALS');
    } else {
      onSelectRole(targetRole);
      onSelectNavPage('LOGIN');
    }
  };

  const loginOptions = [
    { 
      role: 'STUDENT' as UserRole, 
      Icon: GraduationCap, 
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800', 
      title: language === 'HI' ? 'छात्र पोर्टल' : 'Student Portal', 
      desc: 'APAAR ID & Digital Credential Pass' 
    },
    { 
      role: 'INSTITUTION' as UserRole, 
      Icon: Building2, 
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800', 
      title: language === 'HI' ? 'संस्थान पोर्टल' : 'Institution Portal', 
      desc: 'College Registrars & Nodal Admission Desk' 
    },
    { 
      role: 'VERIFIER' as UserRole, 
      Icon: UserCheck, 
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800', 
      title: language === 'HI' ? 'अधिकृत सत्यापनकर्ता' : 'Authorized Verifier', 
      desc: 'Employer Background Check & Consent Query' 
    },
    { 
      role: 'AICTE_OFFICER' as UserRole, 
      Icon: Scale, 
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800', 
      title: language === 'HI' ? 'एआईसीटीई अधिकारी' : 'AICTE Officer Command', 
      desc: 'Regional Directorate & Quota Audit Desk' 
    },
    { 
      role: 'AICTE_SUPER_ADMIN' as UserRole, 
      Icon: ShieldCheck, 
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800', 
      title: language === 'HI' ? 'सुपर एडमिन' : 'Super Admin Gateway', 
      desc: 'National Oversight & System Telemetry' 
    },
  ];

  // Role display names for authenticated header
  const roleDisplayName: Record<string, string> = {
    INSTITUTION: 'COEP Registrar',
    AICTE_OFFICER: 'AICTE Maker',
    AICTE_SUPER_ADMIN: 'AICTE Checker',
    VERIFIER: 'Verifier (TCS)',
    STUDENT: 'Priya Nair',
  };

  // Only show regulatory alerts to officers/admins
  const canSeeAlerts = currentUserRole === 'AICTE_OFFICER' || currentUserRole === 'AICTE_SUPER_ADMIN';

  const isPortalOrLoginActive = activeNavPage === 'PORTALS' || activeNavPage === 'LOGIN';

  return (
    <header className="sticky top-0 z-50 transition-colors shadow-sm font-sans w-full" role="banner">
      {/* Skip Navigation — visible only on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-700 focus:text-white focus:rounded focus:text-sm focus:font-bold"
      >
        {language === 'HI' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
      </a>

      {/* 1. TOP TRI-COLOR ACCENT LINE */}
      <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" aria-hidden="true" />

      {/* 2. TOP META STRIP */}
      <div className="bg-[#0b1b3d] text-white px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium flex items-center justify-between border-b border-blue-950 w-full">
        {/* Left: Timestamp */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="hidden sm:inline" aria-live="polite" aria-atomic="true">{currentDateStr}</span>
          <span className="hidden sm:inline" aria-hidden="true">|</span>
          <span className="inline sm:hidden font-bold text-amber-300">AICTE</span>
          <span className="hidden md:inline">
            Smart Automation • SIH26263 • AICTE Regulation Bureau
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Active Session Info — no logout here (avoid duplicate) */}
          {isAuthenticated && currentUserRole && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-[9px] sm:text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              <span className="truncate max-w-[90px] sm:max-w-[130px]">{currentUserRole}</span>
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center space-x-1 px-2 py-0.5 rounded border border-blue-800 bg-blue-950/70 hover:bg-blue-900 text-slate-200 text-[10px] sm:text-[11px] font-bold cursor-pointer transition-colors"
            aria-label={language === 'HI' ? 'Switch to English' : 'हिंदी में बदलें'}
          >
            <Globe className="w-3 h-3 text-amber-400" aria-hidden="true" />
            <span>{language === 'HI' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1 rounded border border-blue-800 bg-blue-950/70 hover:bg-blue-900 text-amber-400 cursor-pointer transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* 3. OFFICIAL HEADER WITH AICTE SEAL */}
      <div className="dark:bg-[#0b1120] bg-white border-b dark:border-slate-800 border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-colors w-full">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Logo & Emblem */}
          <div 
            onClick={() => onSelectNavPage('HOME')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none min-w-0"
            role="link"
            tabIndex={0}
            aria-label="Go to home page"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNavPage('HOME'); } }}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
              <img 
                src="/aicte-logo.png" 
                alt="AICTE Official Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="text-xs sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight font-serif truncate">
                  {t.councilHindi}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase shrink-0">
                  {t.regulationBureau}
                </span>
              </div>
              <p className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                {t.councilEnglish}
              </p>
              <p className="hidden sm:block text-[10px] text-slate-500 font-medium truncate">
                {t.deptName}
              </p>
            </div>
          </div>

          {/* Desktop Right: Portal Login / User Info */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Public Verify Shortcut */}
            <button
              onClick={() => {
                onSelectRole('PUBLIC_VERIFY');
                onSelectNavPage('PORTALS');
              }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Verify APAAR ID publicly"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>{t.verifyApaarId}</span>
            </button>

            {/* Authenticated User Controls */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentUserRole) onSelectRole(currentUserRole);
                    onSelectNavPage('PORTALS');
                  }}
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs font-bold text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Open your portal"
                >
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span className="truncate max-w-[130px] font-mono">
                    {currentUserRole ? (roleDisplayName[currentUserRole] || currentUserRole) : 'Active Portal'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  aria-label="Log out of your session"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>{language === 'HI' ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated: Login Dropdown */
              <div className="relative" ref={dropdownRef} onKeyDown={handleDropdownKeyDown}>
                <button
                  type="button"
                  id="portal-login-btn"
                  onClick={() => setLoginDropdownOpen(prev => !prev)}
                  className="px-4 py-2 rounded-lg bg-[#0B2559] hover:bg-[#113880] text-white text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer"
                  aria-haspopup="menu"
                  aria-expanded={loginDropdownOpen}
                  aria-controls="portal-login-menu"
                >
                  <LogIn className="w-4 h-4 text-amber-300" aria-hidden="true" />
                  <span>{language === 'HI' ? 'लॉगिन पोर्टल' : 'Portal Login'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${loginDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {/* Login Dropdown Menu */}
                {loginDropdownOpen && (
                  <div
                    id="portal-login-menu"
                    ref={dropdownMenuRef}
                    role="menu"
                    aria-labelledby="portal-login-btn"
                    className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-200 shadow-xl p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b dark:border-slate-800 border-slate-100 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                        Select Access Level
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Sign in to your designated portal
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {loginOptions.map((opt) => (
                        <button
                          key={opt.role}
                          type="button"
                          role="menuitem"
                          onClick={() => handlePortalNavigation(opt.role)}
                          className="w-full p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${opt.color}`} aria-hidden="true">
                              <opt.Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                                {opt.title}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                                {opt.desc}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0 ml-2" aria-hidden="true" />
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 mt-1 border-t dark:border-slate-800 border-slate-100 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                        <span>Encrypted TLS 1.3</span>
                      </span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">2FA Ready</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <div className="flex lg:hidden items-center shrink-0">
              <button
                ref={hamburgerRef}
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2 rounded-lg border dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-100 text-slate-800 dark:text-slate-200 cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DESKTOP NAV RIBBON */}
      <div className="hidden lg:block bg-[#0b2559] text-white px-4 sm:px-6 lg:px-8 border-y border-blue-900 shadow-inner w-full" role="navigation" aria-label="Main navigation">
        <div className="w-full flex items-center justify-between">
          <nav className="flex items-center text-xs font-bold">
            <button
              onClick={() => onSelectNavPage('HOME')}
              className={`px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                activeNavPage === 'HOME'
                  ? 'border-amber-400 text-white bg-[#15469e]/60'
                  : 'border-transparent text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
              aria-current={activeNavPage === 'HOME' ? 'page' : undefined}
            >
              {t.home}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onSelectNavPage('HOME');
                }
              }}
              className="px-4 py-2.5 border-b-2 border-transparent text-slate-200 hover:bg-[#113880] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'HI' ? 'प्रक्रिया' : 'How It Works'}
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('platform-capabilities-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onSelectNavPage('HOME');
                }
              }}
              className="px-4 py-2.5 border-b-2 border-transparent text-slate-200 hover:bg-[#113880] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'HI' ? 'विशेषताएं' : 'Features'}
            </button>

            <button
              onClick={() => onSelectNavPage('ANALYTICS')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'ANALYTICS'
                  ? 'border-amber-400 text-white bg-[#15469e]/60'
                  : 'border-transparent text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
              aria-current={activeNavPage === 'ANALYTICS' ? 'page' : undefined}
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.analytics}</span>
            </button>

            <button
              onClick={() => onSelectNavPage('COMPLIANCE_STANDARDS')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'COMPLIANCE_STANDARDS'
                  ? 'border-amber-400 text-white bg-[#15469e]/60'
                  : 'border-transparent text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
              aria-current={activeNavPage === 'COMPLIANCE_STANDARDS' ? 'page' : undefined}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.aphRules}</span>
            </button>

            <button
              onClick={() => onSelectNavPage('DOCUMENTATION')}
              className={`px-4 py-2.5 flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'DOCUMENTATION'
                  ? 'border-amber-400 text-white bg-[#15469e]/60'
                  : 'border-transparent text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
              aria-current={activeNavPage === 'DOCUMENTATION' ? 'page' : undefined}
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.docsSpec}</span>
            </button>

            {/* Portal active indicator */}
            {isPortalOrLoginActive && (
              <button
                onClick={() => {
                  if (currentUserRole) onSelectRole(currentUserRole);
                  onSelectNavPage('PORTALS');
                }}
                className="px-4 py-2.5 flex items-center space-x-1.5 border-b-2 border-amber-400 text-white bg-[#15469e]/60 cursor-pointer whitespace-nowrap"
                aria-current="page"
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isAuthenticated ? (language === 'HI' ? 'पोर्टल' : 'My Portal') : (language === 'HI' ? 'लॉगिन' : 'Login')}</span>
              </button>
            )}
          </nav>

          {/* Right Ribbon: Regulatory Alerts (role-gated) */}
          <div className="flex items-center space-x-3 text-xs">
            {canSeeAlerts && openViolationsCount > 0 && (
              <button
                onClick={() => handlePortalNavigation('AICTE_OFFICER')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
                aria-label={`${openViolationsCount} regulatory alerts pending`}
              >
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{openViolationsCount} Regulatory Alerts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="lg:hidden bg-[#0b2559] text-white border-b border-blue-900 shadow-xl px-4 py-3 space-y-1 divide-y divide-blue-800/60"
        >
          {/* Navigation Links — always shown */}
          <div className="space-y-0.5 pb-3">
            <button
              ref={firstDrawerItemRef}
              onClick={() => {
                onSelectNavPage('HOME');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg font-bold text-xs text-white hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-blue-300" aria-hidden="true" />
                <span>{t.home}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('ANALYTICS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-300" aria-hidden="true" />
                <span>{t.analytics}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('COMPLIANCE_STANDARDS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-300" aria-hidden="true" />
                <span>{t.aphRules}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('DOCUMENTATION');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-300" aria-hidden="true" />
                <span>{t.docsSpec}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>

            <button
              onClick={() => {
                onSelectRole('PUBLIC_VERIFY');
                onSelectNavPage('PORTALS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-blue-300" aria-hidden="true" />
                <span>{t.verifyApaarId}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>
          </div>

          {/* Portal / Auth Actions */}
          {isAuthenticated ? (
            <div className="pt-3 space-y-2">
              <button
                onClick={() => {
                  if (currentUserRole) onSelectRole(currentUserRole);
                  onSelectNavPage('PORTALS');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-800 hover:bg-blue-700 flex items-center justify-between"
              >
                <span>{language === 'HI' ? 'सक्रिय पोर्टल खोलें' : 'Open Active Portal'}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{language === 'HI' ? 'लॉगआउट करें' : 'Log Out'}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-3 block pb-1">Quick Login</span>
              {loginOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => handlePortalNavigation(opt.role)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
                >
                  <span className="flex items-center space-x-2.5">
                    <opt.Icon className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
                    <span>{opt.title}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
