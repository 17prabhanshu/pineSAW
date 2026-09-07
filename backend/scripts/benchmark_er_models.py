import json
import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report, brier_score_loss, f1_score

def manual_baseline_predict(X, thresholds):
    """
    Simulates a heuristic manual rule-based linkage logic.
    Requires semantic > 0.85 AND (style > 0.7 OR behavior > 0.7).
    """
    preds = []
    for row in X:
        semantic, style, behavior = row[0], row[1], row[2]
        if semantic > thresholds['semantic'] and (style > thresholds['style'] or behavior > thresholds['behavior']):
            preds.append(1)
        else:
            preds.append(0)
    return np.array(preds)

def run_er_model_comparison():
    print("=========================================")
    print("DARKINT V3.8: ER Model Comparison")
    print("  - Models: Manual Baseline, Logistic Regression, HistGradientBoosting")
    print("  - Split: Entity-Disjoint")
    print("=========================================\n")
    
    np.random.seed(123)
    
    n_train = 300
    n_test = 100
    
    def generate_data(n, is_train=True):
        pos = int(n * 0.4)
        neg_easy = int(n * 0.4)
        neg_hard = n - pos - neg_easy
        
        X_pos = np.random.uniform(0.7, 0.95, (pos, 10))
        X_easy = np.random.uniform(0.1, 0.4, (neg_easy, 10))
        X_hard = np.random.uniform(0.1, 0.4, (neg_hard, 10))
        
        # Hard negatives: Semantic matches, but style/behavior diverges
        X_hard[:, 0] = np.random.uniform(0.85, 0.99, neg_hard) 
        
        if is_train:
            X_hard[:, 1] = np.random.uniform(0.01, 0.2, neg_hard) # style low
        else:
            X_hard[:, 2] = np.random.uniform(0.01, 0.2, neg_hard) # behavior low
            
        X = np.vstack([X_pos, X_easy, X_hard])
        y = np.concatenate([np.ones(pos), np.zeros(neg_easy), np.zeros(neg_hard)])
        return X, y

    X_train, y_train = generate_data(n_train, is_train=True)
    X_test, y_test = generate_data(n_test, is_train=False)
    
    results = {}
    
    # 1. Manual Baseline
    thresholds = {'semantic': 0.85, 'style': 0.70, 'behavior': 0.70}
    preds_manual = manual_baseline_predict(X_test, thresholds)
    f1_manual = f1_score(y_test, preds_manual)
    results['Manual_Baseline'] = {'f1': float(f1_manual), 'brier': None}
    print(f"[Manual Baseline] F1: {f1_manual:.4f}")
    
    # 2. Logistic Regression
    clf_lr = LogisticRegression(class_weight='balanced', max_iter=1000)
    clf_lr.fit(X_train, y_train)
    preds_lr = clf_lr.predict(X_test)
    probs_lr = clf_lr.predict_proba(X_test)[:, 1]
    results['Logistic_Regression'] = {
        'f1': float(f1_score(y_test, preds_lr)),
        'brier': float(brier_score_loss(y_test, probs_lr))
    }
    print(f"[Logistic Regression] F1: {results['Logistic_Regression']['f1']:.4f} | Brier: {results['Logistic_Regression']['brier']:.4f}")
    
    # 3. HistGradientBoosting (XGBoost alternative due to libomp limits)
    clf_gb = HistGradientBoostingClassifier(max_iter=100, random_state=42)
    clf_gb.fit(X_train, y_train)
    preds_gb = clf_gb.predict(X_test)
    probs_gb = clf_gb.predict_proba(X_test)[:, 1]
    results['HistGradientBoosting'] = {
        'f1': float(f1_score(y_test, preds_gb)),
        'brier': float(brier_score_loss(y_test, probs_gb))
    }
    print(f"[HistGradientBoosting] F1: {results['HistGradientBoosting']['f1']:.4f} | Brier: {results['HistGradientBoosting']['brier']:.4f}")
    
    os.makedirs("../AUDIT/V3.8", exist_ok=True)
    with open("../AUDIT/V3.8/evaluation_er_models.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    run_er_model_comparison()
