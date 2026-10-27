# BUG TRACKER — Agastya SIH / APAAR Portal
_Last updated: 2026-10-27_

| Bug ID | Severity | Module | Root Cause | Fix | Status |
|---|---|---|---|---|---|
| BUG-001 | HIGH | vite.config.ts | manualChunks object literal incompatible with Vite 8 ManualChunksFunction type | Changed to function form | FIXED |
| BUG-002 | HIGH | App.tsx + AictePortal.tsx | onResolveViolation typed as (id)=>void but AictePortal calls it with (id, notes) | Aligned handler signature to (violationId: string, _notes?: string) => void | FIXED |
| BUG-003 | MEDIUM | AnalyticsView.tsx | Static hardcoded state data instead of real backend data from /aicte/dashboard | Integrated aicteApi.dashboard(), dynamic state aggregates, and live category distribution | FIXED |
| BUG-004 | HIGH | InstitutionPortal.tsx | Hardcoded UUID fallback only worked if backend seeded with exact ID | Removed hardcoded UUID; added session institution_id guard and dynamic lookup | FIXED |
| BUG-005 | HIGH | StudentPortal.tsx | tok_student_default fallback didn't match backend vault record | Implemented dynamic token lookup via authApi.personas(), userStore, and props | FIXED |
| BUG-006 | LOW | Navbar.tsx | Emoji icons (🎓🏛️🔍⚖️🛡️) in nav dropdown & mobile inconsistent with Lucide icon system | Replaced with styled Lucide icons (GraduationCap, Building2, UserCheck, Scale, ShieldCheck, Home, BarChart3, FileText, BookOpen) | FIXED |
| BUG-007 | MEDIUM | App.tsx | Mock state maintained alongside real API state | Real API state prioritized across portals with seamless fallbacks | FIXED |
| BUG-008 | MEDIUM | All portals | Language switching (HI/EN) only covered Navbar and landing page strings | Wired TRANSLATIONS into InstitutionPortal, AictePortal, VerifierPortal, and StudentPortal | FIXED |
| BUG-009 | LOW | SuperAdminPortal.tsx | Props institutions, auditLogs, onAddInstitution accepted but never used | Destructured props and wired into live master tables, audit ledger fallbacks, and action handlers | FIXED |
| BUG-010 | MEDIUM | AictePortal.tsx | handleProposeAction hardcoded officer name 'Rajesh Verma (AICTE Officer)' | Uses dynamic sessionUser.full_name from session store | FIXED |
| BUG-011 | LOW | VerifierPortal.tsx | hardcoded verifierName 'Tata Consultancy Services (HR Recruitment)' | Pre-fills verifierName from sessionUser.org_name with user override capability | FIXED |
