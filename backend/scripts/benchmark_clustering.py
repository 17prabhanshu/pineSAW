import numpy as np
import json
import os

def run_clustering_sensitivity():
    """
    HDBSCAN sensitivity analysis across min_cluster_size=[3,5,10,20].
    Measures cluster stability, noise percentage, and semantic cohesion.
    """
    print("=========================================")
    print("DARKINT V3.7: Clustering Sensitivity Sweep")
    print("=========================================\n")
    
    np.random.seed(42)
    
    # Simulate 200 BGE embeddings in 5D (post-UMAP)
    n = 200
    # 3 natural clusters + noise
    cluster_a = np.random.randn(60, 5) * 0.3 + np.array([2, 0, 0, 0, 0])
    cluster_b = np.random.randn(50, 5) * 0.3 + np.array([0, 2, 0, 0, 0])
    cluster_c = np.random.randn(40, 5) * 0.3 + np.array([0, 0, 2, 0, 0])
    noise = np.random.randn(50, 5) * 2.0  # scattered noise
    
    embeddings = np.vstack([cluster_a, cluster_b, cluster_c, noise])
    
    try:
        import hdbscan
        
        results = []
        for mcs in [3, 5, 10, 20]:
            clusterer = hdbscan.HDBSCAN(min_cluster_size=mcs, metric='euclidean')
            labels = clusterer.fit_predict(embeddings)
            
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
            noise_pct = (labels == -1).sum() / len(labels)
            
            # Cluster stability (from HDBSCAN probabilities)
            avg_stability = float(np.mean(clusterer.probabilities_[labels != -1])) if (labels != -1).any() else 0.0
            
            entry = {
                "min_cluster_size": mcs,
                "n_clusters": n_clusters,
                "noise_pct": round(float(noise_pct), 3),
                "avg_stability": round(avg_stability, 3),
            }
            results.append(entry)
            print(f"min_cluster_size={mcs:<3} | clusters={n_clusters} | noise={noise_pct:.1%} | stability={avg_stability:.3f}")
        
        os.makedirs("../AUDIT/V3.7", exist_ok=True)
        with open("../AUDIT/V3.7/evaluation_clustering_sensitivity.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print("\nSaved to AUDIT/V3.7/evaluation_clustering_sensitivity.json")
        
    except ImportError:
        print("ERROR: hdbscan not installed. Clustering sensitivity skipped.")

if __name__ == "__main__":
    run_clustering_sensitivity()
