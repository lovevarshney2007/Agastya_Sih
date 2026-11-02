// Response shapes of the FastAPI backend (SIH-backend/app/api/endpoints.py).

export type Role = 'INSTITUTION_REGISTRAR' | 'AICTE_MAKER' | 'AICTE_CHECKER' | 'VERIFIER' | 'STUDENT';

export interface SessionUser {
  user_id: string;
  email: string;
  full_name: string;
  role: Role;
  institution_id: string | null;
  org_name: string | null;
  designation: string | null;
  student_token: string | null;
  verifier_org_id: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: SessionUser;
}

export interface DemoAccounts {
  password: string;
  accounts: { persona_id: string; email: string; label: string; organisation: string }[];
}

// ── Institution ─────────────────────────────────────────────
export interface ProgrammeRow {
  program_offering_id: string;
  course: string;
  level: string;
  academic_year: number;
  approved_intake: number;
  enrolled: number;
  supernumerary: number;
  supernumerary_cap: number;
  lateral: number;
  lateral_cap: number;
  held: number;
  utilization_pct: number;
}

export interface AttentionItem {
  type: string;
  severity: Severity;
  target: string;
  title: string;
  description: string;
}

export interface InstitutionDashboard {
  as_of: string;
  institution: {
    id: string; name: string; code: string; state: string; district: string | null;
    type: string; nodal_officer: string; status: string;
  };
  kpis: {
    total_enrolled: number;
    approved_intake: number;
    supernumerary_count: number;
    identity_verified_pct: number;
    pending_apaar_count: number;
    held_count: number;
    open_cases: number;
  };
  program_breakdown: ProgrammeRow[];
  latest_batch: { batch_id: string; filename: string; status: string; total_rows: number; created_at: string } | null;
  attention_items: AttentionItem[];
  submission_deadline: string | null;
}

export interface BatchCounts { total: number; accepted: number; warnings: number; holds: number; rejected: number }

export interface BatchSummary {
  batch_id: string;
  filename: string;
  status: BatchStatus;
  uploaded_by: string | null;
  created_at: string;
  committed_at: string | null;
  rule_version: string;
  counts: BatchCounts;
}

export type BatchStatus = 'VALIDATING' | 'READY_TO_COMMIT' | 'COMMITTED' | 'DISCARDED' | 'FAILED';
export type RowDecision = 'ACCEPT' | 'ACCEPT_WITH_WARNING' | 'HOLD' | 'REJECT';
export type Severity = 'Warning' | 'Error' | 'Review' | 'Violation' | 'Critical';

export interface ValidationIssue {
  issue_id: string;
  row_number: number;
  student_id_no: string | null;
  masked_apaar: string | null;
  rule_id: string;
  severity: Severity;
  message: string;
  suggested_fix: string | null;
  row_decision: RowDecision;
}

export interface BatchReport extends Omit<BatchSummary, 'uploaded_by'> {
  uploaded_by: string | null;
  issues: ValidationIssue[];
}

export interface CommitResult {
  status: string;
  committed_at: string;
  recorded: number;
  held: number;
  rejected: number;
  cases_opened: string[];
}

export interface StudentRow {
  enrolment_id: string;
  student_id_no: string;
  name: string | null;
  masked_apaar: string;
  course: string | null;
  academic_year: number;
  year_of_study: number;
  mode: string;
  seat_category: string;
  is_supernumerary: boolean;
  nationality: string;
  status: string;
  identity_status: string;
  verification_status: string;
  version: number;
  source_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentPage {
  as_of: string;
  total: number;
  page: number;
  page_size: number;
  students: StudentRow[];
}

export interface RecordHistory {
  events: { seq: number; at: string; actor: string; action: string; detail: Record<string, unknown> }[];
  issues: { rule_id: string; severity: Severity; message: string; suggested_fix: string | null }[];
}

export interface AddStudentInput {
  apaar_id: string;
  student_id_no: string;
  name: string;
  dob: string;
  course: string;
  year_of_study: number;
  mode: string;
  seat_category: string;
  is_supernumerary: boolean;
  nationality: string;
}

export interface AddStudentResult {
  decision: RowDecision;
  issues: { rule_id: string; severity: Severity; message: string; suggested_fix: string }[];
  student: StudentRow;
  case_number: string | null;
}

// ── AICTE ───────────────────────────────────────────────────
export interface NationalDashboard {
  as_of: string;
  kpis: {
    approved_institutions: number;
    institutions_reported: number;
    total_students_enrolled: number;
    identity_verified_pct: number;
    pending_apaar: number;
    open_cases: number;
    awaiting_approval: number;
    duplicates_intercepted: number;
    high_risk_institutions: number;
    over_intake_institutions: number;
  };
  state_aggregates: {
    state: string; institutions: number; reported: number; enrolled: number;
    approved_intake: number; open_cases: number; high_risk: number;
  }[];
  reporting_funnel: { stage: string; count: number }[];
  attention: {
    recent_cases: { case_id: string; case_number: string; status: CaseStatus; severity: string; created_at: string }[];
    top_risk: { institution_id: string; name: string; state: string; risk_score: number; risk_level: RiskLevel; reasons: string[] }[];
    over_intake: { institution_id: string; name: string }[];
  };
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type CaseStatus = 'OPEN' | 'UNDER_REVIEW' | 'PENDING_APPROVAL' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface InstitutionListItem {
  institution_id: string;
  aicte_permanent_id: string;
  name: string;
  state: string;
  district: string | null;
  type: string;
  status: string;
  is_activated: boolean;
  nodal_officer: string;
  nodal_officer_email: string;
  programmes: number;
  approved_intake: number;
  enrolled: number;
  within_intake: number;
  open_cases: number;
  risk_score: number;
  risk_level: RiskLevel;
  risk_reasons: string[];
  last_submission: string | null;
}

export interface OnboardInput {
  aicte_permanent_id: string;
  name: string;
  state: string;
  district: string;
  inst_type: string;
  nodal_officer_name: string;
  nodal_officer_email: string;
  programs: { course: string; approved_intake: number; level: string }[];
}

export interface CaseSummary {
  case_id: string;
  case_number: string;
  masked_apaar: string;
  conflict_type: string;
  rule_id: string;
  rule_version: string;
  institutions_involved: string[];
  programs_involved: string[];
  status: CaseStatus;
  severity: string;
  proposed_action: string | null;
  proposed_resolution: 'RESOLVED' | 'FALSE_POSITIVE' | null;
  maker_officer: string | null;
  maker_email: string | null;
  checker_officer: string | null;
  resolution_reason: string | null;
  created_at: string;
  resolved_at: string | null;
  age_days: number;
  overdue: boolean;
}

export interface CaseDetail extends CaseSummary {
  evidence: {
    enrolment_id: string; institution: string; aicte_permanent_id: string; state: string; course: string;
    student_id_no: string; mode: string; year_of_study: number; status: string; verification_status: string;
    reported_at: string;
  }[];
  timeline: { seq: number; at: string; actor: string; action: string; detail: Record<string, unknown> }[];
  notification_preview: string;
}

export interface RiskRow {
  institution_id: string;
  aicte_permanent_id: string;
  name: string;
  state: string;
  type: string;
  risk_score: number;
  risk_level: RiskLevel;
  scored: boolean;
  top_reasons: string[];
  total_intake: number;
  total_enrolled: number;
  factors: { name: string; value: number; display: string; flagged: boolean }[];
}

export interface RiskRanking { as_of: string; model_version: string; institutions: RiskRow[] }

export interface AuditEvent {
  seq: number;
  occurred_at: string;
  actor_id: string;
  actor_type: string;
  action: string;
  entity: string;
  entity_id: string | null;
  purpose: string | null;
  detail: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

export interface AuditLedger {
  as_of: string;
  total_events: number;
  actions: string[];
  latest_anchor: { merkle_root: string; worm_uri: string; start_seq: number; end_seq: number; anchored_at: string } | null;
  events: AuditEvent[];
}

export interface ChainCheck {
  status: 'OK' | 'TAMPER_DETECTED';
  checked_at: string;
  total_events?: number;
  latest_sequence?: number;
  broken_at_seq?: number;
  reason?: string;
  message?: string;
}

// ── Verification ────────────────────────────────────────────
export type RequestStatus = 'AWAITING_CONSENT' | 'VALID' | 'DENIED' | 'EXPIRED' | 'REVOKED' | 'WITHDRAWN';

export interface VerificationRequestSummary {
  request_id: string;
  token: string;
  purpose: string;
  status: RequestStatus;
  verifier_name: string;
  credential_id: string | null;
  created_at: string;
  verified_at: string | null;
  expires_at: string | null;
}

export interface VerifierTracker {
  organisation: { id: string; name: string };
  approved_purposes: string[];
  quota: { used: number; limit: number; remaining: number };
  requests: VerificationRequestSummary[];
}

export interface Claims { institution: string; programme: string; academic_year: number; status: string }

export interface CredentialResult extends VerificationRequestSummary {
  public_url: string;
  claims: Claims | null;
  signature: { valid: boolean; key_id: string; algorithm: string; jws: string } | null;
  qr_codes: { online: string; offline: string } | null;
}

export interface PublicVerifyResult {
  status: 'VALID' | 'REVOKED' | 'INVALID';
  checked_at: string;
  claims: Claims | null;
  verified_at: string | null;
  credential_id: string | null;
  signature: { valid: boolean; key_id: string } | null;
}

// ── Student ─────────────────────────────────────────────────
export type ConsentStatus = 'AWAITING_CONSENT' | 'GRANTED' | 'DENIED' | 'EXPIRED' | 'REVOKED' | 'WITHDRAWN';

export interface Consent {
  consent_id: string;
  verifier_id: string;
  verifier_name: string;
  purpose: string;
  scope: string[];
  status: ConsentStatus;
  duration_days: number;
  requested_at: string;
  granted_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

export interface StudentShare extends VerificationRequestSummary { public_url: string }

export interface StudentRecord {
  student: { name: string; masked_apaar: string };
  enrolments: {
    enrolment_id: string; institution: string; course: string; academic_year: number; year_of_study: number;
    status: string; identity_status: string; verification_status: string; student_id_no: string;
  }[];
  pending: Consent[];
  active: Consent[];
  history: Consent[];
  shares: StudentShare[];
  access_log: { verifier_name: string; purpose: string; at: string; result: RequestStatus }[];
}

export interface PublicStats {
  as_of: string;
  institutions_approved: number;
  institutions_reporting: number;
  students_on_ledger: number;
  duplicates_caught: number;
  credentials_issued: number;
  submission_deadline: string;
}

// -- Public Seats Dashboard ----------------------------------------------------
export interface PublicStateRow {
  state: string;
  institutions_count: number;
  approved_seats: number;
  enrolled: number;
  utilization_pct: number;
  verified_pct: number;
}

export interface PublicProgrammeRow {
  course: string;
  level: string;
  approved_intake: number;
  enrolled: number;
  supernumerary: number;
}

export interface PublicInstitutionProgramme {
  course: string;
  level: string;
  approved_intake: number;
  enrolled: number;
  supernumerary: number;
  supernumerary_cap: number;
}

export interface PublicInstitutionRow {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string | null;
  type: string;
  programmes: PublicInstitutionProgramme[];
  total_approved: number;
  total_enrolled: number;
  seats_remaining: number;
  identity_verified_pct: number;
  as_of: string;
  last_submission: string | null;
}

export interface PublicSeatsResponse {
  as_of: string;
  academic_year: number;
  total_approved_seats: number;
  total_enrolled: number;
  total_institutions: number;
  institutions_reporting: number;
  states: PublicStateRow[];
  programmes: PublicProgrammeRow[];
  institutions: PublicInstitutionRow[];
  page: number;
  page_size: number;
  total_institution_count: number;
}


// ─────────────────────────────────────────────────────────────
// Machine Learning & AI Intelligence Types
// ─────────────────────────────────────────────────────────────

export interface DisciplineForecast {
  discipline: string;
  approved_intake_2025: number;
  actual_enrolled_2025: number;
  current_fill_rate: number;
  projected_demand_2026: number;
  projected_fill_rate_2026: number;
  projected_vacancy_seats: number;
  market_demand_trend: string;
  policy_action_status: string;
  statutory_recommendation: string;
}

export interface ForecastingResult {
  target_academic_year: string;
  state: string;
  summary: {
    total_sanctioned_intake: number;
    total_current_enrolled: number;
    total_projected_demand: number;
    current_fill_rate_pct: number;
    projected_fill_rate_pct: number;
    projected_unfilled_seats: number;
  };
  discipline_breakdown: DisciplineForecast[];
}

export interface FuzzyMatchCandidate {
  student_id: string;
  enrolled_name: string;
  enrolled_dob: string | null;
  apaar_id: string | null;
  institution_name: string;
  institution_state: string;
  course_name: string;
  academic_year: string;
  match_score: number;
  confidence_pct: number;
  risk_tier: string;
  metrics: {
    name_jaro_winkler: number;
    levenshtein_ratio: number;
    phonetic_soundex_match: boolean;
    dob_match_score: number;
    guardian_match_score: number;
  };
}

export interface FuzzyDedupResponse {
  mode: string;
  comparison?: {
    score: number;
    confidence_pct: number;
    risk_tier: string;
    metrics: {
      name_jaro_winkler: number;
      levenshtein_ratio: number;
      phonetic_soundex_match: boolean;
      dob_match_score: number;
      guardian_match_score: number;
    };
  };
  total_matches?: number;
  candidates?: FuzzyMatchCandidate[];
}

export interface BatchFraudAnalysis {
  batch_id: string;
  filename: string;
  total_records: number;
  fraud_score: number;
  risk_level: RiskLevel;
  is_suspicious: boolean;
  findings: string[];
  metrics: {
    birth_year_std_dev: number;
    missing_apaar_pct: number;
    dominant_category_share_pct: number;
  };
}

export interface CohortAnomalyItem {
  institution_id: string;
  aicte_permanent_id: string;
  name: string;
  state: string;
  total_enrolled: number;
  birth_year_std_dev: number;
  missing_apaar_pct: number;
  dominant_category_pct: number;
  fraud_score: number;
  risk_level: RiskLevel;
  findings: string[];
}

// ── Strict Domain Types & Discriminated Unions ──────────────

export type RegulatoryLedgerState =
  | 'ACCEPTED'
  | 'HELD_FOR_REVIEW'
  | 'FLAGGED_DUPLICATE'
  | 'REJECTED';

export interface SanctionItem {
  sanction_id: string;
  institution_id: string;
  institution_name: string;
  sanction_type: string;
  legal_clause: string;
  penalty_value: string;
  rationale: string;
  evidence_summary?: string;
  status: 'PENDING_CHECKER_SIGNATURE' | 'EXECUTED_DUAL_SIGNED' | 'REJECTED';
  maker_id: string;
  maker_name: string;
  maker_role: string;
  maker_hash: string;
  proposed_at: string;
  checker_id?: string;
  checker_name?: string;
  checker_role?: string;
  checker_hash?: string;
  executed_at?: string;
  joint_crypto_seal?: string;
  checker_note?: string;
}

export interface AttackScenario {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  attacker_role: string;
  attacker_objective: string;
  red_team_payload: Record<string, unknown>;
  blue_team_engine: string;
  defense_rule: string;
  expected_result: string;
  statutory_citation: string;
}

export interface AttackExecutionResult {
  success: boolean;
  scenario_id: string;
  scenario_title: string;
  status: string;
  defense_engine: string;
  rule_triggered: string;
  statutory_citation: string;
  latency_ms: number;
  cryptographic_proof: string;
  audit_action: string;
  terminal_logs: string[];
  payload_inspected: Record<string, unknown>;
  timestamp: string;
}


