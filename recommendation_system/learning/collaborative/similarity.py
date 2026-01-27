import json
import math
from collections import defaultdict
from learning.collaborative.matrix import build_user_event_matrix
from pathlib import Path

OUTPUT_PATH = Path("storage/event_similarity.json")

def cosine_similarity(vec1: dict, vec2: dict) -> float:
    common_users = set(vec1.keys()) & set(vec2.keys())
    if not common_users:
        return 0.0

    num = sum(vec1[u] * vec2[u] for u in common_users)
    denom1 = math.sqrt(sum(v * v for v in vec1.values()))
    denom2 = math.sqrt(sum(v * v for v in vec2.values()))

    if denom1 == 0 or denom2 == 0:
        return 0.0

    return num / (denom1 * denom2)


def compute_event_similarity():
    user_event = build_user_event_matrix()

    # transpose → event -> user vector
    event_vectors = defaultdict(dict)
    for user, events in user_event.items():
        for event, weight in events.items():
            event_vectors[event][user] = weight

    similarity = defaultdict(dict)
    events = list(event_vectors.keys())

    for i in range(len(events)):
        for j in range(i + 1, len(events)):
            e1, e2 = events[i], events[j]
            sim = cosine_similarity(
                event_vectors[e1],
                event_vectors[e2]
            )

            if sim > 0:
                similarity[e1][e2] = round(sim, 4)
                similarity[e2][e1] = round(sim, 4)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(similarity, f, indent=2)

    print("Event similarity computed")
