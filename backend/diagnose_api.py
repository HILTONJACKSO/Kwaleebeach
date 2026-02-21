import requests

endpoints = [
    "http://127.0.0.1:8000/api/website/config/",
    "http://127.0.0.1:8000/api/rooms/",
    "http://127.0.0.1:8000/api/recreation/activities/",
    "http://127.0.0.1:8000/api/recreation/packages/"
]

for url in endpoints:
    try:
        r = requests.get(url, timeout=5)
        print(f"URL: {url}")
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('Content-Type')}")
        if 'application/json' not in r.headers.get('Content-Type', ''):
            print("WARNING: NON-JSON RESPONSE DETECTED!")
            print(f"Snippet: {r.text[:200]}")
        print("-" * 30)
    except Exception as e:
        print(f"URL: {url}")
        print(f"ERROR: {str(e)}")
        print("-" * 30)
