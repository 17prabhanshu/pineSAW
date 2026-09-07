from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
import datetime
import uuid

def register_model(db, model_name, loss, mean_error, std_error, threshold_percentile, anomalous_count, train_size):
    from app.db.schema import Evidence
    
    version_id = f"V_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
    
    ev = Evidence(
        evidence_id=f"MOD-{uuid.uuid4().hex[:8]}",
        type="model_version",
        evidence_type="MODEL_INFERENCE",
        raw_reference=model_name,
        confidence=1.0,  # Or null, since it's an autoencoder without supervised confidence
        provenance={
            "version": version_id,
            "metrics": {
                "reconstruction_loss": loss,
                "mean_reconstruction_error": mean_error,
                "reconstruction_error_std": std_error,
                "threshold_percentile": threshold_percentile,
                "anomalous_node_count": anomalous_count
            },
            "train_size": train_size
        }
    )
    db.add(ev)
    return version_id
