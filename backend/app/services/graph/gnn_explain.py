import torch
from sqlalchemy.orm import Session
from app.db.schema import EntityNode, Edge
from app.db.session import SessionLocal
from app.services.graph.gnn import build_pyg_graph, AnomalyGraphSAGE
from torch_geometric.nn import GAE

def explain_anomaly_score(entity_id: str):
    """
    Ablation-based explainability for the Unsupervised Anomaly GraphSAGE.
    Masks neighboring edges to measure the delta in reconstruction error (anomaly score).
    """
    db = SessionLocal()
    try:
        data, mapping = build_pyg_graph(db)
        if entity_id not in mapping:
            return {"status": "error", "message": "Entity not found in graph."}
            
        target_idx = mapping[entity_id]
        
        # Load the latest model (mocking weights load for now since we haven't serialized state_dict yet)
        encoder = AnomalyGraphSAGE(in_channels=4, hidden_channels=16, out_channels=8)
        model = GAE(encoder)
        model.eval()
        
        with torch.no_grad():
            # Baseline score
            z_base = model.encode(data.x, data.edge_index)
            mean_z = z_base.mean(dim=0)
            base_score = torch.norm(z_base[target_idx] - mean_z).item()
            
            # Find neighbors
            edges = data.edge_index
            neighbor_mask = (edges[0] == target_idx) | (edges[1] == target_idx)
            neighbor_edges = edges[:, neighbor_mask]
            
            explanations = []
            
            # Ablate each neighbor
            reverse_mapping = {v: k for k, v in mapping.items()}
            for i in range(neighbor_edges.size(1)):
                src = neighbor_edges[0, i].item()
                dst = neighbor_edges[1, i].item()
                neighbor_idx = dst if src == target_idx else src
                
                # Mask out this specific edge
                mask = ~((edges[0] == src) & (edges[1] == dst))
                ablated_edge_index = edges[:, mask]
                
                z_ablated = model.encode(data.x, ablated_edge_index)
                ablated_score = torch.norm(z_ablated[target_idx] - mean_z).item()
                
                # Contribution is how much the score DROPS when the edge is removed
                delta = base_score - ablated_score
                
                explanations.append({
                    "neighbor_id": reverse_mapping[neighbor_idx],
                    "contribution_delta": delta
                })
                
            # Sort by highest contribution
            explanations.sort(key=lambda x: x["contribution_delta"], reverse=True)
            
            return {
                "entity_id": entity_id,
                "baseline_anomaly_score": base_score,
                "top_contributing_neighbors": explanations[:5]
            }
    finally:
        db.close()
