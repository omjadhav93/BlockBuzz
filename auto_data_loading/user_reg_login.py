import json
import requests
from pathlib import Path

BASE_URL = "http://localhost:3000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"

USERS_FILE = "auto_data_loading/data/users_data.json"
COOKIES_OUTPUT_FILE = "auto_data_loading/metadata/user_cookies.json"


def load_users():
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def register_user(session, user):
    res = session.post(
        REGISTER_URL,
        json={
            "name": user["name"],
            "email": user["email"],
            "password": user["password"]
        }
    )

    if res.status_code not in (200, 201):
        print(f"[REGISTER FAILED] {user['email']} → {res.status_code} {res.json()['message']}")
        return False

    print(f"[REGISTERED] {user['email']}")
    return session.cookies.get_dict()


def user_reg_login():
    users = load_users()

    all_user_cookies = {}
    
    for user in users:
        session = requests.Session()

        try:
            cookies = register_user(session, user)

            if cookies:
                all_user_cookies[user["email"]] = cookies

        except Exception as e:
            print(f"[ERROR] {user['email']} → {e}")

    # Save cookies for reuse
    with open(COOKIES_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_user_cookies, f, indent=2)

    print(f"\n✅ Cookies saved to {COOKIES_OUTPUT_FILE}")
    print(f"👥 Total users processed: {len(all_user_cookies)}")