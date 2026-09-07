import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# Load a lightweight model for embeddings
# In production, we'd use BAAI/bge-small-en-v1.5
MODEL_NAME = "BAAI/bge-small-en-v1.5"
model = SentenceTransformer(MODEL_NAME)
EMBEDDING_DIM = model.get_sentence_embedding_dimension()

class VectorIndex:
    def __init__(self, index_path="artifacts/indexes/faiss_index.bin"):
        self.index_path = index_path
        self.mapping_path = index_path.replace(".bin", "_mapping.json")
        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.id_to_event = {}
        self._current_id = 0
        
        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        
        if os.path.exists(index_path):
            try:
                self.index = faiss.read_index(index_path)
                import json
                if os.path.exists(self.mapping_path):
                    with open(self.mapping_path, "r") as f:
                        mapping = json.load(f)
                        self.id_to_event = {int(k): v for k, v in mapping.items()}
                        self._current_id = max(self.id_to_event.keys()) + 1 if self.id_to_event else 0
            except Exception as e:
                print(f"Could not read index: {e}")

    def add_text(self, text: str, event_id: str):
        embedding = model.encode([text])
        faiss.normalize_L2(embedding)
        self.index.add(embedding)
        self.id_to_event[self._current_id] = event_id
        self._current_id += 1
        self.save()
        
    def search_similar(self, query: str, k: int = 5):
        if self.index.ntotal == 0:
            return []
            
        embedding = model.encode([query])
        faiss.normalize_L2(embedding)
        distances, indices = self.index.search(embedding, k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx != -1 and idx in self.id_to_event:
                results.append({
                    "id": self.id_to_event[idx],
                    "text": query, # Technically we should fetch text from DB, mocking here
                    "score": float(1 / (1 + dist))
                })
        return results
        
    def save(self):
        faiss.write_index(self.index, self.index_path)
        import json
        with open(self.mapping_path, "w") as f:
            json.dump(self.id_to_event, f)

vector_db = VectorIndex()
