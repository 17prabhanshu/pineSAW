from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Source(Base):
    __tablename__ = 'sources'
    id = Column(String, primary_key=True)
    name = Column(String)
    reliability = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = 'events'
    event_id = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey('sources.id'), nullable=True)
    platform_type = Column(String)
    platform_id = Column(String)
    timestamp = Column(DateTime)
    actor_id = Column(String)
    content_text = Column(Text)
    content_lang = Column(String)
    location = Column(String, nullable=True)
    provenance = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class EntityNode(Base):
    __tablename__ = 'entities'
    entity_id = Column(String, primary_key=True)
    entity_type = Column(String)  # vendor, user, platform, wallet, contact_handle, product
    name = Column(String)
    anomaly_score = Column(Float, nullable=True)
    risk_band = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    model_version = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class Evidence(Base):
    __tablename__ = 'evidence'
    evidence_id = Column(String, primary_key=True)
    evidence_group_id = Column(String, index=True, nullable=True) # Used to correlate non-independent duplicate observations
    source_id = Column(String, nullable=True)
    event_id = Column(String, ForeignKey('events.event_id'), nullable=True)
    entity_id = Column(String, ForeignKey('entities.entity_id'), nullable=True)
    type = Column(String) # e.g., 'listing', 'model_signal', 'graph_connection'
    # V3.7: Semantic evidence classification
    evidence_type = Column(String, default='DIRECT_OBSERVATION') # DIRECT_OBSERVATION | DERIVED_SIGNAL | MODEL_INFERENCE | CORROBORATION | DUPLICATE | CONTRADICTORY | ANALYST_INPUT
    source_independence = Column(Float, nullable=True) # 0.0 = copied, 1.0 = fully independent
    raw_reference = Column(String, nullable=True)
    derived_text = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    confidence = Column(Float, nullable=True)
    provenance = Column(JSON, nullable=True)
    model_version = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Edge(Base):
    __tablename__ = 'edges'
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, ForeignKey('entities.entity_id'))
    target_id = Column(String, ForeignKey('entities.entity_id'))
    relation_type = Column(String)
    confidence = Column(Float)
    observed_at = Column(DateTime, default=datetime.utcnow)
    provenance_method = Column(String, nullable=True) # DIRECT_OBSERVATION, DERIVED, INFERRED
    evidence_id = Column(String, ForeignKey('evidence.evidence_id'), nullable=True)

class Alert(Base):
    __tablename__ = 'alerts'
    alert_id = Column(String, primary_key=True)
    alert_type = Column(String)
    severity = Column(String)
    entity_id = Column(String, ForeignKey('entities.entity_id'))
    reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="NEW") # NEW, REVIEWING, DISMISSED, CONFIRMED
    evidence_id = Column(String, ForeignKey('evidence.evidence_id'), nullable=True)

class Case(Base):
    __tablename__ = 'cases'
    case_id = Column(String, primary_key=True)
    title = Column(String)
    status = Column(String, default="OPEN")
    priority = Column(String, default="MEDIUM")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CaseEntity(Base):
    __tablename__ = 'case_entities'
    id = Column(Integer, primary_key=True, autoincrement=True)
    case_id = Column(String, ForeignKey('cases.case_id'))
    entity_id = Column(String, ForeignKey('entities.entity_id'))

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    actor = Column(String)
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
