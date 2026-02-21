import os
import django
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import Order, MenuItem, MenuCategory
from inventory.serializers import OrderSerializer

def reproduce():
    # Ensure we have a menu item
    cat, _ = MenuCategory.objects.get_or_create(name="Test Cat", slug="test-cat")
    item, _ = MenuItem.objects.get_or_create(
        name="Test Item", 
        defaults={"category": cat, "price": Decimal("10.00"), "preparation_station": "KITCHEN"}
    )

    data = {
        "room": "101",
        "location_type": "ROOM",
        "items": [
            {"menu_item": item.id, "quantity": 2}
        ]
    }

    print(f"Attempting to create order with data: {data}")
    serializer = OrderSerializer(data=data)
    if serializer.is_valid():
        try:
            order = serializer.save()
            print(f"Success! Order created with ID: {order.id}")
        except Exception as e:
            import traceback
            print(f"CRITICAL: serializer.save() raised exception: {e}")
            traceback.print_exc()
    else:
        print(f"Validation Failed: {serializer.errors}")

if __name__ == "__main__":
    reproduce()
