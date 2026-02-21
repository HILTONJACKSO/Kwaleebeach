import requests

def test_list():
    # 1. Login to get token
    login_url = "http://localhost:8000/api/core/auth/login/"
    login_data = {
        "username": "admin",
        "password": "Password@pos1"
    }
    
    print(f"Logging in to {login_url}...")
    login_res = requests.post(login_url, json=login_data)
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code}")
        print(login_res.text)
        return

    token = login_res.json().get('access')
    print(f"Login successful. Token: {token[:10]}...")

    # 2. Try to list users
    list_url = "http://localhost:8000/api/core/users/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print(f"Fetching users from {list_url}...")
    list_res = requests.get(list_url, headers=headers)
    
    print(f"Status Code: {list_res.status_code}")
    if list_res.status_code == 200:
        users = list_res.json()
        print(f"Found {len(users)} users:")
        for u in users:
            print(f"- {u['username']} ({u['role']}): {u['first_name']} {u['last_name']}")
    else:
        print(f"Error: {list_res.text}")

if __name__ == "__main__":
    test_list()
