import requests

print("--- Testing PMS API Endpoints ---")
urls = [
    "http://127.0.0.1:8000/api/pms/rooms/",
    "http://127.0.0.1:8000/api/pms/bookings/",
]

for url in urls:
    try:
        r = requests.get(url)
        print(f"URL: {url} | Status: {r.status_code}")
    except Exception as e:
        print(f"URL: {url} | Error: {str(e)}")
