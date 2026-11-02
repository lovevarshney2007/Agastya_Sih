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
    app_title: 'AICTE Agastya · National Enrolment Ledger',
    app_subtitle: 'APAAR 12-Digit Lifelong ID, Sanctioned Seat Intake & WORM Audit Ledger',
    verify_record: 'Verify APAAR Credential',
    live_seats: 'National Seat Intake Matrix',
    sign_in: 'Sign in',
    sign_out: 'Sign out',
    prototype_badge: 'Statutory Depository Node · Production Grade',
    
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

    // Common & UI Actions
    action_search: 'Search',
    action_filter: 'Filter',
    action_export: 'Export',
    action_download: 'Download',
    action_verify: 'Verify',
    action_cancel: 'Cancel',
    action_confirm: 'Confirm',
    action_close: 'Close',
    action_copy: 'Copy',
    action_copied: 'Copied!',
    action_refresh: 'Refresh',
    action_view_all: 'View all',
    action_back: 'Back',
    action_next: 'Next',
    action_prev: 'Previous',
    action_restart: 'Restart',

    // Status Badges
    status_valid: 'VALID',
    status_invalid: 'NOT VALID',
    status_revoked: 'REVOKED',
    status_pending: 'Pending',
    status_approved: 'Approved',
    status_compliant: 'Compliant',
    status_violation: 'Violation Intercepted',

    // Root Ledger Sync
    ledger_badge: 'APAAR National Depository · Ledger Live',
    ledger_popover_title: 'AICTE National Depository Root Ledger',
    ledger_popover_subtitle: 'Consensus Active · 32 Institutional Validator Nodes',
    ledger_block_height: 'Block Height',
    ledger_merkle_root: 'Merkle Root Hash',
    ledger_latency: 'API Latency',
    ledger_consensus: 'Consensus Model',
    ledger_cryptography: 'Cryptographic Standard',
    ledger_compliance: 'Statutory Compliance',
    ledger_open_audit: 'Open Full Audit Ledger',
    ledger_test_sandbox: 'Security Sandbox Exploit Test',
    ledger_copy_root: 'Copy Root Hash',

    // W3C Credentials & DigiLocker
    vc_title: 'AICTE APAAR Digital Identity Smart Card',
    vc_w3c_badge: 'Statutory Verifiable Credential',
    vc_download_json: 'W3C JSON-LD',
    vc_cert_a4: 'Official Certificate (A4)',
    vc_signed_by: 'Signed by AICTE Root Authority',

    // Role Switcher & Tour
    tour_launcher_full: 'Role Switcher & Tour',
    tour_launcher_mobile: 'Role Tour',
    tour_executive_demo: 'Executive Demonstration',
    tour_active_persona: 'Active Demo Persona:',
    tour_auto_pitch: 'Auto-Play Pitch',
    tour_pause_pitch: 'Pause Pitch',
    tour_next_in: 'Auto-advancing in',

    // Command Palette
    cmd_placeholder: 'Type a command, institution, or student...',
    cmd_cat_navigation: 'Navigation',
    cmd_cat_regulatory: 'Regulatory Action',
    cmd_cat_audit: 'Auditing & Security',
    cmd_cat_roles: 'Role Switch',
    cmd_shortcut_move: 'Move',
    cmd_shortcut_select: 'Select',
    cmd_shortcut_exit: 'Exit',
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

    // Common & UI Actions
    action_search: 'खोजें',
    action_filter: 'फ़िल्टर',
    action_export: 'निर्यात करें',
    action_download: 'डाउनलोड',
    action_verify: 'सत्यापित करें',
    action_cancel: 'रद्द करें',
    action_confirm: 'पुष्टि करें',
    action_close: 'बंद करें',
    action_copy: 'प्रतिलिपि बनाएं',
    action_copied: 'कॉपी हो गया!',
    action_refresh: 'ताज़ा करें',
    action_view_all: 'सभी देखें',
    action_back: 'वापस',
    action_next: 'आगे',
    action_prev: 'पिछला',
    action_restart: 'पुनः आरंभ',

    // Status Badges
    status_valid: 'सत्यापित (वैध)',
    status_invalid: 'अमान्य',
    status_revoked: 'निरस्त',
    status_pending: 'लंबित',
    status_approved: 'स्वीकृत',
    status_compliant: 'अनुपालन पूर्ण',
    status_violation: 'उल्लंघन पाया गया',

    // Root Ledger Sync
    ledger_badge: 'अपार राष्ट्रीय रिपॉजिटरी · लाइव लेजर',
    ledger_popover_title: 'एआईसीटीई राष्ट्रीय अपार रूट लेजर',
    ledger_popover_subtitle: 'सक्रिय सर्वसम्मति · 32 संस्थागत सत्यापनकर्ता नोड्स',
    ledger_block_height: 'ब्लॉक ऊंचाई (Height)',
    ledger_merkle_root: 'मर्कल रूट हैश',
    ledger_latency: 'एपीआई लेटेंसी',
    ledger_consensus: 'सर्वसम्मति मॉडल',
    ledger_cryptography: 'क्रिप्टोग्राफिक मानक',
    ledger_compliance: 'वैधानिक अनुपालन',
    ledger_open_audit: 'संपूर्ण ऑडिट लेजर खोलें',
    ledger_test_sandbox: 'सुरक्षा सैंडबॉक्स परीक्षण',
    ledger_copy_root: 'रूट हैश कॉपी करें',

    // W3C Credentials & DigiLocker
    vc_title: 'एआईसीटीई अपार डिजिटल पहचान स्मार्ट कार्ड',
    vc_w3c_badge: 'वैधानिक सत्यापन योग्य प्रमाण-पत्र (W3C)',
    vc_download_json: 'W3C JSON-LD',
    vc_cert_a4: 'आधिकारिक प्रमाण-पत्र (A4)',
    vc_signed_by: 'एआईसीटीई रूट प्राधिकारी द्वारा हस्ताक्षरित',

    // Role Switcher & Tour
    tour_launcher_full: 'भूमिका स्विचर व टूर',
    tour_launcher_mobile: 'रोल टूर',
    tour_executive_demo: 'कार्यकारी प्रस्तुति (डेमो)',
    tour_active_persona: 'सक्रिय डेमो भूमिका:',
    tour_auto_pitch: 'ऑटो-प्ले पिच (3 मिनट)',
    tour_pause_pitch: 'पिच रोकें',
    tour_next_in: 'अगला चरण',

    // Command Palette
    cmd_placeholder: 'कोई कमांड, संस्थान या छात्र खोजें...',
    cmd_cat_navigation: 'नेविगेशन',
    cmd_cat_regulatory: 'नियामक कार्रवाई',
    cmd_cat_audit: 'ऑडिट व सुरक्षा',
    cmd_cat_roles: 'भूमिका बदलें',
    cmd_shortcut_move: 'चयन बदलें',
    cmd_shortcut_select: 'खोलें',
    cmd_shortcut_exit: 'बाहर निकलें',
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
