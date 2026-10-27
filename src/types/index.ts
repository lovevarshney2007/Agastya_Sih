export type UserRole = 
  | 'INSTITUTION' 
  | 'AICTE_OFFICER' 
  | 'AICTE_SUPER_ADMIN' 
  | 'VERIFIER' 
  | 'STUDENT' 
  | 'PUBLIC_VERIFY'
  | 'ARCHITECTURE_MAP';

export type MainNavPage = 'HOME' | 'LOGIN' | 'PORTALS' | 'ANALYTICS' | 'COMPLIANCE_STANDARDS' | 'DOCUMENTATION';

export interface StudentRecord {
  id: string;
  apaarId: string; // 12-digit format
  name: string;
  dob: string;
  gender: 'M' | 'F' | 'O';
  collegeId: string;
  collegeName: string;
  program: string;
  branch: string;
  academicYear: string;
  seatCategory: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'TFW' | 'Supernumerary (NRI/FN)';
  enrolmentStatus: 'Active' | 'Disputed' | 'Revoked' | 'Graduated';
  verificationStatus: 'Verified' | 'Pending' | 'Flagged';
  duplicateRisk: 'NONE' | 'SAME_COLLEGE' | 'CROSS_INSTITUTION' | 'FUZZY_MATCH';
  crossCollegeDetails?: string;
  admissionDate: string;
  studentIdNo: string;
  aadhaarStatus: 'Not Stored (Privacy Preserved)';
  consentGranted: boolean;
  version: number;
  digitalCredentialId?: string;
}

export interface Institution {
  id: string;
  aicteCode: string;
  name: string;
  state: string;
  district: string;
  type: 'Govt' | 'Autonomous' | 'Affiliated' | 'Deemed';
  approvedIntake: number;
  currentEnrolment: number;
  supernumeraryQuota: number;
  supernumeraryUsed: number;
  complianceStatus: 'Compliant' | 'Warning' | 'Breached';
  pendingViolations: number;
  contactEmail: string;
}

export interface UploadBatch {
  id: string;
  filename: string;
  uploadDate: string;
  academicYear: string;
  program: string;
  totalRows: number;
  acceptedRows: number;
  warningRows: number;
  rejectedRows: number;
  status: 'PROCESSING' | 'COMPLETED' | 'ACTION_REQUIRED';
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  id: string;
  rowNumber: number;
  studentName?: string;
  apaarId?: string;
  field: string;
  ruleCode: string;
  severity: 'CRITICAL' | 'WARNING' | 'REJECT';
  explanation: string;
  suggestedCorrection: string;
  status: 'OPEN' | 'RESOLVED' | 'WAIVED';
}

export interface ViolationCase {
  id: string;
  type: 'EXCESS_INTAKE' | 'CROSS_COLLEGE_DUPLICATE' | 'SUSPICIOUS_IDENTITY_MISMATCH' | 'QUOTA_EXCEEDED';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  title: string;
  description: string;
  institutionA: string;
  institutionB?: string;
  studentName?: string;
  apaarId?: string;
  reportedDate: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';
  assignedOfficer: string;
  notes: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  prevHash: string;
  hash: string;
  details: string;
}
