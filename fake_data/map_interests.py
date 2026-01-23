import json

EVENTS_FILE = "auto_data_loading/data/events_data.json"
INTERESTS_ID_MAP_FILE = "auto_data_loading/metadata/interests_id_map.json"
USERS_FILE = "auto_data_loading/data/users_data.json"
EVENTS_OUTPUT_FILE = "auto_data_loading/metadata/events_data.json"
USERS_OUTPUT_FILE = "auto_data_loading/metadata/users_data.json"

def load_event():
    with open(EVENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_user():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_interests_id_map():
    with open(INTERESTS_ID_MAP_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def mapping(objects, interest):
    for obj in objects:
        array = []
        for i in obj["interests"]:
            print(i)
            array.append(interest[i])
        obj["interests"] = array
    return objects

def map_interests():
    events = load_event()
    users = load_user()
    interests_id_map = load_interests_id_map()
    mapped_events = mapping(events, interests_id_map)
    mapped_users = mapping(users, interests_id_map)
    with open(EVENTS_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(mapped_events, f, indent=2)
    with open(USERS_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(mapped_users, f, indent=2)