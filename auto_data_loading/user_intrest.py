import json
import requests
from collections import defaultdict

BASE_URL = "http://localhost:3000"
USER_URL = f"{BASE_URL}/api/user/interest"


USER_COOKIES_FILE = "auto_data_loading/metadata/user_cookies.json"
USERS_OUTPUT_FILE = "auto_data_loading/metadata/users_data.json"

def load_cookies():
    with open(USER_COOKIES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_user():
    with open(USERS_OUTPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_interests(session, interests):
    res = session.patch(USER_URL, json={"interests": interests})
    if res.status_code not in (200, 201):
        print(f"[EVENT FAILED] {res.status_code} → {res.text}")
        return None
    return res.json().get("data").get("id")

def user_interest():
    cookies_data = load_cookies()
    users_data = load_user()
    
    for user in users_data:
        email = user["email"]
        interest = user["interests"]
        user_cookies = cookies_data.get(email)
<<<<<<< HEAD
        print(f"[Interest Added] User: {email} | Interests: {interest}")
=======
>>>>>>> 26ab921 (user intrest script)
        if not user_cookies:
            print(f"[SKIP] No cookies found for user {email}")
            continue
        
        session = requests.Session()
        session.cookies.update(user_cookies)

        load_interests(session, interest)