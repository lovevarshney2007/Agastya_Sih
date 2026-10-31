# AICTE APAAR National Student Ledger — SIH 26263
# System Architecture & Technical Flow Diagrams

> **Problem Statement ID:** SIH26263  
> **Architecture Standard:** DPDP Act 2023 · UIDAI Vault · W3C Verifiable Credentials 2.0 · SHA-256 WORM Ledger  

---

## 1. 🏛️ High-Level System Architecture

```mermaid
flowchart TD
    subgraph Clients["Presentation Layer (Portals)"]
        P1["Institution Registrar Portal<br/>(Batch Upload & Seats)"]
        P2["AICTE Bureau Portal<br/>(4-Eyes Maker-Checker)"]
        P3["Student Portal<br/>(W3C Wallet & DPDP Rights)"]
        P4["Verifier Portal<br/>(Background Checks)"]
    end

    subgraph Gateway["API Gateway (FastAPI)"]
        G1["JWT / Bearer Auth & RBAC"]
        G2["Rate Limiting & Quota Tracker"]
        G3["Audit Event Interceptor"]
    end

    subgraph CoreEngine["Core Processing Engines"]
        E1["APH 14-Rule Ingestion Engine<br/>(Streaming CSV/XLSX)"]
        E2["UGC Dual Enrolment Ladder<br/>(Full-Time vs Online/ODL)"]
        E3["Isolation Forest Anomaly Engine<br/>(4-Feature AI Model)"]
        E4["W3C JWS Digital Signer<br/>(Dual-QR Generator)"]
    end

    subgraph VaultZone["Isolated Trust Zones"]
        V1["Student Identity Vault<br/>(AES-256-GCM + Salted HMAC)"]
        V2["Operational Ledger DB<br/>(Opaque Tokens Only)"]
        V3["SHA-256 Immutable Audit Trail<br/>(Hash-Chained WORM Anchor)"]
    end

    Clients --> Gateway
    Gateway --> CoreEngine
    CoreEngine --> VaultZone
```

---

## 2. ⚡ Batch Ingestion & 14-Rule Validation Ladder

```mermaid
sequenceDiagram
    autonumber
    actor Registrar as Institution Registrar
    participant API as Ingestion Gateway
    participant Ladder as 14-Rule APH Engine
    participant Vault as Student Identity Vault
    participant DB as Operational DB
    participant Ledger as SHA-256 WORM Ledger

    Registrar->>API: Upload CSV/XLSX Batch (15 Records)
    API->>Ladder: Stream Rows & Parse Headers
    loop For Every Student Record
        Ladder->>Ladder: Validate Rules (V-ID, V-INT, V-CAT)
        Ladder->>Vault: Query Salted HMAC Blind Index
        alt Concurrent Full-Time Enrolment Detected
            Ladder->>Ladder: Trigger Rule V-DUP-01 (Critical Violation)
            Ladder->>DB: Open DuplicateCase (Flagged for AICTE)
        else Clean Admission
            Ladder->>Ladder: Verify Approved Seat Capacity & TFW Cap
        end
    end
    Ladder-->>Registrar: Return Batch Staging Report (Accepted / Held / Flags)
    Registrar->>API: Commit Staged Batch
    API->>DB: Write Enrolment Tokens
    API->>Ledger: Append Commit Event (SHA-256 Hash Chain)
    Ledger-->>Registrar: Batch Committed Successfully
```

---

## 3. ⚖️ 4-Eyes Dual-Key Maker-Checker Governance Flow

```mermaid
sequenceDiagram
    autonumber
    actor Maker as AICTE Maker (Rajesh Verma)
    participant Portal as AICTE Governance Bureau
    actor Checker as AICTE Checker (Dr. Deshpande)
    participant Ledger as Immutable Audit Chain

    Portal->>Maker: Display Flagged Duplicate Cases (e.g. COEP vs VJTI)
    Maker->>Portal: Review Evidence & Regulatory Timeline
    Note over Maker,Portal: Maker cannot resolve case alone!
    Maker->>Portal: Submit Proposed Citation & Penalty
    Portal-->>Checker: Notify Senior Approving Officer
    Checker->>Portal: Conduct Independent 4-Eyes Review
    alt Checker Approves
        Checker->>Portal: Authorize Resolution (Dual-Key Signed)
        Portal->>Ledger: Append CASE_RESOLVED Block (Prev Hash Linked)
    else Checker Rejects / Requests Clarification
        Checker->>Portal: Return Case with Feedback
    end
```

---

## 4. 🛡️ DPDP Act 2023 Consent & Data Subject Rights

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Priya Nair)
    actor Guardian as Minor's Parent / Guardian
    participant StudentPortal as Student Portal
    participant DPDP as DPDP Engine
    participant DigiLocker as National DigiLocker API

    rect rgb(240, 248, 255)
    Note over Student,Guardian: Minor Protection (DPDP Rule 10)
    StudentPortal->>Guardian: Dispatch Assisted SMS OTP
    Guardian->>StudentPortal: Verify 6-Digit OTP & Approve Consent
    StudentPortal->>DPDP: Issue Cryptographic Consent Receipt
    end

    rect rgb(245, 255, 245)
    Note over Student,DigiLocker: Data Rights (DPDP Section 11–14)
    Student->>StudentPortal: Click "Export Data Portability"
    StudentPortal-->>Student: Deliver Complete JSON Package
    Student->>StudentPortal: Click "Connect DigiLocker" (MeriPehchaan PIN)
    StudentPortal->>DigiLocker: Deposit W3C Verifiable Credential
    DigiLocker-->>Student: Credential Synced to Government App
    end
```

---

## 5. 🔍 Zero-Trust Credential Verification & Dual-QR Flow

```mermaid
flowchart LR
    subgraph Certificate["Issued Verifiable Certificate"]
        C1["Left QR Code<br/>(Online Gateway Link)"]
        C2["Right QR Code<br/>(Compact W3C JWS Offline Proof)"]
    end

    subgraph OnlineVerification["Online Verification (Browser)"]
        V1["Scan Online QR"] --> V2["Gated by Student DPDP Consent"]
        V2 --> V3["Live Status from National Ledger"]
    end

    subgraph OfflineVerification["Offline Field Verification (PWA)"]
        O1["Scan Cryptographic QR"] --> O2["Decode Compact JWS Payload"]
        O2 --> O3["Verify HMAC/ECDSA Digital Signature"]
        O3 --> O4["Match Against AICTE Public Key<br/>(Zero Internet Required)"]
    end

    C1 --> OnlineVerification
    C2 --> OfflineVerification
```
