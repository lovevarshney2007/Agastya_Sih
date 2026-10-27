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

interface LoginPageProps {
  initialRole?: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  theme: 'dark' | 'light';
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialRole = 'INSTITUTION', 
  onLoginSuccess, 
  theme 
}) => {
  const isDark = theme === 'dark';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState('registrar@diet.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState('849201');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useOtpFlow, setUseOtpFlow] = useState(false);

  const roleConfigs = {
    INSTITUTION: {
      title: 'Institution / College Admin Login',
      badge: 'College Level (Single-Institution Scope)',
      icon: Building2,
      defaultUser: 'registrar@diet.ac.in',
      idFieldLabel: 'AICTE Permanent Institute ID or Official Email',
      idPlaceholder: 'e.g. 1-33249011 or registrar@diet.ac.in',
      hint: 'Only authorised Registrars/Nodal Officers can upload batch admissions.',
      color: 'blue'
    },
    AICTE_OFFICER: {
      title: 'AICTE Officer Command Desk',
      badge: 'Regional & National Regulatory Directorate',
      icon: ShieldCheck,
      defaultUser: 'dr.skmurthy@aicte-india.org',
      idFieldLabel: 'Government Official Email (@gov.in / @aicte-india.org)',
      idPlaceholder: 'officer@aicte-india.org',
      hint: 'Requires AICTE VPN / SSO Two-Factor Government Authentication.',
      color: 'indigo'
    },
    AICTE_SUPER_ADMIN: {
      title: 'Super-Administrator Core Sign-In',
      badge: 'Root Platform Governance & Rule Engine',
      icon: KeyRound,
      defaultUser: 'superadmin@aicte-ledger.gov.in',
      idFieldLabel: 'Root Administrator Identity Key',
      idPlaceholder: 'superadmin@aicte-ledger.gov.in',
      hint: 'FIDO2 / Hardware Security Token & Cryptographic Key Enforced.',
      color: 'rose'
    },
    VERIFIER: {
      title: 'Authorized Verifier Portal Sign-In',
      badge: 'Recruiters, Background Checkers, Embassies',
      icon: UserCheck,
      defaultUser: 'verifier.tcs@tcs.com',
      idFieldLabel: 'Corporate / Agency Work Email',
      idPlaceholder: 'hr.background@company.com',
      hint: 'Subject to candidate DPDP consent validation at every lookup.',
      color: 'emerald'
    },
    STUDENT: {
      title: 'Student Sovereign Passport Login',
      badge: 'Student Self-Service Portal (DigiLocker / APAAR)',
      icon: GraduationCap,
      defaultUser: '892019482019',
      idFieldLabel: '12-Digit APAAR ID or Linked Mobile OTP',
      idPlaceholder: '12-digit APAAR ID (e.g. 892019482019)',
      hint: 'Zero Aadhaar stored. Authenticated via DigiLocker / ABC API.',
      color: 'cyan'
    }
  };

  // Sync state if initialRole changes
  React.useEffect(() => {
    if (initialRole && roleConfigs[initialRole as keyof typeof roleConfigs]) {
      setSelectedRole(initialRole);
      setUsername(roleConfigs[initialRole as keyof typeof roleConfigs].defaultUser);
    }
  }, [initialRole]);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (roleConfigs[role as keyof typeof roleConfigs]) {
      setUsername(roleConfigs[role as keyof typeof roleConfigs].defaultUser);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(selectedRole);
    }, 400);
  };

  const handleInstantDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(selectedRole);
    }, 300);
  };

  const activeConfig = roleConfigs[selectedRole as keyof typeof roleConfigs] || roleConfigs.INSTITUTION;
  const RoleIcon = activeConfig.icon;

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center space-x-2.5">
          <span className="text-lg">🔐</span>
          <div>
            <strong className="block font-bold">Role-Based Access Control Enforced</strong>
            <span>You must authenticate to access the requested portal. Session is audit-logged and scoped to your organization.</span>
          </div>
        </div>

        {/* 1-Click Fast Pass Button for Judges/Presentation */}
        <button
          onClick={handleInstantDemoLogin}
          className="shrink-0 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Instant Demo Login</span>
        </button>
      </div>

      {/* Role Selector Tabs (5 Roles) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 rounded-2xl dark:bg-slate-900/90 bg-white border dark:border-slate-800 border-slate-200 shadow-sm">
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
                {r === 'INSTITUTION' && 'College Admin'}
                {r === 'AICTE_OFFICER' && 'AICTE Officer'}
                {r === 'AICTE_SUPER_ADMIN' && 'Super-Admin'}
                {r === 'VERIFIER' && 'Authorized Verifier'}
                {r === 'STUDENT' && 'Student Passport'}
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
                setPassword('••••••••••••');
              }}
              className="text-xs px-3 py-1.5 rounded-lg border font-mono font-semibold dark:bg-slate-800 bg-slate-100 dark:border-slate-700 border-slate-300 text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Auto-fill Credentials
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 max-w-xl mx-auto">
          {/* Identity/Username Field */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {activeConfig.idFieldLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeConfig.idPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-medium dark:text-white text-slate-900 focus:outline-none focus:border-blue-700 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{activeConfig.hint}</p>
          </div>

          {/* Password or OTP Flow Toggle */}
          {!useOtpFlow ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
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
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  className="w-full pl-10 pr-10 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-medium dark:text-white text-slate-900 focus:outline-none focus:border-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
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
                <Fingerprint className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit OTP code"
                  className="w-full pl-10 pr-4 py-2.5 dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl text-xs sm:text-sm font-bold dark:text-white text-slate-900 font-mono focus:outline-none focus:border-blue-700 tracking-widest"
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
              <span>Authenticating Session Token...</span>
            ) : (
              <>
                <span>Sign In & Open {activeConfig.title.split(' ')[0]} Console</span>
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
