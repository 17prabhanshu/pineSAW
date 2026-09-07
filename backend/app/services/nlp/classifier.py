import os
import joblib
from gliner import GLiNER
import re
from typing import Dict, Any, List

# Load GLiNER model (CPU friendly, zero-shot NER)
# Fallback to regex if we can't load it for some reason
try:
    gliner_model = GLiNER.from_pretrained("urchade/gliner_small-v2.1")
except Exception as e:
    gliner_model = None
    print(f"GLiNER not loaded: {e}")

# Labels for GLiNER zero-shot extraction
LABELS = ["vendor", "product", "substance", "wallet", "contact handle", "platform", "location"]

# ML Model Paths
MODEL_PATH = "artifacts/models/risk_classifier.joblib"
VECTORIZER_PATH = "artifacts/models/tfidf_vectorizer.joblib"

# Fallback keywords for baseline explainability
ILLICIT_KEYWORDS = [
    "oxycontin", "fentanyl", "xanax", "mdma", "adderall", 
    "cocaine", "heroin", "lsd", "meth", "shrooms", "ketamine",
    "stealth packaging", "wickr", "telegram", "escrow", "vendor",
    "top quality", "fast shipping"
]

def classify_text(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    matches = [kw for kw in ILLICIT_KEYWORDS if kw in text_lower]
    
    anomaly_score = 0.0
    model_version = "v1-heuristic"
    
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            classifier = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
            X = vectorizer.transform([text])
            prob = classifier.predict_proba(X)[0][1] # Probability of class 1 (Suspicious)
            anomaly_score = float(prob)
            model_version = "v2-tfidf-lr"
        except Exception as e:
            print(f"Failed to run ML classifier, using fallback: {e}")
            if matches:
                anomaly_score = min(1.0, len(matches) * 0.2)
    else:
        if matches:
            anomaly_score = min(1.0, len(matches) * 0.2)

    return {
        "anomaly_score": anomaly_score,
        "matches": matches,
        "is_suspicious": anomaly_score > 0.5,
        "model_version": model_version
    }

def extract_entities(text: str) -> List[Dict[str, Any]]:
    entities = []
    
    # 1. GLiNER Semantic Extraction
    if gliner_model:
        try:
            preds = gliner_model.predict_entities(text, LABELS)
            for p in preds:
                if p["score"] > 0.6:
                    entities.append({
                        "type": p["label"].lower().replace(" ", "_"),
                        "value": p["text"],
                        "confidence": float(p["score"])
                    })
        except Exception as e:
            print(f"GLiNER prediction failed: {e}")
            
    # 2. Regex Validation / Fallback
    btc_matches = re.findall(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', text)
    for w in btc_matches:
        if not any(e["value"] == w for e in entities):
            entities.append({"type": "wallet", "value": w, "confidence": 0.95})
            
    wickr_matches = re.findall(r'wickr(?: me)? at ([a-zA-Z0-9_]+)', text.lower())
    for w in wickr_matches:
        if not any(e["value"] == w for e in entities):
            entities.append({"type": "contact_handle", "value": w, "confidence": 0.90})
            
    return entities

def extract_relations(text: str, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract relationships (e.g. VENDOR -> SELLS -> PRODUCT)
    Since we are using GLiNER small which doesn't do triplet extraction natively, 
    we heuristically link entities found in the same textual context/sentence.
    """
    relations = []
    
    # Group entities by type
    vendors = [e for e in entities if e['type'] == 'vendor' or e['type'] == 'contact_handle']
    products = [e for e in entities if e['type'] == 'product' or e['type'] == 'substance']
    wallets = [e for e in entities if e['type'] == 'wallet']
    platforms = [e for e in entities if e['type'] == 'platform']
    
    text_lower = text.lower()
    
    # VENDOR -> SELLS -> PRODUCT
    for v in vendors:
        for p in products:
            # Check if they are near each other or in the same sentence
            # Simple heuristic: if the text implies a transaction
            if 'sell' in text_lower or 'price' in text_lower or 'stock' in text_lower:
                relations.append({
                    "source": v['value'],
                    "target": p['value'],
                    "relation": "SELLS",
                    "confidence": 0.8
                })
                
        # VENDOR -> REFERENCES -> WALLET
        for w in wallets:
            relations.append({
                "source": v['value'],
                "target": w['value'],
                "relation": "REFERENCES",
                "confidence": 0.9
            })
            
        # VENDOR -> POSTS_IN -> PLATFORM
        for plat in platforms:
            relations.append({
                "source": v['value'],
                "target": plat['value'],
                "relation": "POSTS_IN",
                "confidence": 0.85
            })
            
    return relations
