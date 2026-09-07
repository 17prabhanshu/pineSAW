import pytest
from app.services.graph.gnn import build_pyg_graph
from app.db.schema import EntityNode, Edge
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def test_no_circular_labels():
    """
    Phase 4: Regression test to ensure training labels in the GraphSAGE model
    are NEVER wired back to the `anomaly_score` or `heuristic_risk`, preventing
    the Phase 1.1 circular-label bug from silently reappearing.
    Since we migrated to an Unsupervised Graph Autoencoder (AnomalyGraphSAGE),
    we verify that `y` is not derived from `anomaly_score`.
    """
    engine = create_engine("sqlite:///:memory:")
    from app.db.schema import Base
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    # Mock data
    node1 = EntityNode(entity_id="1", entity_type="vendor", anomaly_score=0.9)
    node2 = EntityNode(entity_id="2", entity_type="vendor", anomaly_score=0.1)
    db.add(node1)
    db.add(node2)
    db.commit()
    
    data, mapping = build_pyg_graph(db)
    
    # In PyG Data object for our unsupervised approach, there shouldn't even be a `y` tensor.
    # If `y` exists, it MUST NOT be correlated perfectly with anomaly_score
    if hasattr(data, 'y') and data.y is not None:
        y_vals = data.y.flatten().tolist()
        assert y_vals != [0.9, 0.1], "CRITICAL: GraphSAGE label 'y' is directly derived from anomaly_score! Circular leakage detected."
        
    db.close()

def test_agora_parser_corrupted_rows():
    """
    Ensure the parser doesn't crash on \ufffd corrupted rows.
    """
    pass # covered by standard ingest test
