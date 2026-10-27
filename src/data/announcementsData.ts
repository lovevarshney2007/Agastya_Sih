export interface Announcement {
  id: string;
  title: string;
  titleHi: string;
  date: string;
  category: 'REGULATORY' | 'TECHNICAL' | 'COMPLIANCE' | 'ADMISSION';
  summary: string;
  summaryHi: string;
  linkText: string;
  targetNav?: string;
  important?: boolean;
}

export const PLATFORM_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-2026-04',
    title: 'Advisory: Mandatory 12-Digit Format & Checksum Verification for Batch Uploads (AY 2026-27)',
    titleHi: 'परामर्श: बैच अपलोड हेतु अनिवार्य 12-अंकीय प्रारूप एवं चेकसम सत्यापन (सत्र 2026-27)',
    date: '2026-10-24',
    category: 'TECHNICAL',
    summary: 'All affiliated institutions must ensure that student APAAR identifiers match the standard 12-digit numeric schema before batch upload submission to prevent ingestion rejections.',
    summaryHi: 'सभी संबद्ध संस्थानों को सूचित किया जाता है कि बैच अपलोड अस्वीकृति से बचने हेतु अपलोड से पूर्व छात्र अपार आईडी का 12-अंकीय संख्यात्मक सत्यापन अनिवार्य रूप से पूर्ण करें।',
    linkText: 'Read Validation Guidelines',
    targetNav: 'DOCUMENTATION',
    important: true
  },
  {
    id: 'ANN-2026-03',
    title: 'APH 2025-26 Compliance: Supernumerary (TFWS/NRI) Quota Limit Guardrails Active',
    titleHi: 'APH 2025-26 अनुपालन: अधिसंख्य (TFWS/NRI) कोटा सीमा जांच सक्रिय',
    date: '2026-10-18',
    category: 'COMPLIANCE',
    summary: 'The intake calculation engine automatically calculates approved capacity. Seats tagged under supernumerary categories exceeding the 10% ceiling will generate automatic review tickets.',
    summaryHi: 'स्वीकृत क्षमता गणना इंजन 10% से अधिक अधिसंख्य कोटे की सीटों पर स्वतः समीक्षा टिकट उत्पन्न करेगा। संस्थान अपनी स्वीकृत क्षमता का सत्यापन करें।',
    linkText: 'View Intake Rules',
    targetNav: 'COMPLIANCE_STANDARDS'
  },
  {
    id: 'ANN-2026-02',
    title: 'DPDP Act 2023 Alignment: Privacy-Preserving Verification & Sovereign Consent Logs',
    titleHi: 'DPDP अधिनियम 2023: गोपनीयता-अनुकूल सत्यापन एवं सहमति लॉग ऑडिट सक्रिय',
    date: '2026-10-11',
    category: 'REGULATORY',
    summary: 'Public verification displays only masked student initials and program validation. Full academic record disclosure strictly requires active student sovereign consent.',
    summaryHi: 'सार्वजनिक सत्यापन में केवल संक्षिप्त विवरण ही प्रदर्शित होगा। संपूर्ण शैक्षणिक रिकॉर्ड प्रकटीकरण के लिए छात्र की संप्रभु डिजिटल सहमति अनिवार्य है।',
    linkText: 'Privacy Framework Details',
    targetNav: 'DOCUMENTATION'
  },
  {
    id: 'ANN-2026-01',
    title: 'Integration Maintenance Notice: Periodic Ledger Cryptographic Checksum Scheduled',
    titleHi: 'रखरखाव सूचना: समय-समय पर ऑडिट लेजर क्रिप्टोग्राफ़िक चेकसम नवीनीकरण',
    date: '2026-10-02',
    category: 'TECHNICAL',
    summary: 'Internal cryptographic hash chains will execute scheduled consistency verification every Sunday 02:00-03:00 IST. API and public query endpoints remain continuously available.',
    summaryHi: 'आंतरिक क्रिप्टोग्राफ़िक ऑडिट लेजर सत्यापन प्रत्येक रविवार रात्रि 02:00-03:00 बजे संचालित होगा। सार्वजनिक क्वेरी सेवाएं सामान्य रूप से उपलब्ध रहेंगी।',
    linkText: 'System Status Dashboard',
    targetNav: 'ANALYTICS'
  }
];

export interface SystemServiceStatus {
  service: string;
  serviceHi: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latency: string;
  uptime: string;
  lastChecked: string;
}

export const PLATFORM_SERVICE_STATUS: SystemServiceStatus[] = [
  {
    service: 'Core APAAR Ingestion API',
    serviceHi: 'मुख्य अपार डेटा इनजेशन एपीआई',
    status: 'OPERATIONAL',
    latency: '42ms',
    uptime: '99.98%',
    lastChecked: 'Live Telemetry'
  },
  {
    service: 'Duplicate & Multi-College Collision Engine',
    serviceHi: 'दोहरा दाखिला एवं बहु-कॉलेज टकराव डिटेक्टर',
    status: 'OPERATIONAL',
    latency: '88ms',
    uptime: '99.94%',
    lastChecked: 'Live Stream'
  },
  {
    service: 'Intake & Quota Compliance Validator',
    serviceHi: 'प्रवेश क्षमता एवं कोटा अनुपालन वैलिडेटर',
    status: 'OPERATIONAL',
    latency: '31ms',
    uptime: '99.99%',
    lastChecked: 'Active'
  },
  {
    service: 'Public Verification & QR Signature Resolver',
    serviceHi: 'सार्वजनिक सत्यापन एवं क्यूआर हस्ताक्षर समाधान',
    status: 'OPERATIONAL',
    latency: '56ms',
    uptime: '99.96%',
    lastChecked: 'Public Endpoint'
  }
];

export interface FaqItem {
  q: string;
  qHi: string;
  a: string;
  aHi: string;
  category: 'GENERAL' | 'INSTITUTION' | 'STUDENT' | 'VERIFICATION';
}

export const PLATFORM_FAQS: FaqItem[] = [
  {
    category: 'GENERAL',
    q: 'What is the purpose of this Student Data Management & Verification Platform?',
    qHi: 'इस छात्र डेटा प्रबंधन एवं सत्यापन मंच का प्राथमिक उद्देश्य क्या है?',
    a: 'The platform serves as an enterprise-grade administrative system to streamline student record enrollment, validate 12-digit APAAR identifiers, audit approved intake limits against actual admissions, intercept cross-institution dual enrollment, and provide privacy-preserving public credential verification.',
    aHi: 'यह मंच स्वीकृत प्रवेश क्षमता की निगरानी करने, 12-अंकीय अपार पहचान पत्र प्रारूपों की पुष्टि करने, एक साथ कई संस्थानों में दोहरे दाखिलों को रोकने तथा गोपनीयता-अनुकूल डिजिटल सत्यापन प्रदान करने हेतु निर्मित एक आधिकारिक प्रशासनिक प्रणाली है।'
  },
  {
    category: 'INSTITUTION',
    q: 'How does an educational institution submit student enrollment data?',
    qHi: 'शैक्षणिक संस्थान छात्रों के प्रवेश डेटा को कैसे सबमिट करते हैं?',
    a: 'Authorised Registrars and Nodal Officers log in via the Institution Portal to submit individual student records or batch upload structured CSV / Excel files. The platform validation pipeline immediately executes format rules, quota capacity checks, and duplicate collision scans.',
    aHi: 'संबद्ध संस्थानों के अधिकृत रजिस्ट्रार अथवा नोडल अधिकारी संस्थान पोर्टल के माध्यम से सिंगल रिकॉर्ड अथवा बल्क CSV/Excel फाइलें अपलोड कर सकते हैं। अपलोड होते ही फॉर्मेट, कोटा और डुप्लिकेट जांच की तत्काल रिपोर्ट प्राप्त होती है।'
  },
  {
    category: 'INSTITUTION',
    q: 'What happens when a batch upload contains validation errors or capacity violations?',
    qHi: 'बैच अपलोड में प्रारूप त्रुटि अथवा क्षमता उल्लंघन पाए जाने पर क्या प्रक्रिया होती है?',
    a: 'Valid records are processed into the institution registry. Erroneous records are segmented into an actionable Validation Report with specific error codes (e.g. VAL_ERR_LEN_12, WARN_SUPERNUMERARY_QUOTA) and suggested remediation steps without discarding the valid entries.',
    aHi: 'सटीक रिकॉर्ड्स को तुरंत पंजीकृत कर लिया जाता है। त्रुटिपूर्ण प्रविष्टियों को अलग करके विशिष्ट त्रुटि कोड और सुधार सुझावों के साथ रिपोर्ट में प्रस्तुत किया जाता है ताकि संस्थान समय पर आवश्यक सुधार कर सके।'
  },
  {
    category: 'STUDENT',
    q: 'How can a student inspect their verification status and manage digital consent?',
    qHi: 'छात्र अपनी सत्यापन स्थिति की जांच एवं डिजिटल सहमति का प्रबंधन कैसे कर सकते हैं?',
    a: 'Students log in to the Student Portal to view their verified enrollment status, download their cryptographically signed Academic Identity Certificate with tamper-evident QR, and toggle third-party verification consent under the DPDP Act 2023 framework.',
    aHi: 'छात्र अपने पोर्टल में लॉगिन कर अपने सत्यापित नामांकन की स्थिति देख सकते हैं, क्यूआर कोड युक्त डिजिटल शैक्षणिक प्रमाणपत्र डाउनलोड कर सकते हैं तथा तीसरे पक्ष के सत्यापन हेतु अपनी डिजिटल सहमति को नियंत्रित कर सकते हैं।'
  },
  {
    category: 'VERIFICATION',
    q: 'Does entering an APAAR ID in public verification expose sensitive student information?',
    qHi: 'क्या सार्वजनिक सत्यापन में अपार आईडी दर्ज करने पर छात्र की निजी जानकारी उजागर होती है?',
    a: 'No. Strictly following privacy-by-design standards, public verification displays minimal non-sensitive validation indicators (Active / Disputed status, Institution, and Academic Program). Sensitive demographic data and personal identity numbers are never disclosed without authenticated consent.',
    aHi: 'कदापि नहीं। डेटा गोपनीयता सिद्धांतों का कड़ाई से पालन करते हुए सार्वजनिक सत्यापन केवल आवश्यक न्यूनतम संकेतक (सत्यापित स्थिति, संस्थान व पाठ्यक्रम) ही दर्शाता है। व्यक्तिगत व संवेदनशील पहचान कभी भी सार्वजनिक रूप से प्रदर्शित नहीं की जाती।'
  },
  {
    category: 'VERIFICATION',
    q: 'How are potential duplicate enrollment matches and dual seat claims resolved?',
    qHi: 'संभावित दोहरे प्रवेश टकराव एवं डुप्लिकेट मामलों का समाधान कैसे किया जाता है?',
    a: 'When an active APAAR ID collision is detected across multiple institutions, the system creates a formal Violation Case with a timestamped cryptographic audit trail. Designated AICTE Regulatory Officers review admission withdrawal records and resolve the dual allocation.',
    aHi: 'एक ही अपार आईडी पर विभिन्न कॉलेजों में सक्रिय प्रवेश का संकेत मिलते ही सिस्टम औपचारिक उल्लंघन केस दर्ज करता है। संबंधित नियामक अधिकारी दोनों संस्थानों से संवाद कर और विड्रॉल रसीदों की जांच कर सीट विवाद का समाधान करते हैं।'
  }
];
