import joblib
import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, brier_score_loss

def train_er():
    print("=========================================")
    print("DARKINT V3.7: Entity Resolution Training")
    print("  - 10-dim feature vector")
    print("  - Entity-disjoint train/test split")
    print("  - Hard-negative holdout")
    print("=========================================\n")
    
    # EXPANDED 10-DIMENSIONAL FEATURE VECTOR:
    # 0: semantic_similarity
    # 1: stylometric_similarity
    # 2: behavior_similarity
    # 3: temporal_compatibility
    # 4: product_overlap
    # 5: source_diversity
    # 6: support_count (normalized)
    # 7: observation_span (days, normalized)
    # 8: platform_compatibility
    # 9: graph_neighborhood_similarity
    
    # ===== ENTITY-DISJOINT TRAINING SET (Entities A-F) =====
    X_train = np.array([
        # POSITIVE (same entity across platforms)
        [0.95, 0.80, 0.70, 0.85, 0.90, 0.60, 0.50, 0.40, 0.80, 0.70],  # 1
        [0.90, 0.90, 0.85, 0.75, 0.80, 0.50, 0.30, 0.60, 0.90, 0.65],  # 1
        [0.88, 0.85, 0.90, 0.80, 0.70, 0.40, 0.15, 0.20, 0.85, 0.75],  # 1
        [0.82, 0.75, 0.80, 0.70, 0.85, 0.55, 0.25, 0.35, 0.75, 0.60],  # 1
        [0.98, 0.95, 0.95, 0.90, 0.95, 0.80, 2.00, 0.90, 0.95, 0.90],  # 1
        [0.85, 0.82, 0.75, 0.80, 0.60, 0.45, 0.10, 0.15, 0.70, 0.55],  # 1
        # EASY NEGATIVES
        [0.40, 0.40, 0.20, 0.30, 0.10, 0.20, 0.40, 0.50, 0.30, 0.15],  # 0
        [0.30, 0.20, 0.10, 0.15, 0.05, 0.10, 0.60, 0.70, 0.20, 0.10],  # 0
        [0.50, 0.50, 0.50, 0.40, 0.30, 0.25, 1.00, 0.80, 0.40, 0.20],  # 0
        # TRAINING HARD NEGATIVES (same product/template, different entity)
        [0.99, 0.10, 0.10, 0.20, 0.95, 0.15, 1.00, 0.80, 0.90, 0.10],  # 0 ← same product template
        [0.95, 0.15, 0.05, 0.10, 0.90, 0.10, 0.80, 0.70, 0.85, 0.05],  # 0 ← same market language
        [0.92, 0.20, 0.80, 0.60, 0.85, 0.20, 1.50, 0.90, 0.80, 0.15],  # 0 ← same hours, diff style
        [0.85, 0.85, 0.85, 0.80, 0.80, 0.50, 0.02, 0.01, 0.75, 0.60],  # 0 ← N=1, statistically void
        [0.90, 0.90, 0.90, 0.85, 0.85, 0.55, 0.01, 0.01, 0.80, 0.65],  # 0 ← N=1, statistically void
    ])
    y_train = np.array([1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0])
    
    # ===== ENTITY-DISJOINT TEST SET (Entities G-L, NEVER seen in training) =====
    X_test = np.array([
        # POSITIVE (new entities)
        [0.91, 0.83, 0.78, 0.82, 0.75, 0.55, 0.20, 0.30, 0.82, 0.68],  # 1
        [0.87, 0.88, 0.82, 0.78, 0.88, 0.60, 0.35, 0.45, 0.88, 0.72],  # 1
        # EASY NEGATIVE (new entities)
        [0.35, 0.25, 0.15, 0.20, 0.08, 0.12, 0.55, 0.65, 0.25, 0.08],  # 0
        # TEST HARD NEGATIVES (DIFFERENT from training hard negatives)
        [0.96, 0.12, 0.08, 0.15, 0.92, 0.08, 0.90, 0.75, 0.88, 0.07],  # 0 ← same template, diff entity
        [0.88, 0.82, 0.79, 0.75, 0.80, 0.50, 0.01, 0.01, 0.78, 0.58],  # 0 ← N=1, statistically void
        # OPEN-SET UNKNOWN (novel entity, no match expected)
        [0.60, 0.55, 0.50, 0.45, 0.40, 0.30, 0.05, 0.05, 0.50, 0.30],  # 0 ← truly novel
    ])
    y_test = np.array([1, 1, 0, 0, 0, 0])
    
    clf = LogisticRegression(class_weight='balanced', max_iter=1000)
    clf.fit(X_train, y_train)
    
    # Evaluate on ENTITY-DISJOINT test set
    preds = clf.predict(X_test)
    probs = clf.predict_proba(X_test)[:, 1]
    
    print("--- Entity-Disjoint Test Set Results ---")
    print(classification_report(y_test, preds))
    print(f"ER Brier Score (Entity-Disjoint): {brier_score_loss(y_test, probs):.4f}")
    
    feature_names = [
        'Semantic', 'Stylometry', 'Behavior', 'Temporal',
        'ProductOverlap', 'SourceDiversity', 'SupportCount',
        'ObsSpan', 'PlatformCompat', 'GraphNeighborhood'
    ]
    print("\nLearned Coefficients:")
    for name, coef in zip(feature_names, clf.coef_[0]):
        print(f"  {name:>20s}: {coef:+.4f}")
    
    os.makedirs("artifacts/models", exist_ok=True)
    joblib.dump(clf, "artifacts/models/er_classifier.joblib")
    print("\nSaved ER model to artifacts/models/er_classifier.joblib")

if __name__ == "__main__":
    train_er()
