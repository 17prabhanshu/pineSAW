import hashlib
from typing import List, Dict

class EvidenceEngine:
    """
    DARKINT V3.9 Evidence Independence & Provenance Engine.
    Computes source independence and detects contradictory relationships.
    """
    
    @staticmethod
    def compute_content_hash(text: str) -> str:
        """Computes a SHA-256 hash of the normalized content to detect exact copies."""
        if not text:
            return ""
        normalized = " ".join(text.lower().split())
        return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

    @staticmethod
    def process_evidence_group(events: List[Dict]) -> Dict:
        """
        V4.0 Source Independence & Contradiction Engine.
        Returns the processed events and the group-level metrics (Effective-N).
        """
        processed = []
        seen_hashes = {}
        
        raw_n = len(events)
        effective_n = 0.0
        independent_sources = set()
        
        for ev in events:
            content_hash = EvidenceEngine.compute_content_hash(ev.get('content_text', ''))
            source_actor = ev.get('actor_id')
            entity_id = ev.get('entity_id')
            explicit_conflict = ev.get('explicit_conflict', False)
            
            independence = 1.0
            evidence_type = "DIRECT_OBSERVATION"
            
            if content_hash in seen_hashes:
                prev_ev = seen_hashes[content_hash]
                
                # Same hash, different entity is merely POTENTIAL_ATTRIBUTION_CONFLICT 
                # unless explicitly flagged as a contradiction
                if entity_id != prev_ev.get('entity_id'):
                    if explicit_conflict:
                        evidence_type = "DIRECT_CONTRADICTION"
                        independence = 1.0 # True independent conflict
                    else:
                        evidence_type = "POTENTIAL_ATTRIBUTION_CONFLICT"
                        independence = 0.5 
                else:
                    evidence_type = "DUPLICATE_CONTENT"
                    independence = 0.0 # Exact copy yields zero new signal
                    
            elif source_actor and source_actor in independent_sources:
                evidence_type = "CORROBORATION"
                independence = 0.1 # Same actor repeating themselves, low independence
                
            seen_hashes[content_hash] = {
                'entity_id': entity_id,
                'actor_id': source_actor
            }
            
            if source_actor:
                independent_sources.add(source_actor)
                
            effective_n += independence
            
            ev_copy = ev.copy()
            ev_copy['source_independence'] = independence
            ev_copy['evidence_type'] = evidence_type
            ev_copy['content_hash'] = content_hash
            processed.append(ev_copy)
            
        return {
            "events": processed,
            "metrics": {
                "raw_N": raw_n,
                "effective_N": effective_n,
                "independent_source_count": len(independent_sources)
            }
        }
