export type Language = 'EN' | 'HI';

export const TRANSLATIONS = {
  EN: {
    // Top Bar
    screenReader: 'Screen Reader Access',
    subtitleTop: 'Smart Automation • SIH26263 • AICTE Regulation Bureau',
    activeGateway: 'AICTE National Gateway: Active',
    apaarDepository: 'One Nation, One Student ID (DigiLocker & NAD Depository)',
    deptName: 'Department of Higher Education, Ministry of Education, Government of India',
    councilHindi: 'अखिल भारतीय तकनीकी शिक्षा परिषद्',
    councilEnglish: 'All India Council for Technical Education',
    regulationBureau: 'Regulation Bureau',
    webPortalLogin: 'Web Portal Login',
    verifyApaarId: 'Verify APAAR ID',
    session: 'Session',
    logout: 'Logout',

    // Menu Ribbon
    home: 'Home',
    studentPortal: 'Student Portal',
    directApaar: 'Direct APAAR',
    collegeAdmin: 'College Admin',
    intakeAudit: 'Intake Audit',
    aicteSuperAdmin: 'AICTE Super Admin',
    panIndia: 'Pan-India',
    officerCommand: 'Officer Command',
    verifier: 'Verifier',
    analytics: 'Analytics',
    aphRules: 'APH Rules',
    docsSpec: 'Docs & Spec',

    // Hero Section
    pillTag: 'SIH26263 • REGULATION BUREAU',
    pillDesc: 'Approval Process & Academic Data Synchronization 2026-2027',
    heroHeadline: 'One Nation, One Student ID',
    heroSubHeadline: 'APAAR Verification Platform for AICTE-Approved Institutions',
    heroParagraph: 'National e-Governance architecture powered by DigiLocker & National Academic Depository (NAD) to audit approved intake, manage Supernumerary and NRI quotas, and intercept cross-institution duplicate admissions.',

    // Primary Tiles
    tileStudentTitle: 'Student Portal',
    tileStudentDesc: 'Direct APAAR ID verification, view ABC credits, and print digital academic pass.',
    tileStudentAction: 'Launch Portal',

    tileCollegeTitle: 'College Admin',
    tileCollegeDesc: 'Manage enrolments, upload batches, audit intake capacity, and resolve duplicate flags.',
    tileCollegeAction: 'Manage Enrolments',

    tileAdminTitle: 'AICTE Super Admin',
    tileAdminDesc: 'Pan-India state analytics, excess enrolment alerts, Kafka logs, and Apache POI Excel reports.',
    tileAdminAction: 'National Dashboard',

    // Search Bar & Presets
    searchPlaceholder: 'Enter 12-digit APAAR ID (e.g. APAAR12345678)...',
    verifyNow: 'Verify Now',
    quickPresets: 'Quick Test Presets:',

    // AICTE Sahayak
    sahayakButton: 'AICTE Sahayak',
    sahayakPrompt: 'AICTE Sahayak: How may I assist you with APAAR ID verification, batch ingestion, or compliance checks?'
  },
  HI: {
    // Top Bar
    screenReader: 'स्क्रीन रीडर एक्सेस',
    subtitleTop: 'स्मार्ट ऑटोमेशन • SIH26263 • एआईसीटीई विनियमन ब्यूरो',
    activeGateway: 'एआईसीटीई राष्ट्रीय गेटवे: सक्रिय',
    apaarDepository: 'एक राष्ट्र, एक छात्र पहचान पत्र (डिजीलॉकर और नॅड भंडार)',
    deptName: 'उच्च शिक्षा विभाग, शिक्षा मंत्रालय, भारत सरकार',
    councilHindi: 'अखिल भारतीय तकनीकी शिक्षा परिषद्',
    councilEnglish: 'All India Council for Technical Education',
    regulationBureau: 'विनियमन ब्यूरो',
    webPortalLogin: 'वेब पोर्टल लॉगिन',
    verifyApaarId: 'अपार आईडी सत्यापित करें',
    session: 'सत्र',
    logout: 'लॉगआउट',

    // Menu Ribbon
    home: 'होम',
    studentPortal: 'छात्र पोर्टल',
    directApaar: 'सीधा अपार',
    collegeAdmin: 'कॉलेज व्यवस्थापक',
    intakeAudit: 'प्रवेश क्षमता ऑडिट',
    aicteSuperAdmin: 'एआईसीटीई सुपर एडमिन',
    panIndia: 'अखिल भारतीय',
    officerCommand: 'अधिकारी कमान',
    verifier: 'सत्यापनकर्ता',
    analytics: 'एनालिटिक्स',
    aphRules: 'APH नियम',
    docsSpec: 'दस्तावेज़ व विनिर्देश',

    // Hero Section
    pillTag: 'SIH26263 • विनियमन ब्यूरो',
    pillDesc: 'स्वीकृति प्रक्रिया एवं शैक्षणिक डेटा समकालन 2026-2027',
    heroHeadline: 'एक राष्ट्र, एक छात्र आईडी',
    heroSubHeadline: 'एआईसीटीई-स्वीकृत संस्थानों के लिए अपार सत्यापन मंच',
    heroParagraph: 'डिजीलॉकर एवं राष्ट्रीय शैक्षणिक डिपॉजिटरी (NAD) द्वारा संचालित राष्ट्रीय ई-गवर्नेंस वास्तुकला — स्वीकृत प्रवेश क्षमता ऑडिट, अधिसंख्य और अनिवासी भारतीय कोटे का प्रबंधन एवं दोहरे दाखिलों की तत्काल रोकथाम।',

    // Primary Tiles
    tileStudentTitle: 'छात्र पोर्टल',
    tileStudentDesc: 'सीधा अपार आईडी सत्यापन, एबीसी क्रेडिट देखें एवं डिजिटल शैक्षणिक पास प्रिंट करें।',
    tileStudentAction: 'पोर्टल खोलें',

    tileCollegeTitle: 'कॉलेज व्यवस्थापक',
    tileCollegeDesc: 'नामांकन प्रबंधित करें, बैच अपलोड करें, प्रवेश क्षमता ऑडिट करें एवं डुप्लिकेट फ्लैग सुलझाएं।',
    tileCollegeAction: 'नामांकन प्रबंधित करें',

    tileAdminTitle: 'एआईसीटीई सुपर एडमिन',
    tileAdminDesc: 'अखिल भारतीय राज्य एनालिटिक्स, अतिरिक्त प्रवेश अलर्ट, काफ्का लॉग्स एवं एक्सेल रिपोर्ट।',
    tileAdminAction: 'राष्ट्रीय डैशबोर्ड',

    // Search Bar & Presets
    searchPlaceholder: '12-अंकों की अपार आईडी दर्ज करें (उदा. 123456789012)...',
    verifyNow: 'सत्यापित करें',
    quickPresets: 'त्वरित परीक्षण कोड:',

    // AICTE Sahayak
    sahayakButton: 'एआईसीटीई सहायक',
    sahayakPrompt: 'एआईसीटीई सहायक: मैं अपार आईडी सत्यापन, बैच अपलोड या अनुपालन जांच में आपकी क्या सहायता कर सकता हूँ?'
  }
};
