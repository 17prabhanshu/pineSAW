from datetime import datetime, timedelta
import math
from app.db.schema import EntityNode, Edge
from sqlalchemy.orm import Session

class TemporalChangeDetector:
    @staticmethod
    def what_changed(t1: datetime, t2: datetime, db: Session) -> dict:
        """
        Deterministic graph and activity diff between t1 and t2.
        """
        # Entities created between t1 and t2
        new_entities = db.query(EntityNode).filter(
            EntityNode.created_at >= t1,
            EntityNode.created_at <= t2
        ).all()
        
        # Edges created between t1 and t2
        new_edges = db.query(Edge).filter(
            Edge.observed_at >= t1,
            Edge.observed_at <= t2
        ).all()
        
        new_aliases = [e for e in new_edges if e.relation_type in ["SAME_AS", "POTENTIALLY_SAME_AS"]]
        new_sources = [e for e in new_edges if e.relation_type == "POSTED_ON"]
        
        return {
            "new_entities": len(new_entities),
            "new_aliases": len(new_aliases),
            "new_sources": len(new_sources),
            "new_relationships": len(new_edges),
            "details": {
                "new_entities_sample": [e.name for e in new_entities[:5]],
                "new_aliases_sample": [{"source": e.source_id, "target": e.target_id} for e in new_aliases[:5]]
            }
        }

    @staticmethod
    def detect_changes(events: list, current_window_days: int = 7, baseline_window_days: int = 30) -> list:
        if not events:
            return []
            
        now = max(e.timestamp for e in events if e.timestamp)
        current_start = now - timedelta(days=current_window_days)
        baseline_start = current_start - timedelta(days=baseline_window_days)
        
        # Count activity per entity
        current_counts = {}
        baseline_counts = {}
        
        for e in events:
            if not e.timestamp: continue
            actor = e.actor_id
            if e.timestamp >= current_start:
                current_counts[actor] = current_counts.get(actor, 0) + 1
            elif e.timestamp >= baseline_start:
                baseline_counts[actor] = baseline_counts.get(actor, 0) + 1
                
        # Calculate deviations
        changes = []
        for actor, c_count in current_counts.items():
            b_count = baseline_counts.get(actor, 0)
            
            c_rate = c_count / current_window_days
            b_rate = b_count / baseline_window_days if baseline_window_days > 0 else 0
            
            if b_rate == 0 and c_rate > 0:
                deviation_pct = 100.0 # Just a marker for "new"
                event_type = "NEW_ENTITY_ACTIVITY"
            elif b_rate > 0:
                deviation_pct = ((c_rate - b_rate) / b_rate) * 100
                if deviation_pct > 100:
                    event_type = "ACTIVITY_SPIKE"
                elif deviation_pct < -50:
                    event_type = "ACTIVITY_DROP"
                else:
                    event_type = "NORMAL"
            else:
                continue
                
            if event_type != "NORMAL":
                changes.append({
                    "entity_id": actor,
                    "event_type": event_type,
                    "baseline_rate": b_rate,
                    "current_rate": c_rate,
                    "deviation_pct": deviation_pct
                })
                
        return changes
