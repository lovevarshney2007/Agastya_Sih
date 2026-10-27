# PROJECT CONTEXT — Agastya SIH / APAAR Institution Portal
**Generated**: 27 Oct 2026 | **Stack**: React 19 + Vite 8 + FastAPI + PostgreSQL

## Purpose
Multi-role institutional web portal for AICTE APAAR National Ledger (SIH26263).
Manages student duplicate detection, DPDP compliance, regulatory governance, and verifiable credentials.

## Frontend
- Path: Agastya_Sih/  |  Entry: src/main.tsx -> App.tsx
- React 19, TypeScript 6, Tailwind CSS 4, Vite 8
- API client: src/api/client.ts (centralized, all services)
- Translations: src/data/translations.ts (EN/HI)
- Mock fallback: src/data/mockData.ts

## Backend  
- Path: SIH-backend/  |  Entry: app/main.py -> app/api/endpoints.py
- FastAPI, SQLAlchemy, JWT, AES-256-GCM encryption
- Live URL: https://sih.monu14.me  |  API prefix: /api/v1

## Roles
- INSTITUTION / INSTITUTION_REGISTRAR: Batch upload, student registry
- AICTE_OFFICER / AICTE_MAKER: Violation proposals
- AICTE_SUPER_ADMIN / AICTE_CHECKER: Violation approval, risk ranking
- VERIFIER: APAAR lookup, credential download
- STUDENT: Consent management
- PUBLIC_VERIFY: Token QR verification (no auth)

## Navigation (App.tsx)
- activeNavPage: HOME | LOGIN | PORTALS | ANALYTICS | COMPLIANCE_STANDARDS | DOCUMENTATION
- currentRole: selects portal within PORTALS view
- Auth: JWT in localStorage (aicte_token, aicte_user)
