import os, django, sys
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import Order, OrderItem, MenuItem

print("--- ALL ORDERS ---")
for o in Order.objects.all().order_by('-id'):
    print(f"ID: {o.id} | Status: {o.status} | Room: {o.room} | Items: {o.items.count()}")
    for item in o.items.all():
        print(f"  - {item.menu_item.name} | Station: {item.menu_item.preparation_station}")

print("\n--- ALL KITCHEN ITEMS ---")
for m in MenuItem.objects.filter(preparation_station='KITCHEN'):
    print(f"ID: {m.id} | Name: {m.name} | Station: {m.preparation_station}")

print("\n--- ALL BAR ITEMS ---")
for m in MenuItem.objects.filter(preparation_station='BAR'):
    print(f"ID: {m.id} | Name: {m.name} | Station: {m.preparation_station}")
