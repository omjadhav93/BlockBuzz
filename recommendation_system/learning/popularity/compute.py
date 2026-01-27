import json
import math
from collections import defaultdict
from learning.interactions.loader import load_interactions
from pathlib import Path

OUTPUT_PATH = Path("storage/popularity.json")

ACTION_WEIGHT = {
    "VIEW": 1,
    "SAVE": 3,
    "REGISTER": 4,
    "ATTEND": 5
}

def compute_popularity():
    interactions = load_interactions()
    scores = defaultdict(float)

    for i in interactions:
        scores[i["event_id"]] += ACTION_WEIGHT.get(i["action"], 0)

    # normalize using log scale
    popularity = {
        event_id: round(math.log(1 + score), 4)
        for event_id, score in scores.items()
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(popularity, f, indent=2)

    print("Popularity scores updated")
