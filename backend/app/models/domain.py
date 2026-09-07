from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Actor(BaseModel):
    raw_id: str
    display_name: str

class Content(BaseModel):
    text: str
    language: str = "en"
    image_refs: List[str] = []

class Provenance(BaseModel):
    source_uri: str
    dataset: str
    data_integrity_flags: Dict[str, bool] = {}

class Entity(BaseModel):
    entity_id: str
    entity_type: str
    value: str
    confidence: float

class FinancialSignal(BaseModel):
    wallet_address: str
    cryptocurrency: str
    amount: Optional[float] = None

class NormalizedEvent(BaseModel):
    event_id: str
    source: str
    platform_type: str
    platform_id: str
    timestamp: datetime
    actor: Actor
    content: Content
    entities: List[Entity] = []
    financial: List[FinancialSignal] = []
    location: Optional[str] = None
    provenance: Provenance

class RiskComponents(BaseModel):
    content: float = 0.0
    behavior: float = 0.0
    graph: float = 0.0
    temporal: float = 0.0
    financial: float = 0.0
    cross_platform: float = 0.0

class RiskAssessment(BaseModel):
    entity_id: str
    anomaly_score: float
    risk_band: str
    confidence: float
    components: RiskComponents
    reasons: List[str] = []
    evidence_ids: List[str] = []
