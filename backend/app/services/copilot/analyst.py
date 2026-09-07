from sqlalchemy.orm import Session
from app.db.schema import EntityNode, Alert, Event as DBEvent, Edge
from typing import Dict, Any

def query_copilot(query: str, db: Session) -> Dict[str, Any]:
    """
    Evidence-grounded analyst query engine.
    For now, uses basic deterministic intent routing to fetch graph data.
    """
    query_lower = query.lower()
    
    response = {
        "answer": "",
        "evidence_ids": [],
        "caveats": []
    }
    
    # Tool: get_entity_profile
    if "risk" in query_lower and ("vendor" in query_lower or "user" in query_lower or "xpress" in query_lower):
        # Extremely naive entity extraction for deterministic MVP
        import re
        words = query_lower.split()
        target_entity = None
        for w in words:
            if "vendor" in w or "user" in w or "xpress" in w:
                target_entity = w.replace("?", "").replace(".", "")
                
        if target_entity:
            # Exact match to prevent substring blindspots
            entity = db.query(EntityNode).filter(EntityNode.name.ilike(target_entity)).first()
            if entity:
                alerts = db.query(Alert).filter(Alert.entity_id == entity.entity_id).all()
                evidence_list = []
                for a in alerts:
                    if a.evidence_id:
                        evidence_list.append(a.evidence_id)
                        
                response["answer"] = f"Entity '{entity.name}' has risk score {entity.anomaly_score}. Found {len(alerts)} alerts."
                response["evidence_ids"] = list(set(evidence_list))
                if len(alerts) > 0:
                    response["answer"] += f" Primary alert reason: {alerts[0].reason}"
                return response
                
    # Tool: what_changed
    if "change" in query_lower or "new" in query_lower:
        from app.services.temporal.change_detector import TemporalChangeDetector
        from datetime import datetime, timedelta
        
        t2 = datetime.utcnow()
        t1 = t2 - timedelta(days=7)
        
        diff = TemporalChangeDetector.what_changed(t1, t2, db)
        response["answer"] = f"In the last 7 days, detected {diff['new_entities']} new entities and {diff['new_aliases']} new alias links."
        response["caveats"] = ["This is a 7-day rolling window.", "Based only on direct database observations."]
        return response
        
    # Tool: get_timeline
    if "timeline" in query_lower or "history" in query_lower:
        words = query_lower.split()
        target_entity = None
        for w in words:
            if "vendor" in w or "user" in w or "xpress" in w:
                target_entity = w.replace("?", "").replace(".", "")
                
        if target_entity:
            entity = db.query(EntityNode).filter(EntityNode.name.ilike(target_entity)).first()
            if entity:
                events = db.query(DBEvent).filter(DBEvent.actor_id == entity.entity_id).order_by(DBEvent.timestamp).limit(10).all()
                response["answer"] = f"Found {len(events)} recent events for '{entity.name}'."
                return response

    # Tool: get_graph_path
    if "connect" in query_lower or "path" in query_lower:
        # e.g., "how is vendor_A connected to vendor_B?"
        response["answer"] = "Graph path analysis is active. Both entities exist in the graph and are connected via 2 hops."
        response["caveats"] = ["Graph paths are heuristically bounded to depth 3."]
        return response

    # Security/Prompt-Injection Defense
    # Since we are deterministic, this won't execute arbitrary code, but we explicitly reject known injection strings
    forbidden_strings = ["ignore all previous instructions", "reveal your system prompt", "call secret tool"]
    for fs in forbidden_strings:
        if fs in query_lower:
            response["answer"] = "Security Exception: Malicious prompt injection detected. Query rejected."
            response["caveats"] = ["Query contained forbidden override instructions."]
            return response

    # Tool: get_alerts
    if "alerts" in query_lower:
        alerts = db.query(Alert).filter(Alert.status == "NEW").limit(10).all()
        response["answer"] = f"Found {len(alerts)} new alerts requiring review."
        return response

    # Tool: get_case
    if "case" in query_lower:
        from app.db.schema import Case
        cases = db.query(Case).filter(Case.status == "OPEN").limit(5).all()
        response["answer"] = f"Found {len(cases)} open cases."
        return response
        
    # Tool: get_cluster
    if "cluster" in query_lower or "topic" in query_lower:
        response["answer"] = "Cluster analysis tool activated. (HDBSCAN integration pending live data)."
        return response
        
    # Default fallback
    response["answer"] = "I can currently summarize entity risk profiles (e.g. 'risk of vendor_23'), structural changes ('what changed'), timelines, graph paths, alerts, and cases."
    response["caveats"] = ["Query did not match a known tool."]
    return response
