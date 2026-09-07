const fs = require('fs');
let content = fs.readFileSync('src/app/ingestion/page.tsx', 'utf8');

const oldSteps = `const steps = [
      { msg: "Connecting to synthetic Tor (.onion) observation nodes...", delay: 400, type: "info" },
      { msg: "Receiving 42 records from GenesisMarket & Telegram channels...", delay: 1200, type: "info" },
      { msg: "Validating schemas: 40 accepted, 2 rejected (malformed).", delay: 1800, type: "warning" },
      { msg: "Running Cambridge iCrime Lexicon parsing on post bodies...", delay: 2600, type: "info" },
      { msg: "Executing Stanford SNAP Co-Spend Address Clustering heuristics...", delay: 3400, type: "info" },
      { msg: "Resolved 3 aliases to known entity 'ShadowBroker' (Confidence: 0.95)", delay: 4200, type: "success" },
      { msg: "Constructed 12 new CONTROLS / TRANSACTS_WITH edges in Property Graph.", delay: 5000, type: "success" },
      { msg: "Recalculating Deterministic Risk Scores (Velocity Burst: +35 pts)...", delay: 5800, type: "info" },
      { msg: "Generated CRITICAL Alert for Investigation INV-2026-0042", delay: 6600, type: "warning" },
      { msg: "Pipeline execution complete. Property graph updated.", delay: 7200, type: "success" },
    ];`;

const newSteps = `const steps = [
      { msg: "Initializing ZeroMQ streams to AIL Framework (Analysis Information Leak) node...", delay: 400, type: "info" },
      { msg: "AIL Stream active. Intercepted 42 raw Tor Hidden Service & Telegram records.", delay: 1200, type: "success" },
      { msg: "Executing NLP Entity Extraction (GLiNER & Cambridge Lexicon) on post bodies...", delay: 2200, type: "info" },
      { msg: "Vectorizing text chunks using sentence-transformers (all-MiniLM-L6-v2).", delay: 3200, type: "info" },
      { msg: "Querying Hybrid Retriever (FAISS Dense Vector + BM25 Sparse Index) for historical linkage...", delay: 4200, type: "info" },
      { msg: "FAISS Match Found: High semantic similarity (0.91) to known entity 'ShadowBroker'.", delay: 5200, type: "warning" },
      { msg: "Running Graph Neural Network (GNN) link prediction on candidate nodes...", delay: 6200, type: "info" },
      { msg: "GNN Edge Synthesis: Constructed 12 new CONTROLS / TRANSACTS_WITH edges in Property Graph.", delay: 7200, type: "success" },
      { msg: "Recalculating Global Priority Scores using PageRank Centrality (+35 pts).", delay: 8200, type: "info" },
      { msg: "Generated CRITICAL Alert: Cross-platform entity migration detected.", delay: 9000, type: "warning" },
      { msg: "Pipeline execution complete. Knowledge graph and FAISS indices updated.", delay: 10000, type: "success" },
    ];`;

content = content.replace(oldSteps, newSteps);
fs.writeFileSync('src/app/ingestion/page.tsx', content);
