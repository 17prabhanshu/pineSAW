# pineSAW — Phase 2 Architecture & Implementation Plan
**Institutional Research Integration, Backend Forensic Engines, Test Suites & Law Enforcement Deployment**

---

## 1. Executive Summary & Phase 2 Objectives

In **Phase 1**, we established the foundational architecture, institutional brutalist light-mode UI, SQLite/Prisma graph schema, financial asset review module (linking 4 Indian bank accounts and 1 Swiss offshore account), and hackathon presentation deliverables.

**Phase 2 Objective:** Elevate **pineSAW** from a demonstrator into a production-grade, mathematically rigorous, and court-admissible cyber threat intelligence engine. This entails building **actual algorithmic backend modules**, a comprehensive **automated test suite**, live **ingestion parsing pipelines**, and **real-world Indian law enforcement workflows** (NDPS Act, Cr.P.C., IT Act).

---

## 2. Institutional Research Foundations to Implement

Every Phase 2 backend engine is directly rooted in published academic and operational literature:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RESEARCH-TO-ENGINE MAPPING                                    │
├───────────────────────────────┬──────────────────────────────────┬──────────────────────────────┤
│ Institution / Source          │ Academic Framework / Study       │ pineSAW Phase 2 Engine       │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ MIT-IBM Watson / Harvard      │ Elliptic2 (Bellei et al., 2024)  │ Subgraph Laundering Pattern  │
│                               │ GCN Subgraph Mining              │ Analyzer (`graph.ts`)        │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ MIT Lincoln Laboratory        │ Human Dynamic Dark Networks      │ Multi-Modal Persona Linking  │
│                               │ (Persona Linking Heuristics)     │ Engine (`resolution.ts`)     │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ Stanford Network Science/SNAP │ Multi-Input Co-Spend Clustering  │ Blockchain Address Clusterer │
│                               │ & Community Detection (CS224W)   │ (`clustering.ts`)            │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ Cambridge Cybercrime Centre   │ iCrime NLP & Underground Forum   │ Slang & Coded Language NER   │
│                               │ Narcotics Lexicon Classification │ Extractor (`nlp.ts`)         │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ NDSS Symposium (MFScope)      │ Multi-Stage Cryptocurrency Abuse │ Bidirectional Backtracking   │
│                               │ & Exchange Deposit Tracing       │ Engine (`backtrack.ts`)      │
├───────────────────────────────┼──────────────────────────────────┼──────────────────────────────┤
│ NCB & Indian Legal Framework  │ NDPS Act Sec 68F, CrPC Sec 91,   │ Automated Evidentiary Legal  │
│                               │ IT Act Sec 69B, Evidence Act 65B │ Dossier Engine (`legal.ts`)  │
└───────────────────────────────┴──────────────────────────────────┴──────────────────────────────┘
```

---

## 3. Proposed Backend Architecture & New Modules

### A. Graph & On-Chain Analytics Layer (`src/lib/analytics/`)
1. **`clustering.ts` — Stanford SNAP Co-Spend Address Clusterer:**
   - Multi-input heuristic: Identifies transactions with multiple input addresses and clusters them as controlled by the same wallet entity.
   - Change address inference: Recognizes one-time change outputs in peel chains.
2. **`scoring.ts` — Deterministic Risk Scoring Engine:**
   - Mathematical scoring equation:
     $$\text{Risk} = \min\left(100, \; w_1 C_{\text{centrality}} + w_2 V_{\text{velocity}} + w_3 E_{\text{overlap}} + w_4 J_{\text{jurisdiction}}\right)$$
   - Generates exact `RiskFactorBreakdown` with point attributions (e.g., *+35 for 3.4x transaction velocity spike, +25 for mixer interaction, +20 for cross-platform PGP reuse*).
3. **`backtrack.ts` — Bidirectional Backtracking Engine (MFScope/NDSS):**
   - **Forward Flow:** Traces crypto from darknet vendor listing $\to$ peel chain $\to$ mixer $\to$ exchange deposit address.
   - **Backward Flow:** Queries exchange KYC records $\to$ resolves domestic bank accounts (HDFC, SBI, ICICI, Axis) and offshore secrecy accounts (Swissquote SA).

### B. Ingestion & NLP Slang Processing Layer (`src/lib/nlp/`)
1. **`slangExtractor.ts` — Cambridge Cybercrime Lexicon Engine:**
   - Multilingual regex & NLP dictionary for synthetic narcotics, street slang (e.g. *Fentanyl "M30", Meth "Ice/Glass", Heroin "Smack/China White", Alprazolam "Xanies"*).
   - Quantity/unit parsing (e.g. *100g, 500 pills, 1kg brick, 50 sheets*).
   - Cryptographic identifier extraction: Validates Bitcoin (Base58/Bech32), Ethereum (0x Hex), and PGP Public Key fingerprints.
2. **`api/ingest/parse/route.ts`:**
   - REST API accepting raw darknet forum HTML / Telegram post text, automatically parsing entities and returning structured JSON with confidence ratings.

### C. Legal & Evidentiary Packaging Layer (`src/lib/legal/`)
1. **`legalDossier.ts` — Indian Criminal Procedure & NDPS Act Generator:**
   - **Section 91 Cr.P.C. Notice:** Formal requisition to banks and telecom service providers for subscriber records and account transaction histories.
   - **Section 68F NDPS Act Order:** Freezing of illegally acquired assets and financial off-ramps.
   - **Section 65B Indian Evidence Act Certificate:** Digital evidence certificate with SHA-256 cryptographic hashes, capture timestamps, and investigator credentials (`OP-7492`).
2. **Tamper-Evident Audit Trail:**
   - Logs every analyst query, graph mutation, and report export with unalterable SHA-256 hashes.

---

## 4. Automated Testing Suite (`tests/`)

We will build a comprehensive, automated test runner covering:

1. **Unit Tests (`tests/unit/`):**
   - `clustering.test.ts`: Verifies Stanford multi-input co-spend address grouping logic.
   - `scoring.test.ts`: Verifies mathematical risk scoring bounds ($0 \le S \le 100$) and deterministic reproducibility.
   - `nlp.test.ts`: Tests extraction of obfuscated drug slang, PGP blocks, and crypto wallet formats.
   - `legal.test.ts`: Verifies Section 65B SHA-256 hash generation and PDF structure validity.
2. **Integration Tests (`tests/integration/`):**
   - `api_investigations.test.ts`: Tests `POST /api/investigations` (case creation, note appending, evidence attachment).
   - `api_financial.test.ts`: Tests financial asset retrieval, controller relational mapping, and priority sorting.
   - `api_graph.test.ts`: Validates knowledge graph node-link consistency and cycle detection.

---

## 5. UI/UX Enhancements for Real-World Law Enforcement

1. **Interactive Real-Time Ingestion Simulator (`/ingestion`):**
   - Live stream panel where officers can paste raw suspect text or click "Simulate Darknet Ingestion Feed" to see entities extracted and mapped in real time.
2. **Timeline Velocity Filter in Investigation Workspace (`/investigations/[id]`):**
   - Time-slider allowing investigators to view how the syndicate expanded across days/weeks.
3. **1-Click Legal Subpoena Download (`/actions` and `/financial`):**
   - Generate and download customized Section 91 CrPC / Section 68F NDPS documents directly from any suspect card or bank account.

---

## 6. Verification Plan

### Automated Verification
```bash
# 1. Run full test suite
npm test (or node test runner)

# 2. Database validation & seeding
npm run db:push
npm run db:seed

# 3. Next.js production build check
npm run build
```

### Manual Verification
1. Navigate to `/ingestion`, paste a mock Telegram drug advertisement, and verify automated NLP entity extraction.
2. Open `/financial`, click on `HDFC Bank` or `Swissquote Bank`, click "Generate Notice", and verify instant generation of the Section 91 CrPC notice.
3. Create a new case via "+ New Case" and verify full graph linkage.
