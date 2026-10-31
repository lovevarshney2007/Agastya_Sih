# 🏛️ AGASTYA (अगस्त्य) — AICTE National Regulatory Enrollment & Credential Ledger

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP_Act_2023_Sec_6-blue.svg)](https://www.meity.gov.in)
[![W3C Verifiable Credentials](https://img.shields.io/badge/Standard-W3C_VC_v2.0-orange.svg)](https://www.w3.org/TR/vc-data-model-2.0/)
[![Tests](https://img.shields.io/badge/Tests-14_Suites_Passing-brightgreen.svg)]()

> **Smart India Hackathon (SIH 2024) Grand Finale Solution**  
> Problem Statement: **National Level Cross-Institution Student Enrollment Reconciliation, Capacity Adherence, and Privacy-Preserving Verifiable Academic Identity Platform.**

---

## 🎯 Executive Summary

**AGASTYA** is an enterprise-grade, cryptographically secure national regulatory governance platform engineered for the **All India Council for Technical Education (AICTE)**. It reconciles student admissions across all AICTE-approved technical and polytechnic institutions in India, prevents fraudulent dual full-time enrollments (violating UGC 2022 guidelines), enforces statutory intake limits (AICTE Regulations Chapter VIII), guarantees complete non-retention of plaintext biometric/Aadhaar data under the **Digital Personal Data Protection (DPDP) Act 2023**, and anchors immutable proof chains to Write-Once-Read-Many (WORM) storage.

---

## 🏗️ High-Level System Architecture

```
                       ┌────────────────────────────────────────────────────────┐
                       │          AGASTYA CLIENT PORTALS (React + TS)           │
                       │  (AICTE Desk · Institution ERP · Student · Verifier)   │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │ HTTPS / REST / WebSockets
                                                  ▼
                       ┌────────────────────────────────────────────────────────┐
                       │         FASTAPI HIGH-THROUGHPUT REGULATORY API         │
                       ├────────────────────────────────────────────────────────┤
                       │  • Persona RBAC & JWT Session Engine                   │
                       │  • Salted HMAC Blind Index Engine (APAAR)              │
                       │  • Zero-Knowledge Proof (ZKP) Selective Disclosure     │
                       │  • In-Memory Rule Verification Pipeline (14 APH Rules) │
                       │  • ML Anomaly & Cohort Risk Engine                     │
                       └───────────────────┬──────────────┬─────────────────────┘
                                           │              │
                   ┌───────────────────────┘              └────────────────────────┐
                   ▼                                                               ▼
┌──────────────────────────────────────┐                       ┌───────────────────────────────────────┐
│     SQLITE / POSTGRES RELATIONAL     │                       │     IMMUTABLE AUDIT & WORM LEDGER     │
├──────────────────────────────────────┤                       ├───────────────────────────────────────┤
│ • Enrolments & Program Offerings     │                       │ • SHA-256 Block-Chained Audit Ledger  │
│ • Duplicate & Transfer Cases         │                       │ • Merkle Tree Root Anchors            │
│ • Dual-Key Sanction Orders           │                       │ • WORM S3 Simulated Storage (JSON)    │
│ • Student Appeals & Consent Grants   │                       │ • Digital Seals & JWS Signatures      │
└──────────────────────────────────────┘                       └───────────────────────────────────────┘
```

---

## 🌟 Complete Catalogue of Implemented Features

### 1. 🛡️ Regulatory Enforcement & Case Management (AICTE Portal)
* **National Regulatory Overview (`/aicte`):** Real-time aggregation of students enrolled, institutions reporting, seat utilization, and high-risk clusters across all 36 States & UTs.
* **Show-Cause Notice Generator (Regulation 13.4 PDF):** 1-click legal notice generation citing Section 10(k) of the AICTE Act 1987, complete with dynamic case IDs, institutional evidence, and hearing deadlines.
* **Dual-Key Multi-Signature Regulatory Sanctions (4-Eye Principle) (`/aicte/dual-approvals`):** High-penalty punitive sanctions (Seat Reductions, Fines, Intake Freezes) require joint cryptographic authorization from an Enforcement Maker and Regional Director Checker. Generates verifiable statutory sanction orders with joint SHA-256 seals.
* **Live National Regulatory Telemetry & Event Stream:** Real-time animated ticker showing national batch commits, verifier checks, and intrusion containment with live throughput (`tx/s`) and latency metrics.

### 2. 🔐 Privacy & Cryptographic Ledger Security
* **Zero-Knowledge Proof (ZKP) Selective Disclosure Engine:** Verifiers can verify student age ($\ge 18$), institution accreditation, and active student status without accessing student DOB, enrollment number, or personal details (DPDP Act Sec 6 compliant).
* **Salted HMAC Blind Indexing:** APAAR IDs are converted into one-way cryptographic tokens. Plaintext Aadhaar or biometric data is never stored in the database.
* **Tamper-Evident SHA-256 Audit Ledger & Chain of Custody (`/aicte/audit`):** Every action is chained via $\text{hash} = \text{SHA-256}(\text{prev\_hash} \parallel \text{detail})$. Includes demonstration tamper buttons, live hash recomputation, and visual "Chain of Custody Certificates".
* **WORM Merkle Root Storage:** Audit batches are anchored periodically into WORM compliance storage with cryptographic Merkle root proofs.
* **Adversarial Security Attack Simulator (Red-Team vs Blue-Team Sandbox) (`/aicte/security-sandbox`):** Interactive sandbox executing live exploit scenarios (Ghost Student Injection, Concurrent Dual Enrolment, Plaintext Aadhaar Leakage, WORM Tamper Attempt) with live terminal attack logs and boundary containment.

### 3. 🏫 Institution Administration & Ingestion Engine (`/institution`)
* **Automated In-Browser CSV Pre-Flight Validator & Anomaly Highlighter (`/institution/upload`):** Instant client-side parser checking headers, duplicate APAARs in-file, format errors, and hard-blocking Aadhaar leakage before server upload.
* **1-Click "Sanitize & Download Clean CSV":** Strips duplicates and invalid rows automatically in-browser.
* **Batch Ingestion Pipeline:** 14 AICTE Approval Process Handbook (APH) automated rules checking sanctioned capacity, supernumerary caps (TFW, OCI/PIO, Lateral Entry), and program codes.
* **Institutional Accreditation & Compliance Radar Scorecard (`/institution/compliance`):** 5-axis SVG radar chart evaluating intake adherence, cadre ratio, supernumerary quotas, grievance redressal, and DPDP compliance, with downloadable official AICTE Statutory Clearance Certificate.

### 4. 🎓 Student Persona & Digital Identity Wallet (`/student`)
* **3D Holographic AICTE APAAR Smart ID Card:** Interactive 3D flip card with holographic rainbow foil, Government of India emblem, masked APAAR, offline verification QR code, and DPDP Act blind index proof.
* **1-Click "Print / Download Official PVC ID Card":** Ready-to-print student identity card formatted for DigiLocker wallet integration.
* **National DigiLocker & MeriPehchaan Gateway:** Connect 6-digit DigiLocker security PIN and push verifiable JWS credentials directly to the national repository.
* **Student Statutory Appeals & Natural Justice System (Regulation 14):** Formal dispute redressal system allowing students flagged for dual-enrolment to submit Transfer Certificates, cancellation receipts, and natural justice appeals.
* **DPDP Data Rights & Guardian Consent (Rules 6 & 10):** Manage third-party consent tokens, log data access audits, and submit parental/guardian approvals for minors.

### 5. 🔍 Zero-Trust Employer & Verifier Portal (`/verifier`)
* **Live Camera QR Code Scanner & Offline Verification (`/verify`):** Hardware camera scanner decoding dual-QR codes and verifying cryptographic JWS digital signatures locally on client devices without calling external servers.
* **Consent-Gated Verification Tracker:** Regulated enterprise verifiers (TCS, Infosys, HDFC Credila) track monthly quotas and verify student credentials under active consent.

### 6. 🔔 Real-Time Notification Bell & Alert Hub
* **Role-Aware Global Notification Bell (Header):** Persistent bell icon with live unread badge counter, severity classification (🔴 URGENT, 🟡 WARNING, 🔵 INFO, 🟢 SUCCESS), relative timestamps, 1-click navigation links, and 30-second background polling.

### 7. 🧭 9-Step Interactive Guided Jury Tour (`JuryTourWidget`)
* Floating walkthrough widget allowing judges to experience all 9 personas and workflows in 1 click without manual credentials entry:
  1. Ingestion & APH Rule Ladder (Institution Registrar)
  2. Blind-Index Cross-Institution Conflict Interception (AICTE Maker)
  3. 4-Eyes Dual-Key Governance Sign-off (AICTE Checker)
  4. Student Wallet, DigiLocker & DPDP Rights (Student)
  5. Zero-Trust Verification & Offline QR Scan (Verifier)
  6. Adversarial Attack Simulator Sandbox (Red-Team Auditor)
  7. 4-Eye Dual-Key Sanctions Desk (AICTE Regional Director)
  8. Tamper-Evident SHA-256 Chain of Custody Proof (AICTE Audit Officer)
  9. 3D Holographic APAAR Smart ID Card (Student Persona)

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Git

### 1. Clone Repositories
```bash
# Clone the parent repository
git clone https://github.com/lovevarshney2007/Agastya_Sih.git
git clone https://github.com/MonuChaudhary14/SIH-backend.git
```

### 2. Backend Setup & Run
```bash
cd SIH-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run database seed (pre-populates demo users, institutions, rules, & sanctions)
python app/db/seed.py

# Run comprehensive test suite (14/14 suites passing)
python tests/test_extended_endpoints.py

# Start Backend Server on Port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup & Run
```bash
cd Agastya_Sih
npm install

# Build check (0 TypeScript errors)
npm run build

# Start Frontend Dev Server on Port 5173
npm run dev
```

### 4. Automated 1-Click Launch Script
```bash
# From workspace root:
./start_demo.sh
```

---

## 🔑 Demo Personas & Credentials

All demo accounts share the password: **`Aicte@2026!`**

| Persona | Name & Role | Login Email | Key Features |
| :--- | :--- | :--- | :--- |
| **AICTE Maker** | Rajesh Verma (Enforcement Officer) | `aicte.maker@gov.in` | Conflict interception, Show-cause notices, Propose sanctions, Security sandbox |
| **AICTE Checker** | Dr. Anil Deshpande (Regional Director) | `aicte.checker@gov.in` | 4-Eye dual-key sign-off, Statutory order issuance, Audit ledger verification |
| **Institution Registrar** | Dr. S. K. Mahajan (COEP Pune) | `registrar@coep.ac.in` | CSV Pre-flight validator, Batch ingestion, Compliance radar scorecard |
| **Student** | Priya Nair (B.Tech Mechanical) | `priya.nair@coep.ac.in` | 3D APAAR Smart ID Card, DigiLocker sync, Natural justice appeals, Consent portal |
| **Verifier** | Vikram Malhotra (TCS Background Desk) | `verifier@tcs.com` | Consent-gated verification, ZKP selective disclosure, Live QR camera scanner |

*(Or click the floating **"Jury Tour"** widget in the bottom-right corner of the application to switch personas in 1 click!)*

---

## 🧪 Verification & Testing Status

```bash
$ python tests/test_extended_endpoints.py
All extended SIH endpoints verified successfully!
- Test 1: Persona authentication & token generation
- Test 2: AICTE rules & simulation impact
- Test 3: Verifier organizations & monthly quotas
- Test 4: Guardian consent under DPDP Rule 10
- Test 5: Data subject rights & dispute logging
- Test 6: Verifier credential issuance & revocation
- Test 7: Executive briefing PDF & show-cause notice generation
- Test 8: Public dashboard & state-wise aggregates
- Test 9: Zero-Knowledge Proof (ZKP) selective disclosure
- Test 10: Student statutory appeals & natural justice redressal
- Test 11: Adversarial security attack simulator & firewall interception
- Test 12: Real-time notification bell & alert hub (role-filtered)
- Test 13: 4-Eye dual-key regulatory sanctions (Maker propose, Checker sign-off)
- Test 14: Tamper-evident SHA-256 audit ledger visual custody certificate
```

---

## 📜 Legal & Statutory Standard Alignment

| Standard / Law | Section | How AGASTYA Complies |
| :--- | :--- | :--- |
| **AICTE Act 1987** | Sec 10(k), 10(n) | Regulates approved intake; automated show-cause notices for excess intake |
| **UGC Guidelines 2022** | Dual Programme Rules | Detects concurrent full-time admissions via blind indexing without cross-leakage |
| **DPDP Act 2023** | Section 6, 11-14 | Zero biometric/Aadhaar storage; explicit consent revocation; guardian approval |
| **W3C Verifiable Credentials** | Data Model v2.0 | Cryptographic JSON Web Signature (JWS) academic credentials with dual QR |
| **ISO/IEC 18013-5** | Mobile Identity Standard | Offline cryptographic verification on edge devices without server connection |

---

## 👥 Contributors & SIH 2024 Team

* **Love Varshney** — *Lead Full-Stack Developer & Architecture Designer*
* Built for **Smart India Hackathon 2024** · AICTE Problem Statement.
