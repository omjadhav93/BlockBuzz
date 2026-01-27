import json
from collections import defaultdict
from learning.collaborative.matrix import build_user_event_matrix
from pathlib import Path

SIMILARITY_PATH = Path("storage/event_similarity.json")
OUTPUT_PATH = Path("storage/collab_scores.json")

def compute_collab_scores():
    if not SIMILARITY_PATH.exists():
        print("No similarity data found")
        return

    with open(SIMILARITY_PATH, "r") as f:
        similarity = json.load(f)

    user_event = build_user_event_matrix()
    collab_scores = defaultdict(dict)

    for user, events in user_event.items():
        for event in similarity.keys():
            score = 0.0
            for seen_event, weight in events.items():
                score += similarity.get(seen_event, {}).get(event, 0) * weight

            if score > 0:
                collab_scores[user][event] = round(score, 4)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(collab_scores, f, indent=2)

    print("Collaborative scores computed")
