# BUG TRACKER — Agastya SIH / APAAR Portal
_Last updated: October 27, 2026 | Total Defects Resolved: 21 | Active Unresolved: 0_

| Bug ID | Severity | Module | Root Cause | Fix | Status |
|---|---|---|---|---|---|
| **BUG-001** | HIGH | `vite.config.ts` | `manualChunks` object literal was incompatible with Vite 8 `ManualChunksFunction` type. | Converted `manualChunks` to standard function signature. | **FIXED** |
| **BUG-002** | HIGH | `App.tsx` + `AictePortal.tsx` | `onResolveViolation` was typed as `(id) => void` but called with `(id, notes)`. | Aligned handler signature to `(violationId: string, _notes?: string) => void`. | **FIXED** |
| **BUG-003** | MEDIUM | `AnalyticsView.tsx` | Displayed static mock data instead of live metrics from `/aicte/dashboard`. | Integrated `aicteApi.dashboard()`, live state aggregates, and live quota distribution. | **FIXED** |
| **BUG-004** | HIGH | `InstitutionPortal.tsx` | Hardcoded COEP UUID fallback caused mismatched queries if backend ID differed. | Removed hardcoded UUID; added session `institution_id` guard and dynamic lookup. | **FIXED** |
| **BUG-005** | HIGH | `StudentPortal.tsx` | Hardcoded `tok_student_default` fallback did not match backend vault token. | Implemented dynamic token lookup via `authApi.personas()` and session vault. | **FIXED** |
| **BUG-006** | LOW | `Navbar.tsx` | Informal emojis in navigation dropdowns conflicted with Lucide design system. | Replaced with styled Lucide icons and badge containers. | **FIXED** |
| **BUG-007** | MEDIUM | `App.tsx` | State conflicts between mock fallback and live API responses. | Prioritized real API data with fallback safety; removed conflicting state overrides. | **FIXED** |
| **BUG-008** | MEDIUM | All portals | English/Hindi toggle only covered Navbar and landing page. | Wired `TRANSLATIONS` across Institution, AICTE, Verifier, and Student portals. | **FIXED** |
| **BUG-009** | LOW | `SuperAdminPortal.tsx` | Component props accepted `institutions`, `auditLogs`, `students` but ignored them. | Destructured and bound props to master tables, ledger, and action handlers. | **FIXED** |
| **BUG-010** | MEDIUM | `AictePortal.tsx` | Maker proposals hardcoded officer name "Rajesh Verma". | Wired dynamic attribution using `sessionUser.full_name`. | **FIXED** |
| **BUG-011** | LOW | `VerifierPortal.tsx` | Verifier organization name hardcoded to "Tata Consultancy Services". | Pre-fills verifier name dynamically from `sessionUser.org_name` with user override. | **FIXED** |
| **BUG-012** | HIGH | `LoginPage.tsx` / Docs | Login documentation incorrectly listed `password123`; seeded database used `Aicte@2026!`. | Updated documentation, test scripts, and UI hint; verified 200 with JWT. | **FIXED** |
| **BUG-013** | CRITICAL | `endpoints.py` (Backend) | In `enrol_single_student`, `StudentIdentityVault` was instantiated without `student_token` UUID before `db.flush()`, crashing with 500 error. | Added `import uuid` and explicit `student_token=str(uuid.uuid4())` assignment before flush. | **FIXED** |
| **BUG-014** | HIGH | `src/api/client.ts` | Missing client wrapper methods for `/auth/institution/onboard-eoa`, `/auth/institution/activate`, and `/verifier/credential/{token}/pdf`. | Added `authApi.onboardEoA`, `authApi.activateInstitution`, and `verifierApi.downloadPdfUrl`. | **FIXED** |
| **BUG-015** | MEDIUM | `InstitutionPortal.tsx` | "Download CSV Template" generated hardcoded client-side CSV missing AICTE headers. | Wired download action directly to official backend endpoint `reportsApi.admissionTemplateUrl()`. | **FIXED** |
| **BUG-016** | HIGH | `InstitutionPortal.tsx` | Enrolled students fetched from `/institutions/{id}/students` were stored in `apiStudents` but never merged into the table view. | Wired `apiStudents` into `displayStudents` using typed `useMemo` so live backend enrolments appear immediately. | **FIXED** |
| **BUG-017** | MEDIUM | `InstitutionPortal.tsx` | No UI mechanism to download institutional compliance CSV from backend. | Added "Export Compliance CSV" button wired to `reportsApi.institutionCsvUrl(activeInstId)`. | **FIXED** |
| **BUG-018** | MEDIUM | `AictePortal.tsx` | `/aicte/risk-ranking` endpoint was implemented on backend but never invoked in frontend. | Added `useEffect` fetch to `aicteApi.riskRanking()` and displayed scores in Risk Ranking tab. | **FIXED** |
| **BUG-019** | MEDIUM | `AictePortal.tsx` & `SuperAdminPortal.tsx` | WORM audit anchor endpoint `/aicte/audit/anchor` had no triggering button in UI. | Added "Anchor to WORM" buttons and action handlers to write Merkle roots. | **FIXED** |
| **BUG-020** | HIGH | `SuperAdminPortal.tsx` | EoA institution onboarding endpoint `/auth/institution/onboard-eoa` lacked UI trigger. | Added "Onboard EoA Institution" button and interactive modal dialog. | **FIXED** |
| **BUG-021** | MEDIUM | `StudentPortal.tsx` | Assisted rural DPDP SMS OTP endpoint lacked an interactive UI demo card. | Added Assisted SMS OTP simulation component wired to `studentApi.assistedSmsOtp`. | **FIXED** |

---

## Defect Summary by Severity
- **Critical**: 1 (Resolved)
- **High**: 7 (Resolved)
- **Medium**: 9 (Resolved)
- **Low**: 4 (Resolved)
- **Total**: 21 (100% Resolved and Verified)
