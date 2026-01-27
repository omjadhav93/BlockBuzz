import json
import random
import requests

BASE_URL = "http://localhost:3000"

VOLUNTEER_REQUEST_URL = f"{BASE_URL}/api/volunteer/request"
VOLUNTEER_ACCEPT_URL = f"{BASE_URL}/api/admin/volunteer/"

COOKIES_FILE = "auto_data_loading/metadata/user_cookies.json"
OUTPUT_FILE = "auto_data_loading/metadata/approved_volunteers.json"
ADMIN_TOKEN = "rndblockbuzz"

TOTAL_VOLUNTEERS = 80


def load_user_cookies():
    with open(COOKIES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
    
def get_user_id(session):
    res = session.get(f"{BASE_URL}/api/user/profile")
    if res.status_code != 200:
        print(f"[GET USER ID FAILED] {res.status_code}")
        return None
    return res.json().get("user").get("id")

def accept_volunteer(user_id):
    res = requests.post(
        VOLUNTEER_ACCEPT_URL,
        json={
            "userId": user_id,
            "admin_secret": ADMIN_TOKEN
        }
    )

    if res.status_code != 200:
        print(f"[ACCEPT FAILED] {user_id} → {res.status_code}")
        return False

    return res.json().get("volunteerId")


def volunteer():
    user_cookies = load_user_cookies()

    selected_users = random.sample(
        list(user_cookies.items()),
        TOTAL_VOLUNTEERS
    )

    approved_volunteers = {}

    for email, cookies in selected_users:
        session = requests.Session()
        session.cookies.update(cookies)

        try:
            user_id = get_user_id(session)
            if not user_id:
                continue
            volunteer_id = accept_volunteer(user_id)
            approved_volunteers[volunteer_id] = {
                "email": email,
                "cookies": cookies
            }
            print(f"[VOLUNTEER APPROVED] {email} → {volunteer_id}")

        except Exception as e:
            print(f"[ERROR] {email} → {e}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(approved_volunteers, f, indent=2)

    print("\n✅ Volunteer seeding complete")
    print(f"🎯 Total volunteers created: {len(approved_volunteers)}/{TOTAL_VOLUNTEERS}")
    print(f"📁 Saved to {OUTPUT_FILE}")