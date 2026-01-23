import json
import random
import requests
from concurrent.futures import ThreadPoolExecutor
from threading import Lock

BASE_URL = "http://localhost:3000"

VIEW_URL = f"{BASE_URL}/api/event/view"
SAVE_URL = f"{BASE_URL}/api/event/save"
REGISTER_URL = f"{BASE_URL}/api/event/register"
ATTEND_URL = f"{BASE_URL}/api/event/attend"

EVENT_MAP_FILE = "auto_data_loading/metadata/event_organizer_map.json"
EVENTS_FILE = "auto_data_loading/data/events_data.json"
USERS_FILE = "auto_data_loading/data/users_data.json"
INTERESTS_FILE = "auto_data_loading/data/interests.json"
USER_COOKIES_FILE = "auto_data_loading/metadata/user_cookies.json"
ORGANIZERS_FILE = "auto_data_loading/metadata/approved_organizers.json"


MAX_WORKERS = 20

# ------------------------------
# Loaders
# ------------------------------
def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# ------------------------------
# Interest Mapping
# ------------------------------
def build_interest_maps(interests_json):
    sub_to_main = {}
    for main, subs in interests_json.items():
        for sub in subs:
            sub_to_main[sub] = main
    return sub_to_main

def interest_match_score(user_interests, event_interests, sub_to_main):
    score = 0
    for ei in event_interests:
        if ei in user_interests:
            score += 3                 # exact match
        elif ei in sub_to_main and sub_to_main[ei] in user_interests:
            score += 2                 # main interest match
    return score

# ------------------------------
# Session Pool (thread-safe)
# ------------------------------
SESSION_POOL = {}
SESSION_LOCK = Lock()

def get_session(email, cookies):
    with SESSION_LOCK:
        if email not in SESSION_POOL:
            s = requests.Session()
            # Set cookies instead of Authorization header
            s.cookies.set('token', cookies['token'])
            SESSION_POOL[email] = s
        return SESSION_POOL[email]

# ------------------------------
# Task Executor
# ------------------------------
def execute_task(task):
    action, email, cookies, event_id = task
    session = get_session(email, cookies)

    try:
        if action == "view":
            resp = session.get(f"{VIEW_URL}?eventId={event_id}")
        elif action == "save":
            resp = session.post(SAVE_URL, json={"eventId": event_id})
        elif action == "register":
            resp = session.post(REGISTER_URL, json={"eventId": event_id})
        elif action == "attend":
            resp = session.post(ATTEND_URL, json={"eventId": event_id})
        
        # Log errors
        if resp.status_code >= 400:
            print(f"❌ Error {resp.status_code} for {action} on event {event_id[:8]}... by {email}: {resp.text[:100]}")
            
    except Exception as e:
        print(f"❌ Exception during {action} on event {event_id[:8]}... by {email}: {str(e)}")

# ------------------------------
# Main Logic
# ------------------------------
def interactions():
    event_map = load_json(EVENT_MAP_FILE)
    events = load_json(EVENTS_FILE)
    users = load_json(USERS_FILE)
    interests_json = load_json(INTERESTS_FILE)
    user_cookies = load_json(USER_COOKIES_FILE)
    approved_organizers = load_json(ORGANIZERS_FILE)

    sub_to_main = build_interest_maps(interests_json)

    # Build lookups
    event_interest_map = {
        e["title"]: set(e["interests"]) for e in events
    }
    
    # Build event ID to event data map
    # Events are created in order, so we map event IDs to events by index
    event_ids = list(event_map.keys())
    event_id_map = {}
    for idx, event_id in enumerate(event_ids):
        if idx < len(events):
            event_id_map[event_id] = events[idx]
        else:
            event_id_map[event_id] = None

    user_interest_map = {
        u["email"]: set(u["interests"]) for u in users
    }

    print(f"👥 Users: {len(user_interest_map)}")
    print(f"🎟 Events: {len(event_map)}\n")

    for event_id, organizer_id in event_map.items():
        # Get the correct event interests for THIS event
        event_data = event_id_map.get(event_id)
        if event_data is None:
            print(f"⚠️ No event data found for event {event_id[:8]}..., using random interests")
            event_interests = set()
        else:
            event_interests = set(event_data.get("interests", []))

        weighted_users = []

        for email, cookies in user_cookies.items():
            if(approved_organizers.get(organizer_id).get("email") == email): continue
            
            score = interest_match_score(
                user_interest_map.get(email, set()),
                event_interests,
                sub_to_main
            )

            # Convert score → weight
            weight = (
                5 if score >= 3 else
                3 if score == 2 else
                1
            )

            weighted_users.extend([(email, cookies)] * weight)

        # Views (biased sampling)
        views = random.randint(50, 300)
        viewers = random.choices(weighted_users, k=views)
        unique_viewers = list({email: cookies for email, cookies in viewers}.items())

        # Funnel logic
        savers = random.sample(unique_viewers, max(1, int(len(unique_viewers) * 0.05)))
        registrants = random.sample(savers, max(1, int(len(savers) * 0.6)))
        attendees = random.sample(registrants, max(1, int(len(registrants) * 0.9)))

        tasks = []

        for email, cookies in viewers:
            tasks.append(("view", email, cookies, event_id))
        for email, cookies in savers:
            tasks.append(("save", email, cookies, event_id))
        for email, cookies in registrants:
            tasks.append(("register", email, cookies, event_id))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            executor.map(execute_task, tasks)
        tasks = []
        for email, cookies in attendees:
            tasks.append(("attend", email, cookies, event_id))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            executor.map(execute_task, tasks)

        print(f"✅ Event {event_id} interactions seeded")

    print("\n🎉 Interest-based interaction seeding completed")