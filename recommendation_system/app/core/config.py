import json
from pathlib import Path

MAX_DISTANCE_KM = 80

DEFAULT_WEIGHTS = {
    "distance": 0.30,
    "interest": 0.30,
    "time": 0.15,
    "host": 0.15,
    "popularity": 0.10,
    "collab": 0.00,
    "trust": 0.00,
    "engagement": 0.00
}

WEIGHTS_PATH = Path("storage/learned_weights.json")

def load_weights():
    if WEIGHTS_PATH.exists():
        with open(WEIGHTS_PATH, "r") as f:
            return json.load(f)
    return DEFAULT_WEIGHTS

WEIGHTS = load_weights()
