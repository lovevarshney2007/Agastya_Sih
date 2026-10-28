# APAAR Student Ledger — frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 frontend for SIH26263 (APAAR ID-based student data management and
verification for AICTE-approved institutions). Every screen reads from and writes to the FastAPI backend in
`../SIH-backend`; there is no mock data in the frontend.

## Run locally

```bash
# 1. Backend (seeds a SQLite database on first start)
cd ../SIH-backend
python -m venv .venv && .venv/Scripts/activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000

# 2. Frontend
cd ../Agastya_Sih
npm install
npm run dev                                          # http://localhost:5173
```

In development Vite proxies `/api` (and `/docs`) to `http://localhost:8000`, so no CORS setup is needed.
For a deployed build set `VITE_API_BASE_URL` to the backend origin (see `.env.example`).

Demo accounts are listed on the sign-in page; all use the password `Aicte@2026!`. The second-factor step accepts any
six digits in this prototype.

## Pages

| Portal | Route | Spec page |
|---|---|---|
| Public | `/`, `/sign-in`, `/activate`, `/verify/:token` | 1, 2 |
| Institution | `/institution` dashboard, `/upload`, `/batches`, `/batches/:id`, `/registry`, `/compliance` | 3–7 |
| AICTE | `/aicte` overview, `/cases`, `/cases/:id`, `/risk`, `/institutions`, `/institutions/:id`, `/audit` | 10–14, 17, 18 |
| Verifier | `/verifier`, `/verifier/requests/:token` | 20, 21 |
| Student | `/student`, `/student/consent`, `/student/share` | 22–24 |

The portal is chosen from the role the backend returns at sign-in. Opening another portal's URL shows an access message.

## Code layout

```
src/
  api/        typed client (client.ts) and response types (types.ts)
  lib/        router, session, data hooks, formatting
  components/ shared UI (status tags, panels, modal, tables) and the page layout
  pages/      one file per page, grouped by portal
```

## Checks

```bash
npx tsc -b      # type check
npm run lint    # oxlint
npm run build   # production bundle in dist/
```
