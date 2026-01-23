import json
from pathlib import Path

POPULARITY_PATH = Path("storage/popularity.json")
COLLAB_PATH = Path("storage/collab_scores.json")

def load_popularity():
    if POPULARITY_PATH.exists():
        return json.loads(POPULARITY_PATH.read_text())
    return {}

def load_collab_scores():
    if COLLAB_PATH.exists():
        return json.loads(COLLAB_PATH.read_text())
    return {}
