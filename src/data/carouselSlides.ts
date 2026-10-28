export interface CarouselSlide {
  id: string;
  badge: string;
  badgeHi: string;
  badgeColor: string;
  headline: string;
  headlineHi: string;
  highlightText: string;
  highlightTextHi: string;
  description: string;
  descriptionHi: string;
  primaryCtaText: string;
  primaryCtaTextHi: string;
  primaryCtaNav?: string;
  secondaryCtaText: string;
  secondaryCtaTextHi: string;
  secondaryCtaRole?: string;
  imageLandscapeUrl: string;
  themeStyle: 'AICTE_OFFICIAL' | 'STUDENT_DIGITAL' | 'INSTITUTION_AUDIT' | 'COMPLIANCE_DPDP';
  quickStats: { label: string; value: string }[];
}

export const HERO_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    badge: 'ALL INDIA COUNCIL FOR TECHNICAL EDUCATION • NATIONAL PLATFORM',
    badgeHi: 'अखिल भारतीय तकनीकी शिक्षा परिषद् • राष्ट्रीय सत्यापन मंच',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    headline: 'Your Academic Identity Is Just',
    headlineHi: 'आपकी प्रामाणिक शैक्षणिक पहचान',
    highlightText: 'A Single Verification Away',
    highlightTextHi: 'केवल एक क्लिक में सत्यापित',
    description: 'Connecting Indian engineering, management, and polytechnic students with verified academic records, automated intake capacity audits, and sovereign consent management.',
    descriptionHi: 'भारतीय तकनीकी एवं प्रबंधन संस्थानों के छात्रों को 12-अंकीय अपार आईडी, स्वीकृत प्रवेश क्षमता ऑडिट एवं सुरक्षित डिजिटल अकादमिक सत्यापन से जोड़ता राष्ट्रीय मंच।',
    primaryCtaText: 'Verify APAAR Record',
    primaryCtaTextHi: 'अपार रिकॉर्ड सत्यापित करें',
    secondaryCtaText: 'Institution Portal Login',
    secondaryCtaTextHi: 'संस्थान पोर्टल लॉगिन',
    secondaryCtaRole: 'INSTITUTION',
    imageLandscapeUrl: '/hero-slider-1.png',
    themeStyle: 'AICTE_OFFICIAL',
    quickStats: [
      { label: 'Standard', value: '12-Digit APAAR' },
      { label: 'Privacy', value: 'Zero-Aadhaar Leakage' },
      { label: 'Security', value: 'SHA-256 Ledger' }
    ]
  },
  {
    id: 'slide-2',
    badge: 'ONE NATION, ONE STUDENT ID • NATIONAL ACADEMIC REGISTRY',
    badgeHi: 'एक राष्ट्र, एक छात्र पहचान • राष्ट्रीय शैक्षणिक रजिस्ट्री',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    headline: 'Digital Academic Passports for',
    headlineHi: 'लाखों तकनीकी छात्रों के लिए',
    highlightText: 'Empowered Indian Scholars',
    highlightTextHi: 'डिजिटल शैक्षणिक पासपोर्ट',
    description: 'Empower students to access their verified enrolment credentials, download tamper-evident QR certificates, and toggle sovereign third-party background verification consent.',
    descriptionHi: 'छात्र अपनी सत्यापित नामांकन स्थिति देख सकते हैं, क्यूआर कोड युक्त डिजिटल सर्टिफिकेट डाउनलोड कर सकते हैं और तीसरे पक्ष के सत्यापन हेतु डिजिटल सहमति नियंत्रित कर सकते हैं।',
    primaryCtaText: 'Student Portal Access',
    primaryCtaTextHi: 'छात्र पोर्टल खोलें',
    secondaryCtaText: 'Verify a Certificate',
    secondaryCtaTextHi: 'प्रमाणपत्र जांचें',
    secondaryCtaRole: 'PUBLIC_VERIFY',
    imageLandscapeUrl: '/hero-slider-2.png',
    themeStyle: 'STUDENT_DIGITAL',
    quickStats: [
      { label: 'Consent Model', value: 'DPDP Act 2023' },
      { label: 'Resolution', value: 'Instant QR Token' },
      { label: 'Status', value: 'DigiLocker Synced' }
    ]
  },
  {
    id: 'slide-3',
    badge: 'APPROVAL PROCESS HANDBOOK (APH) • INTAKE COMPLIANCE BUREAU',
    badgeHi: 'स्वीकृति प्रक्रिया हैंडबुक (APH) • प्रवेश क्षमता अनुपालन ब्यूरो',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    headline: 'Automated Sanctioned Intake &',
    headlineHi: 'स्वीकृत प्रवेश क्षमता एवं',
    highlightText: 'Quota Compliance Audit',
    highlightTextHi: 'कोटा अनुपालन ऑडिट',
    description: 'Real-time monitoring of college enrollments vs AICTE approved capacity. Automatic detection of 10% supernumerary (TFWS/NRI) quota breaches and multi-institution duplicate admissions.',
    descriptionHi: 'कॉलेजों के वास्तविक प्रवेश की एआईसीटीई स्वीकृत क्षमता से रीयल-टाइम तुलना। 10% अधिसंख्य कोटा सीमा की निगरानी एवं एक साथ कई कॉलेजों में दोहरे दाखिलों की तत्काल रोकथाम।',
    primaryCtaText: 'Explore Compliance Rules',
    primaryCtaTextHi: 'अनुपालन नियम देखें',
    secondaryCtaText: 'AICTE Officer Command',
    secondaryCtaTextHi: 'एआईसीटीई अधिकारी कमान',
    secondaryCtaRole: 'AICTE_OFFICER',
    imageLandscapeUrl: '/hero-slider-3.png',
    themeStyle: 'INSTITUTION_AUDIT',
    quickStats: [
      { label: 'Cap Rule', value: '10% Supernumerary' },
      { label: 'Fraud Intercept', value: 'Multi-College Detection' },
      { label: 'Reporting', value: 'Automated Circulars' }
    ]
  }
];
