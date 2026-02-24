import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from recreation.models import PassType

def populate_passes():
    passes = [
        {"name": "Adult Pool Pass", "price": 2.00, "location": "POOL"},
        {"name": "Kid Pool Pass", "price": 1.00, "location": "POOL"},
        {"name": "Adult Beach Pass", "price": 2.00, "location": "BEACH"},
        {"name": "Kid Beach Pass", "price": 1.00, "location": "BEACH"},
    ]

    print("Cleaning existing pass types...")
    PassType.objects.all().delete()

    print("Populating Pass Types...")
    for p in passes:
        PassType.objects.create(
            name=p['name'],
            price=p['price'],
            location=p['location']
        )
    print("Success! Pass Types populated.")

if __name__ == "__main__":
    populate_passes()
