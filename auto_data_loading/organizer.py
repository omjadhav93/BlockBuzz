import json
import random
import requests

BASE_URL = "http://localhost:3000"

ORGANIZER_REQUEST_URL = f"{BASE_URL}/api/organizer/request"
ORGANIZER_ACCEPT_URL = f"{BASE_URL}/api/admin/organizer"

COOKIES_FILE = "auto_data_loading/metadata/user_cookies.json"
OUTPUT_FILE = "auto_data_loading/metadata/approved_organizers.json"
ADMIN_TOKEN = "rndblockbuzz"

TOTAL_ORGANIZERS = 30


def load_user_cookies():
    with open(COOKIES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def request_organizer(session):
    res = session.post(
        ORGANIZER_REQUEST_URL
    )

    if res.status_code not in (200, 201):
        print(f"[REQUEST FAILED] {res.status_code} → {res.text}")
        return None

    data = res.json()
    organizer_id = data.get("organizerId")

    if not organizer_id:
        print("[ERROR] organizerId not found in response")
        return None

    return organizer_id


def accept_organizer(organizer_id):
    res = requests.post(
        ORGANIZER_ACCEPT_URL,
        json={
            "organizerId": organizer_id,
            "admin_secret": ADMIN_TOKEN
        }
    )

    if res.status_code != 200:
        print(f"[ACCEPT FAILED] {organizer_id} → {res.status_code}")
        return False

    return True


def organizer():
    user_cookies = load_user_cookies()

    selected_users = random.sample(
        list(user_cookies.items()),
        TOTAL_ORGANIZERS
    )

    approved_organizers = {}

    for email, cookies in selected_users:
        session = requests.Session()
        session.cookies.update(cookies)

        try:
            organizer_id = request_organizer(session)
            if not organizer_id:
                continue

            if accept_organizer(organizer_id):
                approved_organizers[organizer_id] = {
                    "email": email,
                    "cookies": cookies
                }
                print(f"[ORGANIZER APPROVED] {email} → {organizer_id}")

        except Exception as e:
            print(f"[ERROR] {email} → {e}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(approved_organizers, f, indent=2)

    print("\n✅ Organizer seeding complete")
    print(f"🎯 Total organizers created: {len(approved_organizers)}/{TOTAL_ORGANIZERS}")
    print(f"📁 Saved to {OUTPUT_FILE}")