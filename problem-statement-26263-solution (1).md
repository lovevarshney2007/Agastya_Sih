# SIH 2026 · PS 26263 — What Actually Needs To Be Built

**Problem Statement ID:** SIH26263
**Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions
**Organization:** AICTE (Ministry of Education)
**Category:** Software
**Theme:** Smart Automation
**Idea-submission deadline (per mirror sites, verify on sih.gov.in):** 28 October 2026

---

## 1. The short answer

**Build a web platform with a heavy backend. It is not a mobile-app problem.**

| Question | Answer |
|---|---|
| App? | Not required. A mobile-friendly web UI (or a thin PWA) for student/employer verification is a nice extra, nothing more. |
| Website? | Yes. Three role-based portals (Institution, AICTE, Verifier) plus one public "verify a record" page. |
| Where is the real work? | The **backend**: data ingestion, validation rules, duplicate detection, identity verification, audit trail, access control, reporting, APIs. |
| Hardware / IoT? | None. (The mirror site auto-tags this PS with "IoT/Embedded"; nothing in the brief supports that.) |
| Core idea in one line | A national *student ledger* for AICTE: every student enrolled in an approved institution is identified by their **APAAR ID**, and AICTE can see, validate and verify that data in real time. |

The pipeline AICTE itself describes:

```
Institution → Student Data Upload → APAAR Validation → Data Verification
→ AICTE Central Repository → Analytics & Monitoring → Authorized Verification
```

---

## 2. The problem in plain words

- AICTE-approved institutions currently report student data inconsistently. **PGDM institutions** send detailed student data yearly; **all other institutions** mostly send only totals (e.g., "total enrolment") during the approval process.
- So AICTE cannot tell whether the enrolment numbers are real, whether students are double-counted, or whether an institute admitted more students than its approved intake.
- **APAAR ID** (Automated Permanent Academic Account Registry, a 12-digit national academic ID) is meant to be the single identity per student. The platform uses it as the unique key so every student record is authentic, de-duplicated and verifiable.

---

## 3. Who uses the system (actors)

| Actor | What they do |
|---|---|
| **Institution admin / registrar** | Uploads and updates student-level data after admissions close; fixes validation errors; views their own dashboard. |
| **AICTE officer (regulation / approval bureau)** | Monitors admissions nationally; sees violations (excess intake, duplicates); exports reports. |
| **AICTE super-admin** | Manages institutions, roles, rules/thresholds, audit logs. |
| **Authorized verifier** (employer, regulator, university, bank, etc.) | Verifies that a student is genuinely enrolled/graduated, with the student's consent. |
| **Student** | Gives/withdraws consent, views their record, downloads a verifiable record. |
| **External systems** | Institutional ERPs, AICTE's existing portal, APAAR/ABC/DigiLocker (via adapter). |

---

## 4. Requirement-by-requirement: what to build

The brief lists 10 key requirements. This table maps each to concrete deliverables.

| # | Requirement (from brief) | What you actually build |
|---|---|---|
| 1 | Secure platform/API for institutions to upload/update student-level data keyed by APAAR ID | Authenticated **bulk upload** (CSV/XLSX with a downloadable template) + **single-record form** + **REST API** (and a batch/webhook endpoint for ERPs). Upsert logic keyed on `(APAAR ID, institution, program, academic year)`. |
| 2 | Data fields: approved intake, actual enrolment, supernumerary seats, NRI, OCI, FN status, other info | Schema with institution/program-level fields (approved intake, sanctioned seats) and student-level fields (admission category, seat type, NRI/OCI/FN flags, program, year, mode, status, etc.). |
| 3 | Automated validation: duplicates, invalid/missing APAAR IDs, intake exceeded, inconsistencies, cross-institution duplicate enrolment | A **validation engine** (see §6) that runs on every upload and returns row-level errors/warnings. |
| 4 | Dashboards for AICTE and institutions, real time | Two dashboards: institution-level and national/state/institution drill-down, with live counters and alerts. |
| 5 | Secure verification for authorized stakeholders | A **verification service**: role-gated lookup + consent check + signed response, and a public QR-verify page that returns a minimal result. |
| 6 | Verifiable student records linked to academic identity | **Digitally signed record / certificate** with a QR code that resolves to a live verification endpoint. |
| 7 | Integration/API capability with existing institutional and AICTE systems | Versioned REST API, OpenAPI docs, API keys/OAuth2 clients per institution, webhook/events, an adapter layer for APAAR and AICTE portal. |
| 8 | Security, privacy, authentication, RBAC, audit trails, consent | Auth (OTP/SSO), RBAC, field-level protection, consent ledger, tamper-evident audit log, encryption. See §9. |
| 9 | Reports for policy-making, accreditation, monitoring, regulation | Report builder + scheduled exports (XLSX/PDF/CSV) by state, program, institution, year, category. |
| 10 | Print/display APAAR ID along with student ID on certificates from degree-awarding bodies | A **certificate-field specification** plus a **template/generator** (PDF with APAAR ID, student ID and a QR). Also a small API/SDK snippet universities can call. |

---

## 5. What the backend must do (the heart of the solution)

1. **Identity & access**
   - Login for institutions (institution code + OTP, or SSO), AICTE staff, verifiers.
   - RBAC: institution users see only their institution; AICTE sees everything in scope; verifiers see only consented, minimal fields.
2. **Ingestion service**
   - Accept CSV/XLSX uploads and JSON API calls; stage them; process asynchronously via a job queue so large files (lakhs of rows) don't block.
   - Return a per-row validation report (accepted / warnings / rejected).
3. **Validation engine** (rules in §6), configurable by AICTE without code changes.
4. **APAAR verification adapter**
   - Interface `verifyApaar(apaarId, studentName, dob)` with a **mock implementation** for the hackathon and a clean slot for the real APAAR/ABC/DigiLocker integration.
   - Format check (12 digits) always; existence/name/DOB match through the adapter.
5. **Duplicate & anomaly detection**
   - Exact duplicates (same APAAR ID twice in one institution).
   - Cross-institution duplicates (same APAAR ID with two simultaneously active seats).
   - Fuzzy matching for records with missing/bad APAAR IDs (name + DOB + guardian name + phone with phonetic/edit-distance matching).
6. **Intake & quota compliance**
   - Compare actual enrolment against approved intake per institution, program and year; treat supernumerary categories separately.
7. **Central repository**
   - Versioned student-enrolment records (never overwrite silently; keep history of who changed what).
8. **Verification service**
   - Consent check → fetch minimal record → sign response → log the access.
9. **Audit & consent ledger**
   - Append-only, hash-chained log of uploads, edits, verifications and consent changes.
10. **Analytics & reporting**
    - Pre-aggregated tables/materialised views for dashboards; report generation jobs.
11. **Notifications**
    - Alerts to institutions on validation failures and to AICTE on violations (email/in-app).
12. **Integration layer**
    - Versioned public API, API keys / OAuth2 client credentials, rate limiting, webhooks.

---

## 6. Validation rules to implement

| Rule | Type | Notes |
|---|---|---|
| APAAR ID missing | Error | Row rejected or held in "pending" state. |
| APAAR ID format invalid (not 12 digits) | Error | Plus checksum if one is defined. |
| APAAR ID not found / name-DOB mismatch | Error/Warning | Via adapter; mock in demo. |
| Same APAAR ID twice in the same institution/program/year | Error | Exact duplicate. |
| Same APAAR ID active in two institutions | Critical flag | Cross-institution duplicate enrolment; notify both institutions and AICTE. |
| Enrolment > approved intake | Violation | Count with supernumerary seats treated per AICTE rules. |
| Supernumerary seats exceed permitted share | Violation | Cap should be **configurable** (see assumptions). |
| NRI / OCI / FN flag inconsistent with other fields | Warning | e.g., FN flag set but nationality = Indian; OCI flag without OCI details. |
| Program, year, mode (full-time/part-time/lateral) inconsistent | Warning | e.g., lateral entry student entered as year 1. |
| Missing mandatory fields / bad dates | Error | Schema validation. |
| Late/unusual changes to previously verified records | Warning | Triggers review. |

---

## 7. What the frontend must show

**Institution portal**
- Upload wizard (download template → upload → validation report → fix → submit).
- Student registry table with filters (status, program, category).
- Own compliance panel: approved intake vs. enrolled, supernumerary usage, pending/duplicate counts.
- Alerts inbox.

**AICTE portal**
- National overview: approved institutions, enrolled students, verified %, duplicates intercepted.
- Drill-down: state → district → institution → program.
- Violations list (excess intake, cross-institution duplicates) with an action/status workflow.
- Report builder and exports.
- Rule configuration and audit-log viewer (super-admin).

**Verification**
- Authorized-verifier search (by APAAR ID + required identifier) with consent status.
- **Public QR verify page**: scan a certificate/record QR → shows "Valid / Invalid / Revoked" and minimal non-sensitive fields.

**Student view (optional but strong)**
- See which institution has reported them, grant/withdraw consent for verifiers, download the verifiable record.

---

## 8. Suggested data model (simplified)

```
Institution(id, aicte_code, name, state, type, status)
Program(id, institution_id, name, level, approved_intake, supernumerary_cap, academic_year)
Student(id, apaar_id UNIQUE, name, dob, gender, ...)          -- minimal identity
Enrolment(id, student_id, institution_id, program_id, academic_year,
          student_id_no, admission_category, seat_type,
          is_supernumerary, nri_flag, oci_flag, fn_flag,
          status[ACTIVE|WITHDRAWN|TRANSFERRED|GRADUATED],
          verification_status[PENDING|VERIFIED|FLAGGED], version)
ValidationIssue(id, enrolment_id, rule_code, severity, status, created_at)
DuplicateCase(id, apaar_id, enrolment_ids[], status, resolved_by)
Consent(id, student_id, verifier_type/id, scope, granted_at, revoked_at)
VerificationRequest(id, verifier_id, student_id, purpose, result, at)
AuditLog(id, actor, action, entity, before, after, prev_hash, hash, at)
UploadBatch(id, institution_id, file_ref, status, counts, created_at)
```

---

## 9. Security, privacy, compliance

- **DPDP Act 2023** alignment: purpose limitation, data minimisation, explicit consent, ability to withdraw consent, retention policy. Surface a consent record in the UI.
- Encrypt in transit (TLS) and at rest; encrypt or tokenise sensitive fields (APAAR ID, DOB).
- RBAC with least privilege; short-lived tokens; MFA/OTP for institutional and AICTE admins.
- **Tamper-evident audit trail** (hash-chained log) for every upload, edit, verification and consent change.
- Verifier responses return the **minimum** fields needed (e.g., "enrolled in program X at institution Y, status active") rather than the whole record.
- Rate limiting and anomaly alerts on verification endpoints to prevent bulk scraping of student data.
- Input hardening on uploads (file type/size limits, formula-injection sanitising for CSV/XLSX, virus scan hook).

---

## 10. The "Innovation Expected" part

The brief explicitly says the solution must go **beyond data collection**: *automated validation, intelligent anomaly detection, real-time monitoring, secure verification, and analytics.* Ideas that fit:

- **Fuzzy identity resolution** to catch the same person under different spellings or missing APAAR IDs.
- **Anomaly detection** on enrolment patterns (isolation forest / z-score on enrolment vs. intake history, sudden spikes in supernumerary or NRI/FN seats, institutions that always report exactly at the cap).
- **Risk score per institution** combining violations, duplicate rate, late/edited records; helps AICTE prioritise inspections.
- **Real-time stream** for alerts (WebSocket/SSE on the dashboard).
- **Verifiable credentials**: signed records (JWS or W3C Verifiable Credential style) + QR, so verification works without calling the database for basic authenticity.
- **Natural-language report/helpdesk assistant** for AICTE staff and institutions ("which colleges in Maharashtra exceeded intake in CSE this year?"), kept on top of the validated data.

Do **not** spend the whole build on AI; the judges also test whether the core pipeline works end to end.

---

## 11. Suggested architecture & stack

```
[Institution ERP / CSV / Portal] ──► API Gateway / Auth
                                         │
              ┌──────────────────────────┼───────────────────────────┐
              ▼                          ▼                           ▼
        Ingestion service        Verification service         Reporting/Analytics
              │ (queue)                  │                           │
              ▼                          ▼                           ▼
       Validation engine ──► APAAR adapter (mock/real)       Aggregates / views
              │                          │
              ▼                          ▼
          PostgreSQL  ◄── Audit + Consent ledger     Redis (cache/queue)   Object storage (uploads, PDFs)
              │
              ▼
        ML worker (duplicate matching, anomaly scoring)
```

A sensible, hackathon-friendly stack (pick what the team already knows):

| Layer | Option |
|---|---|
| Frontend | React + TypeScript (or Angular), a component library, Recharts/ECharts for dashboards |
| Backend | NestJS (Node) **or** FastAPI (Python) **or** Spring Boot (Java) |
| Database | PostgreSQL (strongly preferred: relational integrity, unique constraints, materialised views) |
| Queue / cache | Redis + BullMQ/Celery (Kafka only if the team already knows it; it's overkill for a prototype) |
| ML | Python (scikit-learn, rapidfuzz/recordlinkage) as a worker or service |
| Files/PDF/QR | XLSX/CSV parsers, a PDF library, QR generation, signing via JWS |
| Deploy | Docker Compose for the demo; cloud free tier for a live link |

---

## 12. API sketch

```
POST   /api/v1/auth/login
POST   /api/v1/institutions/{id}/uploads            # multipart CSV/XLSX → batch id
GET    /api/v1/uploads/{batchId}                    # status + validation report
POST   /api/v1/students/enrolments                  # single/bulk JSON upsert
GET    /api/v1/institutions/{id}/dashboard
GET    /api/v1/aicte/dashboard?state=&program=&year=
GET    /api/v1/aicte/violations?type=&status=
POST   /api/v1/aicte/violations/{id}/resolve
POST   /api/v1/verify                               # body: apaarId + verifier context
GET    /api/v1/verify/public/{token}                # QR target, minimal output
POST   /api/v1/students/{id}/consents               # grant/revoke
GET    /api/v1/records/{id}/credential              # signed, verifiable record (PDF/JSON)
GET    /api/v1/reports/{type}?format=xlsx|pdf
GET    /api/v1/audit?entity=&actor=                 # admin only
POST   /api/v1/webhooks                             # institution/system subscriptions
```

---

## 13. What to mock vs. what is real

| Item | Hackathon approach |
|---|---|
| APAAR ID issuance/lookup (ABC / DigiLocker) | **Mock adapter** with realistic test IDs, behind an interface so the real integration is a drop-in. Say clearly in the pitch that production access needs government-approved onboarding. |
| AICTE portal integration | Provide the API contract + a sample integration (a webhook or SSO stub). |
| Institution ERPs | Provide CSV template + API client example. |
| Student/institution data | Synthetic data generator (a few thousand students, ~20 institutions, deliberate violations and duplicates to demo detection). |
| Aadhaar/identity data | Do **not** collect Aadhaar numbers; rely on APAAR ID only. |

---

## 14. Suggested scope for the prototype

**Must have (P0)**
1. Institution login → upload CSV → validation report → accepted records stored.
2. Rules: missing/invalid APAAR ID, in-file duplicates, cross-institution duplicates, intake exceeded.
3. Institution dashboard and AICTE dashboard with live numbers and a violations list.
4. Verification page: enter APAAR ID → result (with consent check) and QR verify.
5. Basic RBAC + audit log.

**Should have (P1)**
6. Signed verifiable record/certificate with APAAR ID + student ID + QR (requirement 10).
7. Report export (XLSX/PDF).
8. Consent ledger UI for students.
9. Anomaly score / risk ranking of institutions.

**Nice to have (P2)**
10. Fuzzy duplicate matching for records without APAAR IDs.
11. Natural-language query/helpdesk.
12. Webhooks and an OpenAPI-documented partner API.
13. Hindi/regional-language UI toggle.

---

## 15. Assumptions and open questions (state these in the idea PPT)

- **Supernumerary/quota rules:** which seat categories count *within* approved intake vs. *over and above* it, and their caps, come from AICTE's Approval Process Handbook. Make them configurable rules rather than hard-coding numbers; confirm against the current handbook before presenting numbers.
- **APAAR access:** real-time verification needs official access to the APAAR/ABC system. The brief doesn't say what API exists. Ask or assume an adapter.
- **Student lifecycle:** how to treat withdrawals, transfers, lateral entry, re-admission and dropouts when deciding what "simultaneous enrolment" means.
- **Students without APAAR yet:** whether to hold them in a "pending APAAR" state with a deadline instead of rejecting them.
- **Who owns the record on a mismatch:** institution, AICTE, or student; define the dispute/correction workflow.
- **Scale:** the brief's own numbers imply tens of thousands of institutions and tens of lakhs of students; design for bulk, asynchronous processing and indexed lookups.
- **Another team's public repo for this PS exists** (a Spring Boot + Angular + Kafka prototype). Judges see many similar ideas, so differentiate on the validation depth, consent/verification flow and anomaly intelligence rather than on the basic CRUD + dashboard.

---

## 16. How to pitch it (one paragraph)

> "AICTE today knows how many students an institute *claims* to have, not who they are. We make the APAAR ID the key: institutions submit student-level data once admissions close; our validation engine checks identity, duplicates across colleges and intake limits in real time; AICTE sees a live national view with risk-ranked institutions; and employers or regulators verify a student's record with consent through a signed, QR-backed credential. Every action is audit-logged and DPDP-aligned."

---

## Sources

- Official brief text for SIH26263 (as mirrored from sih.gov.in): https://zaidsayyed.in/tools/sih-problem-statements/sih26263
- Official problem statement portal: https://www.sih.gov.in/sih2026PS
- SIH 2026 problem statement listing (mirror): https://zaidsayyed.in/tools/sih-problem-statements
- Example public prototype by another team for this PS: https://github.com/shindesiddhant-415/SIH-2026-PSS26263
