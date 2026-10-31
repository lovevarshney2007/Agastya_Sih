import type {
  AddStudentInput, AddStudentResult, AuditLedger, BatchReport, BatchSummary, CaseDetail, CaseSummary, ChainCheck,
  CommitResult, Consent, CredentialResult, DemoAccounts, InstitutionDashboard, InstitutionListItem, LoginResponse,
  NationalDashboard, OnboardInput, PublicSeatsResponse, PublicStats, PublicVerifyResult, RecordHistory, RiskRanking, SessionUser, StudentPage,
  StudentRecord, StudentRow, StudentShare, VerificationRequestSummary, VerifierTracker,
  ForecastingResult, FuzzyDedupResponse, BatchFraudAnalysis, CohortAnomalyItem,
} from './types';

// In development Vite proxies /api to the local backend (see vite.config.ts).
// A deployed build uses VITE_API_BASE_URL, falling back to the team's hosted backend.
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'https://sih.monu14.me')).replace(/\/$/, '');
export const API_BASE = `${API_ORIGIN}/api/v1`;

const TOKEN_KEY = 'apaar.session.token';
const USER_KEY = 'apaar.session.user';

export const sessionStore = {
  token: (): string | null => safeGet(TOKEN_KEY),
  user: (): SessionUser | null => {
    const raw = safeGet(USER_KEY);
    try { return raw ? (JSON.parse(raw) as SessionUser) : null; } catch { return null; }
  },
  save(token: string, user: SessionUser) {
    safeSet(TOKEN_KEY, token);
    safeSet(USER_KEY, JSON.stringify(user));
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* storage unavailable */ }
  },
};

function safeGet(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSet(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } }

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// App-level listener so an expired session sends the user back to sign-in.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) { onUnauthorized = handler; }

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  timeoutMs?: number;
}

async function send(path: string, { method = 'GET', body, form, auth = true, timeoutMs = 30000 }: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = sessionStore.token();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, 'The server took too long to respond. Please try again.');
    }
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running and try again.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const data = await res.json();
      if (typeof data.detail === 'string') message = data.detail;
      else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        const d = data.detail[0];
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : '';
        message = field ? `${String(field).replace(/_/g, ' ')}: ${d.msg}` : d.msg;
      }
    } catch { /* non-JSON error body */ }
    if (res.status === 401 && auth && token) onUnauthorized?.();
    throw new ApiError(res.status, message);
  }
  return res;
}

async function json<T>(path: string, options?: RequestOptions): Promise<T> {
  return (await send(path, options)).json() as Promise<T>;
}

/** Fetches an authenticated file and hands it to the browser as a download. */
export async function downloadFile(path: string, fallbackName: string) {
  const res = await send(path);
  const disposition = res.headers.get('content-disposition') ?? '';
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const q = (params: Record<string, string | number | undefined>) => {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== 'ALL') s.set(k, String(v)); });
  const str = s.toString();
  return str ? `?${str}` : '';
};

export const api = {
  auth: {
    demoAccounts: () => json<DemoAccounts>('/auth/personas', { auth: false }),
    login: (email: string, password: string) =>
      json<LoginResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    demoLogin: (personaId: string) =>
      json<LoginResponse>(`/auth/quick-login/${personaId}`, { method: 'POST', auth: false }),
    activate: (body: { aicte_permanent_id: string; nodal_officer_email: string; otp: string; password: string; confirm_password: string }) =>
      json<LoginResponse>('/auth/institution/activate', { method: 'POST', body, auth: false }),
    me: () => json<SessionUser>('/auth/me'),
    logout: () => json<unknown>('/auth/logout', { method: 'POST' }),
  },

  institution: {
    dashboard: (id: string) => json<InstitutionDashboard>(`/institutions/${id}/dashboard`),
    batches: (id: string) => json<BatchSummary[]>(`/institutions/${id}/batches`),
    batch: (id: string, batchId: string) => json<BatchReport>(`/institutions/${id}/batches/${batchId}`),
    upload: (id: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return json<BatchReport>(`/institutions/${id}/upload`, { method: 'POST', form, timeoutMs: 120000 });
    },
    uploadSample: (id: string) => json<BatchReport>(`/institutions/${id}/upload-demo`, { method: 'POST', timeoutMs: 120000 }),
    commit: (id: string, batchId: string) =>
      json<CommitResult>(`/institutions/${id}/batches/${batchId}/commit`, { method: 'POST', body: { declaration: true } }),
    discard: (id: string, batchId: string) =>
      json<{ status: string }>(`/institutions/${id}/batches/${batchId}/discard`, { method: 'POST' }),
    students: (id: string, params: { search?: string; status?: string; identity_status?: string; verification_status?: string; course?: string; purpose?: string; page?: number; page_size?: number }) =>
      json<StudentPage>(`/institutions/${id}/students${q(params)}`),
    addStudent: (id: string, body: AddStudentInput) =>
      json<AddStudentResult>(`/institutions/${id}/students`, { method: 'POST', body }),
    changeStatus: (id: string, enrolmentId: string, status: string, reason: string) =>
      json<StudentRow>(`/institutions/${id}/students/${enrolmentId}/status`, { method: 'POST', body: { status, reason } }),
    history: (id: string, enrolmentId: string) => json<RecordHistory>(`/institutions/${id}/students/${enrolmentId}/history`),
    exportRegistry: (id: string) => downloadFile(`/reports/institution/${id}.csv`, 'registry.csv'),
  },

  aicte: {
    dashboard: () => json<NationalDashboard>('/aicte/dashboard'),
    institutions: () => json<InstitutionListItem[]>('/aicte/institutions'),
    onboard: (body: OnboardInput) => json<{ institution_id: string }>('/aicte/institutions', { method: 'POST', body }),
    cases: () => json<CaseSummary[]>('/aicte/violations'),
    case: (caseId: string) => json<CaseDetail>(`/aicte/violations/${caseId}`),
    propose: (caseId: string, action_type: string, note: string) =>
      json<CaseSummary>(`/aicte/violations/${caseId}/propose`, { method: 'POST', body: { action_type, note } }),
    decide: (caseId: string, approve: boolean, note: string) =>
      json<CaseSummary>(`/aicte/violations/${caseId}/approve`, { method: 'POST', body: { approve, note } }),
    risk: () => json<RiskRanking>('/aicte/risk-ranking'),
    audit: (params: { search?: string; action?: string; actor_type?: string }) => json<AuditLedger>(`/aicte/audit${q(params)}`),
    verifyChain: () => json<ChainCheck>('/aicte/audit/verify-chain', { method: 'POST' }),
    tamper: () => json<{ status: string; tampered_seq?: number; message: string }>('/aicte/audit/simulate-tamper', { method: 'POST' }),
    restore: () => json<{ status: string; message: string }>('/aicte/audit/restore', { method: 'POST' }),
    anchor: () => json<{ status: string; message?: string; merkle_root?: string; events_anchored?: number }>('/aicte/audit/anchor', { method: 'POST' }),
    exportNational: () => downloadFile('/reports/national-summary.csv', 'national_summary.csv'),
    downloadExecutivePdf: () => downloadFile('/aicte/reports/national-briefing-pdf', 'AICTE-National-Compliance-Briefing-2026.pdf'),
    rules: () => json<any>('/aicte/rules'),
    updateRule: (body: { rule_id: string; enabled: boolean; severity: string }) =>
      json<any>('/aicte/rules/update', { method: 'POST', body }),
    updateSeatCategory: (body: { category_code: string; cap_percentage: number; is_over_and_above: boolean }) =>
      json<any>('/aicte/rules/seat-category', { method: 'POST', body }),
    simulateRuleImpact: () => json<any>('/aicte/rules/simulate-impact', { method: 'POST' }),
    verifierOrgs: () => json<any[]>('/aicte/verifier-orgs'),
    updateVerifierOrgStatus: (orgId: string, status: string, reason?: string) =>
      json<any>(`/aicte/verifier-orgs/${encodeURIComponent(orgId)}/status`, { method: 'POST', body: { status, reason } }),
    updateVerifierOrgQuota: (orgId: string, monthly_quota: number) =>
      json<any>(`/aicte/verifier-orgs/${encodeURIComponent(orgId)}/quota`, { method: 'POST', body: { monthly_quota } }),
    downloadShowCausePdf: (caseId: string) =>
      downloadFile(`/aicte/violations/${encodeURIComponent(caseId)}/show-cause-pdf`, `AICTE-Show-Cause-Notice-${caseId}.pdf`),
    securityScenarios: () => json<any[]>('/security/simulator/scenarios'),
    executeAttack: (scenario_id: string, custom_payload?: Record<string, any>) =>
      json<any>('/security/simulator/execute', { method: 'POST', body: { scenario_id, custom_payload } }),
  },

  verifier: {
    tracker: () => json<VerifierTracker>('/verifier/requests'),
    submit: (apaar_id: string, purpose: string) =>
      json<VerificationRequestSummary & { message: string }>('/verifier/requests', { method: 'POST', body: { apaar_id, purpose } }),
    result: (token: string) => json<CredentialResult>(`/verifier/requests/${encodeURIComponent(token)}`),
    withdraw: (token: string) => json<VerificationRequestSummary>(`/verifier/requests/${encodeURIComponent(token)}/withdraw`, { method: 'POST' }),
    downloadPdf: (token: string) => downloadFile(`/verifier/requests/${encodeURIComponent(token)}/pdf`, 'credential.pdf'),
    zkpVerify: (body: { token: string; verify_age_gte_18?: boolean; verify_accredited?: boolean; verify_active?: boolean }) =>
      json<{
        success: boolean;
        status: string;
        protocol: string;
        zkp_proof_standard: string;
        pii_redacted: boolean;
        timestamp: string;
        selective_claims: Record<string, {
          verified: boolean;
          attribute: string;
          finding: string;
          proof_mode: string;
          note: string;
          institution_status?: string;
        }>;
      }>('/verifier/zkp-verify', { method: 'POST', body }),
  },

  student: {
    me: () => json<StudentRecord>('/student/me'),
    consent: (consentId: string, action: 'APPROVE' | 'DENY' | 'REVOKE', duration_days?: number) =>
      json<Consent>(`/student/consents/${consentId}`, { method: 'POST', body: { action, duration_days } }),
    share: (enrolment_id: string, purpose: string, validity_days: number) =>
      json<StudentShare>('/student/shares', { method: 'POST', body: { enrolment_id, purpose, validity_days } }),
    revokeShare: (token: string) => json<VerificationRequestSummary>(`/student/shares/${encodeURIComponent(token)}/revoke`, { method: 'POST' }),
    guardianRequests: () => json<any[]>('/student/guardian/requests'),
    verifyGuardianOtp: (phone: string, otp: string) =>
      json<any>('/student/guardian/verify-otp', { method: 'POST', body: { phone, otp } }),
    guardianConsentAction: (consentId: string, body: { action: string; guardian_name?: string; guardian_phone?: string; relation?: string; duration_days?: number }) =>
      json<any>(`/student/guardian/consent/${encodeURIComponent(consentId)}`, { method: 'POST', body }),
    rightsRequests: () => json<any[]>('/student/rights/requests'),
    submitRightsRequest: (body: { request_type: string; subject: string; description: string; evidence_notes?: string }) =>
      json<any>('/student/rights/requests', { method: 'POST', body }),
    exportDataPortability: () => json<any>('/student/rights/data-export'),
    digilockerStatus: () =>
      json<{ is_linked: boolean; digilocker_id?: string; linked_at?: string; synced_credentials_count?: number; last_synced_at?: string }>('/student/digilocker/status'),
    linkDigiLocker: (body: { security_pin: string; aadhaar_last4?: string }) =>
      json<{ success: boolean; message: string; digilocker_id: string }>('/student/digilocker/link', { method: 'POST', body }),
    pushToDigiLocker: (enrolment_id: string) =>
      json<{ success: boolean; message: string; doc_uri: string; status: string; synced_at: string }>('/student/digilocker/push-credential', { method: 'POST', body: { enrolment_id } }),
  },

  get: <T>(path: string) => json<T>(path),
  post: <T>(path: string, body?: unknown) => json<T>(path, { method: 'POST', body }),

  publicStats: () => json<PublicStats>('/public/stats', { auth: false }),
  publicSeats: (params: { state?: string; level?: string; search?: string; page?: number; page_size?: number } = {}) =>
    json<PublicSeatsResponse>(`/public/seats${q(params)}`, { auth: false }),
  publicVerify: (token: string) => json<PublicVerifyResult>(`/verify/public/${encodeURIComponent(token)}`, { auth: false }),
  templateDownload: () => downloadFile('/reports/admission-template.csv', 'upload_template.csv'),

  ml: {
    forecasting: (state?: string) => json<ForecastingResult>(`/ml/forecasting${q({ state })}`),
    fuzzyDedup: (body: {
      student_name: string;
      dob?: string;
      father_name?: string;
      target_name?: string;
      target_dob?: string;
      institution_id?: string;
      threshold?: number;
    }) => json<FuzzyDedupResponse>('/ml/fuzzy-dedup', { method: 'POST', body }),
    batchFraud: (batchId: string) => json<BatchFraudAnalysis>(`/ml/batch-fraud/${encodeURIComponent(batchId)}`),
    cohortAnomalies: () => json<CohortAnomalyItem[]>('/ml/cohort-anomalies'),
  },

  notifications: {
    list: () => json<{
      unread_count: number;
      notifications: Array<{
        id: string;
        title: string;
        message: string;
        severity: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
        category: string;
        action_link?: string;
        is_read: boolean;
        created_at: string;
      }>;
    }>('/notifications'),
    markRead: (id: string) => json<any>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
    markAllRead: () => json<any>('/notifications/mark-all-read', { method: 'POST' }),
  },
};
