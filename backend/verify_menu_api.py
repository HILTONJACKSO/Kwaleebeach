import requests

print("--- Testing Menu Management API ---")
base_url = "http://127.0.0.1:8000/api/inventory/menu/items/"

# 1. Test List
try:
    r = requests.get(base_url)
    print(f"GET {base_url} | Status: {r.status_code}")
    if r.status_code == 200:
        items = r.json()
        print(f"Found {len(items)} items.")
        if len(items) > 0:
            first_item = items[0]
            item_id = first_item['id']
            # 2. Test Patch (Availability Toggle)
            patch_url = f"{base_url}{item_id}/"
            new_status = not first_item['is_available']
            r_patch = requests.patch(patch_url, json={"is_available": new_status})
            print(f"PATCH {patch_url} (Toggle Availability) | Status: {r_patch.status_code}")
            if r_patch.status_code == 200:
                print("SUCCESS: Menu item status toggled successfully.")
            else:
                print(f"FAILED: Status {r_patch.status_code} | {r_patch.text}")
except Exception as e:
    print(f"Error: {str(e)}")
