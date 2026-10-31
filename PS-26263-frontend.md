# PS 26263 — Frontend Page Spec (for the designer)

**Product:** APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions
**Purpose of this document:** list every page the frontend needs, who it is for, what requirement it satisfies, and the **minimum** features the designer must draw.
Prepared 26 Oct 2026. Derived from `problem-statement-26263-solution.md` (what to build) and `PS-26263-Backend.md` (how the backend behaves). Where a page rule comes from a backend rule, the backend section is cited as `(BE §n)`.

---

## 0. How to read this

**Structure.** Section 1 lists the **minimum pages** to build if time is short, and explains each one. Section 2 lists the **additional pages** (each marked **[additional]**) and explains only those. Appendices hold rules shared by every page.

**Page numbers** are fixed identifiers (they are used in cross-references), so the minimum table below is not numbered 1, 2, 3 in a row.

**Every page is explained in the same format**

> **Page N — Name**
> **For whom:** the user(s) of the page
> **Requirement (what the page does):** one sentence
> **Minimum features:** the list the designer must cover
> **States to design:** the non-happy-path screens that matter

**Priority tags**

| Tag | Meaning |
|---|---|
| **P0** | **Must have** — Needed for the 5-minute demo spine (see Appendix C). Design these first. |
| **P1** | **Should have** — Strongly recommended; completes the PS requirements. |
| **P2** | **Nice to have** — Only if time allows. |

**Four portals + public pages.** Public pages, Institution portal, AICTE portal, Verifier portal, Student portal. Institution and AICTE pages are **desktop-first** (dense tables, charts; must stay usable on a tablet). Public, student and guardian pages are **mobile-first**.

---

# 1. MINIMUM PAGES (build these first if time is short)

**14 pages.** Together they cover the whole demo: upload → validation → AICTE review → verification with consent → audit.

| # | Page | Portal | For whom | Tag |
|---|---|---|---|---|
| 1 | Sign-in & role entry | Public | everyone | P0 |
| 2 | Public verification page (QR target) | Public | Anyone who scans a QR (employers, universities, banks, public); no login | P0 |
| 3 | Institution dashboard | Institution | institution nodal officer, registrar, admin | P0 |
| 4 | Upload wizard | Institution | institution data-entry user | P0 |
| 5 | Batch history & validation report | Institution | Institution users (AICTE: read-only) | P0 |
| 6 | Student registry & record panel | Institution | institution registrar | P0 |
| 10 | National overview dashboard | AICTE | AICTE officers (regulation, approval bureau) | P0 |
| 12 | Violations & cases workbench | AICTE | AICTE officers (regulation) | P0 |
| 13 | Case detail & resolution | AICTE | AICTE officer (maker) and senior officer (checker) | P0 |
| 14 | Institution risk ranking | AICTE | AICTE officers planning reviews or inspections | P0 |
| 17 | Audit log & ledger integrity | AICTE | AICTE super-admin and auditors | P0 |
| 20 | Verifier home: new request & tracker | Verifier | authorised verifiers from an approved organisation | P0 |
| 21 | Verification result & credential | Verifier | the verifier who received a result | P0 |
| 23 | Consent centre | Student | students; guardians for students under 18 | P0 |

### Page 1 — Sign-in & role entry [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** everyone (institution users, AICTE staff, verifier organisations, students).
**Requirement (what the page does):** authenticate each type of user through the right door and send them to the right portal. (BE Stage 0)

**Minimum features**
- Four clearly separated entry points: **Institution**, **AICTE**, **Verifier organisation**, **Student**.
- Institution and verifier sign-in: organisation ID (AICTE Permanent ID for institutions) + password + second factor (OTP or authenticator code).
- AICTE: "Sign in with Parichay" button. Student: "Sign in with Meri Pehchaan / APAAR ID" button. Students never create a new password with us. (Both are mocked in the prototype; draw the buttons and the redirect state.)
- Forgot/reset password, account-locked message, session-expired message.
- Link to the plain-language privacy notice; language toggle (Hindi is P2).
- After sign-in, redirect to the home page of that role.

**States to design:** wrong credentials, locked account, second-factor prompt, session timed out, "you do not have access to this portal".

---

### Page 2 — Public verification page (QR target) [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** anyone who scans the QR on a certificate or shared credential: employers, universities, banks, the public. No login.
**Requirement (what the page does):** tell the scanner whether a record is **Valid, Revoked or Invalid**, showing only minimal, non-sensitive fields. (PS req. 5 and 6; BE Stage 6)

**Minimum features**
- A large status banner: **VALID / REVOKED / INVALID or EXPIRED**. Use icon + text, not colour alone.
- For VALID, show only: institution name, programme, academic year, status (active/completed), verified-at timestamp, credential ID.
- Never show: APAAR digits, date of birth, contact details, seat category, other institutions.
- "Signature verified" indicator with the signing key ID, and a "Check again" button with last-checked time.
- One identical neutral message for unknown, expired or malformed tokens. It must not reveal whether a student exists. (BE D7, §9)
- A bot-check (CAPTCHA) state shown before the result when abuse is suspected.
- Footer: AICTE identity, privacy note, "Report a problem".
- P2: "Verify a credential file" drop zone (offline signature check).

**States to design:** valid, revoked, invalid/expired, bot-check, rate-limited ("too many checks, try later"), slow network. Keep the page tiny and fast; it is the most exposed page.

---

### Page 3 — Institution dashboard [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** institution nodal officer, registrar, admin.
**Requirement (what the page does):** show the institution's data-submission health and compliance at a glance. (PS req. 4)

**Minimum features**
- KPI tiles, each with an **"as of" timestamp**: total enrolled, approved intake, supernumerary seats used, identity-verified %, students pending APAAR, open issues.
- Bar chart of **enrolled vs approved intake per programme**, with programmes over intake highlighted.
- "Latest upload" card (file, time, state) linking to its report (page 5), and a prominent **Upload student data** button.
- **"Needs your attention"** list: rows on hold, pending-APAAR deadlines, open conflict cases, unresolved errors. Each item deep-links to the fix.
- Submission-deadline banner, if AICTE configures one.
- Auto-refresh or live indicator.
- First-time empty state with a 3-step checklist: download template, upload, fix and submit.

**States to design:** first login (no data), data still processing, nothing needs attention, an AICTE deadline passed.

---

### Page 4 — Upload wizard [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** institution data-entry user.
**Requirement (what the page does):** let the institution submit student-level data in bulk (CSV/XLSX) safely, see it processed, and commit it. (PS req. 1, 2; BE Stage 1–3)

**Minimum features** (a 4-step wizard)
1. **Get the template.** Download the current template (version and year shown). A field dictionary lists every column, allowed values and an example row. Seat categories: general, TFW, NRI, OCI, PIO, FN, Gulf-children, lateral, PwD, PMSSS, other.
2. **Upload.** Drag-and-drop CSV/XLSX with file name, size and limits shown. A visible warning: *"Do not include Aadhaar numbers. Files containing them are rejected."*
3. **Processing.** A stage tracker: Uploaded → Scanned → Parsed → Identity check → Rule checks → Result. Show progress and queue position. The user can leave and come back; the upload keeps running.
4. **Result and commit.** Counts of accepted / accepted with warning / on hold / rejected; top error types; link to the row-level report (page 5); download the error file. Fix and re-upload corrected rows, then **Commit batch** with a nodal-officer declaration checkbox.
- A secondary tab, "Submit via API", links to page 9.

**States to design:** wrong template version, unknown columns, Aadhaar column detected, file failed security scan, this file was already submitted (duplicate), processing delayed (identity service slow: rows show "check pending", the upload is not blocked), partial failure with resume.

---

### Page 5 — Batch history & validation report [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** institution users; AICTE staff see the same report read-only.
**Requirement (what the page does):** show what happened to every upload and every row, and why, so errors can be fixed. (PS req. 3)

**Minimum features**
- **Batch list:** date, file name, uploader, rows, state, counts per decision; filter and search.
- **Batch detail:** stage timeline, summary chart, and an **issues table**: row number, student ID no., masked APAAR, rule ID plus a plain-language message, severity, suggested fix, row decision (ACCEPT / ACCEPT WITH WARNING / HOLD / REJECT).
- Filter by severity, rule and decision; group by rule ("37 rows: APAAR malformed").
- Download the error report (CSV) and re-submit corrected rows.
- Rows blocked by a cross-institution duplicate read **"Conflict, case ID X"** and never name the other institution. (BE §6)
- Committed batches are read-only; show the rule version used.

**States to design:** zero issues, thousands of issues (pagination), batch still processing, batch failed mid-way.

---

### Page 6 — Student registry & record panel [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** institution registrar.
**Requirement (what the page does):** browse, search and correct individual student enrolment records keyed by APAAR ID. (PS req. 1)

**Minimum features**
- Server-paginated table (it can hold lakhs of rows): student ID no., name, **masked APAAR (last 4 digits only)**, programme, year of study, mode, seat category, supernumerary flag, enrolment status, **identity-status chip**, verification-status chip.
- Search (student ID no., name, last 4 of APAAR) and filters (programme, year, category, status, identity status, flagged only).
- Row click opens a side panel: all fields, identity status with reason and deadline, open issues, and **version history** (who changed what and when).
- **Add record** and **Edit record** forms. Editing a verified record shows a warning ("this will trigger a review") and requires a reason. Status actions: withdrawn, transferred, completed.
- Export (sanitised CSV).
- Students without an APAAR appear as **No APAAR / Pending / Refused** with a tooltip. They are legitimate states, never shown as "rejected". (BE C4)

**States to design:** empty registry, no search results, record locked while a batch is processing, edit-reason dialog.

---

### Page 10 — National overview dashboard [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** AICTE officers (regulation, approval bureau).
**Requirement (what the page does):** give a live national picture of reporting, data quality and compliance. (PS req. 4)

**Minimum features**
- KPI tiles with **"as of" time** and change: approved institutions, institutions that have reported, students enrolled, identity-verified %, pending/no APAAR %, open violations, duplicates intercepted.
- Filters: academic year, state, level/programme, institution type.
- India map or ranked state bars, coloured by a selectable metric (reporting %, violation rate).
- Trend chart: enrolment vs intake over time.
- Reporting funnel: not started → uploading → submitted → verified.
- **"Needs attention"** panel: newly flagged violations, spikes, top institutions by risk (links to pages 12 and 14).
- Small groups are shown as **"<10"** instead of the exact number. (BE §8)
- Live-update indicator and manual refresh.

**States to design:** data still loading, filter returns nothing, stale data warning ("last update 3h ago").

---

### Page 12 — Violations & cases workbench [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** AICTE officers (regulation).
**Requirement (what the page does):** show the queue of automatically flagged problems and move each through a workflow. (PS req. 3; BE D8)

**Minimum features**
- Table: case ID, type, severity, institution(s) (AICTE sees both sides of a conflict), rule ID and version, created, assignee, state, age or SLA timer.
- Types: excess intake, supernumerary cap exceeded, cross-institution duplicate, probable duplicate, anomaly, edit to a verified record, programme not approved.
- Filters (type, severity, state, institution, state/region, assignee) and saved views; counters by type.
- Workflow chips: **OPEN → UNDER REVIEW → RESOLVED / FALSE POSITIVE**.
- Bulk assign; click through to page 13.
- Copy says **"flagged"**, never "penalised". Flags are for human review.

**States to design:** empty queue, overdue cases, a case someone else is editing.

---

### Page 13 — Case detail & resolution [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** AICTE officer (maker) and senior officer (checker).
**Requirement (what the page does):** investigate one case with its evidence and resolve it with a reason and a second approver. (BE D8, §6)

**Minimum features**
- **Evidence panel.** For duplicates: both enrolments side by side (identity masked), plus a match score and the reasons for fuzzy matches. For intake violations: the numbers and which rows push it over.
- Activity timeline with comments and attachments.
- Actions: ask the institution for clarification, mark false positive, confirm violation, propose resolution. **Each requires a written reason.**
- **Maker-checker:** a proposed resolution is "pending approval" until a different officer approves or rejects it. The page shows who proposed and who must approve.
- Link to the rule definition (with version) and to the related audit entries.
- Preview of the notification that will be sent to the institution.

**States to design:** awaiting second approver, you cannot approve your own proposal, case already resolved, concurrent edit.

---

### Page 14 — Institution risk ranking [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** AICTE officers planning reviews or inspections.
**Requirement (what the page does):** rank institutions by an explainable risk score so reviews can be prioritised. (PS "innovation expected"; BE Stage 5)

**Minimum features**
- Ranked table: institution, state, score, trend sparkline, and the **top 3 reasons** per row (e.g. enrolment/intake history, supernumerary share, duplicate rate, late edits, upload velocity).
- "Why" drawer showing each factor's contribution.
- Filters (state, year, type); a model-version label.
- Actions: open the institution profile, create a review case, mark as reviewed.
- Permanent disclaimer: **"An indicator for review, not a finding."** A "this looks wrong" feedback button.

**States to design:** score not yet computed, institution with too little data.

---

### Page 17 — Audit log & ledger integrity [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** AICTE super-admin and auditors.
**Requirement (what the page does):** show who did what, and prove the log has not been tampered with. (PS req. 8; BE §10.4)

**Minimum features**
- Searchable log: time, actor, actor type (user / service / verifier), action, entity, purpose, legal basis.
- Filters by actor, entity, action and date; detail view with the change (before and after).
- **Ledger-integrity card:** last verification time, chain status OK / MISMATCH (with the sequence number where it broke), last anchor time.
- Export (itself logged); identifiers masked.

**States to design:** the **tamper-detected alert state** (it is shown in the demo), very large result sets, no results.

---

### Page 20 — Verifier home: new request & tracker [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** authorised verifiers from an approved organisation.
**Requirement (what the page does):** request verification of a student's enrolment and track each request. (PS req. 5; BE §9 Flow B)

**Minimum features**
- **New request form:** APAAR ID (12-digit inline format check), purpose (dropdown limited to the organisation's approved purposes), optional note.
- A neutral confirmation after submit: *"Request sent. If the student consents, the result appears here."* It must **not** say whether the student exists. (BE §9)
- **Tracker table:** request ID, purpose, date, status (Awaiting consent / Verified / Denied / Expired / Revoked), view result, withdraw request.
- Quota meter; reminder of the organisation's terms and approved purposes.
- "Open a shared link or QR": paste a link or token the student gave you (student-initiated flow).

**States to design:** quota reached, rate-limited, invalid APAAR format, organisation suspended.

---

### Page 21 — Verification result & credential [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** the verifier who received a result.
**Requirement (what the page does):** show the signed, minimal result and let the verifier keep proof. (PS req. 6)

**Minimum features**
- Status: **VALID / REVOKED / EXPIRED**.
- Claims shown: institution, programme, academic year, status, verified-at, credential ID. Nothing more.
- Signature check ("signed by AICTE", key ID) and a **QR** for re-checking.
- Download the credential (PDF, and the machine-readable file).
- **Re-check status** button (catches revocation) and the consent expiry date.
- Purpose-limitation notice: "Use only for <purpose>. This access is logged and visible to the student."
- "Report a problem".

**States to design:** revoked after the fact (the demo shows this), consent expired, student denied.

---

### Page 23 — Consent centre [P0]
**Priority:** [P0 · Must have — Needed for the 5-minute demo spine (see Appendix C). Design these first.]

**For whom:** students; guardians for students under 18.
**Requirement (what the page does):** let the student approve, deny and revoke verifier access, and see who has looked at their record. (PS req. 5, 8; DPDP)

**Minimum features**
- **Pending requests:** verifier name, purpose, exactly what will be shared (plain language), requested duration. Buttons: Approve (pick duration) / Deny.
- **Active grants:** verifier, purpose, scope, expiry, **Revoke** (with confirmation; the credential then shows REVOKED).
- **"Who verified me" log:** verifier, purpose, time, result.
- Tabs for expired and denied.
- Minor state: banner "your guardian must approve" with request status.
- Notification preferences.

**States to design:** nothing pending, request expired, revoke confirmation, minor flow.

---

# 2. ADDITIONAL PAGES (build after the minimum pages)

**12 pages** (9 P1, 3 P2). These complete the problem statement but are not needed for the demo spine. Each is marked **[additional]**.

| # | Page | Portal | For whom | Tag |
|---|---|---|---|---|
| 7 | Intake & seat compliance | Institution | institution admin | P1 **[additional]** |
| 8 | Alerts & cases inbox | Institution | institution users | P1 **[additional]** |
| 9 | Integrations & certificate hook | Institution | institution IT contact (ERP integration) and degree-awarding bodies | P1 **[additional]** |
| 11 | Explorer & institution profile | AICTE | AICTE officers | P1 **[additional]** |
| 15 | Reports & exports | AICTE | AICTE officers and policy teams; institutions see only their own data | P1 **[additional]** |
| 16 | Rules & seat-category configuration | AICTE | AICTE super-admin (and policy cell) | P1 **[additional]** |
| 18 | Institutions & user management | AICTE | AICTE super-admin | P1 **[additional]** |
| 19 | Verifier organisation approvals | AICTE | AICTE super-admin | P2 **[additional]** |
| 22 | Student home: my record | Student | students, signed in via Meri Pehchaan / APAAR SSO | P1 **[additional]** |
| 24 | Share & download my verifiable record | Student | students | P1 **[additional]** |
| 25 | Guardian consent | Student | parent or guardian of a student under 18 (arrives by link or OTP) | P2 **[additional]** |
| 26 | My data rights | Student | students and guardians | P2 **[additional]** |

### Page 7 — Intake & seat compliance [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** institution admin.
**Requirement (what the page does):** show approved intake against actual enrolment by programme and seat category, using AICTE's category-aware rules. (PS req. 2, 3)

**Minimum features**
- Programme table: approved intake (read-only, from AICTE), enrolled within intake, and supernumerary seats by category (TFW, OCI/PIO/FN/Gulf-children, lateral, PwD, PMSSS), each with its cap and a usage meter.
- A tooltip per category saying whether it counts inside or over and above approved intake.
- Caps labelled with their source: *"rule version X, year Y"*. Before they are confirmed, label them **"illustrative"**. (BE C10, O3)
- Year selector and comparison with previous years.
- "Why am I flagged?" link that jumps to the related issue (rules V-INT-01/02).
- P2: "Question this intake figure" opens a correction request to AICTE.

**States to design:** no violations, over intake, over a supernumerary cap, approved intake not yet synced.

---

### Page 8 — Alerts & cases inbox [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** institution users.
**Requirement (what the page does):** let the institution act on notifications: validation failures, conflicts, pending-APAAR deadlines and AICTE queries.

**Minimum features**
- Inbox list: type icon, severity, status (new / open / resolved), age, due date.
- Types: validation failure, cross-institution conflict, pending-APAAR deadline, AICTE query, system notice.
- Detail view: what happened, which rows, what to do, and a button that goes straight to the fix. Reply to an AICTE query with an attachment.
- Mark read, filter, notification preferences (email, in-app).
- Content rules: messages carry **case IDs only, no personal data and no names of other institutions**. (BE §6)

**States to design:** empty inbox, overdue item, case closed by AICTE.

---

### Page 9 — Integrations & certificate hook [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** institution IT contact (ERP integration) and degree-awarding bodies.
**Requirement (what the page does):** connect an institution's ERP by API, and register certificates so APAAR ID and student ID appear on them with a QR. (PS req. 7, 10)

**Minimum features**
- **API clients:** create and revoke a client, secret shown once, scopes, last used; link to the API documentation; test (sandbox) toggle.
- **Webhooks** (P2): add an endpoint, choose event types, signing secret, delivery log with retries; clear error if the URL is rejected.
- **Template versions:** current and previous, with sunset dates.
- **Certificate specification:** a diagram of where the APAAR ID, student ID and QR sit on a certificate; field list; a downloadable sample PDF.
- **Register certificate:** single-record form and CSV; returns the verification QR; table of registered certificates with status.

**States to design:** no clients yet, key created (copy-once dialog), webhook failing.

---

### Page 11 — Explorer & institution profile [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** AICTE officers.
**Requirement (what the page does):** let officers drill from state → district → institution → programme and inspect one institution.

**Minimum features**
- Breadcrumb drill-down; the same table-plus-chart layout at each level, compared against approved intake.
- Search any institution by name or AICTE Permanent ID.
- **Institution profile:** Permanent ID, type, state, approved programmes and intake by year, submission timeline, compliance by seat category, open cases, risk score and its history, nodal officer contact.
- Student-level views are hidden by default. Opening them requires picking a **purpose** (dropdown plus note) and shows an "this access is logged" notice. Identity stays masked. (BE §8, §10)
- Export the current view.

**States to design:** institution that never reported, purpose dialog, access denied.

---

### Page 15 — Reports & exports [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** AICTE officers and policy teams; institutions see only their own data.
**Requirement (what the page does):** generate reports for policy, accreditation, monitoring and regulation. (PS req. 9)

**Minimum features**
- Report catalogue: enrolment by state/programme/category, intake compliance, duplicate incidents, identity coverage, institution compliance.
- Parameters: year, state, programme, category, institution. Output format: XLSX, PDF or CSV.
- Preview, then run as a background job with progress.
- "My reports" list with expiring download links.
- Detailed exports require a purpose and show a "this export is logged" notice; small cells are suppressed.
- P2: scheduled reports (frequency and recipients).

**States to design:** report running, report failed, link expired, empty result.

---

### Page 16 — Rules & seat-category configuration [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** AICTE super-admin (and policy cell).
**Requirement (what the page does):** change validation rules, thresholds and seat-category caps without code, with versions. (BE D6, §6)

**Minimum features**
- Rule catalogue: ID, name, severity, enabled, parameters, current version, last changed.
- **Seat-category matrix by year:** inside or over and above approved intake, cap % and base, flags. Values labelled **"illustrative until verified against the Approval Process Handbook"**.
- Edit flow: draft → **impact preview** ("would have flagged N institutions last year") → submit for approval (maker-checker) → effective-from date.
- Version history with diff and rollback.
- **Reference-data sync** card: last sync time, changes in approved intake with accept/reject. Accepted changes never rewrite past compliance results. (BE §7.2)

**States to design:** draft pending approval, conflict with another draft, preview calculating.

---

### Page 18 — Institutions & user management [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** AICTE super-admin (all institutions); institution admin (own users only).
**Requirement (what the page does):** control who has access, starting from the AICTE Permanent ID. (BE Stage 0)

**Minimum features**
- **Institutions tab (AICTE only):** list keyed by Permanent ID, onboarding status, nodal officer attested yes/no, last submission.
- **Users tab:** invite user, assign role, MFA state, last sign-in, suspend/reactivate. Privileged actions need a second approver.
- Access-review report (who has which role) with confirm/remove.
- Per-user activity link to the audit log.

**States to design:** invite pending, user suspended, approval needed.

---

### Page 19 — Verifier organisation approvals [P2] [additional]
**Priority:** [P2 · Nice to have — Only if time allows.]

**For whom:** AICTE super-admin.
**Requirement (what the page does):** review and approve organisations (employers, banks, universities, regulators) before they may verify students. (BE §9)

**Minimum features**
- Application queue with a review checklist and signed terms.
- Approve/reject with a reason; set **allowed purposes** and a **quota**.
- Active organisations list with usage, a warning flag on unusual volume, and a **kill-switch** (suspend).
- Org-level activity link to the audit log.

**States to design:** application pending, suspended organisation, quota exceeded.

---

### Page 22 — Student home: my record [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** students, signed in via Meri Pehchaan / APAAR SSO.
**Requirement (what the page does):** show the student what is held about them and help fix identity problems. (PS req. 8; BE Stage 2 "link & confirm")

**Minimum features**
- Header: name and masked APAAR.
- One card per enrolment: institution, programme, year, status, and an **identity-status chip with a plain-language explanation** and any deadline.
- **"Link & confirm"** flow when the student is unmapped or the institution could not be matched.
- Banner for pending actions (consent requests waiting, guardian approval pending).
- Quick links: Consent centre, Share my record, My data rights.

**States to design:** no enrolment reported yet, PENDING_APAAR with a deadline, MISMATCH ("details differ, raise a correction"), service unavailable.

---

### Page 24 — Share & download my verifiable record [P1] [additional]
**Priority:** [P1 · Should have — Strongly recommended; completes the PS requirements.]

**For whom:** students.
**Requirement (what the page does):** let the student create a signed credential to share on their own initiative. (PS req. 6; BE §9 Flow A)

**Minimum features**
- Choose an enrolment; choose what to include (the default minimal claim set; optional extras if permitted); recipient (named organisation or "anyone with the link"); purpose; validity period.
- **Preview of exactly what the recipient will see.**
- Generate QR, link and PDF; copy and download buttons.
- List of earlier shares with status and **Revoke**.
- Warning when sharing as "anyone with the link".

**States to design:** share expired, share revoked, no verified enrolment to share.

---

### Page 25 — Guardian consent [P2] [additional]
**Priority:** [P2 · Nice to have — Only if time allows.]

**For whom:** parent or guardian of a student under 18 (arrives by link or OTP).
**Requirement (what the page does):** capture verifiable parental consent. (DPDP Rule 10; BE C5)

**Minimum features**
- Guardian identity step (OTP; DigiLocker is mocked in the prototype).
- A plain-language summary: who is asking, why, which fields, for how long.
- Approve / Deny, then a receipt.
- List of consents given, with revoke.
- A statement that there is no profiling of children.

**States to design:** link expired, identity check failed, already answered.

---

### Page 26 — My data rights [P2] [additional]
**Priority:** [P2 · Nice to have — Only if time allows.]

**For whom:** students and guardians.
**Requirement (what the page does):** let them request a correction, a copy of their data or erasure, or raise a grievance. (DPDP rights; BE §10.3)

**Minimum features**
- Request type chooser; pick the record; description and evidence upload.
- Request tracker with status and due dates, and a receipt.
- Short explanation of what may be retained under law or policy.
- Who handles a correction (institution or AICTE) is an **open question** (see Appendix D); design a neutral "routed to the right office" message.

**States to design:** submitted, in progress, completed, declined with a reason.

---

# PART B — APPENDICES

## Appendix A — Rules that apply to every page

These come from the backend design. Please bake them into the component library, not into each page.

1. **Mask identity.** Show the APAAR ID as `••••••••1234` (last 4 only) everywhere except where a user types it in themselves. No APAAR digits in QR codes, URLs or notifications. (BE §10.2, §9)
2. **"As of" on every number.** Dashboards show when each figure was last computed. (BE §8)
3. **One status vocabulary** (Appendix B), same colours, icons and wording on every page. Never rely on colour alone.
4. **No "rejected" for students without an APAAR.** Use the named states; show deadlines. (BE C4)
5. **No cross-institution leakage.** An institution is told "conflict, case ID X", never which other institution holds the seat. Only AICTE sees both. (BE §6)
6. **No existence oracle.** The verifier and public pages give the same neutral message for "no such student" and "no consent". (BE §9)
7. **Small-cell suppression.** Any count below the threshold shows "<10" in institution and public views. (BE §8)
8. **Purpose and logging notices.** Student-level drill-downs and detailed exports ask for a purpose and say "this access is logged".
9. **Illustrative values are labelled.** Seat-category caps and thresholds carry an "illustrative" label until verified. (BE O3)
10. **Standard states for every page:** loading, empty, error, no permission, session expired, maintenance. Long tables are server-paginated.
11. **Accessibility.** Government sites follow GIGW 3.0 (BE C9). Design to WCAG 2.1 AA as the baseline; text must be translatable (Hindi toggle is P2).
12. **Prototype marking.** Show a small "Prototype: synthetic data" ribbon so the demo cannot be mistaken for a live government service. Follow AICTE's brand guidelines for the logo and colours if the team has them; do not copy other government marks.
13. **No personal data in messages.** Emails, SMS and in-app notices carry case IDs and plain wording only.

## Appendix B — Status vocabulary (shared components)

| Group | Values | Where used |
|---|---|---|
| Identity status | VERIFIED · PENDING APAAR · NO APAAR · REFUSED · MISMATCH · CHECK PENDING (service unavailable, retrying) | 4, 5, 6, 22 |
| Row decision | ACCEPT · ACCEPT WITH WARNING · HOLD · REJECT | 4, 5 |
| Verification status | ACCEPTED · ON HOLD · FLAGGED | 6 |
| Severity | Warning · Error · Review · Violation · Critical | 5, 12, 13 |
| Batch stage | Created · Scanning · Parsing · Identity check · Rule checks · Ready to commit · Committed · Failed | 3, 4, 5 |
| Case state | OPEN · UNDER REVIEW · RESOLVED · FALSE POSITIVE (+ PENDING APPROVAL for maker-checker) | 8, 12, 13 |
| Enrolment status | ACTIVE · WITHDRAWN · TRANSFERRED · COMPLETED | 6 |
| Consent / request | AWAITING CONSENT · GRANTED · DENIED · EXPIRED · REVOKED | 20, 21, 23, 24 |
| Credential | VALID · REVOKED · INVALID/EXPIRED | 2, 21, 24 |

## Appendix C — Demo script mapped to pages

| Demo step (BE §13.4) | Pages used |
|---|---|
| 1. Institution uploads a file with a missing APAAR, a malformed APAAR, a duplicate, a cross-college conflict and over-intake | 1, 4 |
| 2. Batch moves through stages with per-row reasons | 4, 5 |
| 3. AICTE dashboard updates; a duplicate case is opened and resolved with maker-checker | 10, 12, 13 |
| 4. Risk ranking with explanations | 14 |
| 5. Student grants consent; employer verifies; scan the QR; revoke and show REVOKED | 20, 23, 21, 2 |
| 6. Audit ledger, then a tampered row is caught | 17 |
| Supporting views shown in passing | 3, 6 |

## Appendix D — Open points to settle with the team (they change a few screens)

1. **Is the student portal in the prototype?** Page 23 (consent) is P0 because the demo needs it; pages 22 and 24 are P1. If the team cuts them, the consent request can be approved from a simple link.
2. **Who owns a correction** when student data is wrong: institution, AICTE or the student? This decides page 26 and the dispute links on pages 7 and 22. (Solution doc §15)
3. **Seat-category caps and the NRI/TFW treatment** are unconfirmed; keep them "illustrative" and configurable. (BE O3)
4. **Is there a submission window or deadline** configured by AICTE? Pages 3 and 8 show a deadline banner only if so.
5. **Legal basis for institutional reporting** (consent vs a function under law) may change the wording on student-facing notices. (BE O4)
6. **Verifier purposes list:** the dropdown on page 20 needs an agreed list (e.g. employment, admission, loan, regulatory check).
