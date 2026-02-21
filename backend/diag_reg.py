import requests

def test_registration():
    # 1. Login to get token
    login_url = "http://127.0.0.1:8000/api/core/auth/login/"
    login_data = {
        "username": "admin",
        "password": "Password@pos1"
    }
    
    print(f"Logging in to {login_url}...")
    login_res = requests.post(login_url, json=login_data)
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.status_code}")
        print(login_res.json())
        return

    token = login_res.json().get('access')
    print(f"Login successful. Token starts with: {token[:10]}...")

    # 2. Try to register
    register_url = "http://127.0.0.1:8000/api/core/auth/register/"
    register_data = {
        "username": "teststaff2",
        "password": "Password@123",
        "email": "test2@yarvo.com",
        "first_name": "Test",
        "last_name": "Staff",
        "role": "WAITER"
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"Attempting registration at {register_url}...")
    reg_res = requests.post(register_url, json=register_data, headers=headers)
    
    print(f"Status Code: {reg_res.status_code}")
    print(f"Response: {reg_res.text}")

if __name__ == "__main__":
    test_registration()
