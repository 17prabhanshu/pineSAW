from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, JSON
from app.db.database import Base
from datetime import datetime

class FeatureValue(Base):
    """
    V3.9 Point-in-Time Feature Abstraction with Mandatory Provenance.
    Automated point-in-time invariants are enforced for the defined feature access paths.
    """
    __tablename__ = "feature_values"

    # Mandatory Provenance Fields (V3.9 Standard)
    feature_id = Column(String, primary_key=True, index=True)   # UUID
    name = Column(String, index=True, nullable=False)           # feature_name
    value = Column(Float, nullable=False)
    
    entity_id = Column(String, index=True, nullable=False)
    
    # POINT-IN-TIME (PIT) GUARANTEES
    valid_at = Column(DateTime, nullable=False, index=True)     # When this feature became true in the real world
    computed_at = Column(DateTime, default=datetime.utcnow, nullable=False) # When the system calculated it
    version = Column(Integer, default=1, nullable=False)        # feature schema version
    source_event_ids = Column(JSON, nullable=False)             # Lineage: array of event IDs that contributed to this feature
    confidence = Column(Float, nullable=True)                   # V4.0 provenance constraint
    
    # GRAPH PIT PROVENANCE (V4.1)
    graph_snapshot_id = Column(String, nullable=True)           # ID of the G(T) snapshot used
    algorithm_version = Column(String, nullable=True)           # e.g., 'pagerank_v2'
    source_edge_ids = Column(JSON, nullable=True)               # Lineage of edges for graph metrics

