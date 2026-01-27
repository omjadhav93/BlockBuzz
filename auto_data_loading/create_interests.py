import json
import requests

BASE_URL = "http://localhost:3000"

INTERESTS_URL = f"{BASE_URL}/api/admin/interest"
INTERESTS_FILE = "auto_data_loading/data/interests.json"

ADMIN_TOKEN = "rndblockbuzz"

def load_interests_data():
    with open(INTERESTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def add_main_interest(interest):
    res = requests.post(
        INTERESTS_URL,
        json={
            "name": interest,
            "admin_secret": ADMIN_TOKEN,
            "main": True
        }
    )
    
    if res.status_code != 200:
        print(f"[ERROR] {interest} → {res.status_code}")
        return False
    
    data = res.json()
    interest_id = data.get("data").get("id")
    
    if not interest_id:
        print(f"[ERROR] interestId not found in response for {interest}")
        return False
    
    return interest_id

def add_interest(interest, parent_id):
    res = requests.post(
        INTERESTS_URL,
        json={
            "name": interest,
            "admin_secret": ADMIN_TOKEN,
            "main": False,
            "parentId": parent_id
        }
    )
    
    if res.status_code != 200:
        print(f"[ERROR] {interest} → {res.status_code}")
        return False
    
    data = res.json()
    interest_id = data.get("data").get("id")
    
    if not interest_id:
        print(f"[ERROR] interestId not found in response for {interest}")
        return False
    
    return interest_id

def create_interests():
    interests_data = load_interests_data()
    
    interests_added = {}
    
    for interest in interests_data.keys():
        interest_id = add_main_interest(interest)
        if not interest_id:
            continue
        
        interests_added[interest] = interest_id
        
        print(f"[INTEREST ADDED] {interest} → {interest_id}")
        
    for parent, interest_list in interests_data.items():
        for interest in interest_list:
            interest_id = add_interest(interest, interests_added[parent])
            if not interest_id:
                continue
            
            interests_added[interest] = interest_id
            
            print(f"[INTEREST ADDED] {interest} → {interest_id}")
    
    with open("auto_data_loading/metadata/interests_id_map.json", "w", encoding="utf-8") as f:
        json.dump(interests_added, f, indent=2)
    
    print("\n✅ Interest seeding complete")
    print(f"🎯 Total interests created: {len(interests_added)}")
    print(f"📁 Saved to auto_data_loading/metadata/interests_id_map.json")