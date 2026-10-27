# TESTING — Agastya SIH / APAAR Portal

## Executed Tests (27 Oct 2026)

### TypeScript Validation
- Command: npx tsc -b --noEmit
- Result: PASS — 0 errors, 0 warnings

### Production Build
- Command: npm run build
- Result: FAIL — Vite Rust allocator memory allocation failure
- Note: This is a system resource issue (OOM in SWC bundler), not a code defect
- The TypeScript compilation itself passed; only the Vite bundle step fails

### Lint Check
- Command: npm run lint (oxlint)
- Result: Not yet executed

## Manual Test Checklist
### Authentication
- [ ] Login with email/password → JWT stored, role assigned
- [ ] Quick demo login (1-click) → JWT stored, role assigned
- [ ] Page refresh restores session from localStorage
- [ ] Expired token cleared, redirected to HOME
- [ ] Logout clears all auth state, redirected to HOME

### Institution Portal
- [ ] Dashboard loads from API (KPIs, program breakdown)
- [ ] Student registry loads from API
- [ ] CSV template download works
- [ ] CSV upload to backend processes correctly
- [ ] Batch commit updates status
- [ ] Single student enroll form submits to real API

### AICTE Portal
- [ ] National dashboard loads (KPIs, state aggregates)
- [ ] Violations list loads
- [ ] Maker: propose action updates case status
- [ ] Checker: approve action enforces maker≠checker rule
- [ ] Risk ranking loads
- [ ] Audit ledger loads (last 100 events)
- [ ] Chain integrity verification runs

### Verifier Portal
- [ ] Submit APAAR verification request
- [ ] Tracker shows historical requests
- [ ] VALID credential shows claims + QR codes
- [ ] PDF download works

### Student Portal
- [ ] Consent list loads (requires correct student_token)
- [ ] Grant/Revoke consent updates status

### Public Verification
- [ ] Token lookup returns VALID/REVOKED/INVALID
- [ ] No sensitive data exposed

### Language Switch
- [ ] EN→HI changes Navbar labels
- [ ] EN→HI changes LandingPage content
- [ ] Portal content remains in English (known limitation)

## Known Test Gaps
- No automated unit tests in frontend (not configured)
- No end-to-end test suite configured
- Backend Python tests: not yet inspected
- Database integration tests: require live DB connection
