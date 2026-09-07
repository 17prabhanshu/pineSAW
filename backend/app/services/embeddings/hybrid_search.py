from rank_bm25 import BM25Okapi
import numpy as np
import os
import json
import pickle
from app.services.embeddings.semantic_search import vector_db, model as dense_model

class HybridRetriever:
    def __init__(self, storage_dir="artifacts/indexes"):
        self.storage_dir = storage_dir
        self.corpus_path = os.path.join(storage_dir, "bm25_corpus.pkl")
        self.doc_ids_path = os.path.join(storage_dir, "bm25_doc_ids.json")
        
        self.corpus = []
        self.doc_ids = []
        self.bm25 = None
        
        os.makedirs(self.storage_dir, exist_ok=True)
        self.load()
        
    def load(self):
        if os.path.exists(self.corpus_path) and os.path.exists(self.doc_ids_path):
            try:
                with open(self.corpus_path, "rb") as f:
                    self.corpus = pickle.load(f)
                with open(self.doc_ids_path, "r") as f:
                    self.doc_ids = json.load(f)
                if self.corpus:
                    self.bm25 = BM25Okapi(self.corpus)
            except Exception as e:
                print(f"Failed to load BM25 index: {e}")
                
    def save(self):
        with open(self.corpus_path, "wb") as f:
            pickle.dump(self.corpus, f)
        with open(self.doc_ids_path, "w") as f:
            json.dump(self.doc_ids, f)

    def add_text(self, text: str, event_id: str):
        vector_db.add_text(text, event_id)
        
        self.corpus.append(text.lower().split())
        self.doc_ids.append(event_id)
        self.bm25 = BM25Okapi(self.corpus)
        self.save()
        
    def search(self, query: str, k: int = 10):
        if not self.bm25:
            return []
            
        tokenized_query = query.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)
        
        bm25_results = []
        max_score = max(bm25_scores) if max(bm25_scores) > 0 else 1.0
        
        for i, score in enumerate(bm25_scores):
            if score > 0:
                bm25_results.append({
                    "id": self.doc_ids[i],
                    "score": score / max_score
                })
                
        dense_results = vector_db.search_similar(query, k=k*2)
        
        rrf_k = 60
        fused_scores = {}
        
        bm25_results.sort(key=lambda x: x["score"], reverse=True)
        for rank, res in enumerate(bm25_results):
            fused_scores[res["id"]] = fused_scores.get(res["id"], 0) + (1.0 / (rrf_k + rank + 1))
            
        for rank, res in enumerate(dense_results):
            fused_scores[res["id"]] = fused_scores.get(res["id"], 0) + (1.0 / (rrf_k + rank + 1))
            
        final_results = []
        
        # Normalize RRF scores to [0, 1] so they can be used in linear combinations
        max_rrf = max(fused_scores.values()) if fused_scores else 1.0
        
        for doc_id, score in fused_scores.items():
            final_results.append({
                "id": doc_id,
                "score": score / max_rrf
            })
            
        final_results.sort(key=lambda x: x["score"], reverse=True)
        return final_results[:k]

hybrid_retriever = HybridRetriever()
