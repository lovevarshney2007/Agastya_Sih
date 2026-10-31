# APAAR Student Ledger — Frontend (Agastya SIH)

React 19 + TypeScript + Vite + Tailwind CSS frontend for **SIH26263: APAAR ID-Based Student Data Management and Verification for AICTE-Approved Institutions**.

Every screen reads from and writes to the production FastAPI backend in `../SIH-backend`; all state is real, cryptographically verifiable, and DPDP Act 2023 compliant.

---

## 🚀 Quick Start

```bash
# 1. Backend (starts on port 8000 with auto-seeded demo data)
cd ../SIH-backend
source .venv/bin/activate
uvicorn app.main:app --port 8000

# 2. Frontend (starts on port 5173)
cd ../Agastya_Sih
npm install
npm run dev
```

In development, Vite automatically proxies `/api` and `/docs` to `http://localhost:8000`.

---

## 🌟 Highlight Features

- **🎬 Jury Interactive Walkthrough Mode**: Floating presentation controller (`JuryTourWidget`) allowing 1-click persona switching across all 5 user roles to present the end-to-end lifecycle in under 3 minutes.
- **🌐 Multilingual Toggle (EN / हिन्दी)**: Full localization of header branding, navigation menus, portal titles, buttons, and alert notices with persistent state.
- **🛡️ DPDP Act 2023 Compliance**:
  - **Minor Guardian Consent (Page 25)**: Parental OTP verification and consent receipts under DPDP Rule 10.
  - **My Data Rights (Page 26)**: Right to summary, 1-click JSON data portability export, correction/erasure requests with SLA tracking.
- **📄 AICTE Executive Briefing PDF**: 1-click downloadable high-resolution national regulatory compliance report with ML anomaly rankings and WORM ledger hash verification.
- **🇮🇳 National DigiLocker Gateway**: MeriPehchaan 6-digit PIN authentication simulation and instant verifiable credential deposit.
- **⚙️ Live Policy Management (Page 16)**: Zero-code rule engine to toggle 14 APH validation rules and edit supernumerary seat category caps.
- **🏢 Verifier Organisation Governance (Page 19)**: G2B onboarding review, monthly query quotas, and emergency kill-switch.

---

## 📱 Portal Routes

| Portal | Route | Description |
|---|---|---|
| **Public** | `/`, `/sign-in`, `/activate`, `/verify/:token` | Public seats registry, zero-knowledge verification, institution onboarding |
| **Institution** | `/institution`, `/upload`, `/batches`, `/batches/:id`, `/registry`, `/compliance` | Batch ingestion, 14-rule APH validation, seat utilization matrix |
| **AICTE** | `/aicte`, `/cases`, `/cases/:id`, `/risk`, `/institutions`, `/institutions/:id`, `/audit`, `/aicte/rules`, `/aicte/verifier-approvals` | 4-Eyes Maker-Checker governance, Isolation Forest anomaly ranking, immutable WORM ledger, policy & quota configuration, verifier approvals |
| **Verifier** | `/verifier`, `/verifier/requests/:token` | Consent-gated credential verification, Dual-QR & JWS offline signature checks |
| **Student** | `/student`, `/student/consent`, `/student/share`, `/student/guardian`, `/student/rights` | W3C Verifiable Credentials, DigiLocker sync, Guardian consent (Rule 10), Data Subject Rights (DPDP) |

---

## 🛠️ Code Layout

```
src/
  api/          Typed API client (client.ts) and DTO response types (types.ts)
  lib/          Router, auth session, i18n dictionary, formatting helpers
  components/   Shared UI library (Panel, StatusTag, Modal, Alert, KeyValue) and Layout
  pages/        Portal screens (institution, aicte, student, verifier, public)
```

---

## ✅ Quality Checks

```bash
npx tsc -b      # Strict TypeScript type check (0 errors)
npm run build   # Production bundle (0 warnings/errors, <1s)
```
