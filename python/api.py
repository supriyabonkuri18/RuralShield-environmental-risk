"""FastAPI inference service: uvicorn api:app --port 8000"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ruralshield.model import load, predict

app = FastAPI(title="RuralShield AI model API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
MODELS = load()


class Indicators(BaseModel):
    rain_24h_mm: float = Field(ge=0)
    rain_7d_mm: float = Field(ge=0)
    temp_mean_c: float
    humidity_pct: float = Field(ge=0, le=100)
    soil_moisture_m3m3: float = Field(ge=0, le=1)


@app.get("/health")
def health():
    return {"status": "ok", "model": "RandomForestClassifier", "training_data": "synthetic"}


@app.post("/predict")
def predict_risk(ind: Indicators):
    return {
        "model": "RandomForestClassifier (scikit-learn)",
        "training_data": "synthetic",
        "disclaimer": "Illustrative output from a model trained on synthetic data. Not a validated forecast.",
        "predictions": predict(MODELS, ind.model_dump()),
    }
