from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.schema import EntityNode, Alert, Event as DBEvent
from app.models.domain import NormalizedEvent
from app.services.nlp.classifier import classify_text, extract_entities
from app.services.embeddings.hybrid_search import hybrid_retriever
from app.services.entity_resolution.linker import get_candidate_matches
from app.services.graph.manager import GraphManager
from app.services.temporal.analytics import get_temporal_risk_series
from app.services.copilot.analyst import query_copilot
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from typing import Optional

router = APIRouter()
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)


class IngestRequest(BaseModel):
    limit: int = 1000

@router.post("/pipeline/ingest/agora")
def api_ingest_agora(req: IngestRequest):
    from app.services.ingestion.agora_parser import ingest_agora_data
    result = ingest_agora_data(limit=req.limit)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

import threading

_training_lock = threading.Lock()
_is_training = False

@router.post("/analytics/graph/train-gnn")
@limiter.limit("2/minute")
def api_train_gnn(request: Request):
    global _is_training
    with _training_lock:
        if _is_training:
            raise HTTPException(status_code=409, detail="Training is already in progress.")
        _is_training = True
        
    try:
        from app.services.graph.gnn import train_gnn
        result = train_gnn()
        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    finally:
        with _training_lock:
            _is_training = False

@router.get("/analytics/graph/explain/{node_id}")
@limiter.limit("10/minute")
def api_explain_gnn(request: Request, node_id: str):
    from app.services.graph.gnn_explain import explain_anomaly_score
    result = explain_anomaly_score(node_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.get("/analytics/text/explain/{event_id}")
@limiter.limit("10/minute")
def api_explain_text(request: Request, event_id: str, db: Session = Depends(get_db)):
    """
    SHAP feature-level explanation for the heuristic text classifier score.
    Loads only the lightweight TF-IDF + LogReg artifacts (~5KB), not transformers.
    """
    event = db.query(DBEvent).filter(DBEvent.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    from app.services.nlp.text_explainer import explain_heuristic_score
    result = explain_heuristic_score(event.content_text)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.get("/analytics/text/explain-entity/{entity_id}")
@limiter.limit("10/minute")
def api_explain_text_by_entity(request: Request, entity_id: str, db: Session = Depends(get_db)):
    """
    SHAP explanation by entity_id. Finds the most recent ingested event for
    this actor and returns feature-level SHAP contributions for its text.
    """
    event = db.query(DBEvent).filter(DBEvent.actor_id == entity_id).order_by(DBEvent.created_at.desc()).first()
    if not event:
        raise HTTPException(status_code=404, detail="No events found for this entity")
    from app.services.nlp.text_explainer import explain_heuristic_score
    result = explain_heuristic_score(event.content_text)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    result["event_id"] = event.event_id
    return result

@router.post("/pipeline/ingest/osint")
def api_ingest_osint():
    from app.services.ingestion.osint_scraper import run_osint_scrape
    result = run_osint_scrape()
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

class CopilotQuery(BaseModel):
    query: str

@router.get("/analytics/temporal")
def get_temporal_analytics(db: Session = Depends(get_db)):
    return get_temporal_risk_series(db)

@router.get("/analytics/graph/centrality")
def get_graph_centrality(db: Session = Depends(get_db)):
    graph = GraphManager(db)
    return graph.get_centrality()

@router.post("/copilot/query")
def ask_copilot(query: CopilotQuery, db: Session = Depends(get_db)):
    result = query_copilot(query.query, db)
    return result

@router.post("/ingest")
def ingest_event(event: NormalizedEvent, db: Session = Depends(get_db)):
    graph = GraphManager(db)
    
    # 1. NLP Classification
    classification = classify_text(event.content.text)
    
    # 2. Entity Extraction
    entities = extract_entities(event.content.text)
    
    # 3. Add to Hybrid Retriever (FAISS + BM25)
    hybrid_retriever.add_text(event.content.text, event.event_id)
    
    # 4. Save Event to DB
    db_event = DBEvent(
        event_id=event.event_id,
        platform_type=event.platform_type,
        platform_id=event.platform_id,
        timestamp=event.timestamp,
        actor_id=event.actor.raw_id,
        content_text=event.content.text,
        content_lang=event.content.language,
        provenance=event.provenance.model_dump()
    )
    db.add(db_event)
    
    # Create Evidence for Classification
    from app.db.schema import Evidence
    ev_class = Evidence(
        evidence_id=f"EVD-CLASS-{uuid.uuid4().hex[:8]}",
        event_id=event.event_id,
        type="model_signal",
        confidence=classification["anomaly_score"],
        model_version=classification["model_version"]
    )
    db.add(ev_class)

    # Create an alert if suspicious
    if classification["is_suspicious"]:
        alert = Alert(
            alert_id=f"ALT-{uuid.uuid4().hex[:8]}",
            alert_type="HIGH_RISK_CONTENT",
            severity="HIGH",
            entity_id=event.actor.raw_id,
            reason=f"Suspicious terms found: {', '.join(classification['matches'])}",
            evidence_id=ev_class.evidence_id
        )
        db.add(alert)
        
    # Graph Building
    # Add Actor Node
    actor_node = graph.add_node(
        entity_id=event.actor.raw_id,
        entity_type="vendor" if classification["is_suspicious"] else "user",
        name=event.actor.display_name,
        anomaly_score=classification["anomaly_score"]
    )
    
    # Add Platform Node
    platform_node = graph.add_node(
        entity_id=event.platform_id,
        entity_type="platform",
        name=event.platform_id
    )
    
    # Edge Actor -> Platform
    graph.add_edge(actor_node.entity_id, platform_node.entity_id, "POSTED_ON", 1.0, [event.event_id], observed_at=event.timestamp)
    
    # Add Extracted Entity Nodes
    for ent in entities:
        ent_node = graph.add_node(
            entity_id=f"ENT-{ent['value']}",
            entity_type=ent["type"],
            name=ent["value"]
        )
        
        # Create Evidence for NER Extraction
        ev_ner = Evidence(
            evidence_id=f"EVD-NER-{uuid.uuid4().hex[:8]}",
            event_id=event.event_id,
            entity_id=ent_node.entity_id,
            type="gliner_extraction",
            confidence=ent["confidence"]
        )
        db.add(ev_ner)
        
        graph.add_edge(actor_node.entity_id, ent_node.entity_id, "MENTIONS", ent["confidence"], [ev_ner.evidence_id], observed_at=event.timestamp)

    # Entity Resolution / Linkage (Now Entity-Level and Hybrid)
    candidate_links = get_candidate_matches(event.content.text, current_platform=event.platform_type, entity_id=event.actor.raw_id, db=db)
    
    for link in candidate_links:
        # Create Evidence for Linkage
        ev_link = Evidence(
            evidence_id=f"EVD-LINK-{uuid.uuid4().hex[:8]}",
            event_id=event.event_id,
            type="graph_connection",
            confidence=link["confidence"],
            provenance=link["signals"]
        )
        db.add(ev_link)
        
        # Create an edge for potential aliases
        graph.add_edge(
            source_id=actor_node.entity_id,
            target_id=link["candidate"],
            relation_type=link["relationship"],
            confidence=link["confidence"],
            evidence_ids=[ev_link.evidence_id],
            observed_at=event.timestamp
        )
        
        # If confidence is high, create an alert for cross-platform migration
        if link["link_class"] in ["KNOWN", "LIKELY MATCH"]:
            alert = Alert(
                alert_id=f"ALT-{uuid.uuid4().hex[:8]}",
                alert_type="CROSS_PLATFORM_LINKAGE",
                severity="HIGH",
                entity_id=actor_node.entity_id,
                reason=f"{link['link_class']} ({link['confidence']:.2f}) link to {link['candidate']} based on multi-signal retrieval.",
                evidence_id=ev_link.evidence_id
            )
            db.add(alert)
            
    db.commit()
    
    return {
        "status": "ingested", 
        "event_id": event.event_id, 
        "anomaly_score": classification["anomaly_score"],
        "extracted_entities": len(entities),
        "potential_links": len(candidate_links)
    }

@router.get("/entities")
def list_entities(db: Session = Depends(get_db)):
    entities = db.query(EntityNode).all()
    return entities

@router.get("/entities/{entity_id}")
def get_entity(entity_id: str, db: Session = Depends(get_db)):
    entity = db.query(EntityNode).filter(EntityNode.entity_id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return entity

@router.get("/alerts")
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    return alerts
from fastapi import APIRouter, Depends, HTTPException, Security
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.schema import EntityNode
from app.models.domain import NormalizedEvent, Actor, Content, Provenance
import uuid
from datetime import datetime

class InterceptRequest(BaseModel):
    text: str

def add_intercept_route(router):
    @router.post("/pipeline/ingest/intercept")
    def api_ingest_intercept(req: InterceptRequest, db: Session = Depends(get_db)):
        from app.api.routes import ingest_event
        event = NormalizedEvent(
            event_id=f"INT-{uuid.uuid4().hex[:8]}",
            source="Live_Intercept",
            timestamp=datetime.utcnow(),
            actor=Actor(raw_id="Unknown_Target", display_name="Unknown"),
            content=Content(text=req.text, language="en"),
            provenance=Provenance(source_uri="intercept://manual", dataset="live_op")
        )
        try:
            result = ingest_event(event, db)
            db.commit()
            return {"status": "success", "result": result, "stream": [{"source": "LIVE INTERCEPT", "preview": req.text}]}
        except Exception as e:
            db.rollback()
add_intercept_route(router)

class ParseTextRequest(BaseModel):
    text: str

@router.get("/search")
def search_endpoint(q: str, denseWeight: float = 0.70, threshold: float = 0.50, topK: int = 30):
    # Use the fast hybrid retriever (FAISS + BM25)
    results = hybrid_retriever.search(q, top_k=topK)
    # We map the results to the expected FAISS engine format
    entities = []
    for r in results:
        entities.append({
            "id": r["id"],
            "type": "DOCUMENT",
            "label": r.get("text", "")[:30] + "...",
            "text": r.get("text", ""),
            "confidence": r.get("score", 0.0),
            "priorityScore": 50,
            "riskFactors": ""
        })
    return {
        "entities": entities,
        "metadata": {
            "query": q,
            "denseWeight": denseWeight,
            "indexType": "FastAPI Hybrid Search"
        }
    }

@router.post("/parse_text")
def parse_text_endpoint(req: ParseTextRequest):
    # 1. NLP Classification
    classification = classify_text(req.text)
    
    # 2. Entity Extraction via GLiNER
    entities = extract_entities(req.text)
    
    # 3. Chainalysis Transaction Tracking
    from app.services.financial.chain_tracker import extract_and_trace_wallets
    chain_traces = extract_and_trace_wallets(req.text)
    
    return {
        "classification": classification,
        "entities": entities,
        "chain_traces": chain_traces
    }
