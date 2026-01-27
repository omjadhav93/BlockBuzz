import json
from collections import defaultdict
from learning.interactions.loader import load_interactions
from pathlib import Path

OUTPUT_PATH = Path("storage/engagement.json")

ACTION_WEIGHT = {
    "VIEW": 0.1,
    "SAVE": 0.4,
    "REGISTER": 0.7,
    "ATTENDED": 1.0
}

def compute_engagement():
    interactions = load_interactions()
    scores = defaultdict(float)

    for i in interactions:
        scores[i["user_id"]] += ACTION_WEIGHT.get(i["action"], 0)

    # clamp between 0 and 1
    engagement = {
        user_id: round(min(score, 1.0), 4)
        for user_id, score in scores.items()
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(engagement, f, indent=2)

    print("Engagement scores updated")
