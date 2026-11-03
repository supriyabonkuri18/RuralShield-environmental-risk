"""Training, prediction and evaluation (scikit-learn)."""
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from .data import FEATURES, LEVELS, generate_synthetic, prepare

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "ruralshield.joblib"
TARGETS = ["flood_level", "drought_level"]


def train(seed: int = 42):
    """Train one small RandomForest per hazard. Returns models + held-out splits."""
    df = generate_synthetic(seed=seed)
    models, holdout = {}, {}
    for t in TARGETS:
        X, y = prepare(df, t)
        Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=seed, stratify=y)
        clf = RandomForestClassifier(n_estimators=120, max_depth=8, random_state=seed)
        clf.fit(Xtr, ytr)
        models[t] = clf
        holdout[t] = (Xte, yte)
    return models, holdout


def evaluate(models, holdout) -> dict:
    """Accuracy on a SYNTHETIC held-out split. This only measures how well the
    model reproduces the synthetic heuristic, not real-world skill."""
    out = {}
    for t, (X, y) in holdout.items():
        pred = models[t].predict(X)
        out[t] = {
            "synthetic_holdout_accuracy": round(float(accuracy_score(y, pred)), 3),
            "report": classification_report(y, pred, zero_division=0),
        }
    return out


def save(models):
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(models, MODEL_PATH)


def load():
    if not MODEL_PATH.exists():
        models, _ = train()
        save(models)
        return models
    return joblib.load(MODEL_PATH)


def predict(models, features: dict) -> dict:
    x = np.array([[float(features[f]) for f in FEATURES]])
    result = {}
    for t in TARGETS:
        clf = models[t]
        proba = clf.predict_proba(x)[0]
        idx = int(clf.classes_[int(np.argmax(proba))])
        importances = sorted(
            zip(FEATURES, clf.feature_importances_), key=lambda p: p[1], reverse=True
        )
        result[t.replace("_level", "")] = {
            "level": LEVELS[idx],
            "probabilities": {LEVELS[int(c)]: round(float(p), 3) for c, p in zip(clf.classes_, proba)},
            "top_factors": [{"feature": f, "importance": round(float(w), 3)} for f, w in importances[:3]],
        }
    return result
