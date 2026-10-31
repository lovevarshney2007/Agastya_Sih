# AICTE APAAR National Student Ledger — SIH 26263
# Grand Finale Jury Presentation Guide & Demo Script

> **Problem Statement ID:** SIH26263  
> **Title:** Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions  
> **Ministry:** All India Council for Technical Education (AICTE), Ministry of Education  
> **Team:** Agastya  

---

## ⚡ Quick Launch Instructions

### 1. Start Full Application (Backend + Frontend)
From the repository root (`/home/love-varshney/Sih`):
```bash
./start_demo.sh
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Interactive Walkthrough:** Click the bottom-right floating badge **"🎬 Jury Demo Mode"**

### 2. Instant Reset Between Jury Evaluation Rounds
If you have committed batches or approved cases and need to restart from a clean slate for the next jury panel:
```bash
./reset_demo.sh
```
*(Wipes temporary state and reseeds 9 institutions, demo users, cases, and rules in < 2 seconds).*

---

## ⏱️ The 5-Minute Winning Pitch Script

| Time | Step | Screen & Action | Presentation Script (What to Say) |
| :--- | :--- | :--- | :--- |
| **0:00 - 1:00** | **The Problem & Architecture** | [National Dashboard](http://localhost:5173/aicte) | *"Respected Jury members, currently AICTE receives aggregate admission counts from colleges, making it impossible to detect ghost admissions, seat hoarding, or institutions admitting beyond sanctioned intake without compromising student privacy. Our platform introduces an APAAR-keyed zero-knowledge student ledger that validates 100% of admissions, natively enforces UGC dual degree rules, and complies with DPDP Act 2023."* |
| **1:00 - 2:00** | **Ingestion & Rule Ladder** | Click **Step 1** on Jury Widget → `/institution/batches` | *"Dr. S. K. Mahajan, Registrar of COEP Pune, uploads a batch submission. Our 14-rule APH engine validates approved intake, supernumerary quotas (TFW, Lateral Entry), and cross-institution collisions in real time before commit. Notice how duplicate admissions are immediately intercepted."* |
| **2:00 - 3:00** | **4-Eyes Governance** | Click **Step 2 & 3** → `/aicte/cases` | *"The system intercepts a concurrent full-time admission between COEP and VJTI. Under strict 4-Eyes Governance (UGC/AICTE Dual-Key), Maker Rajesh Verma investigates evidence without decrypting raw PII and proposes a resolution. Senior Checker Dr. Deshpande approves it. Neither officer can act alone."* |
| **3:00 - 4:00** | **Student Rights & DigiLocker** | Click **Step 4** → `/student` | *"Student Priya Nair receives a tamper-evident W3C Verifiable Credential. She can link MeriPehchaan via 6-digit PIN, deposit credentials into National DigiLocker, exercise DPDP Section 11–14 Data Subject Rights (1-click JSON portability export), and parents can grant Guardian Consent under Rule 10."* |
| **4:00 - 5:00** | **Verifier & Audit Ledger** | Click **Step 5** → `/verifier` & `/aicte/audit` | *"TCS Verifier verifies the credential without plaintext PII exposure. Every transaction is appended to a SHA-256 hash-chained WORM-anchored ledger. Our Tamper Simulation tool mathematically proves zero tampering. We also generate 1-click official AICTE Executive Briefing PDFs."* |

---

## 🎬 How to Use the Floating Jury Demo Widget

Look at the bottom-right of your screen for the floating pill: **"🎬 Jury Demo Mode [1/5]"**.

Clicking the widget opens the interactive panel:
1. **Step 1 (Registrar)**: Auto-logs in as `INSTITUTION_REGISTRAR` and takes you to Batch Upload.
2. **Step 2 (AICTE Maker)**: Auto-logs in as `AICTE_MAKER` and opens Case Review.
3. **Step 3 (AICTE Checker)**: Auto-logs in as `AICTE_CHECKER` to approve resolutions.
4. **Step 4 (Student)**: Auto-logs in as `STUDENT` (Priya Nair) to display W3C credentials and DPDP rights.
5. **Step 5 (Verifier)**: Auto-logs in as `VERIFIER` (TCS) to verify credentials and check the audit ledger.

---

## 🛡️ Tough Jury Q&A Cheat Sheet (Bulletproof Answers)

### Q1: "Aadhaar collect kiye bina aap duplicate admissions kaise pakadte hain?"
> **Answer:** *"Sir, UIDAI ke 2025 Aadhaar Data Vault circular ke mutabik hum Aadhaar number collect nahi karte. Hum student ke 12-digit APAAR ID par **salted HMAC-SHA256 blind indexing** use karte hain. Do alag colleges agar same student ka roll upload karte hain, toh unka HMAC blind-index match ho jata hai, bina raw PII decrypt kiye."*

### Q2: "UGC 2022 dual-enrolment policy kaise enforce hoti hai?"
> **Answer:** *"Humne UGC Dual Degree Regulation natively bake ki hai: Agar koi student ek 'Full-Time' degree aur ek 'Online/ODL' course karta hai, toh engine use **ALLOW** karta hai. Par agar dono courses 'Full-Time' hain, toh Rule `V-DUP-01` use instantly **CRITICAL CONFLICT** mark kar deta hai."*

### Q3: "Agar AICTE ka koi internal database admin database modify kar de toh?"
> **Answer:** *"Hamara audit trail **SHA-256 hash-chained** hai (similar to a private blockchain). Agar koi directly database update karega, toh agle block ka `prev_hash` toot jayega. Humne dashboard par **'Tamper Simulation & Verify Chain'** tool banaya hai jo second mein unauthorized DB modifications pakad leta hai."*

### Q4: "Rural inspection mein bina internet ke credential kaise verify hoga?"
> **Answer:** *"Hamare certificate par **Dual-QR** code hai. Left QR online link hai, aur Right QR ek compact **W3C JWS Cryptographic Signature** carry karta hai. Inspector ke phone mein AICTE ki public key pre-cached hoti hai, toh wo bina internet ke digital signature verify kar sakte hain."*

### Q5: "Isolation Forest ML kyu use kiya, normal SQL rule kyu nahi?"
> **Answer:** *"Simple SQL over-intake pakad leta hai, lekin systemic collusions—jaise colleges jo exactly 100% capacity show karte hain (padded returns) ya 20% se zyada supernumerary spike dikhate hain—unhe pakadne ke liye **Machine Learning Anomaly Detection (Isolation Forest)** 4 multidimensional features par score karti hai."*

### Q6: "DPDP Act 2023 compliance kaise ensure ki hai?"
> **Answer:** *"Humne DPDP Act ke sabhi core provisions implement kiye hain:
> - **Rule 6**: AES-256-GCM envelope encryption on Student Identity Vault.
> - **Rule 10**: Minor Guardian Consent workflow with parental OTP verification.
> - **Section 11–14**: My Data Rights portal with 1-click JSON data portability export, correction requests, and 7-day grievance redressal SLA tracking."*

### Q7: "Third-party verifiers bulk data scrape nahi kar sakte?"
> **Answer:** *"Nahi sir! Verifiers ko purpose limitation NDA sign karna hota hai, unpar strict monthly query quotas aur rate-limiting enforced hai. AICTE portal par **Emergency Kill-Switch** diya gaya hai jo kisi bhi suspicious activity par API key instantly block kar deta hai."*

---

## 🎯 Traceability Matrix: SIH 26263 Deliverables

| Deliverable | Requirement | Our Implementation | Verification |
| :--- | :--- | :--- | :---: |
| **D1** | APAAR Data Ingestion & Batch Engine | Multi-format CSV/XLSX streaming upload, staging rows, 14-rule APH validation ladder | **100% Complete** |
| **D2** | Real-Time Anomaly & Conflict Detection | UGC concurrent full-time conflict interception, supernumerary cap enforcement | **100% Complete** |
| **D3** | Student Identity Vault & Blind Index | AES-256-GCM envelope encryption, salted HMAC-SHA256 blind indexing (Zero Aadhaar) | **100% Complete** |
| **D4** | Maker-Checker Dual-Key Governance | 4-Eyes principle: Maker proposes citation, Senior Checker authorizes resolution | **100% Complete** |
| **D5** | W3C Verifiable Credentials & Dual-QR | W3C VC 2.0 with JWS signatures, offline cryptographic QR + online verify URL | **100% Complete** |
| **D6** | Dynamic Policy & Seat Quota Matrix | Page 16: Zero-code rule engine to toggle 14 APH rules and edit supernumerary caps | **100% Complete** |
| **D7** | ML Isolation Forest Anomaly Engine | 4-feature multidimensional risk scoring of institutions and mobility heatmaps | **100% Complete** |
| **D8** | Tamper-Evident Audit Ledger | SHA-256 hash-chained immutable event chain anchored to WORM storage | **100% Complete** |
| **D9** | DPDP Act 2023 Consent & Rights | Pages 25 & 26: Minor Guardian consent (Rule 10) & Data Subject Rights (Sec 11–14) | **100% Complete** |
| **D10** | Multilingual & G2B Governance | EN / Hindi toggle, DigiLocker gateway, and Verifier G2B approvals with kill-switch | **100% Complete** |

---

## 👥 Demo Personas Quick Reference

| Persona Role | Account Email | Purpose in Demo |
| :--- | :--- | :--- |
| **Institution Registrar** | `registrar@coep.ac.in` | Uploads batches, views seat utilization, resolves institutional flags |
| **AICTE Maker** | `aicte.maker@gov.in` | Investigates cross-institution concurrency cases, proposes citations |
| **AICTE Checker** | `aicte.checker@gov.in` | Senior approving officer; executes Dual-Key Maker-Checker resolution |
| **Student** | `priya.nair@student.aicte.gov.in` | Views credential, exercises DPDP data portability, links DigiLocker |
| **Verifier** | `verifier@tcs.com` | Conducts consent-gated verification, checks JWS digital signature |

*Default demo password for all accounts:* `Aicte@2026!`
