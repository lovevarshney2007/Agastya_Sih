// ─────────────────────────────────────────────────────────────────────────────
// Central API Client — connects to the deployed FastAPI backend
// Base URL: https://sih.monu14.me
// All endpoints are prefixed with /api/v1 (see backend config)
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sih.monu14.me';
export const API_BASE = `${BASE_URL}/api/v1`;

// ─── Token Storage ────────────────────────────────────────────────────────────

export const tokenStore = {
  get: (): string | null => localStorage.getItem('aicte_token'),
  set: (token: string) => localStorage.setItem('aicte_token', token),
  clear: () => localStorage.removeItem('aicte_token'),
};

export const userStore = {
  get: () => {
    const raw = localStorage.getItem('aicte_user');
    return raw ? JSON.parse(raw) : null;
  },
  set: (user: object) => localStorage.setItem('aicte_user', JSON.stringify(user)),
  clear: () => localStorage.removeItem('aicte_user'),
};

// ─── Generic Fetch Wrapper ────────────────────────────────────────────────────

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object | FormData;
  headers?: Record<string, string>;
  auth?: boolean; // attach Bearer token (default: true)
  isFormData?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, isFormData = false } = options;

  const headers: Record<string, string> = { ...options.headers };

  if (auth) {
    const token = tokenStore.get();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorDetail);
  }

  // Handle binary responses (CSV, PDF)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv') || contentType.includes('application/pdf')) {
    return res.blob() as unknown as T;
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPED API METHODS
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  institution_id: string | null;
  org_name: string;
  designation: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authApi = {
  /** Standard email + password login */
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    }),

  /** 1-Click quick login for demo personas */
  quickLogin: (personaId: string) =>
    apiFetch<LoginResponse>(`/auth/quick-login/${personaId}`, {
      method: 'POST',
      auth: false,
    }),

  /** Get current authenticated user profile */
  me: async () => {
    const raw = await apiFetch<Record<string, unknown>>('/auth/me');
    const inst = raw.institution as Record<string, unknown> | null | undefined;
    const normalized: AuthUser = {
      ...(raw as unknown as AuthUser),
      institution_id: (raw.institution_id as string) || (inst?.id as string) || null,
    };
    return normalized;
  },

  /** Logout */
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  /** List all demo personas */
  personas: () => apiFetch<object[]>('/auth/personas', { auth: false }),

  /** AICTE Bureau Feature: Onboard newly approved technical institution into central registry */
  onboardEoA: (data: {
    aicte_permanent_id: string;
    name: string;
    state: string;
    district: string;
    inst_type?: string;
    nodal_officer_name: string;
    nodal_officer_email: string;
    programs?: Array<{
      academic_year?: number;
      level?: string;
      program?: string;
      course: string;
      approved_intake: number;
      unfilled_vacancies_yr1?: number;
    }>;
  }) =>
    apiFetch<object>('/auth/institution/onboard-eoa', {
      method: 'POST',
      body: data,
      auth: false,
    }),

  /** First-time institution activation by verifying Nodal Officer email + OTP */
  activateInstitution: (data: {
    aicte_permanent_id: string;
    nodal_officer_email: string;
    otp: string;
    password: string;
    confirm_password: string;
  }) =>
    apiFetch<object>('/auth/institution/activate', {
      method: 'POST',
      body: data,
      auth: false,
    }),
};

// ── Institutions ──────────────────────────────────────────────────────────────

export const institutionApi = {
  /** Institution dashboard KPIs */
  dashboard: (institutionId: string) =>
    apiFetch<object>(`/institutions/${institutionId}/dashboard`),

  /** Upload CSV batch */
  uploadBatch: (institutionId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiFetch<object>(`/institutions/${institutionId}/upload`, {
      method: 'POST',
      body: fd,
      isFormData: true,
    });
  },

  /** 1-Click demo batch upload */
  uploadDemoBatch: (institutionId: string) =>
    apiFetch<object>(`/institutions/${institutionId}/upload-demo`, { method: 'POST' }),

  /** Get batch validation report */
  getBatchReport: (institutionId: string, batchId: string) =>
    apiFetch<object>(`/institutions/${institutionId}/batches/${batchId}/report`),

  /** Commit a validated batch */
  commitBatch: (institutionId: string, batchId: string) =>
    apiFetch<object>(`/institutions/${institutionId}/batches/${batchId}/commit`, {
      method: 'POST',
    }),

  /** List enrolled students */
  getStudents: (institutionId: string, search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const qs = params.toString();
    return apiFetch<object>(`/institutions/${institutionId}/students${qs ? `?${qs}` : ''}`);
  },

  /** Enroll single student */
  enrollStudent: (institutionId: string, studentData: object) =>
    apiFetch<object>(`/institutions/${institutionId}/students`, {
      method: 'POST',
      body: studentData,
    }),
};

// ── AICTE ─────────────────────────────────────────────────────────────────────

export const aicteApi = {
  /** National dashboard KPIs */
  dashboard: () => apiFetch<object>('/aicte/dashboard'),

  /** List all violations/duplicate cases */
  violations: () => apiFetch<object[]>('/aicte/violations'),

  /** Maker: propose a violation action */
  proposeAction: (caseId: string, action: string, officerName: string, reason: string) =>
    apiFetch<object>(`/aicte/violations/${caseId}/propose`, {
      method: 'POST',
      body: { action, officer_name: officerName, reason },
    }),

  /** Checker: approve or reject a proposed action */
  approveAction: (caseId: string, checkerOfficerName: string, approve: boolean) =>
    apiFetch<object>(`/aicte/violations/${caseId}/approve`, {
      method: 'POST',
      body: { checker_officer_name: checkerOfficerName, approve },
    }),

  /** Institution risk ranking */
  riskRanking: () => apiFetch<object>('/aicte/risk-ranking'),

  /** Audit ledger events */
  auditLedger: () => apiFetch<object>('/aicte/audit'),

  /** Verify SHA-256 chain integrity */
  verifyChain: () => apiFetch<object>('/aicte/audit/verify-chain', { method: 'POST' }),

  /** Simulate tampering (demo) */
  simulateTamper: () => apiFetch<object>('/aicte/audit/simulate-tamper', { method: 'POST' }),

  /** Anchor audit merkle root to WORM storage */
  anchorAudit: () => apiFetch<object>('/aicte/audit/anchor', { method: 'POST' }),
};

// ── Verifier ──────────────────────────────────────────────────────────────────

export const verifierApi = {
  /** Submit a verification request */
  submitRequest: (apaarId: string, purpose: string) =>
    apiFetch<object>('/verifier/requests', {
      method: 'POST',
      body: { apaar_id: apaarId, purpose },
    }),

  /** Get all verification requests (tracker) */
  tracker: () => apiFetch<object>('/verifier/tracker'),

  /** Get verifiable credential for a token */
  getCredential: (token: string) => apiFetch<object>(`/verifier/credential/${token}`),

  /** Download PDF certificate */
  downloadPdf: (token: string) =>
    apiFetch<Blob>(`/verifier/credential/${token}/pdf`),

  /** Direct download URL for PDF certificate */
  downloadPdfUrl: (token: string) =>
    `${API_BASE}/verifier/credential/${token}/pdf`,
};

// ── Student / Consent ─────────────────────────────────────────────────────────

export const studentApi = {
  /** Get student consent requests */
  getConsents: (studentToken: string) =>
    apiFetch<object>(`/student/${studentToken}/consents`),

  /** Grant or revoke consent */
  updateConsent: (consentId: string, action: 'APPROVE' | 'REVOKE') =>
    apiFetch<object>(`/student/consent/${consentId}/action`, {
      method: 'POST',
      body: { action },
    }),

  /** Simulate assisted SMS OTP consent */
  assistedSmsOtp: (apaarId: string, otp?: string) => {
    const params = new URLSearchParams({ apaar_id: apaarId });
    if (otp) params.append('otp', otp);
    return apiFetch<object>(`/student/consent/assisted-sms-otp?${params.toString()}`, {
      method: 'POST',
    });
  },
};

// ── Public Verification ───────────────────────────────────────────────────────

export const publicApi = {
  /** Zero-knowledge QR verification (no auth required) */
  verifyToken: (token: string) =>
    apiFetch<object>(`/verify/public/${token}`, { auth: false }),
};

// ── Reports / Exports ─────────────────────────────────────────────────────────

export const reportsApi = {
  /** Download national summary CSV */
  nationalCsvUrl: () => `${API_BASE}/reports/national-summary.csv`,

  /** Download institution compliance CSV */
  institutionCsvUrl: (institutionId: string) =>
    `${API_BASE}/reports/institution/${institutionId}.csv`,

  /** Download admission template CSV */
  admissionTemplateUrl: () => `${API_BASE}/reports/admission-template.csv`,
};
