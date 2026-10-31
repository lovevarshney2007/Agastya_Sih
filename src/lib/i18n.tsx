import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'en' | 'hi';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Header & Gov branding
    gov_india: 'Government of India · Ministry of Education',
    aicte_full: 'All India Council for Technical Education',
    app_title: 'APAAR Student Ledger',
    app_subtitle: 'Enrolment reporting & verification for AICTE-approved institutions',
    verify_record: 'Verify a record',
    live_seats: 'Live seats',
    sign_in: 'Sign in',
    sign_out: 'Sign out',
    prototype_badge: 'Prototype: synthetic data only',
    
    // Portals
    portal_institution: 'Institution portal',
    portal_aicte: 'AICTE regulation desk',
    portal_verifier: 'Verifier portal',
    portal_student: 'My APAAR record',

    // Institution Nav
    nav_dashboard: 'Dashboard',
    nav_upload_data: 'Upload data',
    nav_uploads_reports: 'Uploads & reports',
    nav_registry: 'Student registry',
    nav_compliance: 'Intake compliance',

    // AICTE Nav
    nav_overview: 'National overview',
    nav_cases: 'Cases',
    nav_risk: 'Risk ranking',
    nav_ml_intel: 'Policy & ML Intel',
    nav_institutions: 'Institutions',
    nav_audit: 'Audit ledger',
    nav_rules_config: 'Rules & seat caps',
    nav_verifier_approvals: 'Verifier approvals',
    nav_security_sandbox: 'Security Sandbox',

    // Verifier Nav
    nav_verifications: 'Verification requests',

    // Student Nav
    nav_my_record: 'My record',
    nav_consent: 'Consent',
    nav_share: 'Share my record',
    nav_guardian: 'Guardian consent',
    nav_data_rights: 'My data rights',

    // Footer
    footer_desc: 'One verified record for every student in an AICTE-approved institution. Built for Smart India Hackathon 2026, problem statement SIH26263.',
    footer_privacy: 'Privacy & DPDP',
    footer_privacy_desc: 'No Aadhaar numbers are collected. APAAR IDs are encrypted and shown masked. Every access is written to a tamper-evident log.',
    footer_help: 'Helpdesk & API',
  },
  hi: {
    // Header & Gov branding
    gov_india: 'भारत सरकार · शिक्षा मंत्रालय',
    aicte_full: 'अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)',
    app_title: 'अपार छात्र लेजर (APAAR Ledger)',
    app_subtitle: 'एआईसीटीई-अनुमोदित संस्थानों हेतु नामांकन रिपोर्टिंग और सत्यापन प्रणाली',
    verify_record: 'रिकॉर्ड सत्यापित करें',
    live_seats: 'लाइव सीटें',
    sign_in: 'लॉग इन करें',
    sign_out: 'लॉग आउट',
    prototype_badge: 'प्रोटोटाइप: केवल कृत्रिम (डेमो) डेटा',

    // Portals
    portal_institution: 'संस्थान पोर्टल',
    portal_aicte: 'एआईसीटीई विनियमन डेस्क',
    portal_verifier: 'सत्यापनकर्ता पोर्टल',
    portal_student: 'मेरा अपार (APAAR) रिकॉर्ड',

    // Institution Nav
    nav_dashboard: 'डैशबोर्ड',
    nav_upload_data: 'डेटा अपलोड',
    nav_uploads_reports: 'अपलोड व रिपोर्ट',
    nav_registry: 'छात्र रजिस्ट्री',
    nav_compliance: 'प्रवेश अनुपालन',

    // AICTE Nav
    nav_overview: 'राष्ट्रीय अवलोकन',
    nav_cases: 'मामले व शिकायतें',
    nav_risk: 'संस्थान जोखिम रैंकिंग',
    nav_ml_intel: 'नीति व एमएल इंटेलिजेंस',
    nav_institutions: 'संस्थान सूची',
    nav_audit: 'ऑडिट लेजर',
    nav_rules_config: 'नियम व कोटा विन्यास',
    nav_verifier_approvals: 'सत्यापनकर्ता अनुमोदन',
    nav_security_sandbox: 'सुरक्षा सैंडबॉक्स (हमला परीक्षण)',

    // Verifier Nav
    nav_verifications: 'सत्यापन अनुरोध',

    // Student Nav
    nav_my_record: 'मेरा रिकॉर्ड',
    nav_consent: 'सहमति केंद्र',
    nav_share: 'रिकॉर्ड साझा करें',
    nav_guardian: 'अभिभावक सहमति (नाबालिग)',
    nav_data_rights: 'मेरे डेटा अधिकार (DPDP)',

    // Footer
    footer_desc: 'एआईसीटीई-अनुमोदित संस्थान में नामांकित प्रत्येक छात्र के लिए एकल सत्यापित डिजिटल रिकॉर्ड। स्मार्ट इंडिया हैकाथॉन 2026 के लिए निर्मित।',
    footer_privacy: 'गोपनीयता और DPDP 2023',
    footer_privacy_desc: 'कोई आधार नंबर संग्रहीत नहीं होता। अपार आईडी एन्क्रिप्टेड और सुरक्षित है। हर एक्सेस का छेड़छाड़-मुक्त ऑडिट रखा जाता है।',
    footer_help: 'सहायता केंद्र और एपीआई',
  }
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_language');
      return (saved === 'hi' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('app_language', newLang);
    } catch {
      // ignore local storage errors
    }
  };

  const t = (key: string, defaultText?: string): string => {
    return DICTIONARY[lang]?.[key] || defaultText || DICTIONARY.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded transition-colors ${
          lang === 'en'
            ? 'bg-navy text-white shadow-xs font-semibold'
            : 'text-muted hover:text-ink'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('hi')}
        className={`px-2 py-0.5 rounded transition-colors ${
          lang === 'hi'
            ? 'bg-navy text-white shadow-xs font-semibold'
            : 'text-muted hover:text-ink'
        }`}
        aria-label="हिन्दी में बदलें"
      >
        हिन्दी
      </button>
    </div>
  );
}
