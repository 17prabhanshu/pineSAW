import json
import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, brier_score_loss, f1_score

def run_er_ablation():
    """
    Evaluates individual feature contributions to the 10-dimensional Entity Resolution model
    using leave-one-out feature ablation on entity-disjoint splits.
    """
    print("=========================================")
    print("DARKINT V3.8: ER Feature Ablation Study")
    print("  - Leave-one-out testing")
    print("  - Entity-disjoint train/test split")
    print("=========================================\n")
    
    np.random.seed(42)
    
    # 10 features: semantic, style, behavior, temporal, product, source_div, support, span, platform, graph
    feature_names = [
        'Semantic', 'Stylometry', 'Behavior', 'Temporal',
        'ProductOverlap', 'SourceDiversity', 'SupportCount',
        'ObsSpan', 'PlatformCompat', 'GraphNeighborhood'
    ]
    
    # Generate synthetic entity-disjoint data (proxy for real data due to access limits)
    n_train = 150
    n_test = 50
    
    def generate_data(n, is_train=True):
        pos = int(n * 0.4)
        neg_easy = int(n * 0.4)
        neg_hard = n - pos - neg_easy
        
        # Positive pairs (same entity)
        X_pos = np.random.uniform(0.7, 0.95, (pos, 10))
        # Easy negatives (different entities)
        X_easy = np.random.uniform(0.1, 0.4, (neg_easy, 10))
        # Hard negatives (same template, different entity)
        X_hard = np.random.uniform(0.1, 0.4, (neg_hard, 10))
        X_hard[:, 0] = np.random.uniform(0.8, 0.99, neg_hard) # High semantic (same template)
        X_hard[:, 4] = np.random.uniform(0.8, 0.99, neg_hard) # High product overlap
        
        # Introduce variation to ensure train/test hard negatives are DIFFERENT
        if is_train:
            X_hard[:, 1] = np.random.uniform(0.01, 0.1, neg_hard) # Extremely low style similarity
        else:
            X_hard[:, 2] = np.random.uniform(0.01, 0.1, neg_hard) # Extremely low behavior similarity
            
        X = np.vstack([X_pos, X_easy, X_hard])
        y = np.concatenate([np.ones(pos), np.zeros(neg_easy), np.zeros(neg_hard)])
        return X, y

    X_train, y_train = generate_data(n_train, is_train=True)
    X_test, y_test = generate_data(n_test, is_train=False)
    
    # Base model (All features)
    clf_base = LogisticRegression(class_weight='balanced', max_iter=1000)
    clf_base.fit(X_train, y_train)
    probs_base = clf_base.predict_proba(X_test)[:, 1]
    preds_base = clf_base.predict(X_test)
    base_f1 = f1_score(y_test, preds_base)
    base_brier = brier_score_loss(y_test, probs_base)
    
    print(f"Base Model (All Features) -> F1: {base_f1:.4f} | Brier: {base_brier:.4f}\n")
    
    results = {
        "benchmark": "ER Feature Ablation (Entity-Disjoint)",
        "dataset": "SYNTHETIC_ENTITY_DISJOINT",
        "base_f1": float(base_f1),
        "base_brier": float(base_brier),
        "ablations": {}
    }
    
    print("Ablation Results (Drop one feature):")
    for i, name in enumerate(feature_names):
        # Drop feature i
        X_train_ablated = np.delete(X_train, i, axis=1)
        X_test_ablated = np.delete(X_test, i, axis=1)
        
        clf = LogisticRegression(class_weight='balanced', max_iter=1000)
        clf.fit(X_train_ablated, y_train)
        
        probs = clf.predict_proba(X_test_ablated)[:, 1]
        preds = clf.predict(X_test_ablated)
        
        f1 = f1_score(y_test, preds)
        brier = brier_score_loss(y_test, probs)
        
        f1_delta = f1 - base_f1
        
        results["ablations"][name] = {
            "f1": float(f1),
            "brier": float(brier),
            "f1_impact": float(f1_delta)
        }
        
        impact_str = f"{f1_delta:+.4f}"
        print(f"  - Dropped {name:<18} -> F1: {f1:.4f} ({impact_str}) | Brier: {brier:.4f}")
        
    os.makedirs("../AUDIT/V3.8", exist_ok=True)
    with open("../AUDIT/V3.8/evaluation_er_ablation.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\nSaved to AUDIT/V3.8/evaluation_er_ablation.json")

if __name__ == "__main__":
    run_er_ablation()
