# APAAR Student Ledger — Test Guide

Step-by-step checks for every portal and feature. Each test lists what to do and what you should see.
Mark the **Result** column ✅ pass or ❌ fail and note anything odd.

| | |
|---|---|
| Website | https://agastya-chi.vercel.app (or http://localhost:5173 when running locally) |
| Backend API docs | https://sih.monu14.me/docs |
| Demo password (all accounts) | `Aicte@2026!` |
| One-time code at sign-in | any 6 digits (prototype) |

**Before you start**
- Run the sections **in order** (A → H). Later tests rely on data created earlier (for example, the conflict case from section C is reviewed in section D).
- The tests change the data. On a local setup you can start fresh by stopping the backend, deleting `SIH-backend/aicte_ledger.db` and starting it again. On the hosted server, ask the backend owner to reset it.
- Demo accounts are listed on the sign-in page under **Demo accounts**. **Sign in** next to an account skips the password; **Fill in** puts the email and password in the form.

| Account | Email | Portal |
|---|---|---|
| Institution registrar (COEP Pune) | registrar@coep.ac.in | Institution |
| AICTE officer (maker) | aicte.maker@gov.in | AICTE |
| AICTE senior officer (checker) | aicte.checker@gov.in | AICTE |
| Verifier (TCS) | verifier@tcs.com | Verifier |
| Student (Priya Nair) | priya.nair@student.aicte.gov.in | Student |

---

## A. Public pages (no sign-in)

| # | Steps | Expected result | Result |
|---|---|---|---|
| A1 | Open the home page. | Heading “One verified record for every student…”, a **Check a credential** box, four “Who uses it” cards, and the six-step “How a record moves” list. A “Prototype — synthetic data only” notice is in the top bar. | |
| A2 | In **Check a credential**, click the example `demo-priya-tcs-2026`. | Green **VALID** banner showing institution, programme, academic year, enrolment status, credential ID and “Signed by AICTE”. | |
| A3 | On the same page, look for personal data. | No APAAR number, date of birth or phone/email of the student anywhere. | |
| A4 | Open `/verify/demo-priya-hdfc-2025`. | Red **REVOKED** banner and the credential ID only. | |
| A5 | Open `/verify/anything-random`. | Grey **NOT VALID** banner with a neutral message that does not say why. | |
| A6 | Click **Check again** on any result. | “Last checked” time updates. | |
| A7 | Open `/institution` while signed out. | You are sent to the sign-in page. After signing in as the registrar you land back on `/institution`. | |
| A8 | Shrink the browser to phone width (about 390 px). | Layout stacks into one column, the menu becomes a ☰ button, nothing scrolls sideways. | |

## B. Sign-in and account activation

| # | Steps | Expected result | Result |
|---|---|---|---|
| B1 | **Sign in** → **Institution** tab. Enter `1-1049281` and a wrong password → **Continue**. | Red message “The ID or password is incorrect.” | |
| B2 | Enter the right password `Aicte@2026!` → **Continue**. | One-time-code step appears. | |
| B3 | Enter any 6 digits → **Sign in**. | Institution dashboard for COEP Technological University opens. Your name and role show at the top right. | |
| B4 | **Sign out**. On the **Institution** tab, enter `verifier@tcs.com` / `Aicte@2026!` → **Continue**. | Message: “This account belongs to the Verifier organisation portal. Use that tab to sign in.” | |
| B5 | Go to **Activate an institution account** (link on the sign-in page). Permanent ID `1-9900112`, email `registrar@mitjaipur.edu.in` → **Send code**. Code `123456`, a new password (8+ characters) twice → **Activate account**. | You are signed in to the Institution portal for Malaviya Institute of Technology. Doing it again shows “already activated”. | |
| B6 | While signed in as the student, open `/aicte`. | “You do not have access to this page” with a link to your own portal. | |

## C. Institution portal — sign in as the registrar (COEP)

| # | Steps | Expected result | Result |
|---|---|---|---|
| C1 | **Dashboard**. | Six figure tiles (enrolled, approved intake, supernumerary, APAAR verified %, without verified APAAR, on hold), intake bars per programme, **Needs your attention**, **Latest upload**, deadline banner and an “As of” time. | |
| C2 | Click **Refresh** on the dashboard. | “As of” time updates. | |
| C3 | **Upload data** → **Download template (CSV)**. | A CSV with the column headers and two example rows downloads. | |
| C4 | Open **Column guide**. | Table of every column with what to enter and an example. | |
| C5 | Choose a `.txt` or `.pdf` file. | “Only .csv and .xlsx files are accepted.” | |
| C6 | Upload a CSV that has an `aadhaar` column (any content). | Refused: “The file contains an Aadhaar column…”. | |
| C7 | Click **Use the sample file**. | Report shows 15 rows with counts for accepted / with warning / on hold / rejected, and **What the checks found** lists rules including V-ID-01, V-ID-02, V-ID-03, V-DUP-01, V-DUP-02, V-INT-01 and V-INT-03. | |
| C8 | Read the V-DUP-02 issue. | It says the student is active at *another institution* but does **not** name that institution. | |
| C9 | Click **Download error file**. | CSV of the row-level issues downloads. | |
| C10 | Look at **Commit batch** before ticking the declaration. | Button is disabled. | |
| C11 | Tick the nodal-officer declaration → **Commit batch**. | “Batch committed to the ledger” with recorded and held counts, plus a yellow notice “Conflict, case DUP-2026-xxxx”. **Write down the case number.** | |
| C12 | **Uploads & reports**. | The sample file is listed as **Committed** with its counts. Click it: the batch page shows issues grouped by rule and a filterable row-level table. | |
| C13 | On the batch page, filter **Row decision** = Reject. | Only rejected rows remain; the count in the heading changes. | |
| C14 | **Student registry**. Search `Ishita`. | One row: Ishita Kulkarni, APAAR shown as `••••••••5431`. | |
| C15 | Click the row. | Side panel with all fields, identity status explanation, issues and history. | |
| C16 | **Mark withdrawn** → type a reason (5+ characters) → **Save change**. | Record shows version 2 and status Withdrawn; history shows the change with your reason. | |
| C17 | Press Esc. Filter **Enrolment** = On hold. | Only held records (e.g. missing APAAR) appear. Click **Clear filters** to reset. | |
| C18 | **Add a student**: name `Kavya Menon`, date of birth any 2006 date, APAAR `778899001122`, student ID `COEP-ME-2026-777`, programme Mechanical Engineering → **Check and add**. | “Kavya Menon was added” with the masked APAAR. | |
| C19 | **Add a student** again with APAAR `123`. | Field shows “Must be 12 digits.” and the button stays disabled. | |
| C20 | Click **Export CSV**. | Registry CSV downloads with masked APAAR numbers only. | |
| C21 | **Intake compliance**. | Table of programmes with meters for within-intake, supernumerary and lateral seats, and a table explaining how each seat category is counted (marked illustrative). | |
| C22 | Back to **Dashboard**. | **Needs your attention** now includes the conflict case from C11 (case number only). | |

## D. AICTE portal — maker and checker

Sign in as **AICTE officer (maker)**.

| # | Steps | Expected result | Result |
|---|---|---|---|
| D1 | **National overview**. | Eight figure tiles, **By state** bars, **Reporting progress**, **Needs attention** (cases and high-risk institutions), “As of” time. | |
| D2 | Change **Show** above the state bars to “Institutions reporting (%)”. | Bars and numbers change to percentages. | |
| D3 | Click **National summary (CSV)**. | CSV downloads with one row per institution programme. | |
| D4 | **Cases**. Switch between Open / Awaiting approval / Closed / All. | Counts in the tabs match the rows shown. The case from C11 is in **Open**. | |
| D5 | Open that case. | **Evidence** shows both enrolments side by side (both institution names visible to AICTE), APAAR masked, plus Activity and the notice text sent to institutions. | |
| D6 | Choose **Confirm the violation**, type a reason of 10+ characters → **Submit for approval**. | Status becomes **Pending approval** and the panel says “You proposed this outcome… a different senior officer must approve it.” | |
| D7 | **Risk ranking**. | Ranked table with score bars, levels and main reasons. Apex Institute is near the top. A yellow notice says it is an indicator, not a finding. | |
| D8 | Click **Why?** on Apex. | Dialog listing four measures with values, the unusual ones marked. | |
| D9 | **Institutions**. Search `Malaviya` or filter by state. | List narrows. | |
| D10 | **Register an institution**: Permanent ID `1-7777001`, name, state, district, nodal officer and email, one programme with intake 60 → **Register**. | Green confirmation; the new institution appears as “Not activated”. | |
| D11 | Open **Apex Institute** → **View student records** → enter a note → **Open records**. | Student table appears with APAAR masked and no names, and “This access is logged”. | |
| D12 | **Audit ledger**. | Green **Chain intact** card with the number of entries checked, last anchor details, and the entries table. Click a row to see its detail and hashes. | |
| D13 | Click **Tamper with entry**, then **Verify now**. | Red **Tampering detected** card naming the entry number; that row is highlighted. **Anchor to WORM storage** is disabled. | |
| D14 | Click **Undo the tampering**. | Card returns to **Chain intact**. | |
| D15 | Click **Anchor to WORM storage**. | Green notice “Anchored N new entries” with a Merkle root. | |
| D16 | In the entries table, set **Action** = Student records viewed. | The access from D11 is listed with its purpose. | |

Sign out and sign in as **AICTE senior officer (checker)**.

| # | Steps | Expected result | Result |
|---|---|---|---|
| D17 | **Cases** → **Awaiting approval** → open the case from D6. | Proposal, the maker’s name and reason, and a note box with **Approve** / **Return to maker**. | |
| D18 | Type a note → **Approve**. | Outcome panel shows “Violation confirmed”, proposed by the maker and approved by you. The case moves to **Closed**. | |
| D19 | Open case `DUP-2026-0042`, propose **Mark as false positive** yourself, then try to approve it. | The approval panel says you cannot approve your own proposal. | |

## E. Verifier portal — sign in as TCS

| # | Steps | Expected result | Result |
|---|---|---|---|
| E1 | **Verification requests** page. | New request form, tracker table, quota meter and the list of approved purposes. | |
| E2 | Type APAAR `12345`. | “An APAAR ID has exactly 12 digits.” and **Send request** stays disabled. | |
| E3 | APAAR `663910284422`, purpose “Higher education admission” → **Send request**. | “The student has already consented. A signed result is ready.” → **View result**. | |
| E4 | On the result page. | Green **VALID** banner, institution / programme / year / status, “Signed by AICTE”, two QR codes, and a purpose-use notice. | |
| E5 | Click **Download PDF**. | A certificate PDF downloads with masked APAAR, student ID and a QR code. | |
| E6 | Open **Machine-readable credential (JWS)**. | The signed token is shown with a **Copy** button. | |
| E7 | Back to the list. Request APAAR `123412341234` (nobody). | Neutral message “Request sent. If the student consents…” — it does **not** say the student doesn’t exist. Tracker shows **Awaiting consent** with a **Withdraw** button. | |
| E8 | Click **Withdraw** on that request. | Status becomes **Withdrawn**. | |
| E9 | Copy the result link from E4’s QR panel (“Link: …/verify/…”) and keep it for section G. If it starts with `http://localhost:5173`, replace that part with the website address. | | |

## F. Student portal — sign in as Priya Nair

| # | Steps | Expected result | Result |
|---|---|---|---|
| F1 | **My record**. | Name, masked APAAR, a yellow banner about pending requests, and an enrolment card for COEP with identity status explained. | |
| F2 | **Consent** → **Waiting for your answer**. | Request from Larsen & Toubro with purpose and exactly what would be shared. | |
| F3 | Choose a duration → **Approve**. | Green notice “Larsen & Toubro Ltd can now see your record until …”; it moves to **Active**. | |
| F4 | In **Active**, click **Withdraw** for Tata Consultancy Services → **Withdraw consent**. | Confirmation dialog first, then “Consent for Tata Consultancy Services is withdrawn…”. TCS moves to **Past** as Revoked. | |
| F5 | Open the **Who verified me** tab. | Every verifier request so far, with organisation, purpose, time and result. | |
| F6 | **Share my record**. | Form plus a preview of exactly what the recipient will see (no name, date of birth or APAAR). | |
| F7 | Enter a purpose → **Create link and QR**. | QR code and link appear, with **Copy** and **Open as the recipient sees it** (opens a VALID page). | |
| F8 | In **Earlier shares**, click **Revoke** on that share, then **Open**. | The share shows **Revoked**; the public page shows **REVOKED**. | |

## G. Revocation reaches the verifier

| # | Steps | Expected result | Result |
|---|---|---|---|
| G1 | Open the link saved in E9 (no sign-in needed). | Red **REVOKED** — because the student withdrew TCS’s consent in F4. | |
| G2 | Sign in as the verifier, open that request → **Re-check status**. | Banner shows **REVOKED** and **Download PDF** is disabled. | |
| G3 | As the verifier, request APAAR `663910284422` again. | Now it says **Awaiting consent** (consent was withdrawn, so the student must approve again). | |

## H. Security and data-protection checks

| # | Steps | Expected result | Result |
|---|---|---|---|
| H1 | Sign in as the registrar and open `/aicte/cases` in the address bar. | “You do not have access to this page.” | |
| H2 | As any user, open https://sih.monu14.me/api/v1/aicte/dashboard directly in the browser (no token). | `{"detail":"Authentication required. Please sign in."}` | |
| H3 | Look through every page and download. | No Aadhaar numbers anywhere; APAAR always shown as `••••••••1234` except where you type it. | |
| H4 | Sign out, then press the browser Back button. | Portal pages send you to sign-in instead of showing data. | |

---

## Quick API check (optional, for developers)

Open https://sih.monu14.me/docs, click **Authorize**, and use a token from `POST /api/v1/auth/quick-login/{persona_id}`
(persona IDs: `INSTITUTION_REGISTRAR`, `AICTE_MAKER`, `AICTE_CHECKER`, `VERIFIER`, `STUDENT`). Every endpoint can be tried there.

## Known limits of the prototype

- The APAAR/ABC registry, DigiLocker, Parichay and Meri Pehchaan are simulated. Test APAAR IDs ending in **9** return a registry mismatch and those ending in **0** return “not found”.
- The one-time code at sign-in accepts any 6 digits; the activation code is `123456`.
- Uploading the sample file a second time rejects most rows as “already registered” — that is correct behaviour.
- If QR codes or PDFs point to `localhost`, the backend’s `PUBLIC_VERIFY_BASE_URL` setting has not been set to the website address yet.

## Reporting a problem

Note the test number, the account you were signed in as, the page address, what you expected and what happened, and a screenshot.
