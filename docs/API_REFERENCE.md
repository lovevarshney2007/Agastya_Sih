# Master API Reference — AICTE APAAR National Engine

**Base URL**: `https://sih.monu14.me/api/v1`  
**Root URL**: `https://sih.monu14.me`  
**Security**: Bearer JWT (HS256) / AES-256-GCM Vault / SHA-256 Hash Chain  
**Specification Version**: 2.4.0-prod  
**Last Verified**: October 27, 2026 (100% Pass Rate across 36 Endpoints)

---

## 1. System & Health Endpoints

### 1.1 Root Engine
- **Method**: `GET`
- **Path**: `/`
- **Auth**: None
- **Headers**: None
- **Response (200)**: `{"service": "Agastya AICTE APAAR National Engine", "version": "2.4.0-prod", "docs": "/docs"}`
- **Frontend Location**: Browser Entry / Liveness ping
- **Client Method**: None (Root)
- **Status**: **PASS**

### 1.2 System Health
- **Method**: `GET`
- **Path**: `/health` and `/api/v1/health`
- **Auth**: None
- **Headers**: None
- **Response (200)**: `{"status": "ok", "db": "connected"}`
- **Frontend Location**: Central Client Health Check
- **Client Method**: `apiClient.healthCheck()`
- **Status**: **PASS**

---

## 2. Authentication & Identity Management

### 2.1 Get Seeded Personas
- **Method**: `GET`
- **Path**: `/api/v1/auth/personas`
- **Auth**: None
- **Headers**: None
- **Response (200)**: Array of 5 personas (`INSTITUTION_REGISTRAR`, `AICTE_MAKER`, `AICTE_CHECKER`, `VERIFIER`, `STUDENT`) with `id`, `name`, `role`, `email`, `institution_id`, `student_token`.
- **Frontend Location**: `src/components/LoginPage.tsx`
- **Client Method**: `authApi.personas()`
- **Status**: **PASS**

### 2.2 Standard Credential Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth**: None
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "registrar@coep.ac.in",
    "password": "Aicte@2026!"
  }
  ```
- **Response (200)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "email": "registrar@coep.ac.in",
      "full_name": "Dr. Suresh Patil",
      "role": "INSTITUTION_REGISTRAR",
      "institution_id": "a46ca936-0a19-462f-9ed4-de50124abb03"
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid email or password).
- **Frontend Location**: `src/components/LoginPage.tsx`
- **Client Method**: `authApi.login(credentials)`
- **Status**: **PASS**

### 2.3 Instant Demo Quick-Login
- **Method**: `POST`
- **Path**: `/api/v1/auth/quick-login/{persona_id}`
- **Auth**: None
- **Path Parameters**: `persona_id` (`INSTITUTION_REGISTRAR` | `AICTE_MAKER` | `AICTE_CHECKER` | `VERIFIER` | `STUDENT`)
- **Response (200)**: Same as `/auth/login` with pre-authenticated JWT.
- **Frontend Location**: `src/components/LoginPage.tsx` (1-Click Demo Personas)
- **Client Method**: `authApi.quickLogin(personaId)`
- **Status**: **PASS**

### 2.4 Active Session Inspection
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth**: Bearer Token
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**: Current user profile object.
- **Errors**: `401 Unauthorized` (Token expired or missing).
- **Frontend Location**: `src/App.tsx` (Session restoration on load)
- **Client Method**: `authApi.me()`
- **Status**: **PASS**

### 2.5 Session Termination
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Auth**: Bearer Token
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**: `{"message": "Session terminated successfully"}`
- **Frontend Location**: `src/App.tsx` (Sign out action)
- **Client Method**: `authApi.logout()`
- **Status**: **PASS**

### 2.6 Onboard EoA Institution
- **Method**: `POST`
- **Path**: `/api/v1/auth/institution/onboard-eoa`
- **Auth**: Bearer Token / AICTE Admin
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "aicte_permanent_id": "1-85372048",
    "name": "Indian Institute of Science",
    "state": "Karnataka",
    "institution_type": "CENTRAL_UNIVERSITY",
    "approved_intake": 1200,
    "nodal_officer_name": "Dr. R. Raman",
    "nodal_officer_email": "nodal@iisc.ac.in",
    "academic_year": 2026
  }
  ```
- **Response (200)**: `{"message": "Institution EoA record created", "permanent_id": "1-85372048"}`
- **Frontend Location**: `src/components/SuperAdminPortal.tsx` (Onboard EoA Modal)
- **Client Method**: `authApi.onboardEoA(data)`
- **Status**: **PASS**

### 2.7 Activate Nodal Officer Account
- **Method**: `POST`
- **Path**: `/api/v1/auth/institution/activate`
- **Auth**: None
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "aicte_permanent_id": "1-85372048",
    "nodal_officer_email": "nodal@iisc.ac.in",
    "otp": "123456",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }
  ```
- **Response (200)**: `{"message": "Congratulations! Institution activated successfully..."}`
- **Frontend Location**: Central Client via `authApi.activateInstitution()`
- **Client Method**: `authApi.activateInstitution(payload)`
- **Status**: **PASS**

---

## 3. Institutions & Enrolments

### 3.1 Institution Dashboard
- **Method**: `GET`
- **Path**: `/api/v1/institutions/{id}/dashboard`
- **Auth**: Bearer Token
- **Path Parameters**: `id` (Institution UUID)
- **Response (200)**:
  ```json
  {
    "institution": { "id": "...", "name": "COEP Technological University", "aicte_id": "1-4467389" },
    "kpis": {
      "approved_intake": 480,
      "total_enrolled": 348,
      "identity_verified_pct": 98.4,
      "disputed_records": 2,
      "supernumerary_enrolled": 12
    },
    "programs": [...]
  }
  ```
- **Frontend Location**: `src/components/InstitutionPortal.tsx`
- **Client Method**: `institutionsApi.dashboard(id)`
- **Status**: **PASS**

### 3.2 List Institution Students
- **Method**: `GET`
- **Path**: `/api/v1/institutions/{id}/students`
- **Auth**: Bearer Token
- **Path Parameters**: `id` (Institution UUID)
- **Query Parameters**: `status` (optional), `course` (optional)
- **Response (200)**: Array of student enrolment objects with masked APAAR and verification badges.
- **Frontend Location**: `src/components/InstitutionPortal.tsx`
- **Client Method**: `institutionsApi.students(id)`
- **Status**: **PASS**

### 3.3 Enrol Single Student
- **Method**: `POST`
- **Path**: `/api/v1/institutions/{id}/students`
- **Auth**: Bearer Token
- **Path Parameters**: `id` (Institution UUID)
- **Request Body**:
  ```json
  {
    "apaar_id": "883011249910",
    "student_id_no": "COEP-2026-CSE-092",
    "name": "Sneha Patel",
    "dob": "2004-11-22",
    "course": "Computer Science and Engineering",
    "year_of_study": 1,
    "mode": "FULL_TIME",
    "seat_category": "General",
    "is_supernumerary": false,
    "nationality": "Indian"
  }
  ```
- **Response (200)**: `{"message": "Enrolment recorded successfully", "enrolment_id": "..."}`
- **Errors**: `400 Bad Request` (Course not approved in EoA), `422 Unprocessable` (Invalid APAAR format).
- **Frontend Location**: `src/components/InstitutionPortal.tsx` (Enrol Student Dialog)
- **Client Method**: `institutionsApi.enrolSingle(id, studentData)`
- **Status**: **PASS**

### 3.4 Upload Demo CSV
- **Method**: `POST`
- **Path**: `/api/v1/institutions/{id}/upload-demo`
- **Auth**: Bearer Token
- **Path Parameters**: `id` (Institution UUID)
- **Response (200)**: `{"batch_id": "...", "status": "PROCESSED", "total_records": 10}`
- **Frontend Location**: `src/components/InstitutionPortal.tsx` ("Load Demo Batch")
- **Client Method**: `institutionsApi.uploadDemoCsv(id)`
- **Status**: **PASS**

### 3.5 Multipart CSV Batch Upload
- **Method**: `POST`
- **Path**: `/api/v1/institutions/{id}/upload`
- **Auth**: Bearer Token
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**: `file` (CSV file conforming to AICTE admission format)
- **Response (200)**: `{"batch_id": "...", "status": "PROCESSED", "records_parsed": 48}`
- **Frontend Location**: `src/components/InstitutionPortal.tsx` (Drag-and-drop CSV Dropzone)
- **Client Method**: `institutionsApi.uploadCsv(id, formData)`
- **Status**: **PASS**

### 3.6 Batch Verification Report
- **Method**: `GET`
- **Path**: `/api/v1/institutions/{id}/batches/{batch_id}/report`
- **Auth**: Bearer Token
- **Path Parameters**: `id`, `batch_id`
- **Response (200)**: Comprehensive audit report detailing valid records, cross-college duplicate flags, and quota overages.
- **Frontend Location**: `src/components/InstitutionPortal.tsx` (Batch Report Modal)
- **Client Method**: `institutionsApi.batchReport(id, batchId)`
- **Status**: **PASS**

### 3.7 Commit Valid Batch Enrolments
- **Method**: `POST`
- **Path**: `/api/v1/institutions/{id}/batches/{batch_id}/commit`
- **Auth**: Bearer Token
- **Path Parameters**: `id`, `batch_id`
- **Response (200)**: `{"message": "Batch committed successfully. Enrolments recorded in Central Ledger."}`
- **Frontend Location**: `src/components/InstitutionPortal.tsx` ("Commit Enrolments" CTA)
- **Client Method**: `institutionsApi.commitBatch(id, batchId)`
- **Status**: **PASS**

---

## 4. AICTE Regulatory Governance

### 4.1 AICTE National Dashboard
- **Method**: `GET`
- **Path**: `/api/v1/aicte/dashboard`
- **Auth**: Bearer Token (AICTE Roles)
- **Response (200)**: National aggregated statistics (`approved_institutions`, `national_intake`, `active_duplicates`, `state_breakdown`).
- **Frontend Location**: `src/components/AictePortal.tsx` & `src/components/AnalyticsView.tsx`
- **Client Method**: `aicteApi.dashboard()`
- **Status**: **PASS**

### 4.2 Violations Investigation Queue
- **Method**: `GET`
- **Path**: `/api/v1/aicte/violations`
- **Auth**: Bearer Token (AICTE Roles)
- **Response (200)**: List of active violation cases (`DUP-2026-*`) with institutions, APAAR hashes, and violation categories.
- **Frontend Location**: `src/components/AictePortal.tsx`
- **Client Method**: `aicteApi.violations()`
- **Status**: **PASS**

### 4.3 Propose Action on Violation (Maker)
- **Method**: `POST`
- **Path**: `/api/v1/aicte/violations/{case_id}/propose`
- **Auth**: Bearer Token (`AICTE_MAKER`)
- **Path Parameters**: `case_id`
- **Request Body**:
  ```json
  {
    "action": "PENALTY_NOTICE",
    "officer_notes": "Cross-college duplicate confirmed via DigiLocker timestamp."
  }
  ```
- **Response (200)**: Updated violation record with proposal status.
- **Frontend Location**: `src/components/AictePortal.tsx` (Maker proposal form)
- **Client Method**: `aicteApi.proposeViolationAction(caseId, action, notes)`
- **Status**: **PASS**

### 4.4 Approve Action on Violation (Checker)
- **Method**: `POST`
- **Path**: `/api/v1/aicte/violations/{case_id}/approve`
- **Auth**: Bearer Token (`AICTE_CHECKER` / `AICTE_SUPER_ADMIN`)
- **Path Parameters**: `case_id`
- **Request Body**:
  ```json
  {
    "decision": "APPROVED",
    "notes": "Reviewed audit log. Enforcing seat cancellation at secondary institution."
  }
  ```
- **Response (200)**: Violation resolved with immutable audit entry.
- **Errors**: `403 Forbidden` (Enforces Maker != Checker separation).
- **Frontend Location**: `src/components/AictePortal.tsx` (Dual-control approval modal)
- **Client Method**: `aicteApi.approveViolationAction(caseId, decision, notes)`
- **Status**: **PASS**

### 4.5 Risk Ranking & Anomaly Scoring
- **Method**: `GET`
- **Path**: `/api/v1/aicte/risk-ranking`
- **Auth**: Bearer Token
- **Response (200)**: Array of institutions ranked by Isolation Forest ML anomaly risk scores.
- **Frontend Location**: `src/components/AictePortal.tsx` (Risk Ranking tab)
- **Client Method**: `aicteApi.riskRanking()`
- **Status**: **PASS**

### 4.6 Cryptographic Audit Ledger
- **Method**: `GET`
- **Path**: `/api/v1/aicte/audit`
- **Auth**: Bearer Token
- **Query Parameters**: `limit` (default: 100)
- **Response (200)**: Array of audit blocks with `block_index`, `timestamp`, `event_type`, `payload_hash`, `prev_hash`, `merkle_root`.
- **Frontend Location**: `src/components/AictePortal.tsx` & `src/components/SuperAdminPortal.tsx`
- **Client Method**: `aicteApi.auditLedger(limit)`
- **Status**: **PASS**

### 4.7 Verify Hash Chain Integrity
- **Method**: `POST`
- **Path**: `/api/v1/aicte/audit/verify-chain`
- **Auth**: Bearer Token
- **Response (200)**: `{"valid": true, "blocks_verified": 63, "status": "SECURE"}`
- **Frontend Location**: `src/components/AictePortal.tsx` & `src/components/SuperAdminPortal.tsx`
- **Client Method**: `aicteApi.verifyChain()`
- **Status**: **PASS**

### 4.8 Simulate Database Tampering
- **Method**: `POST`
- **Path**: `/api/v1/aicte/audit/simulate-tamper`
- **Auth**: Bearer Token
- **Response (200)**: `{"message": "Event #63 tampered with directly. Run verify-chain to trigger alarm."}`
- **Frontend Location**: `src/components/AictePortal.tsx` ("Simulate Tamper" button)
- **Client Method**: `aicteApi.simulateTamper()`
- **Status**: **PASS**

### 4.9 Anchor Ledger to WORM Storage
- **Method**: `POST`
- **Path**: `/api/v1/aicte/audit/anchor`
- **Auth**: Bearer Token
- **Response (200)**: `{"root": "0x3f4a...", "anchored_at": "2026-10-27T...", "tx_hash": "0x..."}`
- **Frontend Location**: `src/components/AictePortal.tsx` & `src/components/SuperAdminPortal.tsx`
- **Client Method**: `aicteApi.anchorAudit()`
- **Status**: **PASS**

---

## 5. Verifier & Academic Credentials

### 5.1 Submit Verification Request
- **Method**: `POST`
- **Path**: `/api/v1/verifier/requests`
- **Auth**: Bearer Token (`VERIFIER`)
- **Request Body**:
  ```json
  {
    "apaar_id": "902144321108",
    "verifier_name": "Tata Consultancy Services (HR Recruitment)",
    "purpose": "EMPLOYMENT_BACKGROUND_CHECK"
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "tok_4d2e568cdd3d6cd1",
    "status": "VALID",
    "claims": { "student_name": "Rahul Sharma", "institution": "COEP Technological University", "degree": "B.Tech CSE", "cgpa": "9.12" }
  }
  ```
- **Frontend Location**: `src/components/VerifierPortal.tsx`
- **Client Method**: `verifierApi.submitRequest(request)`
- **Status**: **PASS**

### 5.2 Verification Request Tracker
- **Method**: `GET`
- **Path**: `/api/v1/verifier/tracker`
- **Auth**: Bearer Token
- **Response (200)**: List of all past verification checks submitted by the verifier organization.
- **Frontend Location**: `src/components/VerifierPortal.tsx` (Tracker Table)
- **Client Method**: `verifierApi.tracker()`
- **Status**: **PASS**

### 5.3 Fetch Verifiable Credential
- **Method**: `GET`
- **Path**: `/api/v1/verifier/credential/{token}`
- **Auth**: Bearer Token
- **Path Parameters**: `token` (Verification Token)
- **Response (200)**: JSON-LD Verifiable Credential schema with cryptographic proofs.
- **Frontend Location**: `src/components/VerifierPortal.tsx`
- **Client Method**: `verifierApi.getCredential(token)`
- **Status**: **PASS**

### 5.4 Download Tamper-Evident Credential PDF
- **Method**: `GET`
- **Path**: `/api/v1/verifier/credential/{token}/pdf`
- **Auth**: Bearer Token
- **Path Parameters**: `token`
- **Response (200)**: Binary PDF stream (`Content-Type: application/pdf`, ~4.1 kB) containing digital signature and QR verification link.
- **Frontend Location**: `src/components/VerifierPortal.tsx` & `src/components/StudentPortal.tsx`
- **Client Method**: `verifierApi.downloadPdfUrl(token)`
- **Status**: **PASS**

---

## 6. DPDP Sovereign Student Consent

### 6.1 Get Active Consent Requests
- **Method**: `GET`
- **Path**: `/api/v1/student/{student_token}/consents`
- **Auth**: Bearer Token (`STUDENT`)
- **Path Parameters**: `student_token` (Student Identity Vault UUID)
- **Response (200)**:
  ```json
  {
    "student": { "name": "Priya Nair", "apaar_id": "••••••••4422", "college": "VJTI Mumbai" },
    "consents": [
      { "id": "c1", "verifier": "Tata Consultancy Services", "purpose": "Employment Verification", "status": "GRANTED", "expires_at": "2026-12-31" }
    ]
  }
  ```
- **Frontend Location**: `src/components/StudentPortal.tsx`
- **Client Method**: `studentApi.getConsents(studentToken)`
- **Status**: **PASS**

### 6.2 Grant or Revoke Consent Action
- **Method**: `POST`
- **Path**: `/api/v1/student/consent/{consent_id}/action`
- **Auth**: Bearer Token (`STUDENT`)
- **Path Parameters**: `consent_id`
- **Request Body**:
  ```json
  {
    "action": "GRANTED" // or "REVOKED"
  }
  ```
- **Response (200)**: `{"message": "Consent status updated to GRANTED", "consent_id": "..."}`
- **Frontend Location**: `src/components/StudentPortal.tsx` (Toggle Buttons)
- **Client Method**: `studentApi.consentAction(consentId, action)`
- **Status**: **PASS**

### 6.3 Assisted Rural DPDP SMS OTP
- **Method**: `POST`
- **Path**: `/api/v1/student/consent/assisted-sms-otp`
- **Auth**: Bearer Token (`STUDENT`)
- **Request Body**:
  ```json
  {
    "student_token": "d5d9ae28-1564-4713-bcb9-1a1ab3823915",
    "mobile_number": "+919876543210",
    "consent_type": "ASSISTED_SMS_OTP",
    "otp": "654321"
  }
  ```
- **Response (200)**: `{"status": "GRANTED", "channel": "ASSISTED_SMS_OTP", "message": "Consent verified via rural SMS gateway"}`
- **Frontend Location**: `src/components/StudentPortal.tsx` (Assisted Consent Card)
- **Client Method**: `studentApi.assistedSmsOtp(payload)`
- **Status**: **PASS**

---

## 7. Public Verification & Reports

### 7.1 Public Privacy-Preserving QR Verification
- **Method**: `GET`
- **Path**: `/api/v1/verify/public/{token}`
- **Auth**: None (Publicly accessible)
- **Path Parameters**: `token` (Verification Token)
- **Response (200)**:
  ```json
  {
    "status": "VALID",
    "credential_id": "AICTE-VC-90214432",
    "student_name_masked": "R***l S****a",
    "institution_name": "COEP Technological University",
    "degree": "B.Tech Computer Science and Engineering",
    "issued_date": "2026-06-15",
    "tamper_proof_validity": true
  }
  ```
- **Frontend Location**: `src/components/PublicVerify.tsx`
- **Client Method**: `publicApi.verifyToken(token)`
- **Status**: **PASS**

### 7.2 Download National Compliance Summary CSV
- **Method**: `GET`
- **Path**: `/api/v1/reports/national-summary.csv`
- **Auth**: None / Authenticated
- **Response (200)**: CSV Stream (`Content-Type: text/csv`) detailing all institutions, approved intake, actual enrolled, duplicate violation flags, and compliance status.
- **Frontend Location**: `src/components/AictePortal.tsx` & `src/components/SuperAdminPortal.tsx`
- **Client Method**: `reportsApi.nationalSummaryUrl()`
- **Status**: **PASS**

### 7.3 Download Institutional Compliance CSV
- **Method**: `GET`
- **Path**: `/api/v1/reports/institution/{institution_id}.csv`
- **Auth**: None / Authenticated
- **Path Parameters**: `institution_id`
- **Response (200)**: CSV Stream containing the institution's complete enrolled student roster with masked APAAR and verification badges.
- **Frontend Location**: `src/components/InstitutionPortal.tsx` ("Export Compliance CSV")
- **Client Method**: `reportsApi.institutionCsvUrl(id)`
- **Status**: **PASS**

### 7.4 Download Standardized Admission Template CSV
- **Method**: `GET`
- **Path**: `/api/v1/reports/admission-template.csv`
- **Auth**: None
- **Response (200)**: CSV Stream containing official AICTE headers: `apaar_id,student_id_no,name,dob,gender,course,year_of_study,mode,seat_category,is_supernumerary,nationality`.
- **Frontend Location**: `src/components/InstitutionPortal.tsx` ("Download CSV Template")
- **Client Method**: `reportsApi.admissionTemplateUrl()`
- **Status**: **PASS**
