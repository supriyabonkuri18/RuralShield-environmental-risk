# RuralShield AI

Experimental flood & drought risk explorer for rural communities (NeuralStorm 2026 — Green Planet track).

## Architecture
- **Frontend** (`src/`): TanStack Start + React dashboard. Fetches weather from Open-Meteo in the browser and sends the 5 indicators to the Python model API.
- **Python ML service** (`python/`): scikit-learn + FastAPI, run separately.
  - `ruralshield/data.py` — synthetic data generation + feature preparation
  - `ruralshield/model.py` — `train`, `predict`, `evaluate`, save/load
  - `train.py` — trains and prints synthetic hold-out metrics
  - `api.py` — `GET /health`, `POST /predict`

## Setup
```bash
cd python && pip install -r requirements.txt
python train.py               # optional; api.py trains on first start if no model file
uvicorn api:app --port 8000
```
Run the frontend (`bun dev`) and set the "Python model address" field (or `VITE_RISK_API_URL`) to the API URL. A hosted frontend can only reach a publicly hosted API (localhost works only when both run on your machine).

## Data sources
- Open-Meteo forecast API (`past_days=7`): hourly precipitation, temperature, humidity, 0–1 cm soil moisture (modelled estimate). No API key.
- Demo mode: two hard-coded scenarios (wet / dry), clearly labelled.

## ML component & synthetic data
Two RandomForestClassifiers (flood, drought) predict Low / Moderate / High / Very High. Training labels are produced by hand-written heuristics on **synthetic** data, so the model only learns those heuristics. Hold-out accuracy printed by `train.py` measures agreement with the synthetic labels only — it is **not** real-world skill. Classes are imbalanced (few "Very High" cases).

## Limitations
Prototype, not an official warning system. No river gauges, terrain, drainage, or historical event validation. Do not use for emergency decisions.

## AI-assistant use
This project was scaffolded with the Lovable AI assistant (frontend, Python modules, README), reviewed by the team.
