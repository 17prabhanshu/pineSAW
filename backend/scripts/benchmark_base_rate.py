import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score

def evaluate_base_rate(neg_multiplier):
    np.random.seed(42)
    
    n_pos = 100
    n_neg = n_pos * neg_multiplier
    
    # 10-dim: semantic, style, behavior, temporal, product, source_div, support, span, platform, graph
    
    # Baseline for all samples is moderate overlap
    X_pos = np.random.normal(0.60, 0.20, (n_pos, 10))
    X_neg = np.random.normal(0.40, 0.25, (n_neg, 10))
    
    # Only 2 dimensions contain true distinguishing signal
    X_pos[:, 1] = np.random.normal(0.85, 0.15, n_pos) # Style
    X_pos[:, 2] = np.random.normal(0.80, 0.15, n_pos) # Behavior
    
    X_neg[:, 1] = np.random.normal(0.20, 0.25, n_neg)
    X_neg[:, 2] = np.random.normal(0.20, 0.25, n_neg)
    
    # Clip to [0, 1]
    X_pos = np.clip(X_pos, 0.0, 1.0)
    X_neg = np.clip(X_neg, 0.0, 1.0)
    
    # Inject some hard negatives (approx 10% of negatives)
    n_hard = int(n_neg * 0.1)
    if n_hard > 0:
        X_neg[:n_hard, 0] = np.random.normal(0.90, 0.1, n_hard)
        X_neg[:n_hard, 4] = np.random.normal(0.90, 0.1, n_hard)
        X_neg[:n_hard, 0] = np.clip(X_neg[:n_hard, 0], 0.0, 1.0)
        X_neg[:n_hard, 4] = np.clip(X_neg[:n_hard, 4], 0.0, 1.0)
        
    X = np.vstack([X_pos, X_neg])
    y = np.concatenate([np.ones(n_pos), np.zeros(n_neg)])
    
    # Train test split (80/20)
    split = int((n_pos + n_neg) * 0.8)
    indices = np.random.permutation(n_pos + n_neg)
    
    X_train, X_test = X[indices[:split]], X[indices[split:]]
    y_train, y_test = y[indices[:split]], y[indices[split:]]
    
    clf = LogisticRegression(class_weight='balanced', max_iter=1000)
    clf.fit(X_train, y_train)
    
    preds = clf.predict(X_test)
    
    # === FORMAL METRIC DEFINITIONS (V4.2) ===
    tp = int(sum((preds == 1) & (y_test == 1)))
    fp = int(sum((preds == 1) & (y_test == 0)))
    tn = int(sum((preds == 0) & (y_test == 0)))
    fn = int(sum((preds == 0) & (y_test == 1)))
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    # FPR (False Positive Rate) = FP / (FP + TN) = FP / N
    # "Of all actual negatives, what fraction were falsely linked?"
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
    
    # FNR (False Negative Rate) = FN / (FN + TP) = FN / P
    fnr = fn / (fn + tp) if (fn + tp) > 0 else 0
    
    # FDR (False Discovery Rate) = FP / (FP + TP)
    # "Of all predicted positives, what fraction were wrong?"
    fdr = fp / (fp + tp) if (fp + tp) > 0 else 0
    
    return {
        "tp": tp, "fp": fp, "tn": tn, "fn": fn,
        "precision": precision, "recall": recall, "f1": f1,
        "fpr": fpr, "fnr": fnr, "fdr": fdr
    }

def run_base_rate_benchmark():
    print("=========================================")
    print("DARKINT V4.2: Base-Rate Stress Test (Formal Metrics)")
    print("=========================================")
    print()
    print("METRIC DEFINITIONS:")
    print("  FPR  = FP / (FP + TN)   — Of all actual negatives, fraction falsely linked")
    print("  FNR  = FN / (FN + TP)   — Of all actual positives, fraction missed")
    print("  FDR  = FP / (FP + TP)   — Of all predicted positives, fraction wrong")
    print()
    
    ratios = [1, 10, 100, 1000]
    
    for r in ratios:
        m = evaluate_base_rate(r)
        print(f"--- Ratio 1:{r} ---")
        print(f"  TP={m['tp']:>5}  FP={m['fp']:>5}  TN={m['tn']:>5}  FN={m['fn']:>5}")
        print(f"  Precision: {m['precision']:.4f}  Recall: {m['recall']:.4f}  F1: {m['f1']:.4f}")
        print(f"  FPR: {m['fpr']:.6f}  FNR: {m['fnr']:.4f}  FDR: {m['fdr']:.4f}")
        print()

if __name__ == "__main__":
    run_base_rate_benchmark()
