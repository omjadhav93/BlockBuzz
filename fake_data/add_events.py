import json
import random
import requests
from collections import defaultdict

BASE_URL = "http://localhost:3000"
EVENT_PUBLISH_URL = f"{BASE_URL}/api/organizer/event/publish"

ORGANIZERS_FILE = "auto_data_loading/metadata/approved_organizers.json"
EVENTS_FILE = "auto_data_loading/metadata/events_data.json"
OUTPUT_FILE = "auto_data_loading/metadata/event_organizer_map.json"

TOTAL_EVENT_ORGANIZERS = 30   # organizers who get events


def load_json(file):
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)


def publish_event(session, event):
    res = session.post(EVENT_PUBLISH_URL, json=event)

    if res.status_code not in (200, 201):
        print(f"[EVENT FAILED] {res.status_code} → {res.text}")
        return None

    return res.json().get("data").get("id")


def add_events():
    organizers = load_json(ORGANIZERS_FILE)
    events = load_json(EVENTS_FILE)

    organizer_ids = list(organizers.keys())

    # Select 25 organizers to receive events
    active_organizers = random.sample(organizer_ids, TOTAL_EVENT_ORGANIZERS)

    event_organizer_map = {}
    organizer_event_count = defaultdict(int)

    for event in events:
        organizer_id = random.choice(active_organizers)
        organizer_data = organizers[organizer_id]

        session = requests.Session()
        session.cookies.update(organizer_data["cookies"])

        try:
            event_id = publish_event(session, event)
            if not event_id:
                continue

            event_organizer_map[event_id] = organizer_id
            organizer_event_count[organizer_id] += 1

            print(
                f"[EVENT CREATED] {event_id} → {organizer_id} "
                f"(total: {organizer_event_count[organizer_id]})"
            )

        except Exception as e:
            print(f"[ERROR] Event publish failed → {e}")

    # Save mapping
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(event_organizer_map, f, indent=2)

    print("\n✅ Event seeding completed")
    print(f"📦 Total events created: {len(event_organizer_map)}")
    print(f"👥 Organizers with events: {len(active_organizers)}")
    print(f"🚫 Organizers without events: {len(organizer_ids) - len(active_organizers)}")
    print(f"📁 Mapping saved to {OUTPUT_FILE}")