"""Data preparation for RuralShield AI.

IMPORTANT: The training data generated here is SYNTHETIC. It is produced by
hand-written heuristics, not real flood/drought observations. Any model
trained on it only reproduces those heuristics and is illustrative only.
"""
import numpy as np
import pandas as pd

FEATURES = [
    "rain_24h_mm",
    "rain_7d_mm",
    "temp_mean_c",
    "humidity_pct",
    "soil_moisture_m3m3",
]
LEVELS = ["Low", "Moderate", "High", "Very High"]


def _bucket(score: np.ndarray) -> np.ndarray:
    return np.digitize(score, [0.3, 0.55, 0.78])  # 0..3


def generate_synthetic(n: int = 4000, seed: int = 42) -> pd.DataFrame:
    """Create a synthetic labelled dataset (clearly NOT real-world data)."""
    rng = np.random.default_rng(seed)
    rain_7d = rng.gamma(1.6, 25, n).clip(0, 400)
    rain_24h = (rain_7d * rng.uniform(0, 0.6, n)).clip(0, 250)
    temp = rng.normal(27, 6, n).clip(5, 46)
    humidity = (40 + rain_7d * 0.15 - (temp - 27) * 1.2 + rng.normal(0, 10, n)).clip(10, 100)
    soil = (0.08 + rain_7d / 900 + rng.normal(0, 0.04, n)).clip(0.02, 0.55)

    flood_score = (
        0.45 * np.clip(rain_24h / 120, 0, 1)
        + 0.30 * np.clip(rain_7d / 250, 0, 1)
        + 0.25 * np.clip(soil / 0.45, 0, 1)
        + rng.normal(0, 0.05, n)
    )
    drought_score = (
        0.40 * (1 - np.clip(rain_7d / 60, 0, 1))
        + 0.25 * np.clip((temp - 20) / 22, 0, 1)
        + 0.15 * (1 - humidity / 100)
        + 0.20 * (1 - np.clip(soil / 0.3, 0, 1))
        + rng.normal(0, 0.05, n)
    )
    df = pd.DataFrame(
        {
            "rain_24h_mm": rain_24h,
            "rain_7d_mm": rain_7d,
            "temp_mean_c": temp,
            "humidity_pct": humidity,
            "soil_moisture_m3m3": soil,
        }
    )
    df["flood_level"] = _bucket(flood_score)
    df["drought_level"] = _bucket(drought_score)
    return df


def prepare(df: pd.DataFrame, target: str):
    return df[FEATURES].to_numpy(dtype=float), df[target].to_numpy()
