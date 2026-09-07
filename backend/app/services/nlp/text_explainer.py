"""
SHAP-based explainability for the TF-IDF + Logistic Regression heuristic classifier.

This module provides feature-level explanations for the heuristic anomaly score
produced by classify_text(). The heuristic score is a live input to the GraphSAGE
model (feature index 3 in build_pyg_graph), so it is a decision-influencing signal
that requires explainability.

Performance note: This loads only the lightweight joblib artifacts (TF-IDF vectorizer
+ Logistic Regression model, ~5KB total). It does NOT load GLiNER, BGE, or any
transformer model. shap.LinearExplainer against a small LogReg is sub-millisecond.
"""
import os
import joblib
import numpy as np
import shap
from typing import Dict, Any


MODEL_PATH = "artifacts/models/risk_classifier.joblib"
VECTORIZER_PATH = "artifacts/models/tfidf_vectorizer.joblib"


def explain_heuristic_score(text: str) -> Dict[str, Any]:
    """
    Compute SHAP feature contributions for a given text using the TF-IDF
    Logistic Regression classifier. Returns the top contributing terms
    and their SHAP values.
    """
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        return {"status": "error", "message": "Model artifacts not found. Train the classifier first."}

    try:
        classifier = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)

        # Extract base linear model from CalibratedClassifierCV if wrapped
        base_estimator = classifier
        if hasattr(classifier, 'calibrated_classifiers_'):
            base_estimator = classifier.calibrated_classifiers_[0].estimator

        if not hasattr(base_estimator, 'coef_'):
            return {"status": "error", "message": "Base model is not a linear model — SHAP LinearExplainer requires coef_."}

        # Transform text to TF-IDF features
        X = vectorizer.transform([text])
        feature_names = vectorizer.get_feature_names_out()

        # Background dataset: zero vector (standard for sparse TF-IDF)
        background = np.zeros((1, X.shape[1]))

        # SHAP LinearExplainer — this is cheap (~0.1ms for small LogReg)
        explainer = shap.LinearExplainer(base_estimator, background)
        shap_values = explainer.shap_values(X)

        # Handle both list-of-arrays (binary) and single-array formats
        if isinstance(shap_values, list):
            shap_vals = shap_values[1][0]  # Positive class (suspicious)
        else:
            shap_vals = shap_values[0]

        # Extract only active (non-zero) features
        contributions = []
        active_indices = X.nonzero()[1]

        for idx in active_indices:
            contribution = shap_vals[idx]
            if abs(contribution) > 0.01:  # Filter noise
                contributions.append({
                    "term": str(feature_names[idx]),
                    "tfidf_value": float(X[0, idx]),
                    "shap_contribution": float(contribution)
                })

        contributions.sort(key=lambda x: abs(x['shap_contribution']), reverse=True)

        base_value = explainer.expected_value
        if isinstance(base_value, (list, np.ndarray)):
            base_value = float(base_value[1]) if len(base_value) > 1 else float(base_value[0])

        return {
            "status": "ok",
            "text_snippet": text[:200],
            "base_value": base_value,
            "top_contributions": contributions[:10]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}
