#!/usr/bin/env python3
"""
Real FAISS Vector Index & BM25 Corpus Builder for DARKINT
Uses Meta AI's native FAISS (IndexFlatIP & IndexHNSWFlat) + BAAI/bge-small-en-v1.5 (384-dim)
"""

import os
import sys
import json
import sqlite3
import pickle
import time
import numpy as np
import faiss
from fastembed import TextEmbedding
from rank_bm25 import BM25Okapi

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DB_PATH = os.path.join(BASE_DIR, "prisma", "dev.db")
DEMO_DATA_PATH = os.path.join(BASE_DIR, "backend", "artifacts", "demo_data.json")

FLAT_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index_flat.bin")
HNSW_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index_hnsw.bin")
MAPPING_PATH = os.path.join(DATA_DIR, "faiss_mapping.json")
BM25_PATH = os.path.join(DATA_DIR, "bm25_corpus.pkl")

def load_entities_from_db():
    entities = []
    if not os.path.exists(DB_PATH):
        print(f"Warning: Database {DB_PATH} not found.")
        return entities
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, type, label, confidence, priorityScore, riskFactors FROM Entity")
        for row in cursor.fetchall():
            risk_factors = []
            if row[5]:
                try:
                    risk_factors = json.loads(row[5])
                except Exception:
                    risk_factors = [str(row[5])]
                    
            risk_text = " ".join(risk_factors) if isinstance(risk_factors, list) else str(risk_factors)
            full_text = f"{row[2]} ({row[1]}) priority {row[4]} risk indicators: {risk_text}"
            
            entities.append({
                "id": row[0],
                "type": row[1],
                "label": row[2],
                "confidence": float(row[3]),
                "priorityScore": int(row[4]),
                "riskFactors": risk_text,
                "text": full_text,
                "source": "sqlite_database"
            })
    except Exception as e:
        print(f"Error reading SQLite entities: {e}")
    finally:
        conn.close()
    return entities

def load_demo_data():
    items = []
    if os.path.exists(DEMO_DATA_PATH):
        try:
            with open(DEMO_DATA_PATH, "r") as f:
                data = json.load(f)
                for item in data:
                    text = item.get("content", {}).get("text", "")
                    actor = item.get("actor", {}).get("display_name", "Anonymous Vendor")
                    platform = item.get("platform_id", "Darknet Marketplace")
                    event_id = item.get("event_id", f"EVT-{len(items)}")
                    
                    full_text = f"Listing by {actor} on {platform}: {text}"
                    items.append({
                        "id": event_id,
                        "type": "LISTING",
                        "label": f"{actor}: {text[:48]}...",
                        "confidence": 0.94,
                        "priorityScore": 82,
                        "riskFactors": "Intercepted darknet listing",
                        "text": full_text,
                        "source": "darknet_market_corpus"
                    })
        except Exception as e:
            print(f"Error reading demo data: {e}")
    return items

def main():
    print("=" * 60)
    print("DARKINT: Building Production-Grade FAISS Vector Index")
    print("Model: BAAI/bge-small-en-v1.5 (384-dimensional dense space)")
    print("=" * 60)
    
    start_time = time.time()
    
    # 1. Gather all documents to index
    entities = load_entities_from_db()
    demo_items = load_demo_data()
    all_docs = entities + demo_items
    
    if not all_docs:
        print("Error: No documents available to index.")
        sys.exit(1)
        
    print(f"Loaded {len(entities)} entities from SQLite DB and {len(demo_items)} darknet records.")
    print(f"Total documents to embed & index: {len(all_docs)}")
    
    # 2. Compute true dense embeddings using fastembed (ONNX runtime)
    print("\nComputing dense neural embeddings...")
    embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    texts = [doc["text"] for doc in all_docs]
    
    raw_embeddings = list(embed_model.embed(texts))
    vectors = np.array(raw_embeddings, dtype=np.float32)
    dim = vectors.shape[1]
    
    print(f"Computed dense vectors: shape = {vectors.shape} (dim = {dim})")
    
    # 3. L2 Normalize for true Cosine Similarity via Inner Product
    faiss.normalize_L2(vectors)
    
    # 4. Build Exact Cosine Similarity Index (IndexFlatIP)
    index_flat = faiss.IndexFlatIP(dim)
    index_flat.add(vectors)
    faiss.write_index(index_flat, FLAT_INDEX_PATH)
    print(f"Built IndexFlatIP: {index_flat.ntotal} vectors -> {FLAT_INDEX_PATH}")
    
    # 5. Build Scalable Graph-Based ANN Index (IndexHNSWFlat)
    index_hnsw = faiss.IndexHNSWFlat(dim, 32, faiss.METRIC_INNER_PRODUCT)
    index_hnsw.hnsw.efSearch = 64
    index_hnsw.hnsw.efConstruction = 64
    index_hnsw.add(vectors)
    faiss.write_index(index_hnsw, HNSW_INDEX_PATH)
    print(f"Built IndexHNSWFlat: {index_hnsw.ntotal} vectors -> {HNSW_INDEX_PATH}")
    
    # 6. Build and save BM25 Okapi lexical index
    tokenized_corpus = [doc["text"].lower().split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized_corpus)
    with open(BM25_PATH, "wb") as f:
        pickle.dump({
            "bm25": bm25,
            "corpus": tokenized_corpus,
            "doc_ids": [d["id"] for d in all_docs]
        }, f)
    print(f"Built BM25 Okapi lexical corpus -> {BM25_PATH}")
    
    # 7. Save mapping metadata with raw vector projections
    mapping = []
    for idx, doc in enumerate(all_docs):
        vec_list = vectors[idx].tolist()
        mapping.append({
            "index": idx,
            "id": doc["id"],
            "type": doc["type"],
            "label": doc["label"],
            "confidence": doc["confidence"],
            "priorityScore": doc["priorityScore"],
            "riskFactors": doc["riskFactors"],
            "text": doc["text"],
            "source": doc["source"],
            "vector": [round(v, 4) for v in vec_list[:12]],
            "vector_full_dim": dim
        })
        
    with open(MAPPING_PATH, "w") as f:
        json.dump({
            "dimension": dim,
            "total_vectors": len(mapping),
            "model": "BAAI/bge-small-en-v1.5",
            "created_at": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
            "documents": mapping
        }, f, indent=2)
    print(f"Saved vector metadata mapping -> {MAPPING_PATH}")
    
    elapsed = round(time.time() - start_time, 2)
    print("=" * 60)
    print(f"SUCCESS: Real FAISS indexes compiled in {elapsed}s.")
    print("=" * 60)

if __name__ == "__main__":
    main()
