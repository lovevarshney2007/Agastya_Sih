import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { UserRole, MainNavPage } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onSelectNavPage: (page: MainNavPage) => void;
  theme: 'dark' | 'light';
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onSelectRole, 
  onSelectNavPage, 
  theme,
  language
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[language];
  const [searchApaarInput, setSearchApaarInput] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchApaarInput) {
      onSelectNavPage('PORTALS');
      onSelectRole('PUBLIC_VERIFY');
    }
  };

  const handlePresetClick = (val: string) => {
    setSearchApaarInput(val);
    onSelectNavPage('PORTALS');
    onSelectRole('PUBLIC_VERIFY');
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-2 px-1 sm:px-0 font-sans">
      {/* 1. HERO BANNER CARD */}
      <section className="text-center pt-4 sm:pt-8 pb-2 space-y-3 sm:space-y-4 max-w-4xl mx-auto">
        {/* Pill Tag */}
        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide font-mono dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-300 shadow-xs max-w-full truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="text-[#0E2F6D] dark:text-blue-400 font-extrabold uppercase shrink-0">
            {t.pillTag}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-700 dark:text-slate-300 truncate hidden sm:inline">
            {t.pillDesc}
          </span>
        </div>

        {/* Big Navy Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#0E2F6D] dark:text-blue-400 font-sans leading-tight px-2">
          {t.heroHeadline}
        </h1>

        {/* Saffron Sub-Headline */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#D97706] tracking-tight px-2">
          {t.heroSubHeadline}
        </h2>

        {/* Paragraph */}
        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium px-2">
          {t.heroParagraph}
        </p>
      </section>

      {/* 2. THREE FEATURE SHOWCASE CARDS (Differentiated from Top Navigation Menu) */}
      <section className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#0b2559] dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{language === 'HI' ? 'मुख्य मंच स्तंभ एवं कार्यक्षमता' : 'Core Architecture Pillars & Ecosystem'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'HI' ? 'एआईसीटीई राष्ट्रीय अपार ढांचे की प्रमुख सेवाएं और तकनीकी अवलोकन' : 'Key technical capabilities & automated regulatory pipelines'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* PILLAR 1: Student Sovereign Identity */}
          <div 
            onClick={() => {
              onSelectRole('STUDENT');
            }}
            className="rounded-2xl border p-5 sm:p-6 flex flex-col justify-between dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-xl">
                  🎓
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  DPDP ACT 2023
                </span>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {language === 'HI' ? 'छात्र डिजिटल पासपोर्ट' : 'Student Digital Passport'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {language === 'HI' 
                    ? '12-अंकीय अपार आईडी सत्यापन, डिजिलॉकर से जुड़े शैक्षणिक साख पत्र, सहमति नियंत्रण (Sovereign Consent) और क्यूआर कोड युक्त प्रामाणिक प्रमाण पत्र।'
                    : '12-digit APAAR verification, ABC academic credit passport, privacy-first sovereign consent toggle, and cryptographically signed QR certificate.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Zero-Knowledge Consent Architecture</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Scannable Tamper-Evident QR</span>
                </div>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center space-x-1 group-hover:underline">
                <span>{language === 'HI' ? 'छात्र पोर्टल पर जाएं' : 'Open Student Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Direct APAAR</span>
            </div>
          </div>

          {/* PILLAR 2: College Admission & Quota Audit */}
          <div 
            onClick={() => {
              onSelectRole('INSTITUTION');
            }}
            className="rounded-2xl border-2 border-amber-400 dark:border-amber-500/80 p-5 sm:p-6 flex flex-col justify-between dark:bg-slate-900 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl">
                  🏛️
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  REAL-TIME AUDIT
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  {language === 'HI' ? 'संस्थान प्रवेश एवं क्षमता ऑडिट' : 'Intake & Quota Engine'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {language === 'HI'
                    ? 'CSV/Excel बैच डेटा अपलोड, 10% सुपरन्यूमरेरी (TFW) कोटा कैपिंग, और एक साथ कई कॉलेजों में अनधिकृत दोहरे दाखिलों की तत्काल रोकथाम।'
                    : 'Automated CSV/XLSX batch ingestion, rule validation engine (VAL_ERR_LEN_12), 10% supernumerary quota tracking, and instant duplicate alerts.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Sanctioned Capacity Guardrails</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Cross-Institution Collision Checks</span>
                </div>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1 group-hover:underline">
                <span>{language === 'HI' ? 'कॉलेज एडमिन कंसोल' : 'Manage College Admissions'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Intake Audit</span>
            </div>
          </div>

          {/* PILLAR 3: AICTE Pan-India Super Admin */}
          <div 
            onClick={() => {
              onSelectRole('AICTE_SUPER_ADMIN');
            }}
            className="rounded-2xl border p-5 sm:p-6 flex flex-col justify-between dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group sm:col-span-2 lg:col-span-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xl">
                  🛡️
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  NATIONAL OVERSIGHT
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {language === 'HI' ? 'अखिल भारतीय केंद्रीय कमान' : 'National Command & Audit'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {language === 'HI'
                    ? '28 राज्यों और केंद्र शासित प्रदेशों का लाइव टेलीमेट्री डेटा, काफ्का रिस्क इंजन इवेंट स्ट्रीम्स, और जेपीए लेजर पर आधारित छेड़छाड़-मुक्त ऑडिट ट्रेल्स।'
                    : 'Pan-India state-wise telemetry, Spring Kafka duplicate anomaly streaming, tamper-evident audit ledger, and official regulatory report generation.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>State-Wise Progress Telemetry</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Kafka Duplicate Anomaly Stream</span>
                </div>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1 group-hover:underline">
                <span>{language === 'HI' ? 'राष्ट्रीय डैशबोर्ड खोलें' : 'Access Super Admin'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">Pan-India</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CENTER SEARCH BAR & VERIFICATION WIDGET */}
      <section className="max-w-2xl mx-auto dark:bg-slate-900 bg-white border dark:border-slate-800 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center justify-center space-x-1.5">
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{language === 'HI' ? 'सार्वजनिक अपार आईडी त्वरित खोज एवं सत्यापन' : 'Public APAAR ID Instant Verification'}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'HI' ? 'बिना किसी लॉगिन के तुरंत छात्र की वैधता की पुष्टि करें' : 'Verify student authenticity directly with privacy-safe zero disclosure'}
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchApaarInput}
              onChange={(e) => setSearchApaarInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-50 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#0b2559] hover:bg-[#113880] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>{t.verifyNow}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Test Presets */}
        <div className="pt-2 border-t dark:border-slate-800 border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-500 font-mono text-[10px] mr-1">
              {t.quickPresets}
            </span>
            {[
              { id: '123456789012', label: 'Valid Student', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
              { id: '100000000013', label: 'Over-Quota', color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
              { id: '100000000005', label: 'Cross-State Duplicate', color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
              { id: '100000000012', label: 'Blocked Seat', color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
              { id: 'APAAR12345678', label: 'Sample APAAR', color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.id)}
                className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 ${preset.color}`}
                title={`Test ${preset.label} (${preset.id})`}
              >
                <span>{preset.id}</span>
                <span className="ml-1 opacity-70">({preset.label})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECURITY & REGULATORY TRUST FOOTNOTE */}
      <section className="max-w-4xl mx-auto pt-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-lg">🔒</span>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">AES-256 Storage</p>
            <p className="text-[10px] text-slate-500">Aadhaar Privacy Assured</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-lg">⚡</span>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">Kafka Risk Pipeline</p>
            <p className="text-[10px] text-slate-500">Real-time Collision Engine</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-lg">📜</span>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">Immutable JPA Ledger</p>
            <p className="text-[10px] text-slate-500">Full Audit Traceability</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <span className="text-lg">🇮🇳</span>
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1">AICTE Regulation</p>
            <p className="text-[10px] text-slate-500">All 28 States & UTs Active</p>
          </div>
        </div>
      </section>
    </div>
  );
};
