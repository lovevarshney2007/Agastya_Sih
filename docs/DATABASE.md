# DATABASE SCHEMA — Agastya SIH Backend

## Tables

### student_identity_vault
- student_token (PK, UUID) — joins to enrolments
- apaar_hmac (UNIQUE) — HMAC-SHA256 blind index for equality lookups
- apaar_enc — AES-256-GCM encrypted 12-digit APAAR ID
- name_enc — AES-256-GCM encrypted student name
- dob_enc — AES-256-GCM encrypted DOB
- masked_apaar — Display-safe masked form (e.g. ••••••••4422)

### institutions
- institution_id (PK, UUID)
- aicte_permanent_id (UNIQUE) — e.g. 1-33249011
- name, state, district, inst_type
- risk_score (Isolation Forest), risk_level (LOW/MEDIUM/HIGH)

### portal_users
- user_id (PK, UUID)
- email (UNIQUE), hashed_password (bcrypt)
- role: INSTITUTION_REGISTRAR | AICTE_MAKER | AICTE_CHECKER | VERIFIER | STUDENT
- institution_id (FK) — null for AICTE/VERIFIER roles

### enrolments
- enrolment_id (PK), student_token (FK vault), institution_id (FK), program_offering_id (FK)
- status: ACTIVE | PROVISIONAL | WITHDRAWN | TRANSFERRED | COMPLETED
- identity_status: VERIFIED | PENDING_APAAR | NO_APAAR | REFUSED | MISMATCH
- verification_status: ACCEPTED | ON_HOLD | FLAGGED

### upload_batches
- batch_id, institution_id, filename, status
- status: VALIDATING | READY_TO_COMMIT | COMMITTED | FAILED
- counts: total_rows, accepted_rows, warning_rows, hold_rows, rejected_rows

### duplicate_cases
- case_id, case_number (e.g. DUP-2026-0042)
- status: OPEN | UNDER_REVIEW | PENDING_APPROVAL | RESOLVED | FALSE_POSITIVE
- maker_officer, checker_officer (Maker-Checker enforcement)

### consent_grants
- student_token (FK vault), verifier_id, verifier_name, purpose, scope (JSON)
- status: AWAITING_CONSENT | GRANTED | DENIED | EXPIRED | REVOKED
- channel: ONLINE_PORTAL | ASSISTED_SMS_OTP

### verification_requests
- token (UNIQUE) — 128-bit random, used in QR codes
- apaar_hmac — links to vault without exposing APAAR
- status: AWAITING_CONSENT | VALID | REVOKED | DENIED
- jws_signature — W3C Verifiable Credential signed JWT

### audit_events (Hash-Chained Ledger)
- seq (autoincrement PK), actor_id, action, entity, entity_id
- prev_hash, hash (SHA-256 chain)

### merkle_anchors
- merkle_root, worm_uri, anchored_at
