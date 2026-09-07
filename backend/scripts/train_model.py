import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

def train_baseline_model():
    # Load dataset
    data_path = "artifacts/demo_data.json"
    if not os.path.exists(data_path):
        print("Dataset not found. Please generate demo data first.")
        return
        
    with open(data_path, "r") as f:
        events = json.load(f)
        
    texts = []
    labels = []
    
    # We heuristically label the synthetic data for training the baseline
    # In reality, this would be a manually annotated dataset.
    for ev in events:
        text = ev["content"]["text"]
        texts.append(text)
        # If it has sales-oriented keywords, it's our positive class
        if "sale" in text.lower() or "shipping" in text.lower() or "wickr" in text.lower():
            labels.append(1)
        else:
            labels.append(0)
            
    if sum(labels) == 0 or sum(labels) == len(labels):
        print("Not enough variance in labels to train.")
        return
        
    # Temporal split simulation (just simple train_test_split for this script, 
    # but we can enforce temporal split by sorting if we want).
    # Let's sort to enforce temporal split.
    # events are chronologically sorted in demo_data.py
    
    split_idx = int(len(texts) * 0.8)
    X_train, X_test = texts[:split_idx], texts[split_idx:]
    y_train, y_test = labels[:split_idx], labels[split_idx:]
    
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1,2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    clf = LogisticRegression(class_weight='balanced')
    clf.fit(X_train_vec, y_train)
    
    preds = clf.predict(X_test_vec)
    
    print("--- EVALUATION METRICS ---")
    print(classification_report(y_test, preds))
    
    os.makedirs("artifacts/models", exist_ok=True)
    joblib.dump(clf, "artifacts/models/risk_classifier.joblib")
    joblib.dump(vectorizer, "artifacts/models/tfidf_vectorizer.joblib")
    
    print("Model saved to artifacts/models/risk_classifier.joblib")
    
    # Save a metrics card
    metrics = {
        "precision": precision_score(y_test, preds),
        "recall": recall_score(y_test, preds),
        "f1": f1_score(y_test, preds),
        "split_method": "temporal",
        "model": "TF-IDF + LogisticRegression"
    }
    with open("artifacts/evaluation/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

if __name__ == "__main__":
    os.makedirs("artifacts/evaluation", exist_ok=True)
    train_baseline_model()
