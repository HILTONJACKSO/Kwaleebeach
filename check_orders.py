import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\User\\Pictures\\Hotel-development\\Yarvo-HMS\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import Order, OrderItem

print("--- RECENT ORDERS ---")
orders = Order.objects.all().order_by('-created_at')[:5]
for o in orders:
    print(f"Order #{o.id} - Status: {o.status} - Room: {o.room}")
    for item in o.items.all():
        print(f"  Item: {item.menu_item.name} - Station: {item.menu_item.preparation_station}")

print("--- RECENT ORDER ITEMS (DIRECT) ---")
items = OrderItem.objects.all().order_by('-id')[:10]
for i in items:
    print(f"OrderItem #{i.id} - Order #{i.order.id} - MenuItem: {i.menu_item.name} - Station: {i.menu_item.preparation_station}")
