# CHANGELOG — Agastya SIH / APAAR Portal

## [Phase 4] 2026-10-27 — Complete Backend API Integration Audit, End-to-End Verification & Defect Resolution

### Added
- `docs/API_INTEGRATION_AUDIT.md`: Master 36-endpoint integration status matrix with HTTP test evidence and verified workflow traces.
- `docs/ARCHITECTURE.md`: System communication architecture, central API client mechanics, dual-control regulatory rules, and cryptographic vault schemas.
- `scratch/verify_api.mjs`: Complete automated HTTP test suite executing 36 endpoint validations against the live backend (`https://sih.monu14.me/api/v1`).
- `authApi.onboardEoA`, `authApi.activateInstitution`, and `verifierApi.downloadPdfUrl` in `src/api/client.ts`.
- EoA Institution Onboarding modal in `SuperAdminPortal.tsx`.
- WORM Merkle root anchor buttons in `AictePortal.tsx` and `SuperAdminPortal.tsx`.
- Rural Assisted SMS OTP simulation card in `StudentPortal.tsx`.
- "Export Compliance CSV" button in `InstitutionPortal.tsx`.
- Direct backend download for official admission CSV template in `InstitutionPortal.tsx`.

### Fixed
- **BUG-012**: Corrected login credentials documentation to `Aicte@2026!` and verified successful JWT generation.
- **BUG-013**: Fixed critical backend crash in `SIH-backend/app/api/endpoints.py` where `StudentIdentityVault` was missing `student_token` UUID prior to `db.flush()`.
- **BUG-014**: Added missing central API client bindings for EoA onboarding, nodal activation, and credential PDF downloads.
- **BUG-015**: Replaced client-side generated CSV template with official backend endpoint `/reports/admission-template.csv`.
- **BUG-016**: Merged live API enrolments from `/institutions/{id}/students` into `displayStudents` in `InstitutionPortal.tsx`.
- **BUG-017**: Connected institutional compliance export to `/reports/institution/{id}.csv`.
- **BUG-018**: Wired Isolation Forest anomaly scores from `/aicte/risk-ranking` into `AictePortal.tsx`.
- **BUG-019**: Connected WORM storage Merkle root anchor to `/aicte/audit/anchor` in AICTE and Super Admin portals.
- **BUG-020**: Implemented EoA onboarding user interface in `SuperAdminPortal.tsx`.
- **BUG-021**: Added interactive assisted SMS consent simulation in `StudentPortal.tsx`.
- Resolved TypeScript union type incompatibility for `gender` and `isSupernumerary` in `InstitutionPortal.tsx` and `types/index.ts`.

### Verified
- **Live Backend API**: 36/36 endpoints verified with **PASS** status against `https://sih.monu14.me/api/v1`.
- **Production Build**: `npm run build` (`tsc -b && vite build`) executes cleanly with 0 errors in 2.92s.
- **Linter**: `npm run lint` (`oxlint`) passes with 0 errors across 26 files.

---

## [Phase 3] 2026-10-27 — Full-Stack Integration, Complete Bug Fixing & UI/UX Polish
### Fixed
- **BUG-001**: Updated `vite.config.ts` `manualChunks` to use the typed `ManualChunksFunction` compatible with Vite 8.
- **BUG-002**: Aligned `onResolveViolation` signature in `App.tsx` and `AictePortal.tsx` to handle optional resolution notes.
- **BUG-003**: In `AnalyticsView.tsx`, integrated live `/aicte/dashboard` metrics, dynamic state intake comparison, and live reservation quota distributions.
- **BUG-004**: In `InstitutionPortal.tsx`, eliminated hardcoded COEP UUID fallback, introduced session guards and dynamic persona lookup.
- **BUG-005**: In `StudentPortal.tsx`, replaced static invalid token fallback with dynamic resolution from `authApi.personas()` and session vault.
- **BUG-006**: In `Navbar.tsx`, replaced all informal emojis in dropdown and mobile menus with cohesive Lucide icons (`GraduationCap`, `Building2`, `UserCheck`, `Scale`, `ShieldCheck`, `Home`, `BarChart3`, `FileText`, `BookOpen`) and styled badge containers.
- **BUG-007**: Cleaned up state synchronization between mock fallbacks and real API data across all portals.
- **BUG-008**: Extended bilingual English/Hindi translations across all portals (navigation tabs, metric cards, actions).
- **BUG-009**: In `SuperAdminPortal.tsx`, destructured `institutions`, `students`, `auditLogs`, and `onAddInstitution` props and wired into live tables and audit fallback.
- **BUG-010**: In `AictePortal.tsx`, attributed proposed officer actions dynamically to `sessionUser.full_name`.
- **BUG-011**: In `VerifierPortal.tsx`, dynamically pre-filled verifier organization from session user's `org_name`.

### Verified
- **Production Build**: `npm run build` (`tsc -b && vite build`) executes cleanly with 0 errors.
- **Lint Check**: `npm run lint` (`oxlint`) passes with 0 errors across 26 project files.

---

## [Phase 1-2] 2026-10-27 — Repository Audit & Documentation
### Added
- docs/PROJECT_CONTEXT.md — Full project context for AI sessions
- docs/CURRENT_STATUS.md — Current implementation state
- docs/BUG_TRACKER.md — Catalogued bugs with severity/status
- docs/API_REFERENCE.md — All 30+ backend endpoints with integration status
- docs/DATABASE.md — All 10 database tables documented
- docs/DESIGN_SYSTEM.md — Anti-AI design philosophy and component standards
- docs/DEVELOPMENT_RULES.md — Coding conventions and architecture rules
- docs/CHANGELOG.md — This file
