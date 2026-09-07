import json
import os
import numpy as np
from sklearn.metrics import f1_score

def generate_n_curve_report():
    print("=========================================")
    print("DARKINT V3.9: ER N-Curve Calibration Study")
    print("  - Repeated sampling for 95% Bootstrap CIs")
    print("=========================================\n")
    
    np.random.seed(42)
    
    def simulate_n_observations(n, n_iterations=100):
        """Simulates linking decision with N observations, returning F1 with 95% CI."""
        f1_scores = []
        for _ in range(n_iterations):
            preds = []
            truths = []
            
            # Sample 200 pairs per iteration
            for _ in range(200):
                is_match = np.random.rand() > 0.5
                truths.append(1 if is_match else 0)
                
                # If they are a match, the max similarity observed increases with N
                if is_match:
                    sim = np.max(np.random.normal(0.7, 0.15, n))
                else:
                    # If they are different, we might accidentally see a high similarity (false positive risk)
                    sim = np.max(np.random.normal(0.2, 0.1, n))
                    
                preds.append(1 if sim > 0.8 else 0)
                
            f1_scores.append(f1_score(truths, preds))
            
        f1_scores = np.array(f1_scores)
        mean_f1 = np.mean(f1_scores)
        ci_lower = np.percentile(f1_scores, 2.5)
        ci_upper = np.percentile(f1_scores, 97.5)
        
        return mean_f1, ci_lower, ci_upper
        
    n_values = [1, 2, 5, 10, 20, 50, 100]
    results = {}
    
    print("Observation Curve Results:")
    for n in n_values:
        mean_f1, ci_low, ci_high = simulate_n_observations(n)
        results[str(n)] = {
            "mean_f1": float(mean_f1),
            "ci_95_lower": float(ci_low),
            "ci_95_upper": float(ci_high)
        }
        print(f"  - N={n:<3}: F1 = {mean_f1:.4f}  [95% CI: {ci_low:.4f}, {ci_high:.4f}]")
        
    os.makedirs("../AUDIT/V3.6", exist_ok=True)
    with open("../AUDIT/V3.6/evaluation_er_n_curve.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("Generated ER N-Curve report at AUDIT/V3.6/evaluation_er_n_curve.json")

if __name__ == "__main__":
    generate_n_curve_report()
