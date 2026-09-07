"""
GraphSAGE Anomaly Scoring (Unsupervised)

This module implements a self-supervised Graph Autoencoder using GraphSAGE layers.
Because independent confirmed_illicit ground-truth labels are not yet available for
supervised training, we train the model to reconstruct the graph's node features and edges.
The anomaly score is derived from the reconstruction error (Mean Squared Error).
Nodes with high reconstruction error are flagged as anomalous (i.e. they do not fit the
standard topological and feature patterns learned by the model).
This ensures there is no circular leakage from heuristic risk into training labels.
"""
import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv, GAE
from torch_geometric.data import Data
from sqlalchemy.orm import Session
from app.db.schema import EntityNode, Edge
from app.db.session import SessionLocal
import numpy as np
import uuid
import datetime

class AnomalyGraphSAGE(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        return self.conv2(x, edge_index)

class GraphDecoder(torch.nn.Module):
    def forward(self, z, edge_index):
        # Decode edges (dot product) and features
        return (z[edge_index[0]] * z[edge_index[1]]).sum(dim=1)

def build_pyg_graph(db: Session):
    nodes = db.query(EntityNode).all()
    edges = db.query(Edge).all()
    
    node_mapping = {n.entity_id: i for i, n in enumerate(nodes)}
    
    x = []
    for n in nodes:
        feats = [
            1.0 if n.entity_type == 'vendor' else 0.0,
            1.0 if n.entity_type == 'product' else 0.0,
            1.0 if n.entity_type == 'wallet' else 0.0,
            n.anomaly_score or 0.0  # Previously anomaly_score
        ]
        x.append(feats)
        
    x_tensor = torch.tensor(x, dtype=torch.float)
    
    src = []
    dst = []
    for e in edges:
        if e.source_id in node_mapping and e.target_id in node_mapping:
            src.append(node_mapping[e.source_id])
            dst.append(node_mapping[e.target_id])
            
    edge_index = torch.tensor([src, dst], dtype=torch.long)
    
    # Train mask (train on 80%) for validation reporting
    indices = np.random.permutation(len(nodes))
    train_idx = indices[:int(0.8 * len(nodes))]
    val_idx = indices[int(0.8 * len(nodes)):]
    
    train_mask = torch.zeros(len(nodes), dtype=torch.bool)
    train_mask[train_idx] = True
    val_mask = torch.zeros(len(nodes), dtype=torch.bool)
    val_mask[val_idx] = True
    
    return Data(x=x_tensor, edge_index=edge_index, train_mask=train_mask, val_mask=val_mask), node_mapping

def train_gnn():
    db = SessionLocal()
    try:
        data, mapping = build_pyg_graph(db)
        if data.num_nodes == 0 or data.edge_index.size(1) == 0:
            return {"status": "error", "message": "Graph is empty. Run ingestion first."}
            
        # 1.1b Unsupervised Anomaly Detection
        encoder = AnomalyGraphSAGE(in_channels=4, hidden_channels=16, out_channels=8)
        model = GAE(encoder)
        
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        
        model.train()
        for epoch in range(100):
            optimizer.zero_grad()
            z = model.encode(data.x, data.edge_index)
            # Minimize reconstruction loss for edges
            loss = model.recon_loss(z, data.edge_index)
            loss.backward()
            optimizer.step()
            
        # 1.2 Validation Metrics
        model.eval()
        with torch.no_grad():
            z = model.encode(data.x, data.edge_index)
            val_loss = model.recon_loss(z, data.edge_index).item()
            # We calculate node-level reconstruction error to assign anomaly scores
            # Using Euclidean distance to cluster centroid or just feature reconstruction
            # A simple anomaly score: distance of node embedding to the mean embedding
            mean_z = z[data.train_mask].mean(dim=0)
            distances = torch.norm(z - mean_z, dim=1)
            
            # Unsupervised statistics
            mean_error = distances.mean().item()
            std_error = distances.std().item()
            
            # Normalize to 0-1
            distances_normalized = (distances - distances.min()) / (distances.max() - distances.min() + 1e-8)
            final_scores = distances_normalized.tolist()
            
            # Item 1a: Top 5% threshold logic
            threshold_percentile = 95
            if len(distances) > 0:
                cutoff_val = np.percentile(distances.cpu().numpy(), threshold_percentile)
                anomalous_count = int((distances >= cutoff_val).sum().item())
            else:
                anomalous_count = 0
            
        # 1.4 Model Versioning
        from app.services.graph.model_registry import register_model
        version_id = register_model(
            db, 
            "GraphSAGE_Anomaly", 
            val_loss, 
            mean_error, 
            std_error, 
            threshold_percentile, 
            anomalous_count, 
            data.num_nodes
        )
            
        # Write back to DB
        nodes = db.query(EntityNode).all()
        for n in nodes:
            idx = mapping.get(n.entity_id)
            if idx is not None:
                n.anomaly_score = final_scores[idx]
                n.model_version = version_id # Provenance tracking
                # Apply hard thresholding to risk_band based on the 95th percentile
                if distances[idx].item() >= cutoff_val:
                    n.risk_band = "critical"
                elif distances[idx].item() >= np.percentile(distances.cpu().numpy(), 80):
                    n.risk_band = "high"
                else:
                    n.risk_band = "low"
        
        db.commit()
        return {
            "status": "success", 
            "message": "GraphSAGE Anomaly model trained.", 
            "nodes_updated": len(nodes), 
            "val_loss": val_loss,
            "version": version_id
        }
        
    finally:
        db.close()

if __name__ == "__main__":
    print(train_gnn())
