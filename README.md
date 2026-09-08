# pineSAW — Cyber Threat Intelligence & Asset Discovery System
*Chandigarh Police Hackathon 2026 | Team ctrl addicts (UIET)*

**pineSAW** is an institutional Cyber Threat Intelligence & Financial Forensics platform designed for law enforcement agencies to identify, monitor, and dismantle illicit narcotics syndicates operating across Darknet marketplaces, encrypted messaging platforms (Telegram/Session), and cryptocurrency networks.

---

## 🎯 Key Features & Capabilities

- **Multi-Modal Data Ingestion:** Simulated lawful ingestion across Tor (.onion), encrypted communication channels, and public blockchain ledgers.
- **Probabilistic Entity Resolution:** Automatically links fragmented identities across platforms (e.g. connecting a darknet vendor alias to a Telegram handle via shared PGP keys and email identifiers).
- **Bidirectional Backtracking (Taint Analysis):** Traces cryptocurrency flows forward from drug listings to mixers and bridges, and backtracks from cash-out points to reveal domestic and offshore bank accounts.
- **Asset Review & Fiat Tracking (`/financial`):** Maps domestic bank accounts (HDFC, SBI, ICICI, Axis Bank), offshore secrecy accounts (Swissquote Bank SA), and high-risk crypto wallets.
- **Deterministic Risk Scoring:** Transparent, explainable scoring based on network centrality and velocity spikes (e.g., 3.4x activity burst) rather than black-box guesswork.
- **1-Click Evidentiary Legal Dossier (`/reports` & `/actions`):** Automated drafting of Section 91 Cr.P.C. / Section 69B IT Act disclosure notices and Section 68F NDPS Act bank freeze requisitions with SHA-256 evidence hashing.
- **Case Management & "+ New Case" Workflow (`/investigations`):** Complete investigative timeline, note-taking, evidence tracking, and case initiation workspace.

---

## 📚 Academic & Research Foundations

pineSAW operationalizes peer-reviewed research from world-leading laboratories:
- **MIT-IBM Watson AI Lab / Harvard (Elliptic & Elliptic2):** Subgraph representation learning and Graph Convolutional Networks (GCN) for on-chain money laundering detection.
- **MIT Lincoln Laboratory (Human Dynamic Dark Networks):** Multi-platform persona linking across PGP fingerprints, stylometry, and network graphs.
- **Stanford Network Science / SNAP:** Multi-input co-spend heuristics for Bitcoin wallet clustering.
- **University of Cambridge Cybercrime Centre:** Underground forum NLP and darknet narcotics terminology classification.
- **NDSS (MFScope):** Multi-stage cybercrime investigation pipeline linking darknet traces to exchange cash-out destinations.

---

## 🏗️ Architecture & Tech Stack

- **Frontend & App Framework:** Next.js 16 (App Router), React 19, Tailwind CSS v4, IBM Plex Mono & Inter typography
- **State & Icons:** Phosphor Icons, clsx, Lucide-style institutional light-mode design
- **Graph Visualization:** `react-force-graph-2d`
- **Backend & API:** Next.js Server Route Handlers
- **Database & ORM:** SQLite with Prisma ORM
- **Export & Document Engine:** `@media print` PDF generation, `python-docx`, `python-pptx`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd CP3

# Install dependencies
npm install
```

### 3. Database Setup & Seeding
```bash
# Push the Prisma schema to SQLite
npm run db:push

# Seed synthetic intelligence entities, relationships, and financial assets
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Note on Synthetic Data & Legal Framing
This platform operates on synthetic intelligence data generated for defensive demonstration and hackathon evaluation. No live connections to real illicit darknet markets are made during this simulation. All legal document generators strictly adhere to standard Indian criminal procedure (Code of Criminal Procedure / Information Technology Act / NDPS Act).

