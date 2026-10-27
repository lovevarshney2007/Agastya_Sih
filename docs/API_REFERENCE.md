# API REFERENCE — Backend Endpoints

Base: https://sih.monu14.me/api/v1

## Authentication & Personas
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| GET | /auth/personas | No | Any | LoginPage (implicit) | INTEGRATED |
| POST | /auth/login | No | Any | LoginPage.handleSubmit | INTEGRATED |
| POST | /auth/quick-login/{persona_id} | No | Any | LoginPage.handleInstantDemoLogin | INTEGRATED |
| POST | /auth/institution/activate | No | New inst | Not exposed in UI | NOT INTEGRATED |
| POST | /auth/institution/onboard-eoa | No | AICTE | Not exposed in UI | NOT INTEGRATED |
| GET | /auth/me | Bearer | Any | App.tsx session restore | INTEGRATED |
| POST | /auth/logout | Bearer | Any | App.tsx handleLogout | INTEGRATED |

## Institutions & Batches
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| GET | /institutions/{id}/dashboard | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| POST | /institutions/{id}/upload-demo | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| POST | /institutions/{id}/upload | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| GET | /institutions/{id}/batches/{batchId}/report | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| POST | /institutions/{id}/batches/{batchId}/commit | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| GET | /institutions/{id}/students | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | INTEGRATED |
| POST | /institutions/{id}/students | Bearer | INSTITUTION_REGISTRAR | InstitutionPortal | PARTIAL |

## AICTE Regulatory Governance
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| GET | /aicte/dashboard | Bearer | AICTE_* | AictePortal | INTEGRATED |
| GET | /aicte/violations | Bearer | AICTE_* | AictePortal | INTEGRATED |
| POST | /aicte/violations/{id}/propose | Bearer | AICTE_MAKER | AictePortal | INTEGRATED |
| POST | /aicte/violations/{id}/approve | Bearer | AICTE_CHECKER | AictePortal | INTEGRATED |
| GET | /aicte/risk-ranking | Bearer | AICTE_* | AictePortal | INTEGRATED |
| GET | /aicte/audit | Bearer | AICTE_* | AictePortal | INTEGRATED |
| POST | /aicte/audit/verify-chain | Bearer | AICTE_* | AictePortal | INTEGRATED |
| POST | /aicte/audit/simulate-tamper | Bearer | AICTE_* | AictePortal | INTEGRATED |
| POST | /aicte/audit/anchor | Bearer | AICTE_* | AictePortal | INTEGRATED |

## Verifier & Credentials
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| POST | /verifier/requests | Bearer | VERIFIER | VerifierPortal | INTEGRATED |
| GET | /verifier/tracker | Bearer | VERIFIER | VerifierPortal | INTEGRATED |
| GET | /verifier/credential/{token} | Bearer | VERIFIER | VerifierPortal | INTEGRATED |
| GET | /verifier/credential/{token}/pdf | Bearer | VERIFIER | VerifierPortal | INTEGRATED |

## DPDP Consent Management
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| GET | /student/{token}/consents | Bearer | STUDENT | StudentPortal | PARTIAL (wrong token) |
| POST | /student/consent/{id}/action | Bearer | STUDENT | StudentPortal | PARTIAL |
| POST | /student/consent/assisted-sms-otp | Bearer | STUDENT | StudentPortal | INTEGRATED |

## Public Verification & Reports
| Method | Path | Auth | Role | Frontend | Status |
|--------|------|------|------|----------|--------|
| GET | /verify/public/{token} | No | Any | PublicVerify | NOT INTEGRATED |
| GET | /reports/national-summary.csv | No | Any | AictePortal | INTEGRATED |
| GET | /reports/institution/{id}.csv | No | Any | InstitutionPortal | INTEGRATED |
| GET | /reports/admission-template.csv | No | Any | InstitutionPortal | INTEGRATED |
