import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  GraduationCap, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Fingerprint, 
  Mail, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types';
import { authApi, tokenStore, userStore } from '../api/client';

import { Language } from '../data/translations';

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole, user?: object) => void;
  theme: 'dark' | 'light';
  language?: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialRole = 'INSTITUTION', 
  onLoginSuccess, 
  theme,
  language = 'EN',
}) => {
  const isDark = theme === 'dark';
  const isHi = language === 'HI';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  // Default to INSTITUTION role demo credentials
  const [username, setUsername] = useState('registrar@coep.ac.in');
  const [password, setPassword] = useState('Aicte@2026!');
  const [otp, setOtp] = useState('849201');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useOtpFlow, setUseOtpFlow] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Mapping frontend role → backend persona ID & demo credentials
  const roleConfigs = {
    INSTITUTION: {
      title: 'Institution / College Admin Login',
      badge: 'College Level (Single-Institution Scope)',
      icon: Building2,
      defaultUser: 'registrar@coep.ac.in',
      defaultPassword: 'Aicte@2026!',
      personaId: 'INSTITUTION_REGISTRAR',
      idFieldLabel: 'AICTE Permanent Institute ID or Official Email',
      idPlaceholder: 'e.g. 1-33249011 or registrar@coep.ac.in',
      hint: 'Only authorised Registrars/Nodal Officers can upload batch admissions.',
      color: 'blue'
    },
    AICTE_OFFICER: {
      title: 'AICTE Officer Command Desk',
      badge: 'Regional & National Regulatory Directorate',
      icon: ShieldCheck,
      defaultUser: 'aicte.maker@gov.in',
      defaultPassword: 'Aicte@2026!',
      personaId: 'AICTE_MAKER',
      idFieldLabel: 'Government Official Email (@gov.in / @aicte-india.org)',
      idPlaceholder: 'aicte.maker@gov.in',
      hint: 'Requires AICTE VPN / SSO Two-Factor Government Authentication.',
      color: 'indigo'
    },
    AICTE_SUPER_ADMIN: {
      title: 'Super-Administrator Core Sign-In',
      badge: 'Root Platform Governance & Rule Engine',
      icon: KeyRound,
      defaultUser: 'aicte.checker@gov.in',
      defaultPassword: 'Aicte@2026!',
      personaId: 'AICTE_CHECKER',
      idFieldLabel: 'Root Administrator Identity Key',
      idPlaceholder: 'aicte.checker@gov.in',
      hint: 'FIDO2 / Hardware Security Token & Cryptographic Key Enforced.',
      color: 'rose'
    },
    VERIFIER: {
      title: 'Authorized Verifier Portal Sign-In',
      badge: 'Recruiters, Background Checkers, Embassies',
      icon: UserCheck,
      defaultUser: 'verifier@tcs.com',
      defaultPassword: 'Aicte@2026!',
      personaId: 'VERIFIER',
      idFieldLabel: 'Corporate / Agency Work Email',
      idPlaceholder: 'verifier@tcs.com',
      hint: 'Subject to candidate DPDP consent validation at every lookup.',
      color: 'emerald'
    },
    STUDENT: {
      title: 'Student Sovereign Passport Login',
      badge: 'Student Self-Service Portal (DigiLocker / APAAR)',
      icon: GraduationCap,
      defaultUser: 'priya.nair@student.aicte.gov.in',
      defaultPassword: 'Aicte@2026!',
      personaId: 'STUDENT',
      idFieldLabel: '12-Digit APAAR ID or Registered Student Email',
      idPlaceholder: 'priya.nair@student.aicte.gov.in',
      hint: 'Zero Aadhaar stored. Authenticated via DigiLocker / ABC API.',
      color: 'cyan'
    }
  };

  // Sync state if initialRole changes
  React.useEffect(() => {
    if (initialRole && roleConfigs[initialRole as keyof typeof roleConfigs]) {
      setSelectedRole(initialRole);
      const cfg = roleConfigs[initialRole as keyof typeof roleConfigs];
      setUsername(cfg.defaultUser);
      setPassword(cfg.defaultPassword);
    }
  }, [initialRole]);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    if (roleConfigs[role as keyof typeof roleConfigs]) {
      const cfg = roleConfigs[role as keyof typeof roleConfigs];
      setUsername(cfg.defaultUser);
      setPassword(cfg.defaultPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const res = await authApi.login(username, password);
      tokenStore.set(res.access_token);
      userStore.set({ ...res.user, institution_id: res.user.institution_id });
      onLoginSuccess(selectedRole, res.user);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setIsSubmitting(true);
    setLoginError(null);
    const cfg = roleConfigs[selectedRole as keyof typeof roleConfigs];
    if (!cfg) return;
    try {
      const res = await authApi.quickLogin(cfg.personaId);
      tokenStore.set(res.access_token);
      userStore.set({ ...res.user, institution_id: res.user.institution_id });
      onLoginSuccess(selectedRole, res.user);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeConfig = roleConfigs[selectedRole as keyof typeof roleConfigs] || roleConfigs.INSTITUTION;
  const RoleIcon = activeConfig.icon;

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center space-x-2.5">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <strong className="block font-bold">
              {isHi ? 'भूमिका-आधारित अभिगम नियंत्रण (RBAC) अनिवार्य' : 'Role-Based Access Control Enforced'}
            </strong>
            <span>
              {isHi 
                ? 'अनुरोधित पोर्टल में प्रवेश हेतु प्रमाणीकरण आवश्यक है। प्रत्येक सत्र ऑडिट-लॉग किया जाता है।' 
                : 'You must authenticate to access the requested portal. Session is audit-logged and scoped to your organization.'}
            </span>
          </div>
        </div>

        {/* 1-Click Fast Pass Button for Judges/Presentation */}
        <button
          onClick={handleInstantDemoLogin}
          className="shrink-0 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isHi ? '1-क्लिक त्वरित डेमो लॉगिन' : '1-Click Instant Demo Login'}</span>
        </button>
      </div>

      {/* Role Selector Tabs (5 Roles) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 shadow-sm" role="tablist" aria-label="Select portal role">
        {(Object.keys(roleConfigs) as (keyof typeof roleConfigs)[]).map((r) => {
          const cfg = roleConfigs[r];
          const Icon = cfg.icon;
          const isSelected = selectedRole === r;
          return (
            <button
              key={r}
              onClick={() => handleRoleTabChange(r as UserRole)}
              className={`p-3 rounded-xl flex flex-col items-center space-y-1.5 text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="text-xs leading-tight">
                {r === 'INSTITUTION' && (isHi ? 'कॉलेज व्यवस्थापक' : 'College Admin')}
                {r === 'AICTE_OFFICER' && (isHi ? 'एआईसीटीई अधिकारी' : 'AICTE Officer')}
                {r === 'AICTE_SUPER_ADMIN' && (isHi ? 'सुपर एडमिन' : 'Super-Admin')}
                {r === 'VERIFIER' && (isHi ? 'सत्यापनकर्ता' : 'Authorized Verifier')}
                {r === 'STUDENT' && (isHi ? 'छात्र पासपोर्ट' : 'Student Passport')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Login Form Card */}
      <div className="dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b dark:border-slate-800 border-slate-200 gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 flex items-center justify-center shrink-0">
              <img 
                src="/aicte-logo.png" 
                alt="AICTE Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm" 
              />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                {activeConfig.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {activeConfig.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setUsername(activeConfig.defaultUser);
                setPassword(activeConfig.defaultPassword);
                setLoginError(null);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border font-mono font-semibold dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {isHi ? 'डेमो क्रेडेंशियल स्वतः भरें' : 'Auto-fill Demo Credentials'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 max-w-xl mx-auto">
          {/* Error Banner */}
          {loginError && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{loginError}</span>
            </div>
          )}
          {/* Identity/Username Field */}
          <div>
            <label htmlFor="login-username" className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {activeConfig.idFieldLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                id="login-username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeConfig.idPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-medium dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 dark:focus:border-blue-400 font-mono transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1" id="login-username-hint">{activeConfig.hint}</p>
          </div>

          {/* Password or OTP Flow Toggle */}
          {!useOtpFlow ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Secure Password / Parichay SSO Key
                </label>
                <button
                  type="button"
                  onClick={() => setUseOtpFlow(true)}
                  className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in with Mobile OTP instead
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  className="w-full pl-10 pr-10 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-medium dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 dark:focus:border-blue-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-otp" className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Government Two-Factor OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setUseOtpFlow(false)}
                  className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in with Password instead
                </button>
              </div>
              <div className="relative">
                <Fingerprint className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" aria-hidden="true" />
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP code"
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-bold dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 dark:focus:border-blue-400 tracking-widest transition-colors"
                />
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                OTP sent to registered mobile/email (Simulated: 849201)
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-75"
          >
            {isSubmitting ? (
              <span>{isHi ? 'सत्र टोकन प्रमाणित किया जा रहा है...' : 'Authenticating Session Token...'}</span>
            ) : (
              <>
                <span>{isHi ? 'लॉगिन करें व पोर्टल खोलें' : `Sign In & Open ${activeConfig.title.split(' ')[0]} Console`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Security & Regulatory Footnote */}
          <div className="pt-4 border-t dark:border-slate-800 border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 Certified • 256-Bit SHA Hashing</span>
            </span>
            <span className="font-mono">IP & Geo-Session Logged</span>
          </div>
        </form>
      </div>
    </div>
  );
};
