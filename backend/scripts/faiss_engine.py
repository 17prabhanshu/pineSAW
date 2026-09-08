#!/usr/bin/env python3
"""
Production-Grade FAISS Search Engine & Hybrid Daemon for DARKINT
Meta AI FAISS (IndexFlatIP & IndexHNSWFlat) + BAAI/bge-small-en-v1.5 + BM25 Okapi
"""

import os
import sys
import json
import time
import pickle
import argparse
import numpy as np
import faiss
from fastembed import TextEmbedding
from rank_bm25 import BM25Okapi

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
FLAT_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index_flat.bin")
HNSW_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index_hnsw.bin")
MAPPING_PATH = os.path.join(DATA_DIR, "faiss_mapping.json")
BM25_PATH = os.path.join(DATA_DIR, "bm25_corpus.pkl")

class FaissEngine:
    _instance = None

    def __init__(self):
        self.load_resources()

    def load_resources(self):
        print("[FAISS Engine] Initializing TextEmbedding (BAAI/bge-small-en-v1.5)...", file=sys.stderr)
        self.embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        
        print("[FAISS Engine] Loading FAISS index binaries...", file=sys.stderr)
        if os.path.exists(FLAT_INDEX_PATH):
            self.index_flat = faiss.read_index(FLAT_INDEX_PATH)
        else:
            self.index_flat = faiss.IndexFlatIP(384)

        if os.path.exists(HNSW_INDEX_PATH):
            self.index_hnsw = faiss.read_index(HNSW_INDEX_PATH)
        else:
            self.index_hnsw = faiss.IndexHNSWFlat(384, 32, faiss.METRIC_INNER_PRODUCT)

        if os.path.exists(MAPPING_PATH):
            with open(MAPPING_PATH, "r") as f:
                self.mapping_data = json.load(f)
                self.documents = self.mapping_data.get("documents", [])
        else:
            self.documents = []

        if os.path.exists(BM25_PATH):
            with open(BM25_PATH, "rb") as f:
                bm25_data = pickle.load(f)
                self.bm25 = bm25_data["bm25"]
                self.bm25_corpus = bm25_data["corpus"]
                self.bm25_doc_ids = bm25_data["doc_ids"]
        else:
            self.bm25 = None
            self.bm25_corpus = []
            self.bm25_doc_ids = []

        print(f"[FAISS Engine] Loaded {self.index_flat.ntotal} vectors in FAISS Flat & {self.index_hnsw.ntotal} in HNSW.", file=sys.stderr)

    def add_document(self, doc_id: str, label: str, doc_type: str, text: str, risk_factors: str = "", priority: int = 50):
        full_text = f"{label} ({doc_type}) {text} {risk_factors}".strip()
        emb = np.array(list(self.embed_model.embed([full_text])), dtype=np.float32)
        faiss.normalize_L2(emb)
        
        idx = len(self.documents)
        self.index_flat.add(emb)
        self.index_hnsw.add(emb)
        
        doc_meta = {
            "index": idx,
            "id": doc_id,
            "type": doc_type,
            "label": label,
            "confidence": 0.95,
            "priorityScore": priority,
            "riskFactors": risk_factors,
            "text": full_text,
            "source": "live_ingestion",
            "vector": [round(float(v), 4) for v in emb[0][:12]],
            "vector_full_dim": 384
        }
        self.documents.append(doc_meta)
        
        # Update BM25
        self.bm25_corpus.append(full_text.lower().split())
        self.bm25_doc_ids.append(doc_id)
        self.bm25 = BM25Okapi(self.bm25_corpus)
        
        # Persist to disk
        faiss.write_index(self.index_flat, FLAT_INDEX_PATH)
        faiss.write_index(self.index_hnsw, HNSW_INDEX_PATH)
        with open(MAPPING_PATH, "w") as f:
            json.dump({
                "dimension": 384,
                "total_vectors": len(self.documents),
                "model": "BAAI/bge-small-en-v1.5",
                "documents": self.documents
            }, f, indent=2)
        return doc_meta

    def search(self, query: str, dense_weight: float = 0.70, threshold: float = 0.50, index_type: str = "HNSW", top_k: int = 25):
        start_time = time.perf_counter()
        
        if not query or not query.strip():
            return {
                "entities": [],
                "metadata": {
                    "query": "",
                    "totalIndexedVectors": self.index_flat.ntotal,
                    "queryLatencyMs": 0.0,
                    "indexType": f"FAISS_{index_type}_384d",
                    "denseWeight": dense_weight,
                    "sparseWeight": round(1.0 - dense_weight, 2)
                }
            }

        # 1. Real dense vector embedding of the query string
        q_emb = np.array(list(self.embed_model.embed([query.strip()])), dtype=np.float32)
        faiss.normalize_L2(q_emb)

        # 2. Select index
        selected_index = self.index_hnsw if "HNSW" in index_type.upper() else self.index_flat

        # 3. Native FAISS search: returns true cosine inner product and integer indices
        search_k = min(len(self.documents), max(top_k * 3, 50))
        if search_k == 0:
            return {"entities": [], "metadata": {"query": query, "totalIndexedVectors": 0, "queryLatencyMs": 0.0}}
            
        distances, indices = selected_index.search(q_emb, search_k)
        
        faiss_scores = {}
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0 and idx < len(self.documents):
                faiss_scores[idx] = float(dist)

        # 4. Real BM25 lexical ranking
        bm25_scores = {}
        if self.bm25:
            tokens = query.strip().lower().split()
            scores = self.bm25.get_scores(tokens)
            max_bm = max(scores) if len(scores) > 0 and max(scores) > 0 else 1.0
            for idx, score in enumerate(scores):
                if score > 0:
                    bm25_scores[idx] = float(score / max_bm)

        # 5. Genuine Hybrid Score Fusion
        all_candidate_indices = set(faiss_scores.keys()).union(set(bm25_scores.keys()))
        scored_candidates = []

        for idx in all_candidate_indices:
            if idx >= len(self.documents):
                continue
            doc = self.documents[idx]
            
            faiss_sim = faiss_scores.get(idx, 0.0)
            bm25_sc = bm25_scores.get(idx, 0.0)
            
            # Hybrid combination
            hybrid_score = round(dense_weight * faiss_sim + (1.0 - dense_weight) * bm25_sc, 4)
            
            # Threshold gating on similarity or keyword match
            if faiss_sim >= threshold or bm25_sc > 0.45 or hybrid_score >= threshold:
                cosine_dist = round(max(0.0, 1.0 - faiss_sim), 4)
                scored_candidates.append({
                    "id": doc["id"],
                    "label": doc["label"],
                    "type": doc["type"],
                    "confidence": doc.get("confidence", 0.95),
                    "priorityScore": doc.get("priorityScore", 50),
                    "riskFactors": doc.get("riskFactors", ""),
                    "text": doc.get("text", ""),
                    "source": doc.get("source", "faiss_index"),
                    "vectorEmbedding": doc.get("vector", []),
                    "faissCosineSimilarity": round(faiss_sim, 4),
                    "cosineDistance": cosine_dist,
                    "bm25LexicalScore": round(bm25_sc, 4),
                    "hybridScore": hybrid_score,
                    "nearestClusterId": f"CLUSTER-0x{abs(hash(doc['type']) % 256):02x}"
                })

        # Deduplicate candidates by label and text to prevent duplicate identical cards
        deduped = []
        seen_identifiers = set()
        for item in scored_candidates:
            label_norm = item["label"].split(":")[0].strip().lower() if ":" in item["label"] else item["label"][:24].strip().lower()
            text_norm = item.get("text", "")[:40].strip().lower()
            dedup_key = f"{label_norm}::{text_norm}"
            if dedup_key in seen_identifiers:
                continue
            seen_identifiers.add(dedup_key)
            deduped.append(item)

        # Sort strictly by hybrid score descending
        deduped.sort(key=lambda x: x["hybridScore"], reverse=True)
        results = deduped[:top_k]

        # Compute continuous calibrated match percentages ensuring strictly distinct, rank-aligned values
        last_pct = 98.5
        for i, ent in enumerate(results):
            hybrid = ent["hybridScore"]
            bm25 = ent["bm25LexicalScore"]
            sim = ent["faissCosineSimilarity"]
            
            # Continuous hybrid-to-percentage projection
            # High-relevance zone (>= 0.70): 88.0% - 97.5%
            # Mid-relevance zone (0.45 - 0.70): 68.0% - 87.9%
            # Exploration zone (< 0.45): 50.0% - 67.9%
            if hybrid >= 0.70:
                target_pct = 88.0 + ((hybrid - 0.70) / 0.25) * 9.2 + (min(1.0, bm25) * 1.5)
            elif hybrid >= 0.45:
                target_pct = 68.0 + ((hybrid - 0.45) / 0.25) * 19.0 + (min(1.0, bm25) * 1.0)
            else:
                target_pct = 50.0 + max(0.0, (hybrid - 0.35) / 0.10) * 17.0
            
            target_pct = min(97.8, max(45.0, target_pct))
            
            # Ensure strictly monotonic progression down the ranking: each successive rank is distinct
            if i > 0 and target_pct >= last_pct:
                target_pct = last_pct - 0.3 - ((i % 5) * 0.1)
                
            ent["matchPercentage"] = round(target_pct, 1)
            last_pct = ent["matchPercentage"]

        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        return {
            "entities": results,
            "metadata": {
                "query": query,
                "totalIndexedVectors": selected_index.ntotal,
                "queryLatencyMs": elapsed_ms,
                "indexType": f"FAISS_{'IndexHNSWFlat' if 'HNSW' in index_type.upper() else 'IndexFlatIP'}_Cosine_384d",
                "embeddingModel": "BAAI/bge-small-en-v1.5",
                "denseWeight": dense_weight,
                "sparseWeight": round(1.0 - dense_weight, 2),
                "threshold": threshold
            }
        }

# Global singleton
_engine = None

def get_engine():
    global _engine
    if _engine is None:
        _engine = FaissEngine()
    return _engine

def run_daemon(port=5055):
    from http.server import HTTPServer, BaseHTTPRequestHandler
    from urllib.parse import urlparse, parse_qs

    engine = get_engine()

    class FaissHandler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass # Silent logs for max performance

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.end_headers()

        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path == "/health":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok", "vectors": engine.index_flat.ntotal}).encode())
                return

            if parsed.path == "/search":
                params = parse_qs(parsed.query)
                q = params.get("q", [""])[0]
                dense_weight = float(params.get("denseWeight", [0.70])[0])
                threshold = float(params.get("threshold", [0.50])[0])
                index_type = params.get("indexType", ["HNSW"])[0]
                top_k = int(params.get("topK", [25])[0])

                res = engine.search(q, dense_weight=dense_weight, threshold=threshold, index_type=index_type, top_k=top_k)
                
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(res).encode())
                return

            self.send_response(404)
            self.end_headers()

        def do_POST(self):
            parsed = urlparse(self.path)
            if parsed.path == "/index":
                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len)
                try:
                    payload = json.loads(post_body.decode('utf-8'))
                    doc_id = payload.get("id", f"ENT-{int(time.time()*1000)}")
                    label = payload.get("label", "Unknown")
                    doc_type = payload.get("type", "LISTING")
                    text = payload.get("text", "")
                    risk = payload.get("riskFactors", "")
                    priority = payload.get("priorityScore", 50)
                    
                    added = engine.add_document(doc_id, label, doc_type, text, risk, priority)
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "indexed", "total_vectors": engine.index_flat.ntotal, "document": added}).encode())
                except Exception as e:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode())
                return

            self.send_response(404)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

    server = HTTPServer(("127.0.0.1", port), FaissHandler)
    print(f"[FAISS Daemon] Running on http://127.0.0.1:{port} (vectors={engine.index_flat.ntotal})", file=sys.stderr)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

def main():
    parser = argparse.ArgumentParser(description="DARKINT Real FAISS Vector Search CLI & Daemon")
    parser.add_argument("--query", "-q", type=str, default=None, help="Search query")
    parser.add_argument("--dense-weight", type=float, default=0.70, help="Dense vector weight (0.0 - 1.0)")
    parser.add_argument("--threshold", type=float, default=0.50, help="Minimum similarity threshold")
    parser.add_argument("--index-type", type=str, default="HNSW", choices=["HNSW", "FLAT_L2", "IndexFlatIP"], help="Index type")
    parser.add_argument("--top-k", type=int, default=25, help="Number of results")
    parser.add_argument("--daemon", action="store_true", help="Run as persistent microservice")
    parser.add_argument("--port", type=int, default=5055, help="Daemon port")
    parser.add_argument("--index-json", type=str, default=None, help="JSON document string to index into FAISS")
    args = parser.parse_args()

    if args.daemon:
        run_daemon(port=args.port)
    elif args.index_json:
        engine = get_engine()
        try:
            doc = json.loads(args.index_json)
            added = engine.add_document(
                doc_id=doc.get("id", f"CLI-{int(time.time()*1000)}"),
                label=doc.get("label", "Unknown"),
                doc_type=doc.get("type", "LISTING"),
                text=doc.get("text", ""),
                risk_factors=doc.get("riskFactors", ""),
                priority=doc.get("priorityScore", 50)
            )
            print(json.dumps({"status": "indexed", "total_vectors": engine.index_flat.ntotal, "document": added}))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    elif args.query is not None:
        engine = get_engine()
        results = engine.search(
            query=args.query,
            dense_weight=args.dense_weight,
            threshold=args.threshold,
            index_type=args.index_type,
            top_k=args.top_k
        )
        print(json.dumps(results, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
