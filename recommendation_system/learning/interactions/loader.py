import json
from pathlib import Path

STORAGE_PATH = Path("storage/interactions.json")

def load_interactions():
    # file does not exist
    if not STORAGE_PATH.exists():
        return []

    try:
        with open(STORAGE_PATH, "r") as f:
            data = json.load(f)

        # empty or invalid content
        if not isinstance(data, list):
            return []

        return data

    except json.JSONDecodeError:
        # empty or corrupted file
        return []
