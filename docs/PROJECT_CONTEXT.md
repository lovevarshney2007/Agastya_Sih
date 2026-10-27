# PROJECT CONTEXT — Agastya SIH / APAAR National Portal

**Project Code**: SIH26263  
**Status**: 100% Integrated & Verified (36/36 Endpoints Passing)  
**Last Updated**: October 27, 2026  
**Frontend**: `Agastya_Sih/` (React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4)  
**Backend**: `SIH-backend/` (FastAPI 0.115 + SQLAlchemy + SQLite / PostgreSQL)  
**Live Backend URL**: `https://sih.monu14.me` (API Prefix: `/api/v1`)

---

## 1. Quick Start & Credentials

### Default Credentials
- **Password for ALL seeded personas**: `Aicte@2026!`
- **Personas**:
  1. **Institution Registrar**: `registrar@coep.ac.in` (COEP Technological University, ID: `a46ca936-0a19-462f-9ed4-de50124abb03`)
  2. **AICTE Officer (Maker)**: `officer.maker@aicte-india.org`
  3. **AICTE Super Admin (Checker)**: `superadmin@aicte-india.org`
  4. **Employer Verifier**: `hr.verify@tcs.com`
  5. **Student**: Priya Nair (Student Vault Token: `d5d9ae28-1564-4713-bcb9-1a1ab3823915`)

### Key Test Commands
```bash
# Frontend dev server
cd Agastya_Sih && npm run dev

# Frontend strict typecheck
cd Agastya_Sih && npx tsc -b --noEmit

# Frontend production build
cd Agastya_Sih && npm run build

# Frontend linter
cd Agastya_Sih && npm run lint

# Live API automated test suite (from repo root)
node scratch/verify_api.mjs
```

---

## 2. Directory Structure

```
├── Agastya_Sih/                  # Frontend Application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # Central typed API client (ALL endpoints)
│   │   ├── components/
│   │   │   ├── InstitutionPortal.tsx   # Registrar portal (batch upload, student registry)
│   │   │   ├── AictePortal.tsx         # AICTE regulatory governance (investigation, audit)
│   │   │   ├── SuperAdminPortal.tsx    # Super Admin (EoA onboarding, ledger anchor)
│   │   │   ├── VerifierPortal.tsx      # Employer background credential verification
│   │   │   ├── StudentPortal.tsx       # Student sovereign DPDP consent & PDF download
│   │   │   ├── PublicVerify.tsx        # Public QR token lookup (privacy-preserving)
│   │   │   ├── AnalyticsView.tsx       # National intake & quota analytics
│   │   │   ├── LoginPage.tsx           # Authentication & 1-click demo personas
│   │   │   └── Navbar.tsx              # Universal navigation & role switcher
│   │   ├── data/
│   │   │   ├── mockData.ts             # Fallback fixtures & static reference data
│   │   │   └── translations.ts         # English / Hindi translations dictionary
│   │   └── types/
│   │       └── index.ts                # TypeScript domain models & interfaces
│   └── docs/                           # Complete project documentation suite
└── SIH-backend/                  # Backend Engine
    └── app/
        ├── api/
        │   └── endpoints.py      # Master FastAPI route controllers (36 endpoints)
        └── main.py               # Application factory & middleware configuration
```

---

## 3. Architecture & Coding Conventions

1. **Central API Client Rule**: Never call `fetch` or Axios directly in components. All backend calls must go through `src/api/client.ts`.
2. **Zero Mock Masking Rule**: Real API responses take absolute precedence. Fallback mock data is reserved solely for offline development resilience.
3. **Dual-Control Rule**: In AICTE regulatory investigations, the officer who proposes a penalty (`maker_id`) cannot approve it (`checker_id != maker_id`).
4. **Privacy-Preserving Vault**: Aadhaar numbers are never stored. APAAR IDs are hashed via SHA-256 HMAC. Student PII is encrypted via AES-256-GCM.
5. **WORM Storage**: The audit trail is an append-only cryptographic hash chain with Merkle root anchoring to simulate Write-Once-Read-Many storage.
