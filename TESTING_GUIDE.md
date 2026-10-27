# 🚀 AICTE APAAR Platform — Complete Testing & User Guide

**Frontend:** https://agastya-chi.vercel.app  
**Backend:** https://sih.monu14.me  
**Swagger Docs:** https://sih.monu14.me/docs

---

## 🖥️ How to Use the Website (Full Flow)

---

### Step 1: Open the Landing Page

Visit **https://agastya-chi.vercel.app**

You will see **5 Portal Cards** — one for each role:

| Portal Card | Role | Use Case |
|---|---|---|
| 🏫 Institution Portal | College Registrar | Upload student data, track compliance |
| 🏛️ AICTE National Portal | AICTE Maker / Checker | View national stats, handle violations |
| 🔍 Verifier Portal | Employer (e.g. TCS) | Request & verify student credentials |
| 🎓 Student Consent Centre | Student | Approve/revoke data sharing |
| 🌐 Public QR Verifier | Anyone | Verify a student credential anonymously |

---

### Step 2: Login — Pick Any Role

Click any portal card → Login screen opens → **Use either method:**

#### Method A: 1-Click Instant Demo Login ⚡ (Recommended)
Click the **"1-Click Instant Demo Login"** button. Instantly logs you in without typing anything.

#### Method B: Email + Password Login
Auto-filled credentials per role:

| Role | Email | Password |
|---|---|---|
| Institution Registrar | `registrar@coep.ac.in` | `coep@2026` |
| AICTE Maker | `aicte.maker@gov.in` | `aicte@2026` |
| AICTE Checker | `aicte.checker@gov.in` | `aicte@2026` |
| Verifier (TCS) | `verifier@tcs.com` | `tcs@2026` |
| Student | `priya.nair@student.aicte.gov.in` | `student@2026` |

> 💡 **Session Persists**: After login, refresh the page — you stay logged in automatically (JWT stored in `localStorage`).

---

## 🧪 Backend Route Testing — Step by Step

---

### ✅ Route Test 1: Health Check

**How to test directly (no login needed):**  
Open this URL in browser → should return JSON:

```
GET https://sih.monu14.me/api/v1/health
```

**Expected Response:**
```json
{ "status": "healthy", "service": "AICTE APAAR National Ledger & Verification Platform" }
```

**Status:** ✅ Pass if you see JSON | ❌ Fail if browser shows connection error

---

### ✅ Route Test 2: Auth — 1-Click Persona Login

**Frontend Steps:**
1. Go to https://agastya-chi.vercel.app
2. Click **"Institution Portal"**
3. Click **"1-Click Instant Demo Login"**

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/auth/quick-login/INSTITUTION_REGISTRAR
```

**What to Check:**
- Open `F12` → **Network tab** → filter by `XHR/Fetch`
- Find the `quick-login` request → Status should be `200 OK`
- Response body should contain `access_token` (JWT string)
- Frontend should **automatically redirect** to Institution Dashboard

**✅ Pass:** Redirected to dashboard with green "Live data from sih.monu14.me" banner  
**❌ Fail:** Red banner "Backend error" or stays on login page

---

### ✅ Route Test 3: Auth — Email/Password Login

**Frontend Steps:**
1. Click any portal card → login screen opens
2. Select **AICTE Maker** tab
3. Credentials auto-fill → click **"Sign In"**

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/auth/login
Body: { "email": "aicte.maker@gov.in", "password": "aicte@2026" }
```

**✅ Pass:** Redirected to AICTE Portal  
**❌ Fail:** "Invalid credentials" error message

---

### ✅ Route Test 4: Auth — Session Restore (Me Endpoint)

**Frontend Steps:**
1. Login with any role
2. Press `F5` (refresh the page)

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/auth/me
Headers: Authorization: Bearer <saved_token>
```

**✅ Pass:** Page loads directly to the portal (not login screen)  
**❌ Fail:** Redirected back to login page after refresh

---

### ✅ Route Test 5: Institution Dashboard — Live KPIs

**Frontend Steps:**
1. Login as **Institution Registrar**
2. Wait for dashboard to load

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/institutions/inst_01/dashboard
```

**What to Check:**
- Banner at top: `✅ Live data from sih.monu14.me · <date>`
- 4 metric cards show real numbers (Approved Seats, Enrolled, Compliance Score, Discrepancies)

**✅ Pass:** Green banner + populated metric cards  
**❌ Fail:** Red banner "Backend error — showing mock data"

---

### ✅ Route Test 6: Institution — Fetch Students List

**Frontend Steps:**
1. Login as Institution Registrar
2. Click **"Student Directory"** tab

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/institutions/inst_01/students
```

**What to Check:**
- Table shows student rows with APAAR ID, Name, Course, Status
- Search and filter work

**✅ Pass:** Table populated with student data  
**❌ Fail:** Empty table or error message

---

### ✅ Route Test 7: Institution — Demo CSV Upload & Validation

**Frontend Steps:**
1. Login as Institution Registrar
2. Click **"Batch Upload"** tab
3. Notice `🔴 LIVE` badge in upload zone
4. Click **"Demo Batch Upload"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/institutions/inst_01/upload-demo
```

**What to Check:**
- Blue banner appears: `📤 Batch #XXXXXXXX — READY_TO_COMMIT`
- Summary row counts: Total Processed, Valid, Violations found
- **"✅ Commit to Ledger"** button appears

**✅ Pass:** Blue upload result banner appears with batch summary  
**❌ Fail:** Error message or no response banner

---

### ✅ Route Test 8: Institution — Commit Batch to Ledger

**Frontend Steps:**
1. After completing Route Test 7
2. Click **"✅ Commit to Ledger"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/institutions/inst_01/batches/{batch_id}/commit
```

**What to Check:**
- Banner disappears (batch committed)
- Dashboard refreshes with updated metrics
- No error toast

**✅ Pass:** Dashboard refreshes and banner clears  
**❌ Fail:** API error or "Commit failed" message

---

### ✅ Route Test 9: Institution — Manual Single Student Enrolment

**Frontend Steps:**
1. Login as Institution Registrar
2. Click **"Manual Enrolment"** tab
3. Fill the form:
   - **APAAR ID:** `111222333444`
   - **Name:** `Test Student`
   - **DOB:** `2002-06-15`
   - **Course:** `Computer Science and Engineering`
4. Click **"Enroll Student"**

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/institutions/inst_01/students
```

**✅ Pass:** Green success alert "Student enrolled successfully!"  
**❌ Fail:** Red error or no response

---

### ✅ Route Test 10: AICTE — National Dashboard

**Frontend Steps:**
1. Login as **AICTE Maker**
2. Wait for dashboard to load

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/aicte/dashboard
```

**What to Check:**
- National stats visible: Total Institutions, Approved Intake, Over-Admission cases
- Charts or summary cards populated with real data

**✅ Pass:** Dashboard shows national aggregate data  
**❌ Fail:** Empty or mock data only

---

### ✅ Route Test 11: AICTE — Violations List

**Frontend Steps:**
1. Login as AICTE Maker
2. Click **"Violations & Discrepancies"** tab

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/aicte/violations
```

**✅ Pass:** List of institutions violating AICTE caps displayed  
**❌ Fail:** Empty list or error

---

### ✅ Route Test 12: AICTE Maker — Propose Action on Violation

**Frontend Steps:**
1. Login as **AICTE Maker**
2. Go to **"Violations"** tab
3. Find any violation entry
4. Click **"Propose Action"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/aicte/violations/{id}/propose
```

**✅ Pass:** Violation status changes to "Pending Checker Approval"  
**❌ Fail:** Error toast or no status change

---

### ✅ Route Test 13: AICTE Checker — Approve Action

**Frontend Steps:**
1. **Logout** → Login as **AICTE Checker** (`aicte.checker@gov.in`)
2. Go to **"Violations"** tab
3. Find the pending violation from Route Test 12
4. Click **"Approve"** or **"Reject"**

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/aicte/violations/{id}/approve
```

**✅ Pass:** Status updates to "Approved" or "Rejected" — Two-person integrity workflow complete!  
**❌ Fail:** Error or status unchanged

---

### ✅ Route Test 14: AICTE — Risk Ranking

**Frontend Steps:**
1. Login as AICTE Maker or Checker
2. Click **"Risk Ranking"** tab

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/aicte/risk-ranking
```

**✅ Pass:** Institutions sorted into High / Medium / Compliant risk tiers  
**❌ Fail:** Empty list

---

### ✅ Route Test 15: AICTE — Audit Ledger (SHA-256 Blockchain)

**Frontend Steps:**
1. Login as AICTE Maker/Checker
2. Click **"Audit Ledger"** tab

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/aicte/audit
```

**What to Check:**
- Table of audit blocks with:
  - Block Index
  - Timestamp
  - SHA-256 Block Hash
  - Previous Block Hash (chain linking)

**✅ Pass:** Cryptographic block chain table renders  
**❌ Fail:** Empty or error

---

### ✅ Route Test 16: AICTE — Verify Chain Integrity

**Frontend Steps:**
1. In Audit Ledger tab
2. Click **"Verify Chain Integrity"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/aicte/audit/verify-chain
```

**Expected Response:**
```json
{ "valid": true, "tampered": false, "blocks_checked": 12 }
```

**✅ Pass:** Green confirmation "Chain integrity verified — No tampering detected"  
**❌ Fail:** Error or "Tampered" flag

---

### ✅ Route Test 17: AICTE — Simulate Tamper Attack

**Frontend Steps:**
1. In Audit Ledger tab
2. Click **"Simulate Tamper"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/aicte/audit/simulate-tamper
```

**What to Check:**
- System detects the tampered block
- Shows which block hash is now broken
- Demonstrates tamper-proof capability

**✅ Pass:** Tamper detection alert showing corrupted block number  
**❌ Fail:** No detection or error

---

### ✅ Route Test 18: AICTE — Anchor to WORM Storage

**Frontend Steps:**
1. In Audit Ledger tab
2. Click **"Anchor to WORM"** button

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/aicte/audit/anchor
```

**✅ Pass:** Confirmation message "Audit log anchored to immutable WORM storage"  
**❌ Fail:** Error or no response

---

### ✅ Route Test 19: Verifier — Submit Verification Request

**Frontend Steps:**
1. Login as **Verifier (TCS)** (`verifier@tcs.com`)
2. Enter in the form:
   - **Candidate APAAR ID:** `892019482019`
   - **Purpose:** `Pre-employment verification`
3. Click **"Request Verification"**

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/verifier/requests
```

**✅ Pass:** Request created with status `PENDING_STUDENT_CONSENT` or `APPROVED`  
**❌ Fail:** Error or no confirmation

---

### ✅ Route Test 20: Verifier — Tracker Roster

**Frontend Steps:**
1. Login as Verifier
2. Click **"Tracker"** tab

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/verifier/tracker
```

**✅ Pass:** Table shows all verification requests with live statuses  
**❌ Fail:** Empty or error

---

### ✅ Route Test 21: Student — Consent Management

**Frontend Steps:**
1. Login as **Student** (`priya.nair@student.aicte.gov.in`)
2. Dashboard loads with pending consent requests (e.g. TCS verification)

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/student/priya.nair/consents
```

**What to Check:**
- List of pending consent requests from employers
- Each request shows: Requester, Purpose, Date

**✅ Pass:** Consent cards visible  
**❌ Fail:** Empty page or error

---

### ✅ Route Test 22: Student — Approve / Revoke Consent

**Frontend Steps:**
1. Login as Student
2. Click **"Approve"** on any pending consent request

**Backend Route Hit:**
```
POST https://sih.monu14.me/api/v1/student/consent/{consent_id}/action
```

**✅ Pass:** Card updates to "Approved" status instantly  
**❌ Fail:** Error or no status change

---

### ✅ Route Test 23: Public QR Verifier (No Login Required)

**Frontend Steps:**
1. On any page, click **"Public QR Verifier"** in the navigation bar
2. Click the quick test button **"892019482019 (Valid)"**
3. Click **"Verify Validity"**

**Backend Route Hit:**
```
GET https://sih.monu14.me/api/v1/verify/public/892019482019
```

**What to Check:**
- Emerald green card: **VALID CREDENTIAL**
- Shows Institution Name, Program, Academic Year
- No personal Aadhaar or private data shown (zero-knowledge)

**✅ Pass:** Valid credential card with institution details  
**❌ Fail:** "Invalid / Unrecognized Credential" red card (when it should be valid)

**Also test invalid token:**
- Click **"999999999999 (Invalid)"** → should show red "Invalid Credential" card

---

### ✅ Route Test 24: CSV Reports Download

Open these directly in browser (no login needed):

| Report | Test URL | Expected |
|---|---|---|
| Admission Template | https://sih.monu14.me/api/v1/reports/admission-template.csv | CSV downloads |
| National Summary | https://sih.monu14.me/api/v1/reports/national-summary.csv | CSV downloads |

**✅ Pass:** Browser prompts download of `.csv` file  
**❌ Fail:** 404 or access denied

---

## ⚡ 1-Minute Full Smoke Test (Browser Console)

Open https://agastya-chi.vercel.app → Press `F12` → **Console** tab → Paste & Enter:

```javascript
(async () => {
  const B = "https://sih.monu14.me/api/v1";
  const log = (label, ok, extra = "") => console.log(`${ok ? "✅" : "❌"} ${label}`, extra);

  // 1. Health Check
  try {
    const r = await fetch(`${B}/health`);
    log("Health Check", r.ok, await r.json());
  } catch(e) { log("Health Check", false, e.message); }

  // 2. Auth Quick Login
  let token = "";
  try {
    const r = await fetch(`${B}/auth/quick-login/INSTITUTION_REGISTRAR`, { method: "POST" });
    const d = await r.json();
    token = d.access_token;
    log("Auth Quick-Login", r.ok && !!token, `Role: ${d.user?.role}`);
  } catch(e) { log("Auth Quick-Login", false, e.message); }

  const h = { "Authorization": `Bearer ${token}` };

  // 3. Institution Dashboard
  try {
    const r = await fetch(`${B}/institutions/inst_01/dashboard`, { headers: h });
    log("Institution Dashboard", r.ok, r.status);
  } catch(e) { log("Institution Dashboard", false, e.message); }

  // 4. Institution Students
  try {
    const r = await fetch(`${B}/institutions/inst_01/students`, { headers: h });
    const d = await r.json();
    log("Institution Students", r.ok, `Count: ${d.students?.length ?? 0}`);
  } catch(e) { log("Institution Students", false, e.message); }

  // 5. AICTE Dashboard
  try {
    const r = await fetch(`${B}/aicte/dashboard`, { headers: h });
    log("AICTE Dashboard", r.ok, r.status);
  } catch(e) { log("AICTE Dashboard", false, e.message); }

  // 6. Violations
  try {
    const r = await fetch(`${B}/aicte/violations`, { headers: h });
    log("AICTE Violations", r.ok, r.status);
  } catch(e) { log("AICTE Violations", false, e.message); }

  // 7. Audit Ledger
  try {
    const r = await fetch(`${B}/aicte/audit`, { headers: h });
    log("Audit Ledger", r.ok, r.status);
  } catch(e) { log("Audit Ledger", false, e.message); }

  // 8. Public Verify (No Auth)
  try {
    const r = await fetch(`${B}/verify/public/892019482019`);
    log("Public QR Verify", r.ok, r.status);
  } catch(e) { log("Public QR Verify", false, e.message); }

  console.log("\n📊 Smoke test complete. ✅ = working, ❌ = broken");
})();
```

---

## 📋 Final Verification Checklist

Mark each item after testing:

**Auth:**
- [ ] `POST /auth/quick-login/{role}` → 200 OK + JWT token
- [ ] `POST /auth/login` → 200 OK + JWT token  
- [ ] `GET /auth/me` → 200 OK after page refresh

**Institution Portal:**
- [ ] `GET /institutions/inst_01/dashboard` → Live banner visible
- [ ] `GET /institutions/inst_01/students` → Students table populated
- [ ] `POST /institutions/inst_01/upload-demo` → Batch banner with summary
- [ ] `POST /institutions/inst_01/batches/{id}/commit` → Dashboard refresh
- [ ] `POST /institutions/inst_01/students` → Enrolment success

**AICTE Portal:**
- [ ] `GET /aicte/dashboard` → National stats loaded
- [ ] `GET /aicte/violations` → Violation list populated
- [ ] `POST /aicte/violations/{id}/propose` → Status changes (Maker)
- [ ] `POST /aicte/violations/{id}/approve` → Approved (Checker)
- [ ] `GET /aicte/risk-ranking` → Institutions ranked
- [ ] `GET /aicte/audit` → Block chain table visible
- [ ] `POST /aicte/audit/verify-chain` → `valid: true`
- [ ] `POST /aicte/audit/simulate-tamper` → Tamper detected
- [ ] `POST /aicte/audit/anchor` → WORM anchored

**Verifier Portal:**
- [ ] `POST /verifier/requests` → Verification request created
- [ ] `GET /verifier/tracker` → Request tracker loaded

**Student Portal:**
- [ ] `GET /student/{token}/consents` → Consent cards visible
- [ ] `POST /student/consent/{id}/action` → Status updated

**Public:**
- [ ] `GET /verify/public/892019482019` → Valid credential card (green)
- [ ] `GET /verify/public/999999999999` → Invalid credential card (red)
- [ ] `GET /reports/admission-template.csv` → CSV file downloads

---

## 🔥 Common Issues & Quick Fixes

| Problem | Cause | Fix |
|---|---|---|
| Red banner "Backend error" | Backend API unreachable or CORS | Check https://sih.monu14.me/api/v1/health — if down, backend is offline |
| Stays on login page after 1-Click | `VITE_API_BASE_URL` not set on Vercel | Add env var `VITE_API_BASE_URL=https://sih.monu14.me` in Vercel dashboard |
| 401 Unauthorized on routes | JWT expired or not attached | Logout and login again to get fresh token |
| Session lost after refresh | localStorage cleared or private mode | Use normal browser window, not incognito |
| Students table empty | Backend data not seeded | Backend developer needs to run seed script |
| CORS error in Network tab | Backend not allowing Vercel domain | Backend must add `https://agastya-chi.vercel.app` to `CORS_ORIGINS` |
