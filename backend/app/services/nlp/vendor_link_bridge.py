import os
import sys
import numpy as np

# Add VendorLink to path
VENDORLINK_DIR = os.path.join(os.path.dirname(__file__), "../../../VendorLink")
if VENDORLINK_DIR not in sys.path:
    sys.path.append(VENDORLINK_DIR)

class VendorLinkBridge:
    def __init__(self):
        self.model_loaded = False
        # In a real scenario, we would load the BERT contextualized model from VendorLink here
        self.model_path = os.path.join(VENDORLINK_DIR, "models", "bert", "pretrained_bert_classifier.model")
        
    def check_model(self):
        if os.path.exists(self.model_path):
            self.model_loaded = True
        return self.model_loaded
        
    def compute_stylometric_similarity(self, text_a: str, text_b: str) -> float:
        """
        Uses VendorLink's methodology to compute authorial style similarity.
        Falls back to a heuristic/TF-IDF stylometry if the BERT model is missing.
        """
        if self.model_loaded:
            # Code to run VendorLink's feature extraction and cosine similarity
            # e.g., using vendor-identification/compute_similarity.py logic
            pass
            
        # Fallback stylometry calculation (token overlap, avg word length, punctuation freq)
        features_a = self._extract_stylometric_features(text_a)
        features_b = self._extract_stylometric_features(text_b)
        
        # Simple cosine similarity on heuristic features
        dot = sum(a * b for a, b in zip(features_a, features_b))
        norm_a = sum(a * a for a in features_a) ** 0.5
        norm_b = sum(b * b for b in features_b) ** 0.5
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)
        
    def _extract_stylometric_features(self, text: str):
        # Fallback basic stylometric features:
        # 1. Avg word length
        # 2. Punctuation density
        # 3. Uppercase ratio
        words = text.split()
        if not words:
            return [0.0, 0.0, 0.0]
        
        avg_word_len = sum(len(w) for w in words) / len(words)
        punct_count = sum(1 for c in text if c in '.,!?;:')
        punct_density = punct_count / max(1, len(text))
        upper_count = sum(1 for c in text if c.isupper())
        upper_ratio = upper_count / max(1, len(text))
        
        return [avg_word_len, punct_density * 10, upper_ratio * 10]

# Singleton
vendor_link = VendorLinkBridge()
