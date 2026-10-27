import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  GraduationCap, 
  QrCode, 
  Layers, 
  Database,
  Lock,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  Shield,
  LogIn,
  LogOut,
  User,
  Globe,
  Menu,
  X,
  ArrowRight
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

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { role: 'STUDENT' as UserRole, icon: '🎓', title: language === 'HI' ? 'छात्र पोर्टल' : 'Student Portal', desc: 'APAAR ID & Digital Credential Pass' },
    { role: 'INSTITUTION' as UserRole, icon: '🏛️', title: language === 'HI' ? 'संस्थान पोर्टल' : 'Institution Portal', desc: 'College Registrars & Nodal Admission Desk' },
    { role: 'VERIFIER' as UserRole, icon: '🔍', title: language === 'HI' ? 'अधिकृत सत्यापनकर्ता' : 'Authorized Verifier', desc: 'Employer Background Check & Consent Query' },
    { role: 'AICTE_OFFICER' as UserRole, icon: '⚖️', title: language === 'HI' ? 'एआईसीटीई अधिकारी' : 'AICTE Officer Command', desc: 'Regional Directorate & Quota Audit Desk' },
    { role: 'AICTE_SUPER_ADMIN' as UserRole, icon: '🛡️', title: language === 'HI' ? 'सुपर एडमिन' : 'Super Admin Gateway', desc: 'National Oversight & System Telemetry' },
  ];

  return (
    <header className="sticky top-0 z-50 transition-colors shadow-sm font-sans w-full">
      {/* 1. TOP TRI-COLOR ACCENT LINE */}
      <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808]" />

      {/* 2. TOP META STRIP (Clean & Full Width) */}
      <div className="bg-[#0b1b3d] text-white px-3 sm:px-6 lg:px-8 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium flex items-center justify-between border-b border-blue-950 w-full">
        {/* Left: Desktop timestamp / Mobile minimal status */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="hidden sm:inline">{currentDateStr}</span>
          <span className="hidden sm:inline">|</span>
          <span className="inline sm:hidden flex items-center space-x-1 font-bold text-amber-300">
            <span>🇮🇳</span>
            <span>AICTE</span>
          </span>
          <span className="hidden md:inline">
            Smart Automation • SIH26263 • AICTE Regulation Bureau
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Active Session Info */}
          {isAuthenticated && currentUserRole && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-mono text-[9px] sm:text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="truncate max-w-[120px] sm:max-w-none">{currentUserRole} ACTIVE</span>
            </div>
          )}

          {/* Language Toggle Hindi <-> English */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center space-x-1 px-2 py-0.5 rounded-md border border-blue-800 bg-blue-950/70 hover:bg-blue-900 text-slate-200 text-[10px] sm:text-[11px] font-bold cursor-pointer transition-colors"
            title="Toggle Hindi/English Language"
          >
            <Globe className="w-3 h-3 text-amber-400" />
            <span>{language === 'HI' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1 rounded-md border border-blue-800 bg-blue-950/70 hover:bg-blue-900 text-amber-400 cursor-pointer transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Logout if authenticated */}
          {isAuthenticated && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px] sm:text-[11px] transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t.logout}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. OFFICIAL HEADER WITH AICTE SEAL & UNIFIED LOGIN DROPDOWN */}
      <div className="dark:bg-[#0b1120] bg-white border-b dark:border-slate-800 border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-colors w-full">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Logo & Emblem */}
          <div 
            onClick={() => onSelectNavPage('HOME')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer group select-none min-w-0"
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
                <h1 className="text-xs sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight font-serif truncate">
                  {t.councilHindi}
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase shrink-0">
                  {t.regulationBureau}
                </span>
              </div>
              <h2 className="text-[11px] sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
                {t.councilEnglish}
              </h2>
              <p className="hidden sm:block text-[10px] text-slate-500 font-medium truncate">
                {t.deptName}
              </p>
            </div>
          </div>

          {/* Desktop Right: Unified Portal Login with Dropdown + Verify Shortcut */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Direct Public Verify Shortcut */}
            <button
              onClick={() => {
                onSelectRole('PUBLIC_VERIFY');
                onSelectNavPage('PORTALS');
              }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t.verifyApaarId}</span>
            </button>

            {/* UNIFIED LOGIN DROPDOWN BUTTON (Replaces all cluttered login buttons) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLoginDropdownOpen(prev => !prev)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#0B2559] hover:bg-[#113880] text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{language === 'HI' ? 'लॉगिन पोर्टल' : 'Portal Login'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Login Dropdown Menu */}
              {loginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl dark:bg-slate-900 bg-white border-2 dark:border-slate-700 border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b dark:border-slate-800 border-slate-100 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Select Access Level
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Sign in to your designated portal
                    </span>
                  </div>

                  <div className="space-y-1">
                    {loginOptions.map((opt) => (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => handlePortalNavigation(opt.role)}
                        className="w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg shrink-0">{opt.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                              {opt.title}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                              {opt.desc}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t dark:border-slate-800 border-slate-100 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>Encrypted TLS 1.3</span>
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">2FA Ready</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex lg:hidden items-center shrink-0">
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="p-2 rounded-lg border dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-100 text-slate-800 dark:text-slate-200 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SOLID NAVY MENU RIBBON (Clean Educational Navigation without duplicate login clutter) */}
      <div className="hidden lg:block bg-[#0b2559] text-white px-4 sm:px-6 lg:px-8 border-y border-blue-900 shadow-inner w-full">
        <div className="w-full flex items-center justify-between">
          <nav className="flex items-center space-x-1 text-xs font-bold">
            <button
              onClick={() => onSelectNavPage('HOME')}
              className={`px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'HOME'
                  ? 'bg-[#15469e] text-white shadow-inner font-extrabold'
                  : 'text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
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
              className="px-4 py-2.5 text-slate-200 hover:bg-[#113880] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'HI' ? 'प्रक्रिया (How It Works)' : 'How It Works'}
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
              className="px-4 py-2.5 text-slate-200 hover:bg-[#113880] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'HI' ? 'विशेषताएं (Features)' : 'Platform Features'}
            </button>

            <button
              onClick={() => onSelectNavPage('ANALYTICS')}
              className={`px-4 py-2.5 flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'ANALYTICS'
                  ? 'bg-[#15469e] text-white font-extrabold'
                  : 'text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
            >
              <span>📊 {t.analytics}</span>
            </button>

            <button
              onClick={() => onSelectNavPage('COMPLIANCE_STANDARDS')}
              className={`px-4 py-2.5 flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'COMPLIANCE_STANDARDS'
                  ? 'bg-[#15469e] text-white font-extrabold'
                  : 'text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
            >
              <span>📜 {t.aphRules}</span>
            </button>

            <button
              onClick={() => onSelectNavPage('DOCUMENTATION')}
              className={`px-4 py-2.5 flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeNavPage === 'DOCUMENTATION'
                  ? 'bg-[#15469e] text-white font-extrabold'
                  : 'text-slate-200 hover:bg-[#113880] hover:text-white'
              }`}
            >
              <span>📖 {t.docsSpec}</span>
            </button>
          </nav>

          {/* Right Ribbon Alert Counter */}
          <div className="flex items-center space-x-3 text-xs">
            {openViolationsCount > 0 && (
              <button
                onClick={() => handlePortalNavigation('AICTE_OFFICER')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
              >
                <span>⚠️ {openViolationsCount} Regulatory Alerts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b2559] text-white border-b border-blue-900 shadow-xl px-4 py-3 space-y-1 divide-y divide-blue-800/60 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1 pb-2">
            <button
              onClick={() => {
                onSelectNavPage('HOME');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-bold text-xs text-white hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span>🏠 {t.home}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('ANALYTICS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span>📊 {t.analytics}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('COMPLIANCE_STANDARDS');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span>📜 {t.aphRules}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onSelectNavPage('DOCUMENTATION');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
            >
              <span>📖 {t.docsSpec}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold px-3">Quick Login</span>
            {loginOptions.map((opt) => (
              <button
                key={opt.role}
                onClick={() => handlePortalNavigation(opt.role)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-blue-900/80 flex items-center justify-between"
              >
                <span>{opt.icon} {opt.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
