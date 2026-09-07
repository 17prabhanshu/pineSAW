from app.services.embeddings.hybrid_search import hybrid_retriever
from app.services.entity_resolution.stylometry import StylometryExtractor
from app.services.entity_resolution.behavior import BehaviorExtractor
from sqlalchemy.orm import Session
from app.db.schema import EntityNode, Event as DBEvent
from typing import Dict, Any, List
import uuid

def get_candidate_matches(text: str, current_platform: str = "Unknown", entity_id: str = None, db: Session = None) -> List[Dict[str, Any]]:
    """
    True Multi-Signal Entity Resolution.
    1. Candidate Generation via Hybrid Retrieval (BM25 + Dense)
    2. Entity-Level Aggregation (Centroids)
    3. Stylometric & Behavioral Scoring
    4. Calibrated Thresholding with Open-Set Rejection
    """
    
    # 1. Candidate Generation (Document Level)
    doc_candidates = hybrid_retriever.search(text, k=20)
    
    if not db:
        return []
        
    # Extract features for the new listing
    new_stylometry = StylometryExtractor.extract_aggregate_profile([text])
    
    # Fake a new event structure to compare behavior if we had one
    new_behavior = BehaviorExtractor.extract_features([]) # Can't do much with 1 event for behavior
    
    # 2. Entity-Level Aggregation
    entity_scores = {}
    for doc in doc_candidates:
        # Find which entity posted this doc (event)
        event = db.query(DBEvent).filter(DBEvent.event_id == doc["id"]).first()
        
        # Prevent self-retrieval (L2 approx 0.0) and prevent linking to the exact same actor identity
        if not event or event.actor_id == entity_id:
            continue
            
        actor_id = event.actor_id
        if actor_id not in entity_scores:
            entity_scores[actor_id] = doc["score"]
        else:
            entity_scores[actor_id] = max(entity_scores[actor_id], doc["score"])
            
    links = []
    
    for cand_actor_id, semantic_score in entity_scores.items():
        # Retrieve all historic events for this candidate
        historical_events = db.query(DBEvent).filter(DBEvent.actor_id == cand_actor_id).all()
        hist_texts = [e.content_text for e in historical_events if e.content_text]
        
        # 3. Stylometric Score (against full entity corpus)
        cand_stylometry = StylometryExtractor.extract_aggregate_profile(hist_texts)
        stylo_score = StylometryExtractor.compare_profiles(new_stylometry, cand_stylometry)
        
        # 4. Behavioral Score
        behavior_events = [{"timestamp": e.timestamp, "platform": e.platform_type} for e in historical_events]
        cand_behavior = BehaviorExtractor.extract_features(behavior_events)
        beh_score = BehaviorExtractor.compare_profiles(new_behavior, cand_behavior)
        
        # 5. Fusion and Calibration via Learned Classifier
        final_confidence = 0.0
        try:
            import joblib
            import os
            import numpy as np
            model_path = "artifacts/models/er_classifier.joblib"
            if os.path.exists(model_path):
                clf = joblib.load(model_path)
                features = np.array([[semantic_score, stylo_score, beh_score, cand_stylometry.get('observation_count', 0)]])
                
                # Probability of class 1 (SAME_AS)
                prob = clf.predict_proba(features)[0][1]
                final_confidence = float(prob)
            else:
                # Fallback if model not trained yet
                final_confidence = (semantic_score * 0.6) + (stylo_score * 0.3) + (beh_score * 0.1)
                if cand_stylometry.get('observation_count', 0) < 3:
                    final_confidence *= 0.8
        except Exception:
            final_confidence = (semantic_score * 0.6) + (stylo_score * 0.3) + (beh_score * 0.1)
            if cand_stylometry.get('observation_count', 0) < 3:
                final_confidence *= 0.8
            
        # Open-Set Rejection Logic
        if final_confidence > 0.85:
            link_class = "KNOWN"
            rel = "SAME_AS"
        elif final_confidence > 0.70:
            link_class = "LIKELY MATCH"
            rel = "POTENTIALLY_SAME_AS"
        else:
            # NO SUFFICIENT MATCH
            continue
            
        links.append({
            "candidate": cand_actor_id,
            "relationship": rel,
            "link_class": link_class,
            "confidence": final_confidence,
            "signals": {
                "semantic": semantic_score,
                "stylometric": stylo_score,
                "behavior": beh_score
            }
        })
            
    # Sort by confidence
    links.sort(key=lambda x: x["confidence"], reverse=True)
    return links
