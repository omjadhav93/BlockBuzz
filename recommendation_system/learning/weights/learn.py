import json
from pathlib import Path
from learning.interactions.loader import load_interactions

OUTPUT_PATH = Path("storage/learned_weights.json")

# initial default (fallback)
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

ACTION_REWARD = {
    "view": 0.1,
    "join": 0.5,
    "volunteer": 0.7,
    "attend": 1.0
}

def learn_weights():
    interactions = load_interactions()

    if not interactions:
        OUTPUT_PATH.write_text(json.dumps(DEFAULT_WEIGHTS, indent=2))
        print("ℹ️ No interactions yet — default weights saved")
        return

    # simple frequency-based learning (light & safe)
    feature_importance = {
        key: 0.0 for key in DEFAULT_WEIGHTS
    }

    for i in interactions:
        reward = ACTION_REWARD.get(i["action"], 0.0)

        # heuristic attribution
        feature_importance["popularity"] += reward
        feature_importance["engagement"] += reward
        feature_importance["collab"] += reward * 0.5

    total = sum(feature_importance.values()) or 1.0

    learned = {
        k: round(v / total, 4)
        for k, v in feature_importance.items()
    }

    OUTPUT_PATH.write_text(json.dumps(learned, indent=2))
    print("Learned weights updated")
