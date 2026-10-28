# Bug tracker

_Updated 28 October 2026. Earlier entries (BUG-001 to BUG-021) referred to the previous mock-based UI, which has been replaced._

| ID | Severity | Area | Problem | Fix | Status |
|---|---|---|---|---|---|
| BUG-101 | Critical | Backend commit | Committing a batch did not save any student records | Staged rows are persisted on commit; conflict cases opened | Fixed |
| BUG-102 | Critical | Validation | `bool("false")` made every CSV row supernumerary | Explicit boolean parsing | Fixed |
| BUG-103 | Critical | Security | No authorisation on institution, AICTE, verifier, student or report endpoints | Role and ownership checks on every endpoint | Fixed |
| BUG-104 | High | Consent | Any organisation's consent let any verifier get a credential; expiry ignored | Consent matched by organisation and expiry | Fixed |
| BUG-105 | High | Student portal | Wrong student shown (fallback to first vault record) | Student login linked to its vault token; `/student/me` | Fixed |
| BUG-106 | High | Verifier flow | Requests without consent never reached the student | Request creates a consent request; approval issues the credential | Fixed |
| BUG-107 | High | Sign-in | Portal chosen from the selected tab, not the account's role | Portal derived from the backend role; mismatched tab explained | Fixed |
| BUG-108 | High | Maker-checker | Checker accounts landed in a portal without the case workbench; maker identity taken from request body | Both AICTE roles use the case pages; maker/checker taken from the session | Fixed |
| BUG-109 | Medium | PDF | Certificate generation wrote to `/tmp`, failing on Windows | In-memory image | Fixed |
| BUG-110 | Medium | Demo upload | Relied on a git-ignored CSV file that only existed after a fresh seed | Sample built in code | Fixed |
| BUG-111 | Medium | Dashboard | Hardcoded funnel and "duplicates intercepted" numbers | Computed from data | Fixed |
| BUG-112 | Medium | UI | Modals lost focus on every keystroke; a space typed in a field could close the dialog | Stable effect in `Modal` | Fixed |
| BUG-113 | Low | UI | Custom CSS outranked Tailwind utilities (hamburger visible on desktop, nav link colours) | Custom CSS moved into `@layer base/components` | Fixed |
