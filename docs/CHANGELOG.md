# CHANGELOG — Agastya SIH / APAAR Portal

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
- **Production Build**: `npm run build` (`tsc -b && vite build`) executes cleanly with 0 errors in 2.67s.
- **Lint Check**: `npm run lint` (`oxlint`) passes with 0 errors across 26 project files.

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
