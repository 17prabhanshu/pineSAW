# 🧠 Vector Search & Embeddings in pineSAW — Made Simple

An easy-to-read guide on how **pineSAW** uses AI vector embeddings, where they are stored on disk, and the technology stack powering fast semantic search.

---

## ⚡ TL;DR (The Quick Summary)

- **What are the vectors?** Mathematical coordinate representations (384 numbers per item) capturing the *meaning* of darknet listings, vendor aliases, and criminal threat indicators.
- **Where are they stored?** In the [`data/`](./data/) directory as binary index files (`.bin`), metadata JSON (`.json`), and pickled lexical models (`.pkl`).
- **Which tech stack is used?**
  - **Meta AI FAISS** (`faiss-cpu`) for ultra-fast vector searching.
  - **FastEmbed & ONNX Runtime** using the `BAAI/bge-small-en-v1.5` model for generating dense embeddings.
  - **BM25 Okapi** (`rank-bm25`) for traditional keyword matching (combined with vectors for **Hybrid Search**).
  - **Next.js & Python** connecting the frontend UI to the search engine.

---

## 💡 The Real-World Analogy: How It Works

Imagine a detective investigating cyber narcotics. 

- **Traditional Keyword Search (BM25):** 
  If you search for *"fentanyl"*, standard search looks strictly for the exact letters `"f-e-n-t-a-n-y-l"`. If a dealer writes *"pure China White"* or *"M30 pills"*, normal search misses it completely.
- **Vector Search (Semantic Embeddings):** 
  The AI translates words into 384 numbers representing concept coordinates in high-dimensional space. In this space, *"fentanyl"*, *"China White"*, and *"M30 synthetic"* are placed right next to each other because their **meaning** is similar.
- **Hybrid Search (Best of Both Worlds):** 
  pineSAW combines both:
  $$\text{Final Score} = (\text{Vector Meaning Score} \times 70\%) + (\text{Exact Keyword Match} \times 30\%)$$

---

## 📂 Where Vectors Are Stored on Disk

All vector assets live locally inside the **`data/`** folder:

```
data/
├── faiss_index_flat.bin    # Exact Cosine Similarity Index (Binary)
├── faiss_index_hnsw.bin    # Scalable Graph-Based ANN Index (Binary)
├── faiss_mapping.json      # Metadata mapping (Entities, Labels, Text, Vector Previews)
└── bm25_corpus.pkl         # Lexical Keyword Index (Python Pickle)
```

### Detailed File Breakdown:

| File | Type | Purpose |
| :--- | :--- | :--- |
| **`data/faiss_index_flat.bin`** | Meta FAISS Binary (`IndexFlatIP`) | Stores exact dense vectors. Uses normalized Inner Product to calculate exact Cosine Similarity. |
| **`data/faiss_index_hnsw.bin`** | Meta FAISS Binary (`IndexHNSWFlat`) | Graph-based Approximate Nearest Neighbor (ANN) index. Uses Hierarchical Navigable Small World graphs for sub-millisecond lookups. |
| **`data/faiss_mapping.json`** | JSON Metadata | Connects each vector position (e.g., vector `#42`) to its real-world information (Entity ID, vendor name, darknet text snippet, risk score). |
| **`data/bm25_corpus.pkl`** | Python Pickle | Pre-tokenized word corpus used by BM25 Okapi to score exact keyword hits. |
| **`prisma/dev.db`** | SQLite Database | Relational database where entities, relationships, cases, and legal notices are permanently recorded. |

> **In-Memory Cache:** When the engine runs, these files are loaded into RAM so searches take less than **5 milliseconds**.

---

## 🛠️ The Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      1. USER INTERFACE                      │
│            Next.js 16 + React 19 (/search page)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. NEXT.JS API LAYER                     │
│               src/app/api/search/route.ts                   │
│         (Query expansion, parameters, error fallback)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Calls port 5055 or CLI
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 3. HYBRID PYTHON ENGINE                     │
│               backend/scripts/faiss_engine.py               │
├──────────────────────────────┬──────────────────────────────┤
│      Dense Neural Search     │    Sparse Keyword Search     │
│   • BAAI/bge-small-en-v1.5   │   • rank-bm25 (BM25Okapi)    │
│   • FastEmbed (ONNX Engine)  │   • Tokenized darknet slang  │
│   • Meta AI FAISS (C++ core) │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### 1. The Embedding Model: `BAAI/bge-small-en-v1.5`
- Generates **384-dimensional dense vectors** (`float32`).
- Trained specifically on semantic search and information retrieval benchmarks (MTEB leaderboards).
- Compact and fast enough to run entirely on CPU without requiring heavy GPUs.

### 2. The Embedding Runtime: `FastEmbed` + `ONNX Runtime`
- Instead of downloading multi-gigabyte PyTorch dependencies, it uses `fastembed`.
- Uses lightweight Microsoft ONNX Runtime binaries for instantaneous vector generation on Windows, Linux, and macOS.

### 3. The Vector Database: `Meta AI FAISS` (`faiss-cpu`)
- High-performance vector indexing library written in optimized C++ by Meta AI Research.
- Provides two complementary index strategies:
  1. **`IndexFlatIP`**: Exhaustive exact search. Guaranteed 100% accuracy.
  2. **`IndexHNSWFlat`**: Graph-traversal index (`M=32`, `efSearch=64`). Extremely fast for millions of records.

### 4. The Sparse Engine: `rank-bm25`
- Implements the **BM25Okapi** algorithm used by enterprise search engines like Elasticsearch.
- Gives high weights to rare, specific terms (like a specific Bitcoin address, PGP fingerprint, or Telegram handle).

---

## 🔄 Complete Step-by-Step Lifecycle

### Step 1: Ingesting & Building the Index
*Script: [`backend/scripts/build_faiss_index.py`](./backend/scripts/build_faiss_index.py)*

1. The script reads entities from SQLite (`prisma/dev.db`) and darknet listings from [`backend/artifacts/demo_data.json`](./backend/artifacts/demo_data.json).
2. It feeds all text through `fastembed` to produce a matrix of vectors with shape `(N, 384)`.
3. Normalizes each vector to unit length ($L_2$ normalization).
4. Adds the vectors into FAISS `IndexFlatIP` and `IndexHNSWFlat`.
5. Writes `faiss_index_flat.bin`, `faiss_index_hnsw.bin`, `faiss_mapping.json`, and `bm25_corpus.pkl` to `data/`.

### Step 2: Querying from the Search UI
*Route: [`src/app/api/search/route.ts`](./src/app/api/search/route.ts)*

1. User enters a query (e.g., *"carfentanil vendor"* at `/search`).
2. Next.js applies darknet query expansion (synonym mapping).
3. The query is sent to `faiss_engine.py`:
   - It computes the vector for *"carfentanil vendor"*.
   - Runs FAISS vector search across all stored vectors.
   - Runs BM25 keyword matching across the token corpus.
   - Blends scores: `dense_score * denseWeight + bm25_score * (1 - denseWeight)`.
4. Returns matching threat entities with confidence percentages and risk tiers directly to the UI.

---

## 📂 Key File Locations

- **Data Directory:** [`data/`](./data/) *(Contains all compiled vector index files)*
- **Index Compiler:** [`backend/scripts/build_faiss_index.py`](./backend/scripts/build_faiss_index.py) *(Builds indices from scratch)*
- **Query Engine:** [`backend/scripts/faiss_engine.py`](./backend/scripts/faiss_engine.py) *(Runs search & daemon)*
- **Search API Route:** [`src/app/api/search/route.ts`](./src/app/api/search/route.ts) *(Next.js API endpoint)*
- **Live Ingest API:** [`src/app/api/ingest/index-faiss/route.ts`](./src/app/api/ingest/index-faiss/route.ts) *(Adds newly scraped messages)*
- **Frontend Search Page:** [`src/app/search/page.tsx`](./src/app/search/page.tsx) *(Interactive search console)*
