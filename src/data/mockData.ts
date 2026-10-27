import { StudentRecord, Institution, UploadBatch, ViolationCase, AuditLog } from '../types';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-1',
    aicteCode: '1-33249011',
    name: 'Delhi Institute of Engineering & Technology (DIET)',
    state: 'Delhi',
    district: 'New Delhi',
    type: 'Govt',
    approvedIntake: 420,
    currentEnrolment: 416,
    supernumeraryQuota: 42,
    supernumeraryUsed: 28,
    complianceStatus: 'Compliant',
    pendingViolations: 0,
    contactEmail: 'registrar@diet.ac.in'
  },
  {
    id: 'inst-2',
    aicteCode: '1-44910283',
    name: 'Maharashtra Institute of Advanced Technology (MIT)',
    state: 'Maharashtra',
    district: 'Pune',
    type: 'Autonomous',
    approvedIntake: 600,
    currentEnrolment: 624, // VIOLATION! +24 over quota
    supernumeraryQuota: 60,
    supernumeraryUsed: 60,
    complianceStatus: 'Breached',
    pendingViolations: 2,
    contactEmail: 'admissions@mitpune.edu'
  },
  {
    id: 'inst-3',
    aicteCode: '1-98234120',
    name: 'Bengaluru Global Academy of Technology (BGAT)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    type: 'Affiliated',
    approvedIntake: 480,
    currentEnrolment: 472,
    supernumeraryQuota: 48,
    supernumeraryUsed: 35,
    complianceStatus: 'Warning',
    pendingViolations: 1,
    contactEmail: 'admin@bgat.edu.in'
  },
  {
    id: 'inst-4',
    aicteCode: '1-55102948',
    name: 'Hyderabad Cyber Valley Institute of Science (HCVIS)',
    state: 'Telangana',
    district: 'Hyderabad',
    type: 'Deemed',
    approvedIntake: 540,
    currentEnrolment: 538,
    supernumeraryQuota: 54,
    supernumeraryUsed: 49,
    complianceStatus: 'Compliant',
    pendingViolations: 0,
    contactEmail: 'director@hcvis.ac.in'
  }
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std-101',
    apaarId: '892019482019',
    name: 'Aarav Sharma',
    dob: '2004-05-14',
    gender: 'M',
    collegeId: 'inst-1',
    collegeName: 'Delhi Institute of Engineering & Technology (DIET)',
    program: 'B.Tech Computer Science & Engineering',
    branch: 'CSE',
    academicYear: '2025-26',
    seatCategory: 'General',
    enrolmentStatus: 'Active',
    verificationStatus: 'Verified',
    duplicateRisk: 'NONE',
    admissionDate: '2025-08-01',
    studentIdNo: '2025-CSE-042',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: true,
    version: 1,
    digitalCredentialId: 'AICTE-CERT-2025-892019'
  },
  {
    id: 'std-102',
    apaarId: '472910482910',
    name: 'Ananya Deshmukh',
    dob: '2004-11-20',
    gender: 'F',
    collegeId: 'inst-2',
    collegeName: 'Maharashtra Institute of Advanced Technology (MIT)',
    program: 'B.Tech Artificial Intelligence & DS',
    branch: 'AI-DS',
    academicYear: '2025-26',
    seatCategory: 'OBC',
    enrolmentStatus: 'Disputed',
    verificationStatus: 'Flagged',
    duplicateRisk: 'CROSS_INSTITUTION',
    crossCollegeDetails: 'Simultaneously registered at BGAT Bengaluru (2025-EC-109)',
    admissionDate: '2025-08-12',
    studentIdNo: 'MIT-25-AI-014',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: false,
    version: 2,
    digitalCredentialId: 'AICTE-CERT-2025-472910'
  },
  {
    id: 'std-103',
    apaarId: '472910482910', // Same duplicate APAAR
    name: 'Ananya Deshmukh',
    dob: '2004-11-20',
    gender: 'F',
    collegeId: 'inst-3',
    collegeName: 'Bengaluru Global Academy of Technology (BGAT)',
    program: 'B.Tech Electronics & Communication',
    branch: 'ECE',
    academicYear: '2025-26',
    seatCategory: 'General',
    enrolmentStatus: 'Disputed',
    verificationStatus: 'Flagged',
    duplicateRisk: 'CROSS_INSTITUTION',
    crossCollegeDetails: 'Simultaneously registered at MIT Pune (MIT-25-AI-014)',
    admissionDate: '2025-08-08',
    studentIdNo: '2025-EC-109',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: true,
    version: 1
  },
  {
    id: 'std-104',
    apaarId: '639102847192',
    name: 'Rohan Varma',
    dob: '2003-09-02',
    gender: 'M',
    collegeId: 'inst-1',
    collegeName: 'Delhi Institute of Engineering & Technology (DIET)',
    program: 'B.Tech Mechanical Engineering',
    branch: 'ME',
    academicYear: '2025-26',
    seatCategory: 'Supernumerary (NRI/FN)',
    enrolmentStatus: 'Active',
    verificationStatus: 'Verified',
    duplicateRisk: 'NONE',
    admissionDate: '2025-07-28',
    studentIdNo: '2025-ME-019',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: true,
    version: 1,
    digitalCredentialId: 'AICTE-CERT-2025-639102'
  },
  {
    id: 'std-105',
    apaarId: '918273645012',
    name: 'Sneha Sundaram',
    dob: '2004-03-18',
    gender: 'F',
    collegeId: 'inst-4',
    collegeName: 'Hyderabad Cyber Valley Institute of Science (HCVIS)',
    program: 'B.Tech Computer Science & Engineering',
    branch: 'CSE',
    academicYear: '2025-26',
    seatCategory: 'EWS',
    enrolmentStatus: 'Active',
    verificationStatus: 'Pending',
    duplicateRisk: 'NONE',
    admissionDate: '2025-08-15',
    studentIdNo: 'HCV-2025-104',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: true,
    version: 1,
    digitalCredentialId: 'AICTE-CERT-2025-918273'
  },
  {
    id: 'std-106',
    apaarId: '102938475610',
    name: 'Vikramjit Singh',
    dob: '2004-12-05',
    gender: 'M',
    collegeId: 'inst-2',
    collegeName: 'Maharashtra Institute of Advanced Technology (MIT)',
    program: 'B.Tech Civil Engineering',
    branch: 'CE',
    academicYear: '2025-26',
    seatCategory: 'General',
    enrolmentStatus: 'Active',
    verificationStatus: 'Verified',
    duplicateRisk: 'NONE',
    admissionDate: '2025-08-04',
    studentIdNo: 'MIT-25-CE-088',
    aadhaarStatus: 'Not Stored (Privacy Preserved)',
    consentGranted: false,
    version: 1
  }
];

export const INITIAL_BATCHES: UploadBatch[] = [
  {
    id: 'BATCH-2025-08-001',
    filename: 'DIET_BTech_Admissions_Round1.csv',
    uploadDate: '2025-08-18 14:32:10',
    academicYear: '2025-26',
    program: 'B.Tech Engineering (All Branches)',
    totalRows: 420,
    acceptedRows: 412,
    warningRows: 5,
    rejectedRows: 3,
    status: 'COMPLETED',
    issues: [
      {
        id: 'iss-1',
        rowNumber: 42,
        studentName: 'Tanya Gupta',
        apaarId: '778901234',
        field: 'apaarId',
        ruleCode: 'VAL_ERR_LEN_12',
        severity: 'REJECT',
        explanation: 'APAAR ID must be exactly 12 numeric digits (Found 9 digits).',
        suggestedCorrection: 'Verify APAAR card or DigiLocker ABC record and enter complete 12 digits.',
        status: 'OPEN'
      },
      {
        id: 'iss-2',
        rowNumber: 118,
        studentName: 'Mohammed Zaid',
        apaarId: '882910482910',
        field: 'seatCategory',
        ruleCode: 'WARN_SUPERNUMERARY_QUOTA',
        severity: 'WARNING',
        explanation: 'Supernumerary seat allocated while general quota is still 8% unfilled.',
        suggestedCorrection: 'Check if candidate is eligible under NRI/FN or TFWS category document.',
        status: 'RESOLVED'
      },
      {
        id: 'iss-3',
        rowNumber: 209,
        studentName: 'Kavita Rawat',
        apaarId: '472910482910',
        field: 'apaarId',
        ruleCode: 'DUP_CROSS_COLLEGE_ACTIVE',
        severity: 'CRITICAL',
        explanation: 'Cross-college duplicate: Active enrolment detected in MIT Pune & BGAT Bengaluru.',
        suggestedCorrection: 'Contact student to confirm admission withdrawal status from previous college.',
        status: 'OPEN'
      }
    ]
  }
];

export const INITIAL_VIOLATIONS: ViolationCase[] = [
  {
    id: 'VIO-2025-001',
    type: 'EXCESS_INTAKE',
    severity: 'CRITICAL',
    title: 'Admissions Exceeded Approved Intake (+24 Students)',
    description: 'Maharashtra Institute of Advanced Technology (MIT) enrolled 624 students against approved intake of 600.',
    institutionA: 'Maharashtra Institute of Advanced Technology (MIT)',
    reportedDate: '2025-08-20',
    status: 'OPEN',
    assignedOfficer: 'Dr. S. K. Murthy (Director AICTE West)',
    notes: [
      'Automatic detection by Intake Compliance Service.',
      'Show-cause notice draft dispatched to Registrar on 2025-08-21.'
    ]
  },
  {
    id: 'VIO-2025-002',
    type: 'CROSS_COLLEGE_DUPLICATE',
    severity: 'HIGH',
    title: 'Dual Enrolment Flag: APAAR 472910482910 (Ananya Deshmukh)',
    description: 'Student enrolled simultaneously in B.Tech CSE (MIT Pune) and B.Tech ECE (BGAT Bengaluru). Dual seat block detected.',
    institutionA: 'Maharashtra Institute of Advanced Technology (MIT)',
    institutionB: 'Bengaluru Global Academy of Technology (BGAT)',
    studentName: 'Ananya Deshmukh',
    apaarId: '472910482910',
    reportedDate: '2025-08-19',
    status: 'UNDER_REVIEW',
    assignedOfficer: 'P. Radhakrishnan (Deputy Director, AICTE South)',
    notes: [
      'Student contacted: stated withdrawal from BGAT submitted but not processed by registrar.'
    ]
  },
  {
    id: 'VIO-2025-003',
    type: 'QUOTA_EXCEEDED',
    severity: 'MEDIUM',
    title: 'TFW/Supernumerary Quota Breach Alert',
    description: 'Institution 1-44910283 supernumerary intake reached 100% capacity with 4 pending registrations.',
    institutionA: 'Maharashtra Institute of Advanced Technology (MIT)',
    reportedDate: '2025-08-18',
    status: 'OPEN',
    assignedOfficer: 'Dr. S. K. Murthy (Director AICTE West)',
    notes: ['Flagged during batch upload processing.']
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-9921',
    timestamp: '2026-10-27 11:04:12',
    actor: 'admin@diet.ac.in',
    role: 'INSTITUTION_ADMIN',
    action: 'BATCH_UPLOAD_VALIDATION',
    entity: 'UploadBatch',
    entityId: 'BATCH-2025-08-001',
    prevHash: '0x889a918f88c7e14...',
    hash: '0x99e2f41c0029b93...',
    details: 'Parsed 420 records: 412 accepted, 5 warnings, 3 rejects. Rules: VAL_ERR_LEN_12, DUP_CROSS_COLLEGE_ACTIVE.'
  },
  {
    id: 'LOG-9920',
    timestamp: '2026-10-27 10:48:30',
    actor: 'dr.skmurthy@aicte-india.org',
    role: 'AICTE_OFFICER',
    action: 'VIOLATION_CASE_FLAGGED',
    entity: 'ViolationCase',
    entityId: 'VIO-2025-001',
    prevHash: '0x712a4199c001a4e...',
    hash: '0x889a918f88c7e14...',
    details: 'Intake violation generated for Maharashtra Inst of Adv Tech (+24 excess enrolments).'
  },
  {
    id: 'LOG-9919',
    timestamp: '2026-10-27 09:15:02',
    actor: 'verifier.tcs@tcs.com',
    role: 'AUTHORIZED_VERIFIER',
    action: 'CONSENT_CHECKED_QUERY',
    entity: 'StudentRecord',
    entityId: '892019482019',
    prevHash: '0x32ba81001ff893b...',
    hash: '0x712a4199c001a4e...',
    details: 'Verified minimal credentials for Aarav Sharma (Employment background check). Consent PASS.'
  }
];
