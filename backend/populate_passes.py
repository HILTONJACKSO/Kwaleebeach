import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from recreation.models import PassType

def populate_passes():
    passes = [
        {"name": "Pool Day Pass (Adult)", "price": 5.00, "location": "POOL"},
        {"name": "Pool Day Pass (Kids)", "price": 3.00, "location": "POOL"},
        {"name": "Beach Access Pass (Adult)", "price": 5.00, "location": "BEACH"},
        {"name": "Beach Access Pass (Kids)", "price": 3.00, "location": "BEACH"},
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
