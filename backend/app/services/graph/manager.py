import networkx as nx
from sqlalchemy.orm import Session
from app.db.schema import EntityNode, Edge
from datetime import datetime

class GraphManager:
    def __init__(self, db: Session):
        self.db = db
        # Using MultiDiGraph to preserve parallel edges (e.g. multiple transactions or posts)
        self.nx_graph = nx.MultiDiGraph()
        self._node_cache = {} # Cache to prevent UNIQUE constraint errors in same transaction
        
    def add_node(self, entity_id: str, entity_type: str, name: str, anomaly_score: float = None):
        if entity_id in self._node_cache:
            node = self._node_cache[entity_id]
        else:
            node = self.db.query(EntityNode).filter(EntityNode.entity_id == entity_id).first()
            
        if not node:
            node = EntityNode(
                entity_id=entity_id,
                entity_type=entity_type,
                name=name,
                anomaly_score=anomaly_score
            )
            self.db.add(node)
            self._node_cache[entity_id] = node
        else:
            # Upgrade risk score and type if new evidence is stronger
            if anomaly_score is not None and (node.anomaly_score is None or anomaly_score > node.anomaly_score):
                node.anomaly_score = anomaly_score
            if entity_type == "vendor" and node.entity_type == "user":
                node.entity_type = "vendor"
        return node
        
    def add_edge(self, source_id: str, target_id: str, relation_type: str, confidence: float, evidence_ids: list, observed_at: datetime = None):
        primary_evidence_id = evidence_ids[0] if evidence_ids else None
        
        edge = Edge(
            source_id=source_id,
            target_id=target_id,
            relation_type=relation_type,
            confidence=confidence,
            observed_at=observed_at or datetime.utcnow(),
            provenance_method="DIRECT_OBSERVATION" if relation_type != "POTENTIALLY_SAME_AS" else "INFERRED",
            evidence_id=primary_evidence_id
        )
        self.db.add(edge)
        return edge

    def build_networkx(self):
        self.nx_graph.clear()
        nodes = self.db.query(EntityNode).all()
        edges = self.db.query(Edge).all()
        
        for n in nodes:
            self.nx_graph.add_node(n.entity_id, type=n.entity_type, risk=n.anomaly_score)
            
        for e in edges:
            self.nx_graph.add_edge(e.source_id, e.target_id, relation=e.relation_type, weight=e.confidence, evidence_id=e.evidence_id)
            
    def get_centrality(self):
        self.build_networkx()
        if len(self.nx_graph.nodes) == 0:
            return {}
        try:
            # MultiDiGraph requires specific centrality algorithms, degree centrality works
            return nx.degree_centrality(self.nx_graph)
        except Exception:
            return {}
            
    def get_communities(self):
        self.build_networkx()
        if len(self.nx_graph.nodes) == 0:
            return []
            
        try:
            from networkx.algorithms.community import louvain_communities
            
            # Louvain requires a simple graph, so we project the MultiDiGraph
            simple_graph = nx.Graph(self.nx_graph)
            communities = louvain_communities(simple_graph)
            
            result = []
            for i, c in enumerate(communities):
                result.append({
                    "community_id": f"comm_{i}",
                    "size": len(c),
                    "members": list(c)[:10] # Top 10 members for summary
                })
            return sorted(result, key=lambda x: x["size"], reverse=True)
        except ImportError:
            return [{"error": "Louvain not available in this networkx version"}]
        except Exception as e:
            return [{"error": str(e)}]
            
    def get_evidence_path(self, source_id: str, target_id: str) -> dict:
        self.build_networkx()
        try:
            # We can use NetworkX shortest path
            path = nx.shortest_path(self.nx_graph, source=source_id, target=target_id)
            evidence_edges = []
            
            for i in range(len(path) - 1):
                u = path[i]
                v = path[i+1]
                
                # nx.MultiDiGraph stores edge data in a dict keyed by an integer index
                # We fetch the first connecting edge as the primary link
                edge_data = self.nx_graph.get_edge_data(u, v)
                if edge_data and 0 in edge_data:
                    evidence_edges.append({
                        "source": u,
                        "target": v,
                        "relation": edge_data[0].get("relation", "UNKNOWN"),
                        "evidence_id": edge_data[0].get("evidence_id")
                    })
                    
            return {
                "path_nodes": path,
                "evidence": evidence_edges
            }
        except nx.NetworkXNoPath:
            return {"path_nodes": [], "evidence": []}
        except Exception as e:
            return {"error": str(e)}

    def get_node_neighborhood(self, entity_id: str):
        node = self.db.query(EntityNode).filter(EntityNode.entity_id == entity_id).first()
        if not node:
            return None
            
        edges = self.db.query(Edge).filter(
            (Edge.source_id == entity_id) | (Edge.target_id == entity_id)
        ).all()
        
        neighbor_ids = set()
        for e in edges:
            neighbor_ids.add(e.source_id)
            neighbor_ids.add(e.target_id)
            
        neighbors = self.db.query(EntityNode).filter(EntityNode.entity_id.in_(neighbor_ids)).all()
        
        return {
            "node": node,
            "edges": edges,
            "neighbors": neighbors
        }
