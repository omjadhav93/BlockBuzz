import json
from datetime import datetime
from pathlib import Path

STORAGE_PATH = Path("storage/interactions.json")
STORAGE_PATH.parent.mkdir(exist_ok=True)

def store_interaction(user_id: str, event_id: str, action: str):
    record = {
        "user_id": user_id,
        "event_id": event_id,
        "action": action,
        "timestamp": datetime.utcnow().isoformat()
    }

    data = []
    if STORAGE_PATH.exists():
        with open(STORAGE_PATH, "r") as f:
            data = json.load(f)

    data.append(record)

    with open(STORAGE_PATH, "w") as f:
        json.dump(data, f, indent=2)
