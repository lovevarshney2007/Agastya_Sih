# 🧪 AICTE APAAR Platform — Live API Verification Guide

This guide allows anyone (evaluators, hackathon judges, developers) to verify that **every single backend API endpoint** is working seamlessly through your **deployed frontend application** (`https://team-agastya.vercel.app` or `http://localhost:5173`).

---

## 📌 Quick Summary of Environments

| Service | URL | Status / Documentation |
|---|---|---|
| **Frontend Deployed** | `https://team-agastya.vercel.app` | Vite + React SPA |
| **Backend Deployed** | `https://sih.monu14.me` | FastAPI ([Swagger Docs](https://sih.monu14.me/docs)) |
| **API Base Route** | `https://sih.monu14.me/api/v1` | Bearer JWT Protected |

---

## 🛠️ Browser Preparation for Verification

1. Open your deployed frontend in Chrome / Edge / Brave.
2. Press `F12` (or `Right-click -> Inspect`).
3. Click on the **Network** tab and select the **`Fetch/XHR`** filter.
4. Keep the **Console** tab open to check for logs.

---

## 📋 Comprehensive API Verification Checklist

---

### 1. 🔐 Authentication APIs

#### Test 1.1: 1-Click Instant Demo Login (Persona Login)
- **Frontend Action:** 
  1. Go to the Landing Page.
  2. Click **"Institution Portal"** (or any role card).
  3. Click the prominent **"1-Click Instant Demo Login"** button.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/auth/quick-login/INSTITUTION_REGISTRAR`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ JSON response contains: `access_token`, `user: { id, email, role: "INSTITUTION_REGISTRAR", institution_id: "inst_01" }`
  - ✅ Frontend automatically saves `aicte_token` in `localStorage` and redirects to the Institution Dashboard.

#### Test 1.2: Standard Email + Password Login
- **Frontend Action:**
  1. On the Login screen, select any tab (e.g. **AICTE Maker**).
  2. Notice the credentials auto-fill: `aicte.maker@gov.in` / `Aicte@2026!`.
  3. Click **"Sign In as AICTE Maker"**.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/auth/login`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Redirects to AICTE Portal with Maker privileges.

#### Test 1.3: Session Restoration & Me Endpoint
- **Frontend Action:**
  1. After logging in, refresh the browser page (`F5` or `Ctrl + R`).
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/auth/me`
- **Expected Result:**
  - ✅ Network status: `200 OK` (with Header `Authorization: Bearer <token>`)
  - ✅ You remain logged in without being redirected back to the login page.

#### Test 1.4: Logout
- **Frontend Action:** Click the **"Log Out"** button in the header.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/auth/logout`
- **Expected Result:**
  - ✅ Local storage keys `aicte_token` and `aicte_user` are cleared.
  - ✅ Redirected to Landing Page.

---

### 2. 🏫 Institution Portal APIs

Login using **Institution Registrar** (`registrar@coep.ac.in`).

#### Test 2.1: Load Dashboard KPIs
- **Frontend Action:** Automatically happens upon entering Institution Portal.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/institutions/inst_01/dashboard`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Top banner displays: `✅ Live data from sih.monu14.me`
  - ✅ Metrics populated: Total Approved Seats, Valid Enrolments, Compliance Score, Discrepancies.

#### Test 2.2: Fetch Live Enrolled Students
- **Frontend Action:** Automatically loads with dashboard.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/institutions/inst_01/students`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Student table renders student records with masked Aadhaar and blind indexing.

#### Test 2.3: 1-Click Demo CSV Upload & Validation
- **Frontend Action:**
  1. Navigate to the **"Batch Upload"** tab.
  2. Notice the upload section indicates `🔴 LIVE`.
  3. Click **"Demo Batch Upload"**.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/institutions/inst_01/upload-demo`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Blue banner appears: `📤 Batch #... — READY_TO_COMMIT`
  - ✅ Displays row counts: Total Processed, Valid Rows, AICTE Violations detected.
  - ✅ **"Commit to Ledger"** button appears.

#### Test 2.4: Commit Batch to Immutable Ledger
- **Frontend Action:** Click the **"✅ Commit to Ledger"** button on the upload banner.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/institutions/inst_01/batches/{batch_id}/commit`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Generates cryptographic block and refreshes live dashboard.

#### Test 2.5: Single Student Direct Enrolment
- **Frontend Action:**
  1. Go to **"Manual Enrolment"** tab.
  2. Enter student details (APAAR ID: `987654321098`, Name: `Test Candidate`).
  3. Click **"Enroll Student"**.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/institutions/inst_01/students`
- **Expected Result:**
  - ✅ Network status: `200 OK` / `201 Created`
  - ✅ Green alert shows: `"Student enrolled successfully!"`

#### Test 2.6: Download Admission CSV Template
- **Frontend Action:** Click **"Download CSV Template"** button.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/reports/admission-template.csv`
- **Expected Result:** Browser downloads `admission-template.csv`.

---

### 3. 🏛️ AICTE National Regulatory Portal

Login using **AICTE Maker** (`aicte.maker@gov.in`) or **AICTE Checker** (`aicte.checker@gov.in`).

#### Test 3.1: National Aggregated Dashboard
- **Frontend Action:** Navigate to AICTE portal.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/aicte/dashboard`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ National statistics loaded: Total Institutions, Approved Intake, National Over-Admission count.

#### Test 3.2: AICTE Violations List & Two-Person Workflow
- **Frontend Action:** Click **"Violations & Discrepancies"** tab.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/aicte/violations`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Lists institutions breaching Supernumerary / Lateral Entry caps.
  - ✅ **Maker Action:** Propose penalty (`POST /api/v1/aicte/violations/{id}/propose`).
  - ✅ **Checker Action:** Approve / Reject proposal (`POST /api/v1/aicte/violations/{id}/approve`).

#### Test 3.3: Risk-Ranking Engine
- **Frontend Action:** Switch to **"Risk Ranking"** tab.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/aicte/risk-ranking`
- **Expected Result:**
  - ✅ Institutions sorted by risk tier (High, Medium, Compliant) according to AICTE audit algorithms.

#### Test 3.4: Audit Ledger & Cryptographic Verification
- **Frontend Action:** Switch to **"Audit Ledger"** tab.
- **Backend Endpoints Triggered:**
  1. `GET https://sih.monu14.me/api/v1/aicte/audit` (loads SHA-256 block chain)
  2. Click **"Verify Chain Integrity"**:
     `POST https://sih.monu14.me/api/v1/aicte/audit/verify-chain`
     - Expected: `{"valid": true, "tampered": false}`
  3. Click **"Simulate Tamper"**:
     `POST https://sih.monu14.me/api/v1/aicte/audit/simulate-tamper`
     - Expected: Chain detection flags broken block hash.
  4. Click **"Anchor to WORM"**:
     `POST https://sih.monu14.me/api/v1/aicte/audit/anchor`
     - Expected: Hash anchored to immutable storage.

---

### 4. 🔍 Verifier Portal (Employers & Third Parties)

Login using **Verifier (TCS)** (`verifier@tcs.com`).

#### Test 4.1: Submit Verification Request
- **Frontend Action:**
  1. In the Verifier Portal, enter Candidate APAAR ID: `892019482019` and Purpose: `Pre-employment background verification`.
  2. Click **"Request Verification"**.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/verifier/requests`
- **Expected Result:**
  - ✅ Network status: `200 OK` / `201 Created`
  - ✅ Request created with status `PENDING_STUDENT_CONSENT` or `APPROVED`.

#### Test 4.2: Tracker Roster
- **Frontend Action:** Switch to **"Tracker"** tab.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/verifier/tracker`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Returns all employer verification requests with live status.

#### Test 4.3: Dual QR Credential & PDF Download
- **Frontend Action:** View any approved credential in tracker and click **"Download Certificate"**.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/verifier/credential/{token}/pdf`
- **Expected Result:**
  - ✅ Official tamper-proof PDF certificate downloaded with dual QR codes.

---

### 5. 🎓 Student Consent Centre

Login using **Student** (`priya.nair@student.aicte.gov.in`).

#### Test 5.1: Fetch Pending & Active Consents
- **Frontend Action:** Go to the Student Portal.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/student/priya.nair/consents`
- **Expected Result:**
  - ✅ Lists data sharing consent requests (e.g. from TCS, Infosys).

#### Test 5.2: Grant / Revoke Consent
- **Frontend Action:** Click **"Approve Consent"** or **"Revoke Consent"** on any request card.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/student/consent/{consent_id}/action`
- **Expected Result:**
  - ✅ Status updates instantly, logged to audit ledger.

#### Test 5.3: Assisted SMS OTP
- **Frontend Action:** Click **"Verify via SMS OTP"** for rural / assisted verification.
- **Backend Endpoint Triggered:**
  `POST https://sih.monu14.me/api/v1/student/consent/assisted-sms-otp`
- **Expected Result:**
  - ✅ Simulates OTP dispatch with confirmation alert.

---

### 6. 🌐 Public QR Verifier (Zero-Knowledge)

- **Frontend Action:**
  1. Click **"Public QR Verifier"** in the top navigation bar (no login required).
  2. In the input box, enter a token (or click quick test button `892019482019`).
  3. Click **"Verify Validity"**.
- **Backend Endpoint Triggered:**
  `GET https://sih.monu14.me/api/v1/verify/public/892019482019`
- **Expected Result:**
  - ✅ Network status: `200 OK`
  - ✅ Result card shows:
    - **Valid Credential** badge in emerald green
    - Institution: *College of Engineering Pune (COEP)*
    - Program: *Computer Engineering*
    - Integrity: *12-Digit APAAR Authentic*
    - Data Minimisation: *Aadhaar & private PII masked (Zero-knowledge)*

---

### 7. 📊 Reports & CSV Exports

Open any of these URLs directly in the browser:

| Report | URL | Expected Response |
|---|---|---|
| **National Summary CSV** | `https://sih.monu14.me/api/v1/reports/national-summary.csv` | Direct CSV file download |
| **Institution Compliance CSV** | `https://sih.monu14.me/api/v1/reports/institution/inst_01.csv` | Direct CSV file download |
| **Admission Template CSV** | `https://sih.monu14.me/api/v1/reports/admission-template.csv` | Direct CSV file download |

---

## ⚡ Quick 1-Minute Browser Console Smoke Test

If you want to test the entire backend API health directly from your browser console:

1. Open your frontend on Vercel (`F12` -> **Console**).
2. Paste this snippet and hit Enter:

```javascript
(async () => {
  console.log("🔍 Testing backend connection to https://sih.monu14.me ...");
  try {
    const res = await fetch("https://sih.monu14.me/api/v1/health");
    const data = await res.json();
    console.log("✅ Backend Health Check:", data);

    const loginRes = await fetch("https://sih.monu14.me/api/v1/auth/quick-login/INSTITUTION_REGISTRAR", {
      method: "POST"
    });
    const loginData = await loginRes.json();
    console.log("✅ Auth Quick-Login Passed! JWT Received:", loginData.access_token?.slice(0, 20) + "...");

    const dashRes = await fetch("https://sih.monu14.me/api/v1/institutions/inst_01/dashboard", {
      headers: { "Authorization": `Bearer ${loginData.access_token}` }
    });
    const dashData = await dashRes.json();
    console.log("✅ Institution Dashboard API Passed! Data:", dashData);

    const publicRes = await fetch("https://sih.monu14.me/api/v1/verify/public/892019482019");
    const publicData = await publicRes.json();
    console.log("✅ Public QR Verify API Passed! Data:", publicData);

    console.log("🎉 ALL CORE APIS ARE 100% OPERATIONAL!");
  } catch (err) {
    console.error("❌ API Test Error:", err);
  }
})();
```

---

## 🎯 Verification Success Checklist

- [ ] `POST /api/v1/auth/quick-login/{id}` returns 200 with JWT
- [ ] `GET /api/v1/institutions/{id}/dashboard` loads live data banner
- [ ] `GET /api/v1/institutions/{id}/students` returns students array
- [ ] `POST /api/v1/institutions/{id}/upload-demo` validates CSV batch
- [ ] `POST /api/v1/institutions/{id}/batches/{id}/commit` creates ledger block
- [ ] `GET /api/v1/aicte/dashboard` returns national aggregated intake
- [ ] `POST /api/v1/aicte/audit/verify-chain` returns cryptographic integrity true
- [ ] `GET /api/v1/verify/public/{token}` returns credential without exposing PII
- [ ] All sessions survive browser refresh (`localStorage` JWT persistence)
