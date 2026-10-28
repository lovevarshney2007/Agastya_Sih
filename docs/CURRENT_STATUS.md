# Current status

**Date:** 28 October 2026
**Backend:** 1.1.0-PROTOTYPE · **Frontend:** rebuilt against the live API (no mock data)

## How it was verified

| Check | Result |
|---|---|
| `npx tsc -b` (strict, unused locals/params on) | 0 errors |
| `npm run build` | passes |
| `oxlint` | 0 errors; only fast-refresh hints on files that export hooks next to components |
| API end-to-end script (auth, RBAC, upload → commit, maker-checker, consent, verification, revocation, tamper detection) | 65/65 checks pass on a fresh database |
| Browser walkthrough in headless Edge across all four portals and mobile width | 53/53 checks pass; no console errors besides the deliberate wrong-password 401 |

## What changed in this round

### Backend
- **Commit now writes records.** Uploads stage validated rows; committing creates vault entries and enrolments, opens
  conflict cases for cross-institution full-time duplicates, and recomputes risk. Previously commit only changed a status flag.
- **CSV booleans fixed.** `is_supernumerary=false` was read as `True` (`bool("false")`), so every row counted as supernumerary.
- **RBAC on every endpoint.** Institutions see only their own data; AICTE endpoints need an AICTE role; approvals need the
  checker role and a different officer from the maker; verifiers see only their organisation's requests; students see only their own record.
- **Consent → verification flow.** A verifier request creates a consent request for the student; approving issues a signed
  credential; refusing or revoking marks it denied/revoked. Consent is checked per organisation and for expiry (before, any
  organisation's consent unlocked any verifier).
- **Student account linked to the vault.** The student portal previously fell back to the first student in the database.
- **New rules / checks:** mandatory fields, date and year validation, programme exact-match, same-institution duplicate in
  the database, category vs supernumerary flag, Aadhaar column rejection, template column check, duplicate-file detection, 5 MB limit, XLSX support.
- **New endpoints:** batch list, discard batch, record status change and history, case detail with evidence, institution
  register, student self-share and revoke, verifier withdraw, tamper restore.
- PDF generation no longer writes to `/tmp` (failed on Windows); CSV exports neutralise formula injection; unhandled errors no longer leak exception text.

### Frontend
- Replaced the mock-state UI (client-side fake hashes, hardcoded counts) with pages that call the API, following the page
  spec in `PS-26263-frontend.md`.
- One status vocabulary (text + colour + icon) across all pages; APAAR always masked; "as of" times on dashboards;
  neutral messages on public and verifier pages; purpose prompt before AICTE opens student-level records (logged server-side).

## Known limits (prototype)
- ABC/APAAR, DigiLocker, Parichay and Meri Pehchaan are simulated. The OTP step accepts any six digits.
- Credentials are signed with HMAC (HS256) rather than an asymmetric HSM key.
- Seat-category caps are illustrative and come from backend settings, not an admin UI.
- Hindi language toggle and dark theme from the earlier UI were not carried over.
- Other files in this folder (API_REFERENCE.md etc.) describe the earlier version; the backend's `/docs` (Swagger) is current.
