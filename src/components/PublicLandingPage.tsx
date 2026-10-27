import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Lock, 
  FileSpreadsheet, 
  QrCode, 
  Layers, 
  Database, 
  Users, 
  BookOpen, 
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Activity,
  Check,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Info,
  Calendar,
  Award
} from 'lucide-react';
import { UserRole, MainNavPage, StudentRecord } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';
import { PLATFORM_ANNOUNCEMENTS, PLATFORM_SERVICE_STATUS, PLATFORM_FAQS } from '../data/announcementsData';
import { HeroCarousel } from './HeroCarousel';

interface PublicLandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onSelectNavPage: (page: MainNavPage) => void;
  students: StudentRecord[];
  theme: 'dark' | 'light';
  language: Language;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onSelectRole,
  onSelectNavPage,
  students,
  theme: _theme,
  language
}) => {
  const isHi = language === 'HI';
  const _t = TRANSLATIONS[language];

  // Public quick verification state
  const [apaarQuery, setApaarQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState<StudentRecord | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apaarQuery.trim()) return;

    setIsVerifying(true);
    setHasChecked(true);

    setTimeout(() => {
      const clean = apaarQuery.replace(/\s+/g, '');
      const found = students.find(s => s.apaarId === clean || s.digitalCredentialId === clean);
      setVerifyResult(found || null);
      setIsVerifying(false);
    }, 300);
  };

  const handlePresetSelect = (id: string) => {
    setApaarQuery(id);
    setIsVerifying(true);
    setHasChecked(true);
    setTimeout(() => {
      const clean = id.replace(/\s+/g, '');
      const found = students.find(s => s.apaarId === clean || s.digitalCredentialId === clean);
      setVerifyResult(found || null);
      setIsVerifying(false);
    }, 200);
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SLIDING HERO CAROUSEL BANNER (Full Width Match)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <HeroCarousel 
        onSelectRole={onSelectRole}
        onSelectNavPage={onSelectNavPage}
        language={language}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. REPUTATION & TRUST STRIP WITH MEDIA BADGES                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-6 rounded-2xl border dark:border-slate-800 border-slate-200 dark:bg-slate-900/60 bg-white shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x dark:divide-slate-800 divide-slate-100">
            <div className="pt-2 md:pt-0 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">
                12-Digit
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                Standard APAAR ID Schema
              </span>
              <span className="text-[10px] text-slate-500">Universal Student Registry</span>
            </div>

            <div className="pt-2 md:pt-0 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                Zero Leakage
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                Aadhaar Privacy Assured
              </span>
              <span className="text-[10px] text-slate-500">DPDP Act 2023 Compliant</span>
            </div>

            <div className="pt-2 md:pt-0 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
                10% Cap
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                Supernumerary Quota Ceiling
              </span>
              <span className="text-[10px] text-slate-500">APH Regulatory Guardrails</span>
            </div>

            <div className="pt-2 md:pt-0 flex flex-col items-center">
              <span className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-400 font-mono">
                Cryptographic
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                Immutable SHA-256 Ledger
              </span>
              <span className="text-[10px] text-slate-500">Chained Audit Traceability</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. PORTAL ACCESS CARDS WITH MEDIA GRAPHICS                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-xl font-black text-[#0B2559] dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>{isHi ? 'विशिष्ट पोर्टल प्रवेश द्वार (Portal Access)' : 'Authorized Operational Portal Access'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'छात्रों, संस्थानों व अधिकृत सत्यापनकर्ताओं के लिए एकीकृत लॉगिन' : 'Direct authenticated workspaces for students, college administrators, and verifiers'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Student Portal with Visual Avatar/Badge Media */}
          <div className="rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-2xl shadow-inner">
                  🎓
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  STUDENT SOVEREIGN
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {isHi ? 'छात्र पोर्टल' : 'Student Portal'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHi 
                    ? 'अपने सत्यापित शैक्षणिक रिकॉर्ड देखें, क्यूआर युक्त प्रमाण पत्र डाउनलोड करें तथा तृतीय-पक्ष सत्यापन हेतु सहमति नियंत्रित करें।'
                    : 'Inspect verified academic enrollments, download tamper-evident QR certificates, and manage digital verification consent under DPDP Act 2023.'}
                </p>
              </div>

              {/* Graphic Media Indicator */}
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 flex items-center space-x-3">
                <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block">Digital Identity Pass</span>
                  <span>Instant Scannable Attestation</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sovereign Consent Management Toggle</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Download Cryptographic Pass</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 border-slate-100 mt-4">
              <button
                onClick={() => {
                  onSelectRole('STUDENT');
                  onSelectNavPage('LOGIN');
                }}
                className="w-full py-2.5 rounded-xl bg-[#0B2559] hover:bg-[#113880] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{isHi ? 'छात्र लॉगिन' : 'Launch Student Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Institution Portal with Media Graphic */}
          <div className="rounded-2xl border-2 border-amber-400 dark:border-amber-600/80 dark:bg-slate-900 bg-white p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-2xl shadow-inner">
                  🏛️
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  INSTITUTION NODAL
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  {isHi ? 'संस्थान पोर्टल' : 'Institution Portal'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHi 
                    ? 'छात्र नामांकन डेटा प्रविष्टि, CSV/Excel बैच अपलोड, 12-अंकीय सत्यापन नियम व स्वीकृत प्रवेश क्षमता की स्वचालित जांच।'
                    : 'Submit student records, batch upload CSV/Excel admissions, review validation errors (VAL_ERR_LEN_12), and audit approved intake limits.'}
                </p>
              </div>

              {/* Graphic Media Indicator */}
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60 flex items-center space-x-3">
                <FileSpreadsheet className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block">Batch Excel/CSV Engine</span>
                  <span>Automated Schema & Capacity Audit</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sanctioned Capacity Compliance Check</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                  <span>Real-time Duplicate Ingestion Intercept</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 border-slate-100 mt-4">
              <button
                onClick={() => {
                  onSelectRole('INSTITUTION');
                  onSelectNavPage('LOGIN');
                }}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{isHi ? 'संस्थान लॉगिन' : 'Access Institution Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Verifier Portal with Media Graphic */}
          <div className="rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-2xl shadow-inner">
                  🔍
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  AUTHORIZED AUDIT
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {isHi ? 'अधिकृत सत्यापनकर्ता' : 'Authorized Verifier'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHi 
                    ? 'नियोक्ताओं एवं शैक्षणिक निकायों हेतु छात्र की सहमति पर आधारित पृष्ठभूमि व अकादमिक साख पत्रों का वैध सत्यापन।'
                    : 'Verify authentic student credentials for employment, higher studies, or institutional background checks backed by consent authorization.'}
                </p>
              </div>

              {/* Graphic Media Indicator */}
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block">Cryptographic Ledger Query</span>
                  <span>Consent-Gated Verification Access</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800 border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tamper-Proof Audit Logging</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>DPDP 2023 Verification Record</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-800 border-slate-100 mt-4">
              <button
                onClick={() => {
                  onSelectRole('VERIFIER');
                  onSelectNavPage('LOGIN');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{isHi ? 'सत्यापनकर्ता लॉगिन' : 'Verifier Desk Login'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. HOW IT WORKS SECTION                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-base sm:text-xl font-black text-[#0B2559] dark:text-white uppercase tracking-wider">
            {isHi ? 'कार्य प्रणाली (Standard Operating Workflow)' : 'Standard Operating Workflow'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            {isHi 
              ? 'प्रवेश डेटा जमा करने से लेकर अंतिम सत्यापित प्रमाण पत्र तक 4-चरणीय सत्यापन प्रक्रिया'
              : 'End-to-end procedural architecture from institutional enrollment to cryptographic verification'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-2 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'अधिकृत डेटा प्रविष्टि' : '1. Submit Enrolment Data'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isHi 
                ? 'संस्थान एकल प्रविष्टि अथवा संरचित CSV/Excel बैच द्वारा छात्र अपार आईडी और पाठ्यक्रम डेटा अपलोड करते हैं।'
                : 'Institutions submit enrollment files via secure authenticated portal channels with mandatory 12-digit APAAR format.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-2 relative">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'प्रारूप एवं नियम जांच' : '2. Automated Validation'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isHi 
                ? 'सिस्टम स्वचालित रूप से चेकसम, फील्ड प्रारूप, स्वीकृत कोटा और अनधिकृत दोहरे दाखिलों की तत्काल जांच करता है।'
                : 'Validation pipelines execute regex checks, supernumerary quota ceilings (10%), and cross-institution collision detection.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-2 relative">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'विसंगति समाधान' : '3. Resolve Discrepancies'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isHi 
                ? 'त्रुटिपूर्ण रिकॉर्ड्स को अलग करके विस्तृत समाधान सुझाव प्रदान किए जाते हैं ताकि संस्थान सुधारात्मक कदम उठा सकें।'
                : 'Validation errors generate actionable issue logs (e.g. VAL_ERR_LEN_12) for correction prior to final registry freeze.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-2 relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {isHi ? 'प्रमाण पत्र एवं सत्यापन' : '4. Attested Credential'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isHi 
                ? 'सत्यापित छात्र को डिजिटल प्रमाण पत्र प्राप्त होता है, जिसे सार्वजनिक क्यूआर अथवा अधिकृत सहमति से सत्यापित किया जा सकता है।'
                : 'A verified record unlocks student sovereign consent toggles, PDF credential certificates, and public QR lookups.'}
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. PLATFORM CAPABILITIES                                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="platform-capabilities-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-xl font-black text-[#0B2559] dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{isHi ? 'मंच की प्रमुख क्षमताएं (Platform Capabilities)' : 'Enterprise Administrative Capabilities'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'राष्ट्रीय स्तर पर छात्र डेटा प्रबंधन हेतु कार्यान्वित मॉड्यूल' : 'Fully integrated functional modules and regulatory enforcement tools'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Record Management</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Structured database of enrolled students with branch, category, and academic year indexes.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Bulk Ingestion Pipeline</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Standardized CSV/Excel parser processing thousands of admissions with line-by-line validation.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Duplicate Detection</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Real-time anomaly scanner catching dual active enrollment across different colleges instantly.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Intake Capacity Audit</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated monitoring of approved intake vs actual admissions, preventing illegal over-enrollment.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Consent Management</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              DPDP Act 2023 aligned sovereign toggles allowing students to grant or revoke third-party verification access.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Digital Credentials</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tamper-evident verification passes with embedded digital token and instant QR resolution.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cryptographic Audit Chain</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Immutable SHA-256 chained transaction logs for every admission, modification, and inspection event.
            </p>
          </div>

          <div className="p-4 rounded-xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 space-y-1.5">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Regulatory Reporting</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              State-wise telemetry, intake compliance certificates, and exportable regulatory spreadsheets.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. PUBLIC VERIFICATION PANEL (COMPACT & INFORMATIVE)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="public-verification-widget" className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <div className="dark:bg-slate-900 bg-white border-2 dark:border-slate-700 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>PRIVACY-PRESERVING PUBLIC LOOKUP</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isHi ? 'सार्वजनिक अपार आईडी त्वरित सत्यापन' : 'Public APAAR ID Instant Verification Tool'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'बिना किसी लॉगिन के तुरंत छात्र की नामांकन वैधता की पुष्टि करें (न्यूनतम डेटा प्रदर्शन)' : 'Check academic authenticity with zero personal identity or demographic disclosure'}
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={apaarQuery}
                onChange={(e) => setApaarQuery(e.target.value)}
                placeholder={isHi ? "12-अंकीय अपार आईडी दर्ज करें (उदा. 892019482019)..." : "Enter 12-digit APAAR ID (e.g. 892019482019)..."}
                className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-slate-50 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 font-mono font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-6 py-3 rounded-xl bg-[#0B2559] hover:bg-[#113880] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isVerifying ? 'Checking...' : (isHi ? 'सत्यापित करें' : 'Verify Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Presets */}
          <div className="pt-2 border-t dark:border-slate-800 border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-500 font-mono text-[10px] mr-1">
                Sample Test Tokens:
              </span>
              {[
                { id: '892019482019', label: 'Valid Record', color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
                { id: '472910482910', label: 'Disputed Record', color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
                { id: '999999999999', label: 'Unregistered', color: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`px-2.5 py-0.5 rounded-md border font-mono text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 ${preset.color}`}
                >
                  <span>{preset.id}</span>
                  <span className="ml-1 opacity-75">({preset.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result */}
          {hasChecked && (
            <div className="pt-2 animate-in fade-in duration-200">
              {verifyResult ? (
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  verifyResult.enrolmentStatus === 'Active' && verifyResult.verificationStatus === 'Verified'
                    ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                    : 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      verifyResult.enrolmentStatus === 'Active' && verifyResult.verificationStatus === 'Verified'
                        ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                      {verifyResult.enrolmentStatus === 'Active' && verifyResult.verificationStatus === 'Verified'
                        ? 'AUTHENTIC RECORD CONFIRMED'
                        : 'RECORD PENDING / DISPUTED'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      Token: {verifyResult.digitalCredentialId || 'AICTE-CERT-VERIFIED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Student Reference</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {verifyResult.name.split(' ')[0]} {verifyResult.name.split(' ')[1]?.[0] || ''}**** (Masked)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Institution</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate block">
                        {verifyResult.collegeName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Program & Branch</span>
                      <span className="text-slate-700 dark:text-slate-300 block">{verifyResult.program}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block">Academic Year</span>
                      <span className="text-blue-700 dark:text-blue-400 font-bold block">{verifyResult.academicYear}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Personal identity preserved under DPDP guidelines.</span>
                    </span>
                    <span className="font-mono">Timestamp: 2026-10-27</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-center space-y-1">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                    No Active Enrolment Found for Token: {apaarQuery}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Please verify that the 12-digit number is typed correctly or contact the college nodal officer.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. ANNOUNCEMENTS & CIRCULARS                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-xl font-black text-[#0B2559] dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{isHi ? 'नवीनतम परिपत्र एवं तकनीकी अधिसूचनाएं' : 'Regulatory Circulars & Technical Advisories'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHi ? 'अपार सत्यापन एवं प्रवेश क्षमता से संबंधित नवीनतम निर्देश' : 'Official operational notifications, schema advisories, and guidelines'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORM_ANNOUNCEMENTS.map((ann) => (
            <div 
              key={ann.id}
              className={`p-4 rounded-xl border dark:bg-slate-900 bg-white transition-all space-y-2 ${
                ann.important 
                  ? 'border-amber-300 dark:border-amber-700/80 shadow-xs' 
                  : 'dark:border-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  ann.category === 'TECHNICAL'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : ann.category === 'COMPLIANCE'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                }`}>
                  {ann.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{ann.date}</span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {isHi ? ann.titleHi : ann.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {isHi ? ann.summaryHi : ann.summary}
              </p>

              <div className="pt-2 flex items-center justify-between border-t dark:border-slate-800 border-slate-100 text-[11px]">
                <span className="font-mono text-slate-400 text-[10px]">{ann.id}</span>
                <button
                  onClick={() => ann.targetNav && onSelectNavPage(ann.targetNav as any)}
                  className="font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <span>{ann.linkText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. RESOURCES, SERVICE STATUS & FAQ                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Service Status */}
        <div className="p-5 rounded-2xl border dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b dark:border-slate-800 border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                {isHi ? 'प्रणाली सेवा स्थिति एवं उपलब्धता' : 'System Service Telemetry & Platform Availability'}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              All Core Microservices Operational • 99.96% Uptime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLATFORM_SERVICE_STATUS.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-slate-950 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{item.status}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.latency}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {isHi ? item.serviceHi : item.service}
                </p>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Uptime: {item.uptime}</span>
                  <span>{item.lastChecked}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-xl font-black text-[#0B2559] dark:text-white uppercase tracking-wider">
              {isHi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              {isHi ? 'मंच की कार्यप्रणाली, प्रवेश सत्यापन एवं डेटा सुरक्षा से जुड़े सामान्य प्रश्न' : 'Practical guidance regarding enrollment uploads, duplicate resolution, and privacy'}
            </p>
          </div>

          <div className="space-y-2 max-w-4xl mx-auto">
            {PLATFORM_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="border dark:border-slate-800 border-slate-200 dark:bg-slate-900 bg-white rounded-xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">Q{index + 1}.</span>
                      <span>{isHi ? faq.qHi : faq.q}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t dark:border-slate-800 border-slate-100">
                      <p>{isHi ? faq.aHi : faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
